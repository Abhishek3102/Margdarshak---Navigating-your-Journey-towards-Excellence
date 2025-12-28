
from fastapi import APIRouter, Depends, HTTPException, Body
from app.api.auth import get_current_user
from pydantic import BaseModel
from typing import Dict, Any, List
import json
import os
import random
from supabase import create_client, Client
import google.generativeai as genai

router = APIRouter()

# --- Config ---
# Load from file relative to this script or configured path
# Assuming quiz data is in Backend/quiz_generator/
BASE_QUIZ_PATH = os.path.join(os.path.dirname(__file__), "../../quiz_generator")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)
    # Using the same model as the generator script to ensure compatibility
    model = genai.GenerativeModel('gemini-flash-lite-latest')

# --- Schemas ---
class QuizSubmission(BaseModel):
    answers: Dict[str, str] # question_id (as str) -> selected_option
    time_taken: Dict[str, float] # question_id -> seconds

# --- Helpers ---
def get_quiz_file_path(target_class: int):
    # Fallback logic: 7 is min, 10 is max (based on what we generated)
    # If student is 11 or 12, give 10.
    # If student is 6 or below, give 7.
    safe_class = max(7, min(target_class, 10))
    return os.path.join(BASE_QUIZ_PATH, f"quiz_data_class_{safe_class}.json")

async def generate_ai_analysis(score: int, total: int, subject_breakdown: Dict, time_analysis: Dict):
    if not GOOGLE_API_KEY:
        return "Great job completing the quiz! (AI Analysis unavailable)"
    
    prompt = f"""
    Analyze this student's diagnostic quiz performance with a focus on SPEED and ACCURACY.
    
    Overall Score: {score}/{total}
    Subject Breakdown (Correct/Total): {json.dumps(subject_breakdown)}
    Time Taken per Question (Seconds map): {json.dumps(time_analysis)}
    
    Task:
    1. Identify their strongest subject.
    2. Identify their weakest subject.
    3. Analyze their SPEED: Are they too slow on specific subjects? Did they rush? 
    4. Write a structured review with bullet points.
       - Use **Bold** for key terms.
       - Use bullet points for distinct insights.
       - structure it as:
         * 🏆 **Strengths**: ...
         * ⚠️ **Areas for Improvement**: ...
         * ⏱️ **Speed Analysis**: ...
         * 💡 **Recommendation**: ...
    
    Output Format: Clean Markdown.
    """
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Gemini Analysis Failed: {e}")
        return "Great effort! Review your scores to see where to focus next."

# --- Endpoints ---

@router.get("/start")
async def start_quiz(user: dict = Depends(get_current_user)):
    """
    Determines the correct quiz for the user (Class - 1) and returns it 
    WITHOUT the correct answers.
    """
    try:
        # User 'class' might be string like "10th", "Class 10", "10". Try to parse.
        user_class_str = str(user.get("class", "10"))
        import re
        match = re.search(r'\d+', user_class_str)
        current_class = int(match.group()) if match else 10
        
        # Diagnostic is for previous year
        target_class = current_class - 1
        
        file_path = get_quiz_file_path(target_class)
        
        if not os.path.exists(file_path):
             # Fallback to 10 if file missing (dev safety)
             file_path = get_quiz_file_path(10)
        
        with open(file_path, "r") as f:
            full_quiz_data = json.load(f)
            
        # Sanitize: Remove 'answer' field
        client_quiz = []
        for q in full_quiz_data:
            q_copy = q.copy()
            if "answer" in q_copy:
                del q_copy["answer"]
            client_quiz.append(q_copy)
            
        return {
            "target_class": target_class,
            "questions": client_quiz
        }

    except Exception as e:
        print(f"Error starting quiz: {e}")
        raise HTTPException(status_code=500, detail="Failed to load quiz.")

