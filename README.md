# Margdarshak - Navigating your Journey towards Excellence

> An intelligent, AI-driven Learning Management System. Personalized learning, seamless assessment creation, and actionable feedback.

## What is This?

Margdarshak is a full-stack educational platform that combines traditional LMS features with cutting-edge Artificial Intelligence. 
Unlike standard learning platforms, it starts by deeply understanding a student's baseline through prerequisite assessments. It empowers educators with automated AI quiz generation (via Gemini) and supports students with a Mem0-powered personalized AI tutor, collaborative Watch Parties, and Jira-integrated actionable study plans.

## How It Works

```text
[ Browser (Next.js) ] <-> [ Python Backend (FastAPI) ] <-> [ Supabase (DB/Auth) & AI Services ]
  User Interface             Gemini + Mem0 + Cloudinary       PostgreSQL, Mem0 memory, Video Storage
```

There are three independently running parts:

| Layer | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | Next.js (React) | UI, video player, Watch Parties, Student/Teacher dashboards |
| **Backend** | FastAPI (Python) | AI Quiz generation, Mem0 integration, Cloudinary orchestrations |
| **Database** | Supabase (PostgreSQL) | Authentication, User roles, Storing quizzes and performance data |

---

## The Learning Lifecycle

1. **Student Onboarding** 
   - A student registers and takes an AI-powered Prerequisite Assessment.
   - The platform maps out their foundational strengths and weaknesses.

2. **Content Creation (Teacher)**
   - Teacher uploads a lecture video (handled by Cloudinary via the Backend).
   - Teacher clicks "AI Quiz". **Gemini 2.5 Flash Lite** analyzes the video and audio to instantly generate a custom assessment.
   
3. **Collaborative Learning**
   - Students can watch the lecture asynchronously.
   - Or, they can initiate a **Study Group / Watch Party**, syncing playback and collaborating with peers in real-time.

4. **Assessment & AI Scribe**
   - Student takes the AI Quiz, utilizing AI-generated hints if stuck.
   - Upon submission, the **AI Performance Scribe** provides a personalized breakdown of the student's understanding.

5. **Actionable Roadmap**
   - The platform generates a **Jira Study Plan** with tracked remedial tasks based on the student's weak areas.
   - The **Mem0-powered AI Chatbot** acts as a 24/7 personalized tutor, remembering these Jira tasks and previous weaknesses in future interactions.

---

## Technology Stack

| Area | Technology |
| :--- | :--- |
| **Frontend** | Next.js, React, TypeScript, Tailwind CSS, shadcn/ui |
| **Backend** | FastAPI (Python), Uvicorn |
| **Database / Auth** | Supabase (PostgreSQL) |
| **Video Storage** | Cloudinary |
| **Generative AI** | Google Gemini 2.5 Flash Lite (via `google.genai` SDK) |
| **AI Memory** | Mem0 (Personalized Chatbot Memory) |
| **Task Management** | Jira API Integration |

---

## User Roles

| Role | Access |
| :--- | :--- |
| **Student** | Take prerequisite assessments, join Watch Parties, take AI Quizzes, interact with Mem0 Chatbot, view Jira study plans. |
| **Teacher** | Create chapters/lessons, upload videos, generate and refine AI quizzes, view overall student performance metrics. |
