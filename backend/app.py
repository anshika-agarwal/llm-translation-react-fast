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
from datetime import datetime, timedelta
import aiohttp
from typing import Dict, List, Tuple, Optional
import random
from pathlib import Path

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

# Add these constants after the DB_CONFIG
PROLIFIC_API_KEY = os.getenv("PROLIFIC_API_KEY")
PROLIFIC_API_URL = "https://api.prolific.com/api/v1"
#PRIORITY_WAIT_TIME = 300  # seconds for priority matching (different languages only)
MAX_WAIT_TIME = 10     # seconds before timeout
PRIORITY_PAIRS = [
    ("english", "chinese"),
    ("chinese", "english"),
    ("english", "spanish"),
    ("spanish", "english"),
    ("chinese", "spanish"),
    ("spanish", "chinese")
]
CONTROL_PAIRS = [
    ("english", "english"),
    ("spanish", "spanish")
]

# Import translations from frontend
import json
import sys
from pathlib import Path

def get_conversation_starter():
    """Get the conversation starter index."""
    # We only have one conversation starter now
    return 0

def get_db_connection():
    return psycopg2.connect(**DB_CONFIG)

# Global variables for WebSocket user management
waiting_room: List[Tuple[WebSocket, str, datetime]] = []  # (websocket, language, join_time)
active_users = {}         # Maps a websocket to its partner
user_languages = {}       # Maps a websocket to its chosen language
conversation_mapping = {} # Maps a websocket to its conversation_id (from DB)
chat_timers = {}          # Maps conversation_id to its timer task
websocket_to_uuid = {}    # Maps a websocket to its persistent user UUID
chat_sessions = {}        # Maps conversation_id to the central chat session task
websocket_locks = {}      # Maps websocket to its lock
conversation_start_times = {}  # Maps conversation_id to its start time

# -------------------- Helper Functions --------------------

