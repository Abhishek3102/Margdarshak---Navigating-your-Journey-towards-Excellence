
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.utils.watch_party_manager import manager
import uuid
import datetime
import json

router = APIRouter()

class CreateRoomRequest(BaseModel):
    video_url: str
    video_title: str
    host_id: str
    host_name: str
    
class RoomResponse(BaseModel):
    room_id: str
    video_url: str
    video_title: str
    host_id: str
    host_name: str
    created_at: str

@router.post("/create", response_model=RoomResponse)
async def create_room(req: CreateRoomRequest):
    room_id = str(uuid.uuid4())[:8] # Short ID
    
    manager.room_metadata[room_id] = {
        "room_id": room_id,
        "video_url": req.video_url,
        "video_title": req.video_title,
        "host_id": req.host_id,
        "host_name": req.host_name,
        "created_at": datetime.datetime.now().isoformat()
    }
    
    return manager.room_metadata[room_id]

@router.get("/{room_id}", response_model=RoomResponse)
async def get_room(room_id: str):
    if room_id not in manager.room_metadata:
        raise HTTPException(status_code=404, detail="Watch Party not found or expired")
    return manager.room_metadata[room_id]

@router.websocket("/ws/{room_id}/{user_id}")
async def websocket_watch_party(websocket: WebSocket, room_id: str, user_id: str):
    # Verify room exists (optional, or auto-create if we wanted ad-hoc)
    if room_id not in manager.room_metadata:
        await websocket.close(code=4004, reason="Room not found")
        return

    await manager.connect(websocket, room_id, user_id)
    
    # Broadcast Join Event
    await manager.broadcast_to_room({
        "type": "USER_JOINED", 
        "userId": user_id
    }, room_id, exclude_ws=websocket)

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            msg_type = message.get("type")
            
            # --- VIDEO SYNC ACTIONS (Play, Pause, Seek) ---
            if msg_type in ["PLAY", "PAUSE", "SEEK"]:
                # Broadcast to everyone ELSE
                await manager.broadcast_to_room(message, room_id, exclude_ws=websocket)
                
            # --- CHAT MESSAGES ---
            elif msg_type == "CHAT_MESSAGE":
                # Broadcast to EVERYONE (including sender, for simple echo/order)
                # Or sender handles optimistic UI. Let's broadcast to everyone for consistency.
                await manager.broadcast_to_room(message, room_id)
                
            # --- SYNC REQUEST (New user asking for current time) ---
            elif msg_type == "REQUEST_SYNC":
                # Broadcast to Host (or everyone) to send back state
                # Ideally send to Host only, but we don't track who is host in `rooms` mapping strictly
                # So broadcast to everyone, Host client filters it
                await manager.broadcast_to_room(message, room_id, exclude_ws=websocket)
            
            # --- SYNC STATE RESPONSE (Host replying) ---
            elif msg_type == "SYNC_STATE":
                # Send to specific requester
                # target_user_id = message.get("targetUserId")
                await manager.broadcast_to_room(message, room_id)

            # --- VOICE CHAT SIGNALING ---
            elif msg_type == "VOICE_JOIN":
                # Broadcast desire to join voice (triggers existing users to offer)
                await manager.broadcast_to_room(message, room_id, exclude_ws=websocket)

            elif msg_type in ["VOICE_OFFER", "VOICE_ANSWER", "VOICE_ICE_CANDIDATE"]:
                # P2P Signaling: Must reach the specific target
                # We broadcast to room because we don't have target_ws map yet
                # Client will filter by 'to' field
                await manager.broadcast_to_room(message, room_id, exclude_ws=websocket)

    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)
        # Broadcast Leave Event
        await manager.broadcast_to_room({
            "type": "USER_LEFT",
            "userId": user_id
        }, room_id)
