
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv(dotenv_path="../Backend/.env")
# Or explicit
load_dotenv(dotenv_path="../Backend/supabase_credentials.env")

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

if not url or not key:
    print("Error: Missing credentials")
    exit(1)

supabase = create_client(url, key)

print("Initializing Quiz DB Table...")

# We cannot run raw SQL via the JS client easily without Rpc or direct connection.
# But python client typically doesn't support raw SQL unless via RPC.
# However, for this environment, I will instruct the user to run the SQL in their Supabase Dashboard SQL Editor
# because running raw DDL from client is often restricted.

print("Please run the content of Backend/quiz_results_schema.sql in your Supabase SQL Editor.")
