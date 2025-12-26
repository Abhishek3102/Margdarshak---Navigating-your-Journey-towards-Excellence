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
        raise HTTPException(status_code=500, detail="Supabase credentials not configured.")
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
async def register(user: UserRegister):
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
async def login(user: UserLogin):
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
