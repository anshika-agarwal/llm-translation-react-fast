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
MAX_WAIT_TIME = 60  # seconds
PRIORITY_PAIRS = [
    ("english", "spanish"),
    ("spanish", "english")
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
    """Get a random index for the conversation starter."""
    # We know there are 3 starters in each language
    return random.randint(0, 2)

def get_db_connection():
    return psycopg2.connect(**DB_CONFIG)

# Global variables for WebSocket user management
waiting_room: List[Tuple[WebSocket, str, datetime]] = []  # (websocket, language, join_time)
active_users = {}         # Maps a websocket to its partner
user_languages = {}       # Maps a websocket to its chosen language
user_presurveys = {}      # Maps a websocket to its presurvey data
conversation_mapping = {} # Maps a websocket to its conversation_id (from DB)
chat_timers = {}          # Maps conversation_id to its timer task
websocket_to_uuid = {}    # Maps a websocket to its persistent user UUID
chat_sessions = {}        # Maps conversation_id to the central chat session task
websocket_locks = {}      # Maps websocket to its lock

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
            if "Cannot call 'receive' once a disconnect message has been received" in str(e):
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
    global active_users, waiting_room, user_languages, user_presurveys, conversation_mapping, websocket_to_uuid, websocket_locks
    
    # Remove from active users
    if user in active_users:
        partner = active_users.pop(user, None)
        if partner:
            active_users.pop(partner, None)
            print(f"[INFO] Removed users {websocket_to_uuid.get(user)} and {websocket_to_uuid.get(partner)} from active_users.")
    
    # Remove from waiting room
    waiting_room[:] = [(w, lang, join_time) for w, lang, join_time in waiting_room if w != user]
    
    # Clean up other mappings
    user_languages.pop(user, None)
    user_presurveys.pop(user, None)
    conversation_mapping.pop(user, None)
    websocket_to_uuid.pop(user, None)
    websocket_locks.pop(user, None)
    
    print(f"[INFO] Cleaned up all data for user {websocket_to_uuid.get(user, 'unknown')}")

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
    
    # First, try to find a priority match (different languages)
    for waiting_ws, waiting_lang, join_time in waiting_room:
        if waiting_ws != websocket and (language, waiting_lang) in PRIORITY_PAIRS:
            # Remove the matched pair from waiting room immediately
            waiting_room[:] = [(w, l, t) for w, l, t in waiting_room 
                             if w not in (websocket, waiting_ws)]
            return waiting_ws
    
    # Only try same-language matching if user has waited long enough
    user_join_time = next((t for w, _, t in waiting_room if w == websocket), None)
    if user_join_time and (current_time - user_join_time).total_seconds() >= MAX_WAIT_TIME:
        same_language_users = [(w, t) for w, l, t in waiting_room 
                             if w != websocket and l == language]
        if same_language_users:
            # Sort by join time and get the oldest waiting user
            oldest_waiting = min(same_language_users, key=lambda x: x[1])
            waiting_ws = oldest_waiting[0]
            # Remove the matched pair from waiting room immediately
            waiting_room[:] = [(w, l, t) for w, l, t in waiting_room 
                             if w not in (websocket, waiting_ws)]
            return waiting_ws
    
    return None

async def cleanup_waiting_room():
    """Remove participants who have waited too long and try to pair them with same-language users."""
    current_time = datetime.now()
    global waiting_room, active_users
    
    # Sort waiting room by join time to ensure FIFO order
    waiting_room.sort(key=lambda x: x[2])
    
    # First try to make any possible cross-language matches
    waiting_room_copy = waiting_room.copy()
    for ws1, lang1, _ in waiting_room_copy:
        if ws1 not in waiting_room:  # Skip if already matched
            continue
        for ws2, lang2, _ in waiting_room_copy:
            if ws2 not in waiting_room or ws1 == ws2:  # Skip if already matched or same user
                continue
            if (lang1, lang2) in PRIORITY_PAIRS:
                # Set up the cross-language pair
                active_users[ws1] = ws2
                active_users[ws2] = ws1
                # Remove both users from waiting room
                waiting_room[:] = [(w, l, t) for w, l, t in waiting_room 
                                 if w not in (ws1, ws2)]
                break
    
    # Then handle same-language pairing for users who have waited too long
    english_users = [(ws, join_time) for ws, lang, join_time in waiting_room 
                    if lang == "english" and (current_time - join_time).total_seconds() >= MAX_WAIT_TIME]
    spanish_users = [(ws, join_time) for ws, lang, join_time in waiting_room 
                    if lang == "spanish" and (current_time - join_time).total_seconds() >= MAX_WAIT_TIME]
    
    # Try to pair expired users within each language group
    for users in [english_users, spanish_users]:
        i = 0
        while i < len(users):
            ws, join_time = users[i]
            if i + 1 < len(users):
                partner_ws = users[i + 1][0]
                if ws in waiting_room and partner_ws in waiting_room:
                    # Set up the pair
                    active_users[ws] = partner_ws
                    active_users[partner_ws] = ws
                    # Remove both users from waiting room
                    waiting_room[:] = [(w, l, t) for w, l, t in waiting_room 
                                     if w not in (ws, partner_ws)]
                    i += 2  # Skip both paired users
                    continue
            i += 1
    
    # Handle remaining expired users who couldn't be paired
    remaining_users = [
        (ws, lang) for ws, lang, join_time in waiting_room 
        if (current_time - join_time).total_seconds() >= MAX_WAIT_TIME
    ]
    
    for ws, lang in remaining_users:
        # Check if there are any other users with the same language still in waiting room
        has_potential_match = any(
            l == lang for w, l, _ in waiting_room 
            if w != ws
        )
        
        if not has_potential_match:
            participant_id = websocket_to_uuid.get(ws)
            if participant_id:
                await notify_prolific_overflow(participant_id)
            await safe_close(ws)
            waiting_room[:] = [(w, l, t) for w, l, t in waiting_room if w != ws]

async def pair_users():
    """Pairs users based on language preferences and waiting time."""
    global waiting_room, active_users, conversation_mapping
    
    # Clean up expired participants
    await cleanup_waiting_room()
    
    # Sort waiting room by join time to ensure FIFO order
    waiting_room.sort(key=lambda x: x[2])  # Sort by join_time
    
    # Create a copy of the waiting room to iterate over
    waiting_room_copy = waiting_room.copy()
    
    # Try to pair remaining participants
    for websocket, language, join_time in waiting_room_copy:
        # Skip if this websocket is no longer in the waiting room
        if not any(w == websocket for w, _, _ in waiting_room):
            continue
            
        match = find_best_match(websocket, language)
        if match:
            # Set up the pair
            active_users[websocket] = match
            active_users[match] = websocket
            
            # Get persistent UUIDs
            user1_id = websocket_to_uuid.get(websocket)
            user2_id = websocket_to_uuid.get(match)
            
            # Get a random conversation starter index
            starter_index = get_conversation_starter()
            print(f"[DEBUG] Selected conversation starter index: {starter_index}")
            
            try:
                conn = get_db_connection()
                with conn.cursor() as cursor:
                    cursor.execute("""
                        INSERT INTO conversations (
                            user1_id, user2_id, user1_lang, user2_lang, "group", model, conversation_history, user1_presurvey, user2_presurvey, convo_starter
                        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        RETURNING conversation_id
                    """, (
                        user1_id,
                        user2_id,
                        user_languages[websocket],
                        user_languages[match],
                        "control" if user_languages[websocket].lower() == user_languages[match].lower() else "experiment",
                        'gpt-4o',
                        Json([]),
                        Json(user_presurveys[websocket]),
                        Json(user_presurveys[match]),
                        starter_index
                    ))
                    conversation_id = cursor.fetchone()[0]
                    conn.commit()
                print(f"[INFO] Paired users {user1_id} and {user2_id} in conversation {conversation_id}.")
                conversation_mapping[websocket] = conversation_id
                conversation_mapping[match] = conversation_id
                
                pairing_message = json.dumps({
                    "type": "paired",
                    "message": "You are now paired. Start chatting!",
                    "conversation_id": conversation_id,
                    "starter_index": starter_index
                })
                await asyncio.gather(websocket.send_text(pairing_message), match.send_text(pairing_message))
                # Start chat timer for this conversation
                timer_task = asyncio.create_task(chat_timer_task(websocket, match, conversation_id))
                chat_timers[conversation_id] = timer_task
                
            except Exception as e:
                print(f"[ERROR] Failed to pair users or insert conversation into DB: {e}")
            finally:
                if conn:
                    conn.close()

async def start_chat(user1: WebSocket, user2: WebSocket, conversation_id):
    """Central chat session that reads messages from both users."""
    conn = None
    survey_submitted = {user1: False, user2: False}
    try:
        conn = get_db_connection()
        chat_ended = False
        while not chat_ended or not all(survey_submitted.values()):
            # Create concurrent receive tasks for both users
            user1_task = asyncio.create_task(safe_receive(user1))
            user2_task = asyncio.create_task(safe_receive(user2))
            
            try:
                done, pending = await asyncio.wait(
                    [user1_task, user2_task],
                    return_when=asyncio.FIRST_COMPLETED,
                )
                
                for task in done:
                    try:
                        message_text = task.result()
                        if message_text is None:
                            continue
                        message = json.loads(message_text)
                        if "type" not in message:
                            print(f"[ERROR] Missing 'type' in message: {message}")
                            continue

                        # Process message based on type
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
                            await handle_survey_submission(conn, conversation_id, sender, message, survey_submitted)

                        elif message["type"] in ["typing", "stopTyping"]:
                            target_user = user2 if task == user1_task else user1
                            await target_user.send_text(json.dumps({
                                "type": "typing",
                                "status": "typing" if message["type"] == "typing" else "stopped"
                            }))

                        elif message["type"] == "message" and "text" in message:
                            sender = user1 if task == user1_task else user2
                            receiver = user2 if sender == user1 else user1
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
        if all(survey_submitted.values()):
            await asyncio.gather(*(safe_close(user) for user in [user1, user2]))
            print("[INFO] Both surveys submitted. Chat session ended and WebSocket connections closed.")
        else:
            print("[WARNING] Chat session ended but not all surveys were submitted.")

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
        survey_submitted[sender] = True
        
        await sender.send_text(json.dumps({
            "type": "surveyReceived",
            "message": "Your survey has been submitted successfully."
        }))
    except Exception as e:
        print(f"[ERROR] Failed to store survey: {e}")

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
        # Expect an initial message with language and presurvey data
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
            user_presurveys[websocket] = {
                "qualityRating": data.get("qualityRating"),
                "seamlessRating": data.get("seamlessRating"),
                "translationeseRating": data.get("translationeseRating")
            }
            # Add to waiting room with current timestamp
            waiting_room.append((websocket, data["language"], datetime.now()))
            print(f"[INFO] User {user_id} selected language: {data['language']}.")
            
            # Keep trying to pair until either paired or no possible matches remain
            while websocket not in conversation_mapping:
                # Try to pair immediately
                await pair_users()
                
                # If still not paired, check if there are any potential matches
                current_time = datetime.now()
                join_time = next((t for w, _, t in waiting_room if w == websocket), None)
                
                if join_time:
                    # Check if there are any other users with the same language
                    same_language_users = [
                        w for w, lang, _ in waiting_room 
                        if w != websocket and lang == user_languages[websocket]
                    ]
                    
                    # If no potential matches and waited too long, then exit
                    if not same_language_users and (current_time - join_time).total_seconds() >= MAX_WAIT_TIME:
                        print(f"[INFO] No potential matches for {user_id} after waiting.")
                        await notify_prolific_overflow(user_id)
                        await safe_close(websocket)
                        return
                
                await asyncio.sleep(1)
            
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
