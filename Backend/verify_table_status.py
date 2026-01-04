
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

def verify_table():
    print("Verifying 'blogs' table existence...")
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        # Attempt to select 1 row. If table doesn't exist, this should raise PostgrestAPIError
        response = supabase.table("blogs").select("*").limit(1).execute()
        print("Success! Table exists.")
        print(f"Data: {response.data}")
    except Exception as e:
        print(f"Error: {e}")
        print("Likely cause: Table 'blogs' does not exist.")

if __name__ == "__main__":
    verify_table()