@router.post("/submit")
async def submit_quiz(submission: QuizSubmission, user: dict = Depends(get_current_user)):
    try:
        # 1. Determine Class again to load correct answer key
        user_class_str = str(user.get("class", "10"))
        import re
        match = re.search(r'\d+', user_class_str)
        current_class = int(match.group()) if match else 10
        target_class = current_class - 1
        file_path = get_quiz_file_path(target_class)
        if not os.path.exists(file_path): file_path = get_quiz_file_path(10)
        
        with open(file_path, "r") as f:
            answer_key_data = json.load(f)
            
        # Map ID -> Correct Answer & Subject
        key_map = {str(q["id"]): {"answer": q["answer"], "subject": q["subject"]} for q in answer_key_data}
        
        correct_count = 0
        subject_stats = {} # "Math": {"correct": 0, "total": 0}
        
        # 2. Grade & Build Detailed Report
        detailed_report = []
        
        for q_id, user_ans in submission.answers.items():
            if q_id in key_map:
                info = key_map[q_id]
                subj = info["subject"]
                
                if subj not in subject_stats: subject_stats[subj] = {"correct": 0, "total": 0}
                subject_stats[subj]["total"] += 1
                
                is_correct = (user_ans == info["answer"])
                if is_correct:
                    correct_count += 1
                    subject_stats[subj]["correct"] += 1
                    
                detailed_report.append({
                    "id": q_id,
                    "subject": subj,
                    "difficulty": info.get("difficulty", "Medium"), # Fallback
                    "time_taken": submission.time_taken.get(q_id, 0),
                    "is_correct": is_correct
                })

        # 3. AI Analysis
        ai_feedback = await generate_ai_analysis(
            score=correct_count,
            total=len(answer_key_data),
            subject_breakdown=subject_stats,
            time_analysis=submission.time_taken
        )

        # --- MEM0 INTEGRATION ---
        # Record long-term insights about the student
        try:
             mem0_key = os.getenv("MEM0_API_KEY")
             google_key = os.getenv("GOOGLE_API_KEY")
             m = None

             # 1. Try Platform Client
             if mem0_key:
                 try:
                     from mem0 import MemoryClient
                     m = MemoryClient(api_key=mem0_key)
                 except ImportError:
                     pass
             
             # 2. Fallback to Local/Cloud with Gemini
             if not m and google_key:
                 from mem0 import Memory
                 
                 qdrant_url = os.getenv("QDRANT_URL")
                 qdrant_key = os.getenv("QDRANT_API_KEY")
                 
                 vector_config = {}
                 if qdrant_url and qdrant_key:
                     print("Using Qdrant Cloud for Submit Quiz")
                     vector_config = {"provider": "qdrant", "config": {"url": qdrant_url, "api_key": qdrant_key}}
                 else:
                     db_path = os.path.join(os.getcwd(), "mem0_db")
                     vector_config = {"provider": "qdrant", "config": {"path": db_path}}
                     
                 config = {
                     "vector_store": vector_config,
                     "embedder": {"provider": "gemini", "config": {"api_key": google_key, "model": "models/embedding-001"}},
                     "llm": {"provider": "gemini", "config": {"api_key": google_key, "model": "gemini-flash-lite-latest"}}
                 }
                 m = Memory.from_config(config)

             if m:
                 # Construct Memory Payload (Same logic as before)
                 # 1. Identify Patterns
                 strong_subjects = [s for s, stats in subject_stats.items() if (stats["total"] > 0 and (stats["correct"]/stats["total"]) >= 0.8)]
                 weak_subjects = [s for s, stats in subject_stats.items() if (stats["total"] > 0 and (stats["correct"]/stats["total"]) <= 0.5)]
                 
                 # 2. Time Analysis
                 subject_times = {}
                 for q_rpt in detailed_report:
                     subj = q_rpt["subject"]
                     if subj not in subject_times: subject_times[subj] = []
                     subject_times[subj].append(q_rpt["time_taken"])
                 
                 slow_subjects = []
                 fast_subjects = []
                 for subj, times in subject_times.items():
                     avg_time = sum(times) / len(times) if times else 0
                     if avg_time > 60: slow_subjects.append(subj)
                     elif avg_time < 20: fast_subjects.append(subj)

                 # 3. Create Narrative
                 memory_text = f"Diagnostic Quiz Update: "
                 if strong_subjects: memory_text += f" EXCELS in {', '.join(strong_subjects)}. "
                 if weak_subjects: memory_text += f" STRUGGLES with {', '.join(weak_subjects)}. "
                 if slow_subjects: memory_text += f" Takes TIME to process {', '.join(slow_subjects)}. "
                 if fast_subjects: memory_text += f" Answers QUICKLY in {', '.join(fast_subjects)}. "
                 
                 # 4. Store
                 print(f"Storing to Mem0 for {user['id']}: {memory_text}")
                 m.add(memory_text, user_id=user["id"], metadata={"source": "diagnostic_quiz"})
             else:
                 print("Mem0 skipped: No valid configuration found.")
        except Exception as mem_err:
             print(f"Mem0 Error: {mem_err}")
             # Non-blocking, continue submission
        
        # 4. Save to DB using authenticated client (to pass RLS)
        supabase_client: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
        
        # Manually set auth header if needed, but for now relying on RLS or open access.
        # Ideally user['token'] is used.
        supabase_client.postgrest.auth(user["token"])

        result_data = {
            "user_id": user["id"],
            "score": correct_count,
            "total_questions": len(answer_key_data),
            "subject_scores": subject_stats,
            "time_analysis": detailed_report, # Store full report here
            "ai_review": ai_feedback,
            # New columns (Ensure SQL migration is run!)
            "student_name": user.get("full_name") or user.get("email"), 
            "student_grade": str(current_class)
        }

        # Use error handling for insert in case migration isn't run yet
        try:
             response = supabase_client.table("quiz_results").insert(result_data).execute()
        except Exception as insert_error:
             print(f"Insert Error (Schema mismatch?): {insert_error}")
             # Fallback: Remove new columns and try again
             del result_data["student_name"]
             del result_data["student_grade"]
             response = supabase_client.table("quiz_results").insert(result_data).execute()
        
        return {
            "score": correct_count,
            "total": len(answer_key_data),
            "feedback": ai_feedback,
            "breakdown": subject_stats,
            "detailed_report": detailed_report,
            "memory_saved": memory_text if 'memory_text' in locals() else "No memory generated."
        }

    except Exception as e:
        print(f"Error submitting quiz: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- Teacher Endpoints ---

@router.get("/teacher/classes")
async def get_teacher_classes(user: dict = Depends(get_current_user)):
    """Returns list of available classes for analysis."""
    if user.get("role") != "teacher":
         # In strict mode we'd raise 403, but for now allowing flexible access or returning empty
         pass 
    return ["Class 7", "Class 8", "Class 9", "Class 10"]

@router.get("/teacher/{grade}/students")
async def get_class_students(grade: str, user: dict = Depends(get_current_user)):
    """Fetches all quiz results for a specific grade."""
    # Mapping "Class 10" -> "10"
    import re
    match = re.search(r'\d+', grade)
    numeric_grade = match.group() if match else "10"
    
    supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
    
    # Authenticate via RLS using Teacher's Token
    supabase.postgrest.auth(user["token"])
    
    try:
        # Fetch results where student_grade matches OR is null (legacy records)
        # We use the 'or' filter syntax: "student_grade.eq.10,student_grade.is.null"
        response = supabase.table("quiz_results")\
            .select("*")\
            .or_(f"student_grade.eq.{numeric_grade},student_grade.is.null")\
            .order("created_at", desc=True)\
            .execute()
            
        return response.data
    except Exception as e:
        print(f"Error fetching students: {e}")
        return []

@router.get("/teacher/result/{result_id}")
async def get_student_result(result_id: str, user: dict = Depends(get_current_user)):
    supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
    supabase.postgrest.auth(user["token"])
    
    try:
        response = supabase.table("quiz_results").select("*").eq("id", result_id).single().execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=404, detail="Result not found")

