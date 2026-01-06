from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Body
from app.api.auth import get_current_user
from pydantic import BaseModel
import os
import io
from typing import Optional, List
import google.generativeai as genai
from supabase import create_client, Client
import cloudinary
import cloudinary.uploader
from datetime import datetime, timezone
import re

router = APIRouter()

# --- Config ---
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
MEM0_API_KEY = os.getenv("MEM0_API_KEY")

# Cloudinary Config (Check if exists)
CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")

if CLOUDINARY_CLOUD_NAME and CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET:
    cloudinary.config(
        cloud_name=CLOUDINARY_CLOUD_NAME,
        api_key=CLOUDINARY_API_KEY,
        api_secret=CLOUDINARY_API_SECRET
    )

if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)
    # Reverting to gemini-1.5-flash for reliable Vision and Instruction following
    model = genai.GenerativeModel('gemini-flash-lite-latest')

# --- Endpoints ---

@router.get("/sessions")
async def get_sessions(user: dict = Depends(get_current_user)):
    """List all chat sessions for the user."""
    supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
    supabase.postgrest.auth(user["token"])
    
    try:
        res = supabase.table("ai_chat_sessions")\
            .select("*")\
            .order("updated_at", desc=True)\
            .execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sessions")
async def create_session(title: str = Body(embed=True, default="New Chat"), user: dict = Depends(get_current_user)):
    """Create a new chat session."""
    supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
    supabase.postgrest.auth(user["token"])
    
    try:
        res = supabase.table("ai_chat_sessions")\
            .insert({"user_id": user["id"], "title": title})\
            .execute()
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str, user: dict = Depends(get_current_user)):
    """Delete a chat session."""
    supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
    supabase.postgrest.auth(user["token"])
    
    try:
        # Check ownership (handled by RLS policy, but explicit check is good practice)
        # RLS 'Users can delete own sessions' handles it.
        supabase.table("ai_chat_sessions").delete().eq("id", session_id).execute()
        return {"message": "Session deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions/{session_id}")
async def get_session_history(session_id: str, user: dict = Depends(get_current_user)):
    """Get messages for a specific session."""
    supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
    supabase.postgrest.auth(user["token"])
    
    try:
        res = supabase.table("ai_chat_messages")\
            .select("*")\
            .eq("session_id", session_id)\
            .order("created_at", desc=False)\
            .execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/message")
