from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()
supabase = create_client(os.environ.get("SUPABASE_URL"), os.environ.get("SUPABASE_KEY"))

# Fetch all standards
stds = supabase.table("standards").select("id, name, created_at").execute().data
seen = {}
duplicates = []

for s in stds:
    name = s['name']
    if name in seen:
        # Keep the latest one or the one with more subjects (logic here assumes later is better or we check siblings)
        # Let's check subject count for both
        count_old = supabase.table("subjects").select("id", count="exact").eq("standard_id", seen[name]['id']).execute().count
        count_new = supabase.table("subjects").select("id", count="exact").eq("standard_id", s['id']).execute().count
        
        print(f"Duplicate {name}: {seen[name]['id']} ({count_old} subjs) vs {s['id']} ({count_new} subjs)")
        
        if count_old < count_new:
            duplicates.append(seen[name]['id'])
            seen[name] = s
        else:
            duplicates.append(s['id'])
    else:
        seen[name] = s

print(f"Deleting {len(duplicates)} duplicates: {duplicates}")

for d_id in duplicates:
    # Delete dependent subjects (cascade isn't always on in supbase-js/template)
    # Actually, let's just delete the standard and hope for cascade or handle errors
    # Delete subjects first manually to be safe
    supabase.table("subjects").delete().eq("standard_id", d_id).execute()
    supabase.table("standards").delete().eq("id", d_id).execute()

print("Cleanup done.")
