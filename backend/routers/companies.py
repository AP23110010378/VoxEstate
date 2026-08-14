"""
companies.py — Router for Company endpoints

GET /companies → returns all companies (tenants) in the system.
The frontend uses this to populate the company selector dropdown.
"""

from fastapi import APIRouter, HTTPException
from database import get_db
from models.company import CompanyResponse

router = APIRouter(tags=["Companies"])


@router.get("/companies", response_model=list[CompanyResponse])
async def list_companies():
    """
    Fetch all companies from MongoDB.
    Returns a list of companies with their IDs, names, and prompts.
    """
    db = get_db()

    # Find all documents in the 'companies' collection
    companies = []
    cursor = db.companies.find({})

    async for doc in cursor:
        companies.append(CompanyResponse(
            id=str(doc["_id"]),
            name=doc["name"],
            prompt=doc["prompt"],
            created_at=doc["created_at"]
        ))

    return companies
