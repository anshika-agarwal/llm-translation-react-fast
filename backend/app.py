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

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# Enable CORS for frontend access
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

# WebSocket user management
waiting_room = []  # List of (WebSocket, timestamp)
active_users = {}  # {user1: user2, user2: user1}
user_languages = {}  # Language preferences
conversation_mapping = {}  # Maps users to conversation_id
user_presurveys = {}
chat_timers = {}  # {conversation_id: asyncio.Task}
websocket_to_uuid = {}  # Maps WebSocket to UUID


def get_db_connection():
    return psycopg2.connect(**DB_CONFIG)


@app.get("/")
async def root():
    return JSONResponse({"message": "Welcome to the FastAPI WebSocket server!"})


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Handles WebSocket connections from clients."""
    print(f"[INFO] New WebSocket connection attempt from {websocket.client}")
    await websocket.accept()
    
    # Assign UUID to WebSocket
    user_id = str(uuid.uuid4())
    websocket_to_uuid[websocket] = user_id
    print(f"[INFO] Assigned UUID {user_id} to WebSocket")

    try:
        while True:
            # Safely receive messages
            message = await safe_receive(websocket)
            if message is None:
                break  # WebSocket disconnected

            print(f"[INFO] Received message: {message}")
            data = json.loads(message)

            if data["type"] == "language":
                user_languages[websocket] = data["language"]
                print(f"[INFO] User {user_id} selected language: {data['language']}")

                # Store presurvey data
                presurvey = {
                    "qualityRating": data.get("question1"),
                    "seamlessRating": data.get("question2"),
                    "translationeseRating": data.get("question3")
                }
                user_presurveys[websocket] = presurvey
                print(f"[INFO] User presurvey data: {presurvey}")

                # Add user to waiting room
                waiting_room.append((websocket, time.time()))
                print(f"[INFO] User {user_id} added to waiting room")

            # Try pairing users
            if len(waiting_room) >= 2:
                await pair_users()

    except WebSocketDisconnect:
        print(f"[INFO] WebSocket {user_id} disconnected")
    except Exception as e:
        print(f"[ERROR] Exception in WebSocket: {e}")
    finally:
        remove_user_from_active(websocket)


async def safe_receive(websocket: WebSocket):
    """Safely receives a WebSocket message while handling disconnections."""
    try:
        return await websocket.receive_text()
    except WebSocketDisconnect:
        print(f"[INFO] WebSocket {id(websocket)} disconnected.")
        return None
    except Exception as e:
        print(f"[ERROR] Error while receiving message: {e}")
        return None


async def pair_users():
    """Pairs two users together for a conversation."""
    global waiting_room, active_users, conversation_mapping
    if len(waiting_room) >= 2:
        user1, _ = waiting_room.pop(0)
        user2, _ = waiting_room.pop(0)

        active_users[user1] = user2
        active_users[user2] = user1

        conversation_id = str(uuid.uuid4())  # Generate a conversation ID
        conversation_mapping[user1] = conversation_id
        conversation_mapping[user2] = conversation_id

        print(f"[INFO] Paired users for conversation {conversation_id}")

        # Notify users
        await user1.send_text(json.dumps({"type": "paired", "conversation_id": conversation_id}))
        await user2.send_text(json.dumps({"type": "paired", "conversation_id": conversation_id}))

        # Start chat timer
        chat_timers[conversation_id] = asyncio.create_task(chat_timer_task(user1, user2, conversation_id))


async def chat_timer_task(user1, user2, conversation_id):
    """Manages the chat session timer."""
    try:
        total_time = 180  # 3 minutes
        print(f"[INFO] Timer started for conversation {conversation_id}")

        for remaining_time in range(total_time, 0, -1):
            await user1.send_text(json.dumps({"type": "timer", "remaining_time": remaining_time}))
            await user2.send_text(json.dumps({"type": "timer", "remaining_time": remaining_time}))
            await asyncio.sleep(1)

        # End chat session
        print(f"[INFO] Chat timer expired for conversation {conversation_id}")
        await user1.send_text(json.dumps({"type": "expired", "conversation_id": conversation_id}))
        await user2.send_text(json.dumps({"type": "expired", "conversation_id": conversation_id}))

    except asyncio.CancelledError:
        print(f"[INFO] Chat timer cancelled for conversation {conversation_id}")


async def translate_message(message, source_language, target_language):
    """Translates a message using OpenAI API."""
    language_map = {
        "english": "English",
        "chinese": "Chinese",
        "spanish": "Spanish"
    }
    source = language_map.get(source_language, "English")
    target = language_map.get(target_language, "English")

    if source == target:
        return message  # No translation needed

    prompt = f"Translate this {source} text to {target}: {message}. Answer with only the translation."
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"[ERROR] OpenAI API call failed: {e}")
        return "Translation error."


async def safe_close(websocket: WebSocket):
    """Safely closes a WebSocket connection."""
    try:
        await websocket.close(code=1000)
        print(f"[INFO] WebSocket {id(websocket)} closed successfully.")
    except Exception as e:
        print(f"[ERROR] Error closing WebSocket {id(websocket)}: {e}")


def remove_user_from_active(user):
    """Removes a user from active users and cleans up connections."""
    global active_users, waiting_room
    if user in active_users:
        partner = active_users.pop(user, None)
        if partner:
            active_users.pop(partner, None)
            print(f"[INFO] Removed User {websocket_to_uuid.get(user, 'unknown')} from active_users.")

    waiting_room[:] = [(w, ts) for w, ts in waiting_room if w != user]


if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
