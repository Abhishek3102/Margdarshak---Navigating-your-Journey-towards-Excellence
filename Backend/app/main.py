from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, content, monitoring, upload, notifications, watch_party, quiz

app = FastAPI(title="MARGDARSHAK - NAVIGATING YOUR JOURNEY TOWARDS EXCELLENCE", version="0.1.0")

# CORS Configuration
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
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

@app.get("/")
async def root():
    return {"message": "Welcome to AMEP Cognitive OS API"}
