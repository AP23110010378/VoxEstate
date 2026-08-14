"""
call_log.py — Call Log Schema

Every completed call gets a log entry.
This stores the full transcript, the AI's classification,
and metadata like call duration. Useful for:
- Debugging: "Why was this lead marked QUALIFIED?"
- Analytics: "What's our average call duration?"
- Compliance: "What exactly did the AI say?"
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class CallLogCreate(BaseModel):
    """Schema for creating a call log after a call completes."""
    customer_id: str
    company_id: str
    vapi_call_id: str = Field(..., description="Vapi's unique ID for this call")
    transcript: str = Field(default="", description="Full conversation transcript")
    summary: str = Field(default="", description="Brief summary of the call")
    outcome: str = Field(..., description="QUALIFIED, NOT_INTERESTED, or FAILED")
    duration_seconds: int = Field(default=0, description="How long the call lasted")


class CallLogResponse(BaseModel):
    """Schema for returning call log data."""
    id: str
    customer_id: str
    company_id: str
    vapi_call_id: str
    transcript: str
    summary: str
    outcome: str
    duration_seconds: int
    created_at: datetime

    class Config:
        from_attributes = True
