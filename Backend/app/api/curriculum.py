from fastapi import APIRouter, HTTPException
from supabase import create_client
import os
from dotenv import load_dotenv

router = APIRouter()

# Load env variables explicitly
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env'))

# Log setup
def log_error(msg):
    with open("backend_error.log", "a") as f:
        f.write(f"[Curriculum] {msg}\n")

# Initialize Supabase Client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

try:
    if not SUPABASE_URL or not SUPABASE_KEY:
        log_error("Missing SUPABASE_URL or SUPABASE_KEY")
        supabase = None
    else:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception as e:
    log_error(f"Supabase Init Error: {e}")
    supabase = None

@router.get("/structure")
async def get_curriculum_structure():
    """
    Returns the full hierarchical structure of the curriculum:
    Standards -> Subjects -> Chapters -> Videos
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not configured")

    try:
        # 1. Fetch all data in parallel usually, but sequential is fine for now
        # Fetch Standards (Classes)
        stds = supabase.table("standards").select("id, name, description").order("name").execute()
        standards = stds.data

        # Fetch Subjects
        subjs = supabase.table("subjects").select("id, standard_id, name, icon_url").execute()
        subjects = subjs.data
        
        # Fetch Chapters
        chaps = supabase.table("chapters").select("id, subject_id, title, sequence_order").order("sequence_order").execute()
        chapters = chaps.data

        # Fetch Videos (Topics)
        vids = supabase.table("videos").select("id, chapter_id, title, duration_seconds").execute()
        videos = vids.data

        # 2. Build Hierarchy
        # Map Videos to Chapters
        vid_map = {} # chapter_id -> [videos]
        for v in videos:
            cid = v.get('chapter_id')
            if cid not in vid_map:
                vid_map[cid] = []
            vid_map[cid].append(v)

        # Map Chapters to Subjects
        chap_map = {} # subject_id -> [chapters]
        for c in chapters:
            sid = c.get('subject_id')
            if sid not in chap_map:
                chap_map[sid] = []
            # Attach videos to chapter
            c['videos'] = vid_map.get(c['id'], [])
            chap_map[sid].append(c)

        # Map Subjects to Standards
        subj_map = {} # standard_id -> [subjects]
        for s in subjects:
            stid = s.get('standard_id')
            if stid not in subj_map:
                subj_map[stid] = []
            # Attach chapters to subject
            s['chapters'] = chap_map.get(s['id'], [])
            subj_map[stid].append(s)

        # Attach Subjects to Standards
        result = []
        for st in standards:
            st['subjects'] = subj_map.get(st['id'], [])
            result.append(st)

        return {"data": result}
        
    except Exception as e:
        print(f"Curriculum Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
