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
                    "translationeseRating":