async def send_message(
    session_id: str = Form(...),
    message: str = Form(...),
    image: Optional[UploadFile] = File(None),
    user: dict = Depends(get_current_user)
):
    """
    Send a message (Text + Optional Image).
    Handles persistence, Mem0 context, Gemini generation, and Rate Limiting.
    """
    supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
    supabase.postgrest.auth(user["token"])

    image_url = None
    
    # 1. Image Handling & Rate Limiting
    if image:
        # Check Rate Limit (Max 4 images per day)
        today_start = datetime.now(timezone.utc).date().isoformat()
        
        try:
            # Fix: Use correct filter for NOT NULL
            count_res = supabase.table("ai_chat_messages")\
                .select("id", count="exact")\
                .not_.is_("image_url", "null")\
                .gte("created_at", today_start)\
                .execute()
                
            if count_res.count >= 4:
                raise HTTPException(status_code=429, detail="Daily image limit reached (4/4). Please try again tomorrow.")
        except HTTPException as he:
            raise he
        except Exception as e:
            print(f"Rate Limit Check Error: {e}")
            # Fail open or closed? Let's log and proceed for now unless critical
            pass 
        
        # Upload to Cloudinary
        try:
            # Reset cursor just in case
            await image.seek(0)
            content = await image.read()
            upload_result = cloudinary.uploader.upload(io.BytesIO(content), folder="ai_tutor_images")
            image_url = upload_result.get("secure_url")
        except Exception as e:
            print(f"Upload Error: {e}")
            raise HTTPException(status_code=500, detail="Image upload failed")

    # 2. Save User Message
    user_msg_data = {
        "session_id": session_id,
        "role": "user",
        "content": message,
        "image_url": image_url
    }
    try:
        supabase.table("ai_chat_messages").insert(user_msg_data).execute()
         # Update session timestamp
        supabase.table("ai_chat_sessions").update({"updated_at": "now()"}).eq("id", session_id).execute()
    except Exception as e:
         print(f"DB Insert Error: {e}")
         raise HTTPException(status_code=500, detail=f"Failed to save message: {str(e)}")

    # 3. Retrieve Mem0 Context
    context_str = ""
    try:
        google_key = os.getenv("GOOGLE_API_KEY")
        if google_key:
            from mem0 import Memory
            
            qdrant_url = os.getenv("QDRANT_URL")
            qdrant_key = os.getenv("QDRANT_API_KEY")
            
            vector_config = {}
            if qdrant_url and qdrant_key:
                vector_config = {"provider": "qdrant", "config": {"url": qdrant_url, "api_key": qdrant_key}}
            else:
                db_path = os.path.join(os.getcwd(), "mem0_db")
                vector_config = {"provider": "qdrant", "config": {"path": db_path}}

            config = {
                "vector_store": vector_config,
                "embedder": {"provider": "gemini", "config": {"api_key": google_key, "model": "models/embedding-001"}},
                "llm": {"provider": "gemini", "config": {"api_key": google_key, "model": "gemini-flash-lite-latest"}}
            }
            m = Memory.from_config(config)
            
            memories = m.get_all(user_id=user["id"])
            if memories:
                 # Fix: Handle both dict (mem['memory']) and string formats
                 context_str = "\n".join([m['memory'] if isinstance(m, dict) else str(m) for m in memories])
    except Exception as mem_err:
        print(f"Mem0 Handling Error: {mem_err}")
        # Continue without memory

    # 4. Retrieve Chat History (Short-Term Memory)
    history_str = ""
    try:
        # Fetch last 10 messages
        hist_res = supabase.table("ai_chat_messages")\
            .select("role, content")\
            .eq("session_id", session_id)\
            .order("created_at", desc=True)\
            .limit(10)\
            .execute()
        
        # Reverse to chronological order and format
        if hist_res.data:
            msgs = reversed(hist_res.data)
            history_str = "\n".join([f"{msg['role'].capitalize()}: {msg['content']}" for msg in msgs])
    except Exception as hist_err:
        print(f"History Fetch Error: {hist_err}")

    # 5. Generate AI Response
    system_prompt = f"""
    You are 'Margdarshak AI'.
    
    Student Context (Long-Term Memory):
    {context_str}

    Recent Conversation History (Short-Term Context):
    {history_str}
    
    CRITICAL INSTRUCTIONS:
    1. **Study Queries**: If the user asks about a Subject/Topic (Math, Science, History, etc.), you MUST use the 'Student Context' above.
       - Adjust diffculty based on their profile (e.g., if they struggle with Math, explain simply).
       - Use Socratic questioning.
       
    2. **General Queries**: If the user asks general questions (e.g., "How are you?", "What is the weather?", "Tell me a joke"), DROP the Socratic persona.
       - Be friendly, neutral, and helpful.
       - Do NOT force academic context into casual conversation.
       
    3. **Images**: If an image is provided, analyze it first.

    4. **Formatting**: 
       - Provide answers in CLEAN, PLAIN TEXT. 
       - Do NOT use Markdown styling (no **bold**, no *italics*, no ## headers). 
       - Use numbered lists (1., 2., 3.) for main points.
       - Ensure each point starts on a NEW LINE.
       - Keep it concise and easy to read.
    """
    
    try:
        # Prompt Construction
        # Order: [System Prompt, Image(s), User Message]
        content_parts = []
        
        # 1. System Prompt (as text)
        content_parts.append(system_prompt)

        # 2. Image (if present)
        if image_url and image:
             try:
                await image.seek(0)
                import PIL.Image
                img_pil = PIL.Image.open(io.BytesIO(await image.read()))
                content_parts.append(img_pil) 
                print("Image attached to Gemini request")
             except Exception as img_err:
                 print(f"Image Process Error: {img_err}")

        # 3. User Message
        content_parts.append(f"Student Question: {message}")
        
        response = model.generate_content(content_parts)
        ai_text = response.text
        
        # --- REGEX CLEANUP ---
        # User requested strict plain text with no stars/markdown.
        ai_text = re.sub(r'\*\*(.*?)\*\*', r'\1', ai_text) # Remove bold
        ai_text = re.sub(r'\*(.*?)\*', r'\1', ai_text)     # Remove italic
        ai_text = re.sub(r'_(.*?)_', r'\1', ai_text)       # Remove underscore italic
        ai_text = re.sub(r'#{1,6}\s*', '', ai_text)        # Remove headers
        ai_text = ai_text.replace("```", "")               # Remove code blocks
        ai_text = ai_text.replace("`", "")                 # Remove inline code
        ai_text = re.sub(r'\n{3,}', '\n\n', ai_text)       # Normalize newlines
        # ---------------------
        
        # 5. Save AI Response
        ai_msg_data = {
            "session_id": session_id,
            "role": "assistant",
            "content": ai_text
        }
        supabase.table("ai_chat_messages").insert(ai_msg_data).execute()
        
        return {"response": ai_text, "image_url": image_url}
        
    except Exception as e:
        print(f"GenAI/Process Error: {e}")
        raise HTTPException(status_code=500, detail=f"AI Generation failed: {str(e)}")
