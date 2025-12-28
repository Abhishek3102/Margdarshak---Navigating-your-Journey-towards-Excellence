import os
from dotenv import load_dotenv
from qdrant_client import QdrantClient

load_dotenv()

def verify_data():
    url = os.getenv("QDRANT_URL")
    key = os.getenv("QDRANT_API_KEY")
    
    if not url or not key:
        print("Error: Qdrant credentials missing in .env")
        return

    print(f"Connecting to Qdrant Cloud: {url}...")
    try:
        client = QdrantClient(url=url, api_key=key)
        
        # Check collection info
        try:
            info = client.get_collection("mem0")
            print(f"Collection 'mem0' Status: {info.status}")
            print(f"Points Count: {info.points_count}")
        except Exception as e:
             print(f"Collection 'mem0' check failed (Might be empty/missing): {e}")
             return

        # Scroll points (List memories)
        print("\n--- Listing Stored Memories ---")
        points, _ = client.scroll(
            collection_name="mem0",
            limit=10,
            with_payload=True
        )
        
        if not points:
            print("No memories found (Collection is empty).")
        else:
            for p in points:
                payload = p.payload
                print(f"\n[ID: {p.id}]")
                print(f"User ID: {payload.get('user_id', 'N/A')}")
                print(f"Memory: {payload.get('data', payload.get('memory', 'N/A'))}")
                print(f"Metadata: {payload.get('metadata', {})}")

    except Exception as e:
        print(f"Connection/Query Failed: {e}")

if __name__ == "__main__":
    verify_data()
