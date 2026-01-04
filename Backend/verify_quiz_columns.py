import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

if not url or not key:
    print("Error: Missing SUPABASE_URL or SUPABASE_KEY in .env")
    exit(1)

print(f"Connecting to Supabase at: {url}")

try:
    supabase = create_client(url, key)
    
    # We can't query information_schema directly via supabase-js/py client easily usually (blocked by RLS often).
    # But we can try to just insert a dummy row with the column and see the specific error, 
    # OR try to select the column.
    
    print("Attempting to SELECT 'subject_scores' from 'quiz_results'...")
    
    # Try selecting the specific new column. 
    # If it fails, we know it's missing or not recognized.
    response = supabase.table("quiz_results").select("subject_scores").limit(1).execute()
    
    print("\nSUCCESS! Column 'subject_scores' exists and is accessible.")
    print(f"Data sample: {response.data}")

except Exception as e:
    print(f"\nFAILURE. Detailed error: {e}")
    
    import json
    try:
        err_dict = json.loads(str(e).replace("'", '"')) # naive parsing
        if "Could not find" in str(e):
             print("\nDIAGNOSIS: The column is definitely MISSING in this database.")
             print("Please ensure you ran the SQL in the Project matched by the URL above.")
    except:
        pass
