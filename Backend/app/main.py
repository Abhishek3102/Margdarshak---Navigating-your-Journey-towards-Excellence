from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, content

app = FastAPI(title="AMEP API", version="0.1.0")

# CORS Configuration
origins = [
    "http://localhost:3000",  # Next.js frontend
    "http://localhost:8000",
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

@app.get("/")
async def root():
    return {"message": "Welcome to AMEP Cognitive OS API"}
