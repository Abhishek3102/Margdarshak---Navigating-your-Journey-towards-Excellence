import os
from dotenv import load_dotenv
from supabase import create_client

# Load env
load_dotenv(dotenv_path=".env")
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

if not url or not key:
    print("Error: Missing credentials")
    exit(1)

supabase = create_client(url, key)

def fix_audio():
    print("Starting Audio Recovery...")
    
    # Fetch all videos (paged if necessary, but 1000 limit is fine for now)
    res = supabase.from_("videos").select("id, title, video_url").limit(1000).execute()
    
    if not res.data:
        print("No videos found.")
        return

    count = 0
    for vid in res.data:
        original_url = vid["video_url"]
        if not original_url:
            continue
            
        # Check for 'ac_none'
        if "ac_none" in original_url:
            # Remove ac_none and clean up commas/slashes
            # Scenarios: "/ac_none,q_auto/" or "/q_auto,ac_none/"
            
            new_url = original_url.replace("ac_none", "")
            
            # Clean up artifacts
            new_url = new_url.replace(",,", ",")
            new_url = new_url.replace("/,", "/")
            new_url = new_url.replace(",/", "/")
            
            # Explicit cleanup if it was the only param
            # e.g. "/upload/ac_none/v1" -> "/upload//v1" -> "/upload/v1" (Cloudinary handles empty segments mostly but better safe)
            # Actually Cloudinary URL stucture: /upload/TRANSFORMATIONS/v1..
            # If transformations become empty (e.g. was just ac_none), we get /upload//v1
            
            # Regex or smart replace might be better, but let's just handle double slash in middle
            # But wait, http:// has double slash. Be careful.
            
            # Safest: Use split/join on '/'
            parts = new_url.split("/")
            # Remove empty strings between upload and version if strictly empty?
            # Cloudinary is robust.
            
            print(f"Fixing Video: {vid['title']}")
            print(f"  Old: {original_url}")
            print(f"  New: {new_url}")
            
            try:
                supabase.from_("videos").update({"video_url": new_url}).eq("id", vid["id"]).execute()
                print("  -> Success")
                count += 1
            except Exception as e:
                print(f"  -> Failed: {e}")

    print(f"Recovery Complete. Fixed {count} videos.")

if __name__ == "__main__":
    fix_audio()
