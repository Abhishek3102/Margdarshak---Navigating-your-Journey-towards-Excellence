from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
from supabase import create_client
import json

load_dotenv()

router = APIRouter()

# Initialize Supabase
# Note: We use the key from env. If it's the anon key, RLS applies.
# If it's service_role, we bypass RLS. For this agent, we want to respect RLS for inserts
# but maybe read all.
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

class BlogPost(BaseModel):
    title: str
    content: str
    excerpt: str
    category: str
    image_url: str
    author_name: str

class BlogResponse(BlogPost):
    id: str
    created_at: str
    author_id: str

def get_supabase_client(token: str = None):
    # Create a client. If token is provided, set auth to respect RLS.
    client = create_client(SUPABASE_URL, SUPABASE_KEY)
    if token:
        client.postgrest.auth(token)
    return client

@router.get("", response_model=List[BlogResponse])
def get_blogs():
    """
    Fetch all blog posts, ordered by latest.
    """
    try:
        supabase = get_supabase_client()
        response = supabase.table("blogs").select("*").order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        print(f"Error fetching blogs: {e}")
        # Return empty list or mock data if table doesn't exist yet (graceful degradation)
        return []

from app.api.auth import get_current_user

@router.post("", response_model=dict)
def create_blog(blog: BlogPost, user: dict = Depends(get_current_user)):
    """
    Create a new blog post. Requires Authentication.
    """
    try:
        supabase = get_supabase_client(user.get("token"))
        
        # Determine author name (fallback if not provided/valid)
        author_name = blog.author_name or user.get("user_metadata", {}).get("name", "Anonymous")
        
        data = blog.dict()
        data["author_id"] = user["id"]
        # Ensure author_name is set if it was optional in request but required in DB logic, though schema has it as text.
        # We trust the request or override it. Let's start with request, but maybe override?
        # The user's request sends author_name.
        
        result = supabase.table("blogs").insert(data).execute()
        
        if result.data:
            return {"message": "Blog created successfully", "id": result.data[0]['id']}
        else:
            raise HTTPException(status_code=500, detail="Failed to create blog (No data returned)")
            
    except Exception as e:
        print(f"Error creating blog: {e}")
        raise HTTPException(status_code=500, detail=str(e))
