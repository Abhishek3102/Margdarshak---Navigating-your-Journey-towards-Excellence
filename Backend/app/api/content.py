from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.models import Standard, Subject, Chapter, VideoContent
from app.api.auth import get_supabase
from supabase import Client

router = APIRouter()

# --- Standards ---

@router.get("/standards", response_model=List[Standard])
async def get_standards():
    supabase = get_supabase()
    response = supabase.table("standards").select("*").execute()
    return response.data

@router.post("/standards")
async def create_standard(standard: Standard):
    # TODO: Add Admin Check Dependency
    supabase = get_supabase()
    response = supabase.table("standards").insert(standard.model_dump(exclude={"id"})).execute()
    return response.data[0]

# --- Subjects ---

@router.get("/standards/{standard_id}/subjects", response_model=List[Subject])
async def get_subjects(standard_id: str):
    supabase = get_supabase()
    response = supabase.table("subjects").select("*").eq("standard_id", standard_id).execute()
    return response.data

@router.post("/subjects")
async def create_subject(subject: Subject):
    supabase = get_supabase()
    response = supabase.table("subjects").insert(subject.model_dump(exclude={"id"})).execute()
    return response.data[0]

# --- Chapters ---

@router.get("/subjects/{subject_id}/chapters", response_model=List[Chapter])
async def get_chapters(subject_id: str):
    supabase = get_supabase()
    # Fetch chapters
    response = supabase.table("chapters").select("*").eq("subject_id", subject_id).order("sequence_order").execute()
    chapters = response.data
    
    # Logic to fetch prerequisites for each chapter could go here
    # For now, we return the base chapter data. 
    # To fully implement user request ("show prerequisites below"), the frontend will 
    # query the `chapter_prerequisites` table or we enrich the response here.
    return chapters

@router.get("/chapters/{chapter_id}/prerequisites")
async def get_chapter_prerequisites(chapter_id: str):
    supabase = get_supabase()
    # Join with chapters table to get details of the prerequisite chapters
    response = supabase.table("chapter_prerequisites").select("prerequisite_chapter_id, chapters:prerequisite_chapter_id(*)").eq("chapter_id", chapter_id).execute()
    
    # Flatten structure if needed, or return as is
    return [item['chapters'] for item in response.data if item.get('chapters')]

# --- Videos ---

@router.get("/chapters/{chapter_id}/videos", response_model=List[VideoContent])
async def get_videos(chapter_id: str):
    supabase = get_supabase()
    response = supabase.table("videos").select("*").eq("chapter_id", chapter_id).order("sequence_order").execute()
    return response.data
