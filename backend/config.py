"""
config.py — Environment Variables Loader

WHY: We never hardcode secrets (API keys, database URLs) in our code.
Instead, we read them from a .env file locally or from environment
variables in production (Cloud Run). pydantic-settings makes this easy
and validates that all required vars are present at startup.
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """
    All environment variables our app needs.
    pydantic-settings automatically reads from .env file
    and from OS environment variables.
    """

    # MongoDB connection string
    # Example: mongodb+srv://user:pass@cluster.mongodb.net/voiceagent
    MONGODB_URI: str

    # Vapi.ai credentials for triggering AI voice calls
    VAPI_API_KEY: str = ""
    VAPI_ASSISTANT_ID: str = ""
    VAPI_PHONE_NUMBER_ID: str = ""

    # OpenAI API key for LLM transcript classification
    OPENAI_API_KEY: str = ""

    # App URLs (used for CORS and webhook configuration)
    BACKEND_URL: str = "http://localhost:8000"
    FRONTEND_URL: str = "http://localhost:5173"

    class Config:
        # Tell pydantic-settings to look for a .env file
        env_file = ".env"
        env_file_encoding = "utf-8"


# Create a single settings instance that the whole app uses
settings = Settings()
