from pydantic import BaseModel, HttpUrl, Field
from typing import List, Optional, Dict
from enum import Enum
from datetime import datetime
from uuid import UUID

# --- Enums ---
class Difficulty(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"

# --- Base Models ---

class Standard(BaseModel):
    """Represents a School Class/Standard (e.g., 'Class 10')"""
    id: Optional[UUID] = None
    name: str  # e.g. "Class 10"
    description: Optional[str] = None

class Subject(BaseModel):
    """Represents a Subject within a Standard (e.g., 'Physics')"""
    id: Optional[UUID] = None
    standard_id: UUID
    name: str # e.g. "Physics"
    icon_url: Optional[HttpUrl] = None

class Chapter(BaseModel):
    """Represents a Chapter within a Subject"""
    id: Optional[UUID] = None
    subject_id: UUID
    title: str
    description: Optional[str] = None
    sequence_order: int
    prerequisites: Optional[List[UUID]] = [] # IDs of required chapters

class ConceptTag(BaseModel):
    """Represents a node in the Knowledge Graph"""
    id: Optional[str] = None # Slug, e.g., 'linear-equations'
    name: str
    prerequisites: List[str] = [] # List of Concept IDs

class VideoContent(BaseModel):
    """Represents a Video Lecture"""
    id: Optional[UUID] = None
    chapter_id: UUID
    title: str
    video_url: HttpUrl # Cloudinary URL
    duration_seconds: int
    concept_tags: List[str] = [] # List of Concept IDs
    sequence_order: int

class QuizQuestion(BaseModel):
    id: Optional[UUID] = None
    text: str
    options: List[str]
    correct_option_index: int
    explanation: Optional[str] = None
    concept_tag: str
    hint_1: Optional[str] = None
    hint_2: Optional[str] = None
    hint_3: Optional[str] = None

class Quiz(BaseModel):
    """Represents a Quiz (Baseline, Daily, or Chapter-wise)"""
    id: Optional[UUID] = None
    title: str
    type: str = "chapter_practice" # baseline, daily, chapter_practice
    related_id: Optional[UUID] = None # ID of Chapter or Video
    questions: List[QuizQuestion]
    start_time: Optional[datetime] = None # For Scheduled Quizzes
    end_time: Optional[datetime] = None
