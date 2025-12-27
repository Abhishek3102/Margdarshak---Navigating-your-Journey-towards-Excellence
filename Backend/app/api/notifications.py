from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.utils.connection_manager import manager
import json

router = APIRouter()

@router.websocket("/ws/{user_id}/{role}")
async def websocket_endpoint(websocket: WebSocket, user_id: str, role: str):
    await manager.connect(websocket, user_id, role)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Logic for handling different message types
            msg_type = message.get("type")
            
            if msg_type == "ACCESS_REQUEST":
                # User requesting access -> Broadcast to Teachers
                notification = {
                    "type": "ACCESS_REQUEST",
                    "from_user": message.get("studentName"),
                    "from_id": user_id,
                    "target_class": message.get("targetClass"),
                    "message": f"{message.get('studentName')} requested access to {message.get('targetClass')}"
                }
                await manager.broadcast_to_role(notification, "teacher")
                
            elif msg_type == "ACCESS_GRANT":
                # Teacher granted access -> Send to specific Student
                student_id = message.get("studentId")
                notification = {
                    "type": "ACCESS_GRANTED",
                    "class": message.get("targetClass"),
                    "message": f"Your request for {message.get('targetClass')} has been approved!"
                }
                await manager.send_personal_message(notification, student_id)

    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
