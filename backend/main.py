from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from socket_manager import manager
from routers import auth, transactions, analytics
from logger import get_logger
from fastapi.staticfiles import StaticFiles
import os

load_dotenv()

os.makedirs("uploads", exist_ok=True)

logger = get_logger(__name__)
logger.info("Initializing NeuroShield API Server...")

app = FastAPI(title="NeuroShield API")

app.mount("/static", StaticFiles(directory="uploads"), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/ping", tags=["Health"])
@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "ok", 
        "message": "NeuroShield API is running smoothly."
    }

# Include Routers
app.include_router(auth.router, tags=["Authentication"])
app.include_router(transactions.router, tags=["Transactions"])
app.include_router(analytics.router, tags=["Analytics"])

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