async def safe_receive(websocket: WebSocket):
    """Safely receive a text message from a WebSocket, handling disconnects."""
    # Get or create a lock for this websocket
    if websocket not in websocket_locks:
        websocket_locks[websocket] = asyncio.Lock()
    
    async with websocket_locks[websocket]:
        try:
            return await websocket.receive_text()
        except WebSocketDisconnect:
            print(f"[INFO] WebSocket {websocket_to_uuid.get(websocket, 'unknown')} disconnected during receive.")
            remove_user_from_active(websocket)
            return None
        except RuntimeError as e:
            if "once a disconnect message has been received" in str(e):
                print(f"[INFO] WebSocket {websocket_to_uuid.get(websocket, 'unknown')} already disconnected.")
                remove_user_from_active(websocket)
            else:
                print(f"[ERROR] Runtime error while receiving message: {e}")
            return None
        except Exception as e:
            print(f"[ERROR] Unexpected error while receiving message: {e}")
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
    global active_users, waiting_room, user_languages, websocket_to_uuid, websocket_locks
    
    # Remove from active users
    if user in active_users:
        partner = active_users.pop(user, None)
        # Only remove partner if they're not in active_users (meaning they've already disconnected)
        if partner and partner not in active_users:
            print(f"[INFO] Both users {websocket_to_uuid.get(user)} and {websocket_to_uuid.get(partner)} have disconnected.")
        else:
            print(f"[INFO] User {websocket_to_uuid.get(user)} disconnected. Partner still active.")
    
    # Remove from waiting room
    waiting_room[:] = [(w, lang, join_time) for w, lang, join_time in waiting_room if w != user]
    
    # Clean up other mappings
    user_languages.pop(user, None)
    websocket_to_uuid.pop(user, None)
    websocket_locks.pop(user, None)

    print(f"[INFO] Cleaned up data for user {websocket_to_uuid.get(user, 'unknown')}")

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
        
        # Calculate conversation length for automatic expiry
        end_time = datetime.now()
        start_time = conversation_start_times.get(conversation_id, end_time)
        duration = end_time - start_time
        
        # Update database with conversation length
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
                    UPDATE conversations
                    SET conversation_length = %s
                    WHERE conversation_id = %s
                """, (duration, conversation_id))
                conn.commit()
        finally:
            conn.close()
            
        await asyncio.gather(user1.send_text(expired_message), user2.send_text(expired_message))
    except asyncio.CancelledError:
        print(f"[INFO] Chat timer cancelled for conversation {conversation_id}.")

async def notify_prolific_overflow(participant_id: str):
    """Notify Prolific API about participant overflow."""
    if not PROLIFIC_API_KEY:
        print("[WARNING] Prolific API key not configured")
        return
    
    headers = {
        "Authorization": f"Token {PROLIFIC_API_KEY}",
        "Content-Type": "application/json"
    }
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{PROLIFIC_API_URL}/participants/{participant_id}/status/",
                headers=headers,
                json={"status": "APPROVED"}
            ) as response:
                if response.status == 200:
                    print(f"[INFO] Successfully notified Prolific about participant {participant_id}")
                else:
                    print(f"[ERROR] Failed to notify Prolific about participant {participant_id}")
    except Exception as e:
        print(f"[ERROR] Error notifying Prolific: {e}")

def find_best_match(websocket: WebSocket, language: str) -> Optional[WebSocket]:
    """Find the best matching partner based on language preferences and waiting time."""
    current_time = datetime.now()
    user_join_time = next((t for w, _, t in waiting_room if w == websocket), None)
    if not user_join_time:
        return None
    
    wait_time = (current_time - user_join_time).total_seconds()
    
    # Only try to find priority matches (different languages)
    for waiting_ws, waiting_lang, join_time in waiting_room:
        if waiting_ws != websocket and (language, waiting_lang) in CONTROL_PAIRS:
            # Remove the matched pair from waiting room immediately
            waiting_room[:] = [(w, l, t) for w, l, t in waiting_room 
                             if w not in (websocket, waiting_ws)]
            return waiting_ws
    
    return None

async def cleanup_waiting_room():
    """Remove participants who have waited too long."""
    current_time = datetime.now()
    global waiting_room
    
    # Check each user's wait time
    for ws, lang, join_time in waiting_room:
        if (current_time - join_time).total_seconds() >= MAX_WAIT_TIME:
            participant_id = websocket_to_uuid.get(ws)
            if participant_id:
                await notify_prolific_overflow(participant_id)
            await ws.send_text(json.dumps({
                "type": "waitingRoomTimeout",
                "message": "Sorry, we could not pair you at this time. Please try again later. You will be redirected to return."
            }))
            await safe_close(ws)
            # Remove this user from waiting room
            waiting_room[:] = [(w, l, t) for w, l, t in waiting_room if w != ws]
            return  # Exit after removing one user to avoid modifying while iterating

async def pair_users():
    """Pairs users based on language preferences."""
    global waiting_room, active_users, conversation_mapping
    
    # Try to pair remaining participants
    for i, (ws1, lang1, _) in enumerate(waiting_room):
        for j, (ws2, lang2, _) in enumerate(waiting_room[i+1:], i+1):
            if (lang1, lang2) in CONTROL_PAIRS:
                # Set up the pair
                active_users[ws1] = ws2
                active_users[ws2] = ws1
                
                # Get persistent UUIDs
                user1_id = websocket_to_uuid.get(ws1)
                user2_id = websocket_to_uuid.get(ws2)
                
                # Get a random conversation starter index
                starter_index = get_conversation_starter()
                print(f"[DEBUG] Selected conversation starter index: {starter_index}")
                
                try:
                    conn = get_db_connection()
                    with conn.cursor() as cursor:
                        cursor.execute("""
                            INSERT INTO conversations (
                                user1_id, user2_id, user1_lang, user2_lang, "group", model, conversation_history, convo_starter
                            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                            RETURNING conversation_id
                        """, (
                            user1_id,
                            user2_id,
                            user_languages[ws1],
                            user_languages[ws2],
                            "control" if user_languages[ws1].lower() == user_languages[ws2].lower() else "experiment",
                            'gpt-4o',
                            Json([]),
                            starter_index
                        ))
                        conversation_id = cursor.fetchone()[0]
                        conn.commit()
                    print(f"[INFO] Paired users {user1_id} and {user2_id} in conversation {conversation_id}.")
                    conversation_mapping[ws1] = conversation_id
                    conversation_mapping[ws2] = conversation_id
                    
                    # Remove both users from waiting room
                    waiting_room[:] = [(w, l, t) for w, l, t in waiting_room if w not in (ws1, ws2)]
                    
                    pairing_message = json.dumps({
                        "type": "paired",
                        "message": "You are now paired. Start chatting!",
                        "conversation_id": conversation_id,
                        "starter_index": starter_index
                    })
                    await asyncio.gather(ws1.send_text(pairing_message), ws2.send_text(pairing_message))
                    # Start chat timer for this conversation
                    timer_task = asyncio.create_task(chat_timer_task(ws1, ws2, conversation_id))
                    chat_timers[conversation_id] = timer_task
                    return  # Exit after successful pairing
                    
                except Exception as e:
                    print(f"[ERROR] Failed to pair users or insert conversation into DB: {e}")
                finally:
                    if conn:
                        conn.close()

async def start_chat(user1: WebSocket, user2: WebSocket, conversation_id):
    """Central chat session that reads messages from both users."""
    conn = None
    survey_submitted = {user1: False, user2: False}
    user_disconnected = {user1: False, user2: False}
    chat_ended = False
    try:
        conn = get_db_connection()
        conversation_start_times[conversation_id] = datetime.now()

        while not all(survey_submitted.values()) and not all(user_disconnected.values()):
            # Skip receiving if both users are gone
            if user1 in active_users:
                user1_task = asyncio.create_task(safe_receive(user1))
            else:
                user1_task = None
                user_disconnected[user1] = True

            if user2 in active_users:
                user2_task = asyncio.create_task(safe_receive(user2))
            else:
                user2_task = None
                user_disconnected[user2] = True

            tasks = [t for t in [user1_task, user2_task] if t is not None]
            if not tasks:
                break  # No one left to receive from

            try:
                done, pending = await asyncio.wait(tasks, return_when=asyncio.FIRST_COMPLETED)
                for task in done:
                    try:
                        message_text = task.result()
                        sender = user1 if task == user1_task else user2
                        receiver = user2 if sender == user1 else user1

                        if message_text is None:
                            user_disconnected[sender] = True
                            continue

                        message = json.loads(message_text)
                        if "type" not in message:
                            print(f"[ERROR] Missing 'type' in message: {message}")
                            continue

                        if message["type"] == "endChat":
                            chat_ended = True
                            if conversation_id in chat_timers:
                                chat_timers[conversation_id].cancel()
                                del chat_timers[conversation_id]

                            end_time = datetime.now()
                            start_time = conversation_start_times.get(conversation_id, end_time)
                            duration = (end_time - start_time).total_seconds()
                            minutes = int(duration // 60)
                            seconds = int(duration % 60)

                            with conn.cursor() as cursor:
                                cursor.execute("""
                                    UPDATE conversations
                                    SET conversation_length = %s
                                    WHERE conversation_id = %s
                                """, (f"{minutes}:{seconds:02d}", conversation_id))
                                conn.commit()

                            survey_prompt = json.dumps({
                                "type": "survey",
                                "conversation_id": conversation_id,
                                "message": f"Conversation {conversation_id} has ended."
                            })
                            await asyncio.gather(
                                *(user.send_text(survey_prompt) for user in [user1, user2]
                                  if not user_disconnected[user])
                            )
                            print("[INFO] Sent survey prompts to both users.")

                        elif message["type"] == "survey":
                            await handle_survey_submission(conn, conversation_id, sender, message, survey_submitted)

                        elif message["type"] in ["typing", "stopTyping"]:
                            if not user_disconnected[receiver]:
                                await receiver.send_text(json.dumps({
                                    "type": "typing",
                                    "status": "typing" if message["type"] == "typing" else "stopped"
                                }))

                        elif message["type"] == "message" and "text" in message:
                            if not user_disconnected[receiver]:
                                await handle_message(conn, conversation_id, sender, receiver, message)

                        else:
                            print(f"[WARNING] Unhandled message type: {message}")
                    except Exception as e:
                        print(f"[ERROR] Exception processing message: {e}")

                for task in pending:
                    task.cancel()

            except asyncio.CancelledError:
                print(f"[INFO] Chat session cancelled for conversation {conversation_id}")
                break

    except Exception as e:
        print(f"[ERROR] Exception in start_chat: {e}")
    finally:
        if conn:
            conn.close()
        chat_sessions.pop(conversation_id, None)

        # Let users know if the other person disconnected
        for user in [user1, user2]:
            if not survey_submitted[user] and not user_disconnected[user]:
                try:
                    await user.send_text(json.dumps({
                        "type": "info",
                        "message": "Your partner disconnected. Please complete your survey before closing."
                    }))
                except:
                    pass

        if all(survey_submitted.values()) or all(user_disconnected.values()):
            print(f"[INFO] Final cleanup for conversation {conversation_id}")
            await asyncio.gather(
                *(safe_close(user) for user in [user1, user2] if not user_disconnected[user])
            )

async def handle_survey_submission(conn, conversation_id, sender, message, survey_submitted):
    """Handle survey submission and database updates."""
    try:
        # First determine which user (1 or 2) the sender is for this conversation
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT user1_id, user2_id
                FROM conversations
                WHERE conversation_id = %s
            """, (conversation_id,))
            result = cursor.fetchone()
            if not result:
                print(f"[ERROR] Could not find conversation {conversation_id}")
                return
            user1_id, user2_id = result
            
        # Determine if sender is user1 or user2
        sender_uuid = websocket_to_uuid.get(sender)
        is_user1 = sender_uuid == user1_id
        
        # Now check existing survey submissions
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT user1_postsurvey, user2_postsurvey
                FROM conversations
                WHERE conversation_id = %s
            """, (conversation_id,))
            result = cursor.fetchone()
            user1_postsurvey, user2_postsurvey = result if result else (None, None)
        
        # Determine which column to update
        if is_user1 and not user1_postsurvey:
            column = "user1_postsurvey"
        elif not is_user1 and not user2_postsurvey:
            column = "user2_postsurvey"
        else:
            print(f"[WARNING] Survey already submitted for this user in conversation {conversation_id}.")
            return
            
        with conn.cursor() as cursor:
            cursor.execute(f"""
                UPDATE conversations
                SET {column} = %s
                WHERE conversation_id = %s
            """, (Json(message), conversation_id))
            conn.commit()
        print(f"[INFO] Stored survey for user {sender_uuid} in conversation {conversation_id}.")
        
        # Update the survey_submitted dictionary
        survey_submitted[sender] = True
        
        # Send individual completion message to the sender
        await sender.send_text(json.dumps({
            "type": "surveyCompleted",
            "message": "Your survey has been submitted successfully. You will be redirected shortly."
        }))
        
        # Log the current state of survey submissions
        print(f"[INFO] Survey submission state - User1: {survey_submitted.get(sender, False)}, User2: {survey_submitted.get(sender, False)}")
        
    except Exception as e:
        print(f"[ERROR] Failed to store survey: {e}")
        # Don't mark as submitted if there was an error
        survey_submitted[sender] = False

async def handle_message(conn, conversation_id, sender, receiver, message):
    """Handle message translation and storage."""
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

# -------------------- Endpoints --------------------

@app.get("/")
async def root():
    return JSONResponse({"message": "Welcome to the FastAPI WebSocket server with full functionality!"})

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    print(f"[INFO] New WebSocket connection attempt from {websocket.client}.")
    await websocket.accept()
    
    try:
        # Expect an initial message with language
        message = await safe_receive(websocket)
        if message is None:
            return
        data = json.loads(message)
        if data["type"] == "language":
            # Try to get PROLIFIC_PID from the data
            prolific_pid = data.get("prolific_pid")
            user_id = prolific_pid if prolific_pid else str(uuid.uuid4())
            websocket_to_uuid[websocket] = user_id
            print(f"[INFO] Assigned {'Prolific' if prolific_pid else 'Generated'} ID {user_id} to WebSocket.")
            
            user_languages[websocket] = data["language"]
            join_time = datetime.now()
            # Add to waiting room with current timestamp
            waiting_room.append((websocket, data["language"], join_time))
            print(f"[INFO] User {user_id} selected language: {data['language']}.")
            
            # Keep trying to pair until either paired or timeout
            while websocket not in conversation_mapping:
                # Check if we've exceeded MAX_WAIT_TIME
                if (datetime.now() - join_time).total_seconds() >= MAX_WAIT_TIME:
                    print(f"[INFO] No priority matches found for {user_id} after waiting {MAX_WAIT_TIME} seconds.")
                    await websocket.send_text(json.dumps({
                        "type": "waitingRoomTimeout",
                        "message": "Sorry, we could not pair you at this time. Please try again later. You will be redirected to return."
                    }))
                    await notify_prolific_overflow(user_id)
                    await safe_close(websocket)
                    return
                
                # Try to pair immediately
                await pair_users()
                
                # If still not paired, wait before trying again
                if websocket not in conversation_mapping:
                    await asyncio.sleep(0.1)  # Very short sleep to be more responsive
            
            conversation_id = conversation_mapping.get(websocket)
            partner = active_users.get(websocket)
            
            if conversation_id is not None and partner is not None:
                if conversation_id not in chat_sessions:
                    chat_sessions[conversation_id] = asyncio.create_task(start_chat(websocket, partner, conversation_id))
                await chat_sessions[conversation_id]
            else:
                print(f"[ERROR] Conversation details not found for user {user_id}.")
                await websocket.close(code=1011)
                
    except WebSocketDisconnect:
        print(f"[INFO] WebSocket {websocket_to_uuid.get(websocket, 'unknown')} disconnected.")
    except Exception as e:
        print(f"[ERROR] Exception in WebSocket endpoint: {e}")
    finally:
        remove_user_from_active(websocket)

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
