import sys
import os

# Add current directory to path
sys.path.append(os.getcwd())

try:
    print("Attempting to import app.main...")
    from app.main import app
    print("Successfully imported app.main")
    
    # Check if router is in routes
    routes = [route.path for route in app.routes]
    if "/api/quiz-agent/generate" in routes:
        print("SUCCESS: /api/quiz-agent/generate found in routes")
    else:
        print("FAILURE: /api/quiz-agent/generate NOT found in routes")
        print("Available routes:")
        for r in routes:
            if "quiz" in r:
                print(f" - {r}")
                
except Exception as e:
    print(f"IMPORT ERROR: {e}")
    import traceback
    traceback.print_exc()
