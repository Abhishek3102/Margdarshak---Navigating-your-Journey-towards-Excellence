from supabase import Client
from typing import List, Dict
import json

async def update_mastery_score(supabase: Client, user_id: str, concept_tag: str, is_correct: bool):
    """
    Updates the weighted mastery score for a concept.
    Simple decay algorithm: NewUserScore = (OldScore * 0.9) + (Performance * 0.1)
    """
    # 1. Fetch current mastery
    # Note: You need a 'user_mastery' table. If not exists, we assume 50.
    # For MVP, we mock this fetch or assume a table structure.
    # res = supabase.table("user_mastery").select("score").eq("user_id", user_id).eq("concept", concept_tag).execute()
    
    current_score = 50.0 # Default
    
    # 2. Calculate new score
    performance = 100.0 if is_correct else 0.0
    new_score = (current_score * 0.9) + (performance * 0.1)
    
    # 3. Update DB (Mocking the table update for now)
    # await supabase.table("user_mastery").upsert({...}).execute()
    
    return new_score

async def get_remedial_loop(supabase: Client, failed_concept: str) -> List[Dict]:
    """
    If student fails 'failed_concept', look up graphs to find prerequisites.
    """
    # 1. Finds Concept ID from Name (Mock logic for slug)
    concept_slug = failed_concept.lower().replace(" ", "-")
    
    # 2. Query Prerequisites from a 'concepts' table or 'chapter_prerequisites'
    # Assuming we map Concept -> Chapter for now
    # Note: Requires a strict mapping of Concept Tag -> Chapter ID
    
    return [
        {"type": "video", "title": f"Basics of {failed_concept}", "url": "http://cloudinary..."}
    ]
