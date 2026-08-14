"""
customer.py — Customer (Lead) Schema

A customer is a potential lead for a real estate company.
They have a status that changes as the AI campaign progresses:

PENDING → CALL_INITIATED → QUALIFIED / NOT_INTERESTED / FAILED

This status lifecycle is the core of our system.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class CustomerStatus(str, Enum):
    """
    The 5 possible states a lead can be in.
    This is a state machine — leads can only move forward.
    """
    PENDING = "PENDING"                 # Not yet called
    CALL_INITIATED = "CALL_INITIATED"   # Vapi call triggered
    QUALIFIED = "QUALIFIED"             # Lead is interested in buying/selling
    NOT_INTERESTED = "NOT_INTERESTED"   # Lead said no
    FAILED = "FAILED"                   # Call failed, disconnected, or unclear


class CustomerCreate(BaseModel):
    """Schema for creating a new customer/lead."""
    company_id: str = Field(..., description="Which company this lead belongs to")
    name: str = Field(..., description="Lead's full name")
    phone: str = Field(..., description="Lead's phone number with country code, e.g. +91XXXXXXXXXX")


class CustomerResponse(BaseModel):
    """Schema for returning customer data to the frontend."""
    id: str = Field(..., description="MongoDB ObjectId as string")
    company_id: str
    name: str
    phone: str
    status: CustomerStatus = CustomerStatus.PENDING
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
