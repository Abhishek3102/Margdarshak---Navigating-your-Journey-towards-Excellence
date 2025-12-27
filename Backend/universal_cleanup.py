from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()
supabase = create_client(os.environ.get("SUPABASE_URL"), os.environ.get("SUPABASE_KEY"))

def deep_clean_standard(std_id):
    print(f"Deep cleaning Standard {std_id}...")
    # 1. Get Subject IDs
    subs = supabase.table("subjects").select("id").eq("standard_id", std_id).execute().data
    sub_ids = [s['id'] for s in subs]
    
    if sub_ids:
        # 2. Get Chapter IDs
        chaps = supabase.table("chapters").select("id").in_("subject_id", sub_ids).execute().data
        chap_ids = [c['id'] for c in chaps]
        
        if chap_ids:
            # 3. Delete Videos
            supabase.table("videos").delete().in_("chapter_id", chap_ids).execute()
            
            # 4. Delete Prerequisites
            supabase.table("chapter_prerequisites").delete().in_("chapter_id", chap_ids).execute()
            supabase.table("chapter_prerequisites").delete().in_("prerequisite_chapter_id", chap_ids).execute()

            # 5. Delete Chapters
            supabase.table("chapters").delete().in_("id", chap_ids).execute()
    
    # 6. Delete Subjects
    supabase.table("subjects").delete().eq("standard_id", std_id).execute()

    # 7. Delete Standard
    supabase.table("standards").delete().eq("id", std_id).execute()
    print(f"Standard {std_id} deleted.")

# Fetch all standards
all_stds = supabase.table("standards").select("id, name").execute().data
grouped = {}

# Group by name
for s in all_stds:
    if s['name'] not in grouped:
        grouped[s['name']] = []
    grouped[s['name']].append(s['id'])

# Check for duplicates
for name, ids in grouped.items():
    if len(ids) > 1:
        print(f"Found {len(ids)} copies of '{name}'.")
        
        # Find the 'best' one (most subjects)
        best_id = None
        max_subs = -1
        
        for i in ids:
            count = supabase.table("subjects").select("id", count="exact").eq("standard_id", i).execute().count
            print(f" - ID {i} has {count} subjects")
            if count > max_subs:
                max_subs = count
                best_id = i
        
        print(f"Keeping {best_id} with {max_subs} subjects. Deleting others...")
        
        for i in ids:
            if i != best_id:
                deep_clean_standard(i)
    else:
        print(f"'{name}' is unique.")

print("Universal cleanup complete.")
