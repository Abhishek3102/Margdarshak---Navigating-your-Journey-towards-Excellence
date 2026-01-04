from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from enum import Enum
from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# Supabase Setup
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

if not url or not key:
    print("Warning: SUPABASE_URL or SUPABASE_KEY not found in environment variables.")
    # For now, we proceed to allow the app to start, but actual calls will fail if credentials are missing.

def get_supabase() -> Client:
    if not url or not key:
        print("DEBUG: Missing credentials in get_supabase")
        raise HTTPException(status_code=500, detail="Supabase credentials not configured.")
    # print(f"DEBUG: Backend init Supabase with URL: {url}") # excessive
    return create_client(url, key)

class UserRole(str, Enum):
    STUDENT = "student"
    TEACHER = "teacher"
    ADMIN = "admin"

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str
    role: UserRole = UserRole.STUDENT

class UserLogin(BaseModel):
    email: EmailStr
    password: str

@router.post("/register")
def register(user: UserRegister):
    supabase = get_supabase()
    
    # 1. Register with Supabase Auth
    try:
        auth_response = supabase.auth.sign_up({
            "email": user.email,
            "password": user.password,
            "options": {
                "data": {
                    "full_name": user.full_name,
                    "role": user.role.value
                }
            }
        })
        
        if not auth_response.user:
            raise HTTPException(status_code=400, detail="Registration failed")
            
        # 2. Add to public users table (optional, depending on if you want a separate users table)
        # For now, we rely on Supabase Auth's user_metadata for the role.
        
        return {"message": "Registration successful", "user": auth_response.user}
        
    except Exception as e:
         raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
def login(user: UserLogin):
    supabase = get_supabase()
    
    try:
        response = supabase.auth.sign_in_with_password({
            "email": user.email,
            "password": user.password,
        })
        
        if not response.user:
             raise HTTPException(status_code=401, detail="Invalid credentials")
             
        return {"access_token": response.session.access_token, "token_type": "bearer", "user": response.user}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# --- Auth Dependency ---
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    # print(f"DEBUG: Token received: {token[:10]}...") # excessive logging
    supabase = get_supabase()
    try:
        # Verify the token with Supabase
        user_response = supabase.auth.get_user(token)
        if not user_response.user:
                print("DEBUG: No user found in response")
                raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        
        # Enrich with metadata if needed, but usually user_metadata has 'grade'
        # Return a dict-like object or the user object directly.
        # Our quiz app expects user["id"] and user["class"] (from metadata).
        
        user_data = {
            "id": user_response.user.id,
            "email": user_response.user.email,
            "class": user_response.user.user_metadata.get("grade", "Class 10"), # Default fallback
            "grade": user_response.user.user_metadata.get("grade", "Class 10"), # For frontend compatibility
            "role": user_response.user.user_metadata.get("role", "student"),
            "full_name": user_response.user.user_metadata.get("full_name", ""),
            "token": token
        }
        return user_data
        
    except Exception as e:
        print(f"DEBUG: Auth Error detailed: {str(e)}")
        raise HTTPException(status_code=401, detail=f"Could not validate credentials: {str(e)}")

@router.get("/me")
def get_me(user: dict = Depends(get_current_user)):
    return {"user": user}

# --- Admin/Teacher Actions ---

class AccessRequest(BaseModel):
    student_id: str
    target_class: str

@router.post("/grant-access")
def grant_access(request: AccessRequest, current_user: dict = Depends(get_current_user)):
    # 1. Check Permissions
    if current_user["role"] not in ["teacher", "admin"]:
        raise HTTPException(status_code=403, detail="Only teachers can grant access")
        
    # 2. Setup Admin Client (Required to update other users)
    service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not service_key:
        # Fallback: Try to read from .env file directly if not in os.environ yet
        # (This handles cases where load_dotenv didn't pick it up or it wasn't exported)
        # But for now, we'll raise error
        raise HTTPException(status_code=500, detail="Server misconfiguration: Missing SERVICE_ROLE_KEY")
        
    supabase_admin = create_client(url, service_key)
    
    try:
        # 3. Get Student Data
        user_res = supabase_admin.auth.admin.get_user_by_id(request.student_id)
        user = user_res.user
        
        if not user:
             raise HTTPException(status_code=404, detail="Student not found")
             
        # 4. Update Metadata
        current_metadata = user.user_metadata or {}
        allowed = current_metadata.get("allowed_classes", [])
        
        if request.target_class not in allowed:
            allowed.append(request.target_class)
            
        update_res = supabase_admin.auth.admin.update_user_by_id(
            request.student_id,
            {"user_metadata": {**current_metadata, "allowed_classes": allowed}}
        )
        
        return {"message": f"Access granted to {request.target_class}", "allowed_classes": allowed}
        
    except Exception as e:
        import traceback
        error_msg = f"Grant Access Error: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        with open("auth_error.log", "a") as f:
            f.write(error_msg + "\n")
        raise HTTPException(status_code=500, detail=str(e))
