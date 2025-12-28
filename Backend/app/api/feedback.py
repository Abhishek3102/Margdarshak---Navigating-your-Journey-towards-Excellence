from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from app.api.auth import get_current_user
from supabase import create_client
import os
from dotenv import load_dotenv

router = APIRouter()

# Load env variables explicitly
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env'))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

try:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
except:
    supabase = None

class FeedbackCreate(BaseModel):
    type: str # 'course', 'platform', 'quick'
    course_id: Optional[str] = None
    rating: Optional[int] = None
    message: Optional[str] = None

@router.post("/")
async def submit_feedback(feedback: FeedbackCreate, user=Depends(get_current_user)):
    """
    Submits user feedback.
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="DB connection failed")

    try:
        data = {
            "user_id": user['id'],
            "type": feedback.type,
            "rating": feedback.rating,
            "message": feedback.message,
            "status": "new"
        }
        
        if feedback.course_id and feedback.course_id.strip():
             data["course_id"] = feedback.course_id

        res = supabase.table("feedback").insert(data).execute()
        
        if not res.data:
            raise HTTPException(status_code=400, detail="Failed to submit feedback")

        return {"success": True, "data": res.data[0]}

    except Exception as e:
        print(f"Feedback Submit Error: {e}")
        # Assuming table might not exist yet
        raise HTTPException(status_code=500, detail=str(e))
