from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, content, monitoring, upload, notifications, watch_party, quiz, chat, quiz_agent, jira_agent

app = FastAPI(title="MARGDARSHAK - NAVIGATING YOUR JOURNEY TOWARDS EXCELLENCE", version="0.1.0")

# CORS Configuration
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "https://margdarshak-t0jj.onrender.com",
    "https://margdarshak-t0jj.onrender.com/",
    "https://margdarshak-two.vercel.app",
    "https://margdarshak-two.vercel.app/",
    "https://margdarshak-*-ankush-gargs-projects.vercel.app",  # Preview deployments
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(content.router, prefix="/api/content", tags=["content"])
app.include_router(monitoring.router, prefix="/api/monitoring", tags=["monitoring"])
app.include_router(upload.router, prefix="/api", tags=["upload"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])
app.include_router(watch_party.router, prefix="/api/watch-party", tags=["watch-party"])
app.include_router(quiz.router, prefix="/api/quiz", tags=["quiz"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(quiz_agent.router, prefix="/api/quiz-agent", tags=["quiz-agent"])
from app.api import curriculum
app.include_router(curriculum.router, prefix="/api/curriculum", tags=["curriculum"])
from app.api import feedback
app.include_router(feedback.router, prefix="/api/feedback", tags=["feedback"])
app.include_router(jira_agent.router, prefix="/api/jira", tags=["jira-agent"])

@app.get("/")
async def root():
    return {"message": "Welcome to AMEP Cognitive OS API"}

# Reload Trigger (Model Switch + Qdrant Cloud)
