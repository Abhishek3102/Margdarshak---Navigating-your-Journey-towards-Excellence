from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import requests
from requests.auth import HTTPBasicAuth
import json
import os
from dotenv import load_dotenv
from supabase import create_client
from typing import List, Optional

# Load environment variables
load_dotenv()

router = APIRouter(tags=["Jira Agent"])

# --- CONFIGURATION ---
JIRA_DOMAIN = os.getenv("JIRA_DOMAIN")
JIRA_EMAIL = os.getenv("JIRA_USER_EMAIL")
JIRA_API_TOKEN = os.getenv("JIRA_API_TOKEN")
JIRA_PROJECT_KEY = os.getenv("JIRA_PROJECT_KEY", "SCRUM")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

def get_jira_auth():
    return HTTPBasicAuth(JIRA_EMAIL, JIRA_API_TOKEN)

def get_supabase_client():
    return create_client(SUPABASE_URL, SUPABASE_KEY)

# --- MODELS ---
class JiraTaskRequest(BaseModel):
    student_name: str
    topic: str
    score: int
    weak_areas: List[str]
    result_id: Optional[str] = None # Added Result ID to link back to DB

# --- ENDPOINTS ---

@router.post("/create-remedial-task")
async def create_remedial_task(request: JiraTaskRequest):
    """
    Creates a detailed remedial study plan in Jira and links it to the quiz result.
    """
    summary = f"Remedial Plan: {request.topic} for {request.student_name}"
    
    description_adf = {
        "version": 1,
        "type": "doc",
        "content": [
            {
                "type": "paragraph",
                "content": [
                    {
                        "type": "text",
                        "text": f"Student scored {request.score}% on {request.topic}. Needs improvement in:",
                         "marks": [{"type": "strong"}]
                    }
                ]
            },
            {
                "type": "bulletList",
                "content": [
                    {
                        "type": "listItem", 
                        "content": [{"type": "paragraph", "content": [{"type": "text", "text": area}]}]
                    } for area in request.weak_areas
                ]
            },
            {
                "type": "paragraph",
                "content": [{"type": "text", "text": "Recommended Actions:\n1. Review Reference Video\n2. Complete Practice Set B\n3. Retake Quiz"}]
            }
        ]
    }

    payload = {
        "fields": {
            "project": {"key": JIRA_PROJECT_KEY},
            "summary": summary,
            "description": description_adf,
            "issuetype": {"name": "Task"},
            "labels": ["remedial", "ai-tutor"]
        }
    }

    url = f"{JIRA_DOMAIN}/rest/api/3/issue"

    try:
        response = requests.post(
            url,
            json=payload,
            auth=get_jira_auth(),
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()
        data = response.json()
        
        ticket_key = data['key']
        ticket_url = f"{JIRA_DOMAIN}/browse/{ticket_key}"

        # --- UPDATE DB IF RESULT_ID PROVIDED ---
        if request.result_id:
            try:
                supabase = get_supabase_client()
                supabase.table("quiz_results").update({
                    "jira_ticket_key": ticket_key,
                    "jira_ticket_url": ticket_url
                }).eq("id", request.result_id).execute()
                print(f"Linked Ticket {ticket_key} to Result {request.result_id}")
            except Exception as db_err:
                print(f"Failed to link Jira ticket to DB: {db_err}")
                # Don't fail the request, just log it

        return {
            "status": "success",
            "ticket_key": ticket_key,
            "ticket_url": ticket_url
        }
    except requests.exceptions.RequestException as e:
        error_msg = e.response.text if e.response else str(e)
        raise HTTPException(status_code=500, detail=f"Jira API Error: {error_msg}")


@router.post("/test-connection")
async def test_connection():
    """
    Simple endpoint to verify credentials.
    """
    domain = JIRA_DOMAIN
    if not domain:
        raise HTTPException(status_code=500, detail="Jira Domain not configured")
        
    url = f"{domain}/rest/api/3/myself"
    try:
        response = requests.get(
            url, 
            auth=get_jira_auth(),
            headers={"Content-Type": "application/json"}
        )
        if response.status_code == 200:
            return {"status": "connected", "user": response.json().get("displayName")}
        else:
             raise HTTPException(status_code=400, detail=f"Connection Failed: {response.status_code}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
