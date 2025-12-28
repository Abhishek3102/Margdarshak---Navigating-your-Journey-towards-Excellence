
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
    4. Write a 3-4 sentence review. Be specific mentioning subjects and their pace. Address them directly ("You...").
    
    Output Format: plain text.
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
        
        # 4. Save to DB using authenticated client (to pass RLS)
        supabase_client: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
        
        # Set the session manually or just pass Authorization header if client supports it easily.
        # supabase-py doesn't have a simple 'set_token' for single request easily without session.
        # But we can try setting the session if we had refresh token (we don't).
        # HACK: If we can't use Service Key, we must rely on the fact that we have the access token.
        # We can construct the header manually for the postgrest request.
        
        supabase_client.postgrest.auth(user["token"])

        result_data = {
            "user_id": user["id"],
            "score": correct_count,
            "total_questions": len(answer_key_data),
            "subject_scores": subject_stats,
            "time_analysis": detailed_report, # Store full report here
            "ai_review": ai_feedback,
        }

        response = supabase_client.table("quiz_results").insert(result_data).execute()
        
        return {
            "score": correct_count,
            "total": len(answer_key_data),
            "feedback": ai_feedback,
            "breakdown": subject_stats,
            "detailed_report": detailed_report
        }

    except Exception as e:
        print(f"Error submitting quiz: {e}")
        raise HTTPException(status_code=500, detail=str(e))
