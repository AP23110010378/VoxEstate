"""
campaigns.py — Router for Campaign endpoints

POST /campaign/start → triggers the AI voice campaign for a company.
This is the "big button" endpoint — when the manager clicks "Launch Campaign",
this endpoint gets called and kicks off the LangGraph dispatch flow.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from bson import ObjectId
from database import get_db

router = APIRouter(tags=["Campaigns"])


class CampaignStartRequest(BaseModel):
    """Request body for starting a campaign."""
    company_id: str


@router.post("/campaign/start")
async def start_campaign(request: CampaignStartRequest):
    """
    Start an AI voice campaign for a company.

    Flow:
    1. Validate company exists
    2. Check there are PENDING leads
    3. Invoke the LangGraph dispatch graph
    4. Return confirmation

    The actual calling happens async via Vapi — this endpoint
    just triggers the process and returns immediately.
    """
    db = get_db()

    # Validate company exists
    try:
        company_oid = ObjectId(request.company_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid company_id format")

    company = await db.companies.find_one({"_id": company_oid})
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    # Check for pending leads
    pending_count = await db.customers.count_documents({
        "company_id": company_oid,
        "status": "PENDING"
    })

    if pending_count == 0:
        raise HTTPException(
            status_code=400,
            detail="No pending leads to call for this company"
        )

    # Import and invoke the LangGraph dispatch graph
    # We import here to avoid circular imports
    from agent.graph import run_dispatch_graph

    try:
        result = await run_dispatch_graph(request.company_id)
        return {
            "status": "success",
            "message": f"Campaign started! Calling {pending_count} leads.",
            "company": company["name"],
            "leads_to_call": pending_count
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to start campaign: {str(e)}"
        )
