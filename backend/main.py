"""
main.py — FastAPI Application Entry Point

This is the heart of our backend. It:
1. Creates the FastAPI app
2. Sets up CORS (so our React frontend can talk to it)
3. Connects to MongoDB on startup
4. Registers all our API routers
5. Provides a health check endpoint

To run locally: uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import connect_db, close_db
from config import settings

# Import our routers
from routers import companies, customers, campaigns, webhooks


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager — runs code on startup and shutdown.

    On STARTUP: Connect to MongoDB
    On SHUTDOWN: Close MongoDB connection

    This is the modern FastAPI way (replaces @app.on_event).
    """
    # === STARTUP ===
    print("🚀 Starting Voice Agent SaaS Backend...")
    await connect_db()
    print("✅ Backend is ready!")

    yield  # App runs here

    # === SHUTDOWN ===
    print("👋 Shutting down...")
    await close_db()


# Create the FastAPI app
app = FastAPI(
    title="Voice Agent SaaS — Multi-Tenant Agentic Voice Orchestrator",
    description=(
        "A SaaS platform where real estate companies can launch AI voice campaigns "
        "to qualify leads. Built with FastAPI + LangGraph + Vapi.ai + MongoDB."
    ),
    version="1.0.0",
    lifespan=lifespan
)


# === CORS MIDDLEWARE ===
# CORS = Cross-Origin Resource Sharing
# Without this, our React frontend (localhost:5173) can't call our
# FastAPI backend (localhost:8000) because they're on different ports.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],          # Allow all HTTP methods
    allow_headers=["*"],          # Allow all headers
)


# === REGISTER ROUTERS ===
# Each router handles a group of related endpoints
app.include_router(companies.router)
app.include_router(customers.router)
app.include_router(campaigns.router)
app.include_router(webhooks.router)


# === HEALTH CHECK ===
@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint.
    GCP Cloud Run uses this to know if the app is alive.
    Returns 200 OK if everything is working.
    """
    return {
        "status": "healthy",
        "service": "voice-agent-saas",
        "version": "1.0.0"
    }


# === ROOT ENDPOINT ===
@app.get("/", tags=["Health"])
async def root():
    """Root endpoint — confirms the API is running."""
    return {
        "message": "🎙️ Voice Agent SaaS API is running!",
        "docs": "/docs",
        "health": "/health"
    }
