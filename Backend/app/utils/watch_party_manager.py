
from typing import Dict, List
from fastapi import WebSocket

class WatchPartyManager:
    def __init__(self):
        # Map room_id -> list of WebSockets
        self.rooms: Dict[str, List[WebSocket]] = {}
        # Map websocket -> user_id (for tracking)
        self.ws_to_user: Dict[WebSocket, str] = {}
        # Map room_id -> { host_id, video_data, created_at }
        self.room_metadata: Dict[str, dict] = {}


    async def connect(self, websocket: WebSocket, room_id: str, user_id: str):
        await websocket.accept()
        
        if room_id not in self.rooms:
            self.rooms[room_id] = []
        
        self.rooms[room_id].append(websocket)
        self.ws_to_user[websocket] = user_id

    def disconnect(self, websocket: WebSocket, room_id: str):
        if room_id in self.rooms:
            if websocket in self.rooms[room_id]:
                self.rooms[room_id].remove(websocket)
            
            # Clean up empty rooms
            if not self.rooms[room_id]:
                del self.rooms[room_id]
        
        if websocket in self.ws_to_user:
            del self.ws_to_user[websocket]

    async def broadcast_to_room(self, message: dict, room_id: str, exclude_ws: WebSocket = None):
        if room_id in self.rooms:
            for connection in self.rooms[room_id]:
                if connection != exclude_ws:
                    try:
                        await connection.send_json(message)
                    except:
                        # Handle broken pipe / stale connection
                        pass

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        try:
            await websocket.send_json(message)
        except:
            pass

manager = WatchPartyManager()
