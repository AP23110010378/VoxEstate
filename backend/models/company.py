"""
company.py — Company (Tenant) Schema

Each company is a "tenant" in our multi-tenant SaaS.
Think of it like: Sunrise Realty is one customer of our platform,
Urban Nest Apartments is another. Each has their own leads.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class CompanyCreate(BaseModel):
    """Schema for creating a new company."""
    name: str = Field(..., description="Company name, e.g. 'Sunrise Realty'")
    prompt: str = Field(
        ...,
        description="Custom system prompt for the AI voice agent when calling this company's leads"
    )


class CompanyResponse(BaseModel):
    """Schema for returning company data to the frontend."""
    id: str = Field(..., description="MongoDB ObjectId as string")
    name: str
    prompt: str
    created_at: datetime

    class Config:
        # Allow creating from MongoDB documents (which use _id)
        from_attributes = True
