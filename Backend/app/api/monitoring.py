from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.api.auth import get_supabase

router = APIRouter()

class EngagementSignal(BaseModel):
    user_id: str
    session_id: str
    timestamp: datetime
    state: str # FOCUSED, CONFUSED, DISTRACTED
    confidence: float
    metadata: Optional[dict] = {}

@router.post("/log-signal")
async def log_engagement_signal(signal: EngagementSignal, background_tasks: BackgroundTasks):
    """
    Receives 'Invisible Monitoring' signals from the generic Local AI.
    """
    supabase = get_supabase()
    
    # 1. Real-time Broadcast (to Teacher Dashboard)
    # We broadcast to a specific channel for the class or session
    channel_name = f"session_{signal.session_id}"
    
    try:
        # Supabase Realtime Broadcast is typically handled via client-side libraries
        # But we can insert into a table that client listens to.
        
        # Async Insert into logs
        background_tasks.add_task(
            supabase.table("engagement_logs").insert,
            {
                "user_id": signal.user_id,
                "session_id": signal.session_id,
                "state": signal.state,
                "confidence": signal.confidence,
                "created_at": signal.timestamp.isoformat()
            }
        )
        
        # If 'CONFUSED' persists, trigger an Alert (Logic to be added)
        if signal.state == "CONFUSED":
             print(f"ALERT: Student {signal.user_id} is CONFUSED.")
             
        return {"status": "received"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
