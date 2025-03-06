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

# Global variable to track sequential conversation IDs
conversation_counter = 100  # Start at 100

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
        # Receive user language selection and presurvey
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
            print(f"[INFO] User {user_id} selected language: {data['language']}")

        # Try pairing users
        if len(waiting_room) >= 2:
            await pair_users()

        # Wait until paired
        while websocket not in active_users:
            await asyncio.sleep(1)

        partner = active_users[websocket]
        conversation_id = conversation_mapping.get(websocket)

        if conversation_id is not None:
            await start_chat(websocket, partner, conversation_id)
        else:
            print(f"[ERROR] Conversation ID not found for User {user_id}.")
            await websocket.close(code=1011)

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
    """Pairs two users together for a conversation with sequential numbering."""
    global waiting_room, active_users, conversation_mapping, conversation_counter

    if len(waiting_room) >= 2:
        user1, _ = waiting_room.pop(0)
        user2, _ = waiting_room.pop(0)

        active_users[user1] = user2
        active_users[user2] = user1

        # Assign a sequential numeric conversation ID
        conversation_id = conversation_counter
        conversation_counter += 1

        conversation_mapping[user1] = conversation_id
        conversation_mapping[user2] = conversation_id

        print(f"[INFO] Paired users for conversation {conversation_id}")

        # Notify both users of the pairing
        await user1.send_text(json.dumps({"type": "paired", "conversation_id": conversation_id}))
        await user2.send_text(json.dumps({"type": "paired", "conversation_id": conversation_id}))

        # Start chat session
        await start_chat(user1, user2, conversation_id)

async def start_chat(user1, user2, conversation_id):
    """Handles message relay between two connected users."""
    try:
        while True:
            # Wait for either user to send a message
            user1_task = asyncio.create_task(safe_receive(user1))
            user2_task = asyncio.create_task(safe_receive(user2))

            done, pending = await asyncio.wait(
                [user1_task, user2_task], return_when=asyncio.FIRST_COMPLETED
            )

            for task in done:
                message = task.result()
                if message is None:
                    continue  # Ignore empty messages

                message_data = json.loads(message)

                if message_data["type"] == "message":
                    sender = user1 if task == user1_task else user2
                    receiver = user2 if sender == user1 else user1

                    print(f"[INFO] Forwarding message from {websocket_to_uuid[sender]} to {websocket_to_uuid[receiver]}: {message_data['text']}")

                    # Send the message to the recipient
                    await receiver.send_text(json.dumps({"type": "message", "text": message_data["text"]}))

    except Exception as e:
        print(f"[ERROR] Exception in start_chat: {e}")

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