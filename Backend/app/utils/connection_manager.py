from typing import List, Dict
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # Map user_id to a list of active WebSockets (user might have multiple tabs)
        self.active_connections: Dict[str, List[WebSocket]] = {}
        # Map role to list of user_ids (helper for broadcasting to 'teacher')
        self.user_roles: Dict[str, str] = {} 

    async def connect(self, websocket: WebSocket, user_id: str, role: str):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        self.user_roles[user_id] = role

    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
                if user_id in self.user_roles:
                    del self.user_roles[user_id]

    async def send_personal_message(self, message: dict, user_id: str):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except:
                    # Handle stale connection
                    pass

    async def broadcast_to_role(self, message: dict, role: str):
        # Find all user_ids with this role
        target_users = [uid for uid, r in self.user_roles.items() if r == role]
        for uid in target_users:
            await self.send_personal_message(message, uid)

manager = ConnectionManager()
