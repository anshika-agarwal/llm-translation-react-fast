import os
import json
import asyncio
import uuid
import time
import psycopg2
from psycopg2.extras import Json
from dotenv import load_dotenv
from openai import OpenAI
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Load environment variables and initialize FastAPI app
load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://34.219.101.222:5173",
        "https://34.219.101.222:5173",
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI API client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Database configuration
DB_CONFIG = {
    "dbname": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "host": os.getenv("DB_HOST"),
    "port": os.getenv("DB_PORT", "5432")
}

def get_db_connection():
    return psycopg2.connect(**DB_CONFIG)

# Global variables for WebSocket user management
waiting_room = []         # List of tuples: (websocket, timestamp)
active_users = {}         # Maps a websocket to its partner
user_languages = {}       # Maps a websocket to its chosen language
user_presurveys = {}      # Maps a websocket to its presurvey data
conversation_mapping = {} # Maps a websocket to its conversation_id (from DB)
chat_timers = {}          # Maps conversation_id to its timer task
websocket_to_uuid = {}    # Maps a websocket to its persistent user UUID
chat_sessions = {}        # Maps conversation_id to the central chat session task

# -------------------- Helper Functions --------------------

async def safe_receive(websocket: WebSocket):
    """Safely receive a text message from a WebSocket, handling disconnects."""
    try:
        return await websocket.receive_text()
    except WebSocketDisconnect:
        print(f"[INFO] WebSocket {websocket_to_uuid.get(websocket, 'unknown')} disconnected during receive.")
        return None
    except Exception as e:
        print(f"[ERROR] Error while receiving message: {e}")
        return None

async def safe_close(websocket: WebSocket):
    """Safely close a WebSocket connection."""
    try:
        await websocket.close(code=1000)
        print(f"[INFO] WebSocket {websocket_to_uuid.get(websocket, 'unknown')} closed successfully.")
    except Exception as e:
        print(f"[ERROR] Error closing WebSocket {websocket_to_uuid.get(websocket, 'unknown')}: {e}")

def remove_user_from_active(user: WebSocket):
    """Removes a user from active users and cleans up the waiting room."""
    global active_users, waiting_room
    if user in active_users:
        partner = active_users.pop(user, None)
        if partner:
            active_users.pop(partner, None)
            print(f"[INFO] Removed users {websocket_to_uuid.get(user)} and {websocket_to_uuid.get(partner)} from active_users.")
    waiting_room[:] = [(w, ts) for w, ts in waiting_room if w != user]

async def translate_message(message: str, source_language: str, target_language: str) -> str:
    """
    Translate the given message using the OpenAI API if needed.
    If source and target languages are the same, returns the original message.
    """
    language_map = {
        "english": "English",
        "chinese": "Chinese",
        "spanish": "Spanish"
    }
    source = language_map.get(source_language.lower(), "English")
    target = language_map.get(target_language.lower(), "English")
    if source == target:
        return message  # No translation needed

    prompt = f"Translate the following {source} text to {target}: {message}. Answer with only the translated message."
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"[ERROR] OpenAI API call failed: {e}")
        return "Translation error."

async def chat_timer_task(user1: WebSocket, user2: WebSocket, conversation_id):
    """Send timer updates to both users; on expiry, send an 'expired' message."""
    try:
        total_time = 180  # Total chat duration in seconds
        print(f"[INFO] Timer started for conversation {conversation_id}.")
        for remaining_time in range(total_time, 0, -1):
            time_message = json.dumps({"type": "timer", "remaining_time": remaining_time})
            await user1.send_text(time_message)
            await user2.send_text(time_message)
            await asyncio.sleep(1)
        # When timer expires, notify both users
        expired_message = json.dumps({
            "type": "expired",
            "conversation_id": conversation_id,
            "message": "Chat timer has expired."
        })
        print(f"[INFO] Chat timer expired for conversation {conversation_id}.")
        await asyncio.gather(user1.send_text(expired_message), user2.send_text(expired_message))
    except asyncio.CancelledError:
        print(f"[INFO] Chat timer cancelled for conversation {conversation_id}.")