@router.get("/result/latest")
async def get_my_latest_result(user: dict = Depends(get_current_user)):
    """Fetches the logged-in student's most recent quiz result."""
    supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
    # Auth as user to allow RLS to work (Select own data)
    supabase.postgrest.auth(user["token"])
    
    try:
        response = supabase.table("quiz_results")\
            .select("*")\
            .eq("user_id", user["id"])\
            .order("created_at", desc=True)\
            .limit(1)\
            .execute()
            
        if not response.data or len(response.data) == 0:
             return None
             
        # Map fields to match frontend expectation if needed
        data = response.data[0]
        # Ensure compatibility with frontend interface
        return {
            "score": data["score"],
            "total": data.get("total_questions", 30),
            "feedback": data.get("ai_review", ""),
            "breakdown": data.get("subject_scores", {}),
            "detailed_report": data.get("time_analysis", []), # time_analysis column holds detailed report array
            "time_analysis": data.get("time_analysis", [])
        }
    except Exception as e:
        print(f"Error fetching latest result: {e}")

@router.post("/sync-memories")
async def sync_memories():
    """
    Backfill Mem0 memories for ALL students who have taken quizzes 
    but might be missing memory records.
    """
    try:
        sb_url = os.getenv("SUPABASE_URL")
        sb_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")
        supabase = create_client(sb_url, sb_key)
        
        google_key = os.getenv("GOOGLE_API_KEY")
        if not google_key:
             return {"status": "error", "message": "GOOGLE_API_KEY required for local embeddings."}

        # Force Memory Configuration (Priority: Qdrant Cloud > Local)
        from mem0 import Memory
        
        qdrant_url = os.getenv("QDRANT_URL")
        qdrant_key = os.getenv("QDRANT_API_KEY")
        
        vector_config = {}
        if qdrant_url and qdrant_key:
            print("Using Qdrant Cloud")
            vector_config = {
                "provider": "qdrant",
                "config": {
                    "url": qdrant_url,
                    "api_key": qdrant_key,
                    "port": 6333 # Standard port, usually ignored by cloud URL but good to have
                }
            }
        else:
            print("Using Local Qdrant (Ephemeral on Render)")
            db_path = os.path.join(os.getcwd(), "mem0_db")
            vector_config = {
                "provider": "qdrant",
                "config": {"path": db_path}
            }

        config = {
            "vector_store": vector_config,
            "embedder": {
                "provider": "gemini",
                "config": {
                    "api_key": google_key,
                    "model": "models/embedding-001"
                }
            },
            "llm": {
                "provider": "gemini",
                "config": {
                    "api_key": google_key,
                    "model": "gemini-flash-lite-latest"
                }
            }
        }
        m = Memory.from_config(config)

        res = supabase.table("quiz_results").select("*").execute()
        results = res.data
        
        debug_info = f"Found {len(results)} rows. "
        if results:
            debug_info += f"Sample Keys: {list(results[0].keys())} "
            debug_info += f"Sample UserID: {results[0].get('user_id')} "
            debug_info += f"Sample Scores: {type(results[0].get('subject_scores'))} "
        print(debug_info)

        count = 0
        for r in results:
            user_id = r.get("user_id")
            subject_stats = r.get("subject_scores")
            time_analysis = r.get("time_analysis")
            
            if not user_id or not subject_stats: continue
            
            try:
                 # Logic duplicated from submit_quiz
                 strong_subjects = [s for s, stats in subject_stats.items() if (stats.get("total",0) > 0 and (stats.get("correct",0)/stats.get("total",1)) >= 0.8)]
                 weak_subjects = [s for s, stats in subject_stats.items() if (stats.get("total",0) > 0 and (stats.get("correct",0)/stats.get("total",1)) <= 0.5)]
                 
                 subject_times = {}
                 if time_analysis and isinstance(time_analysis, list):
                     for q_rpt in time_analysis:
                         subj = q_rpt.get("subject")
                         if subj:
                             if subj not in subject_times: subject_times[subj] = []
                             subject_times[subj].append(q_rpt.get("time_taken", 0))
                 
                 slow_subjects = []
                 fast_subjects = []
                 for subj, times in subject_times.items():
                     avg_time = sum(times) / len(times) if times else 0
                     if avg_time > 60: slow_subjects.append(subj)
                     elif avg_time < 20: fast_subjects.append(subj)

                 memory_text = f"Diagnostic Quiz Update (Backfill): "
                 if strong_subjects: memory_text += f" EXCELS in {', '.join(strong_subjects)}. "
                 if weak_subjects: memory_text += f" STRUGGLES with {', '.join(weak_subjects)}. "
                 if slow_subjects: memory_text += f" Takes TIME to process {', '.join(slow_subjects)}. "
                 if fast_subjects: memory_text += f" Answers QUICKLY in {', '.join(fast_subjects)}. "
                 
                 m.add(memory_text, user_id=user_id, metadata={"source": "diagnostic_quiz_backfill"})
                 count += 1
                 
            except Exception as inner_e:
                print(f"Error processing result {r.get('id')}: {inner_e}")
                continue

        return {
        "status": "success", 
        "message": f"Successfully synced memories for {count} quiz submissions.",
        "debug": debug_info
    }

    except Exception as e:
        import traceback
        trace = traceback.format_exc()
        print(f"Global Sync Error: {e}")
        return {"status": "error", "message": str(e), "trace": trace}
