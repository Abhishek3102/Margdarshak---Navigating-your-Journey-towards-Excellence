
import os
import asyncio
import sys
import json
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
TARGET_USER_ID = "8713360a-4912-4e08-a657-8f3f014b2811"

async def debug_status():
    sys.stdout.write(f"DEBUG_START\n")
    results = supabase.table("quiz_results").select("id, quiz_id").eq("user_id", TARGET_USER_ID).execute()
    
    data = []
    for r in results.data:
        quiz = supabase.table("generated_quizzes").select("video_url").eq("id", r['quiz_id']).execute()
        url = quiz.data[0]['video_url'] if quiz.data else "ORPHANED"
        data.append({"result_id": r['id'], "quiz_id": r['quiz_id'], "url": url})
        
    print(json.dumps(data, indent=2))
    sys.stdout.flush()

if __name__ == "__main__":
    asyncio.run(debug_status())
