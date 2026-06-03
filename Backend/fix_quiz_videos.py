import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: Missing SUPABASE credentials in .env")
    exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def fix_quizzes():
    try:
        # 1. Get the most recently uploaded video
        print("Fetching the latest video from the database...")
        res = supabase.table("videos").select("video_url, title").order("created_at", desc=True).limit(1).execute()
        
        if not res.data:
            print("No videos found in the database. Have you uploaded the new video?")
            return
            
        latest_video = res.data[0]
        new_video_url = latest_video["video_url"]
        new_title = latest_video["title"]
        print(f"Found latest video: '{new_title}' with URL: {new_video_url}")
        
        # 2. Find all quizzes that do NOT have this video URL
        print("Finding old quizzes to update...")
        quizzes_res = supabase.table("generated_quizzes").select("id, video_url").neq("video_url", new_video_url).execute()
        
        old_quizzes = quizzes_res.data
        if not old_quizzes:
            print("All quizzes are already up to date!")
            return
            
        print(f"Found {len(old_quizzes)} old quizzes to update.")
        
        # 3. Update the quizzes to use the new video_url
        for quiz in old_quizzes:
            supabase.table("generated_quizzes").update({"video_url": new_video_url}).eq("id", quiz["id"]).execute()
            print(f"Updated quiz ID: {quiz['id']} to new video URL.")
            
        print("\nSuccess! All old quizzes have been restored and linked to the new video.")
        
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    fix_quizzes()