async def pair_users():
    """Pairs two waiting users, creates a conversation record in the DB, and notifies them."""
    global waiting_room, active_users, conversation_mapping
    if len(waiting_room) >= 2:
        user1, _ = waiting_room.pop(0)
        user2, _ = waiting_room.pop(0)
        active_users[user1] = user2
        active_users[user2] = user1

        # Get persistent UUIDs
        user1_id = websocket_to_uuid.get(user1)
        user2_id = websocket_to_uuid.get(user2)

        try:
            conn = get_db_connection()
            with conn.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO conversations (
                        user1_id, user2_id, user1_lang, user2_lang, "group", model, conversation_history, user1_presurvey, user2_presurvey
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING conversation_id
                """, (
                    user1_id,
                    user2_id,
                    user_languages[user1],
                    user_languages[user2],
                    "control" if user_languages[user1].lower() == user_languages[user2].lower() else "experiment",
                    'gpt-4o',
                    Json([]),
                    Json(user_presurveys[user1]),
                    Json(user_presurveys[user2])
                ))
                conversation_id = cursor.fetchone()[0]
                conn.commit()
            print(f"[INFO] Paired users {user1_id} and {user2_id} in conversation {conversation_id}.")
            conversation_mapping[user1] = conversation_id
            conversation_mapping[user2] = conversation_id

            pairing_message = json.dumps({
                "type": "paired",
                "message": "You are now paired. Start chatting!",
                "conversation_id": conversation_id
            })
            await asyncio.gather(user1.send_text(pairing_message), user2.send_text(pairing_message))
            # Start chat timer for this conversation
            timer_task = asyncio.create_task(chat_timer_task(user1, user2, conversation_id))
            chat_timers[conversation_id] = timer_task

        except Exception as e:
            print(f"[ERROR] Failed to pair users or insert conversation into DB: {e}")
        finally:
            if conn:
                conn.close()

async def start_chat(user1: WebSocket, user2: WebSocket, conversation_id):
    """
    Central chat session that reads messages from both users and handles:
      - Message relaying (with translation when necessary)
      - 'typing' and 'stopTyping' notifications
      - 'endChat' event to end conversation and prompt survey
      - Storing messages and surveys into the DB
    """
    conn = None
    survey_submitted = {user1: False, user2: False}
    try:
        conn = get_db_connection()
        chat_ended = False
        while not chat_ended:
            # Create concurrent receive tasks for both users
            user1_task = asyncio.create_task(safe_receive(user1))
            user2_task = asyncio.create_task(safe_receive(user2))
            done, pending = await asyncio.wait(
                [user1_task, user2_task],
                return_when=asyncio.FIRST_COMPLETED,
            )
            for task in done:
                try:
                    message_text = task.result()
                    if message_text is None:
                        continue  # Skip if no message (e.g. disconnect)
                    message = json.loads(message_text)
                    if "type" not in message:
                        print(f"[ERROR] Missing 'type' in message: {message}")
                        continue

                    if message["type"] == "endChat":
                        chat_ended = True
                        if conversation_id in chat_timers:
                            chat_timers[conversation_id].cancel()
                            del chat_timers[conversation_id]
                        survey_prompt = json.dumps({
                            "type": "survey",
                            "conversation_id": conversation_id,
                            "message": f"Conversation {conversation_id} has ended."
                        })
                        await asyncio.gather(user1.send_text(survey_prompt), user2.send_text(survey_prompt))
                        print("[INFO] Sent survey prompts to both users.")

                    elif message["type"] == "survey":
                        sender = user1 if task == user1_task else user2
                        primary_column = "user1_postsurvey" if sender == user1 else "user2_postsurvey"
                        secondary_column = "user2_postsurvey" if primary_column == "user1_postsurvey" else "user1_postsurvey"
                        try:
                            with conn.cursor() as cursor:
                                cursor.execute("""
                                    SELECT user1_postsurvey, user2_postsurvey
                                    FROM conversations
                                    WHERE conversation_id = %s
                                """, (conversation_id,))
                                result = cursor.fetchone()
                            user1_postsurvey, user2_postsurvey = result if result else (None, None)
                            if not (user1_postsurvey if primary_column == "user1_postsurvey" else user2_postsurvey):
                                column = primary_column
                            elif not (user2_postsurvey if primary_column == "user1_postsurvey" else user1_postsurvey):
                                column = secondary_column
                            else:
                                print(f"[WARNING] Both survey columns are filled for conversation {conversation_id}.")
                                continue
                            with conn.cursor() as cursor:
                                cursor.execute(f"""
                                    UPDATE conversations
                                    SET {column} = %s
                                    WHERE conversation_id = %s
                                """, (Json(message), conversation_id))
                                conn.commit()
                            print(f"[INFO] Stored survey for user {websocket_to_uuid.get(sender)} in conversation {conversation_id}.")
                        except Exception as e:
                            print(f"[ERROR] Failed to store survey: {e}")
                        survey_submitted[sender] = True

                    elif message["type"] == "typing":
                        target_user = user2 if task == user1_task else user1
                        await target_user.send_text(json.dumps({"type": "typing", "status": "typing"}))

                    elif message["type"] == "stopTyping":
                        target_user = user2 if task == user1_task else user1
                        await target_user.send_text(json.dumps({"type": "typing", "status": "stopped"}))

                    elif message["type"] == "message" and "text" in message:
                        sender = user1 if task == user1_task else user2
                        receiver = user2 if sender == user1 else user1
                        translated_message = await translate_message(
                            message["text"],
                            user_languages[sender],
                            user_languages[receiver]
                        )
                        await receiver.send_text(json.dumps({
                            "type": "message",
                            "text": translated_message
                        }))
                        with conn.cursor() as cursor:
                            cursor.execute("""
                                UPDATE conversations
                                SET conversation_history = conversation_history || %s
                                WHERE conversation_id = %s
                            """, (
                                Json([{
                                    "sender": websocket_to_uuid.get(sender),
                                    "text": message["text"],
                                    "translation": translated_message
                                }]),
                                conversation_id,
                            ))
                            conn.commit()
                    else:
                        print(f"[WARNING] Unhandled message type: {message}")
                except Exception as e:
                    print(f"[ERROR] Exception processing message: {e}")
            for task in pending:
                task.cancel()
    except Exception as e:
        print(f"[ERROR] Exception in start_chat: {e}")
    finally:
        if conn:
            conn.close()
        # Safely close both WebSocket connections if surveys were submitted
        await asyncio.gather(*(safe_close(user) for user, submitted in survey_submitted.items() if submitted))
        print("[INFO] Chat session ended and WebSocket connections closed.")

# -------------------- Endpoints --------------------

@app.get("/")
async def root():
    return JSONResponse({"message": "Welcome to the FastAPI WebSocket server with full functionality!"})

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    print(f"[INFO] New WebSocket connection attempt from {websocket.client}.")
    await websocket.accept()
    user_id = str(uuid.uuid4())
    websocket_to_uuid[websocket] = user_id
    print(f"[INFO] Assigned UUID {user_id} to WebSocket.")

    try:
        # Expect an initial message with language and presurvey data
        message = await safe_receive(websocket)
        if message is None:
            return
        data = json.loads(message)
        if data["type"] == "language":
            user_languages[websocket] = data["language"]
            user_presurveys[websocket] = {
                "qualityRating": data.get("question1"),
                "seamlessRating": data.get("question2"),
                "translationeseRating": data.get("question3")
            }
            waiting_room.append((websocket, time.time()))
            print(f"[INFO] User {user_id} selected language: {data['language']}.")

        # If two or more users are waiting, attempt pairing
        if len(waiting_room) >= 2:
            await pair_users()

        # Wait until this websocket is paired
        while websocket not in conversation_mapping:
            await asyncio.sleep(1)
        conversation_id = conversation_mapping.get(websocket)
        partner = active_users.get(websocket)

        if conversation_id is not None and partner is not None:
            # Ensure that the central chat session is launched only once per conversation.
            if conversation_id not in chat_sessions:
                chat_sessions[conversation_id] = asyncio.create_task(start_chat(websocket, partner, conversation_id))
            await chat_sessions[conversation_id]
        else:
            print(f"[ERROR] Conversation details not found for user {user_id}.")
            await websocket.close(code=1011)
    except WebSocketDisconnect:
        print(f"[INFO] WebSocket {user_id} disconnected.")
    except Exception as e:
        print(f"[ERROR] Exception in WebSocket endpoint: {e}")
    finally:
        remove_user_from_active(websocket)

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
