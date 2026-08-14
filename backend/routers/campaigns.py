from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from bson import ObjectId
from datetime import datetime, timezone
from database import get_db

router = APIRouter(tags=["Campaigns"])


class CampaignStartRequest(BaseModel):
    """Request body for starting or resetting a campaign."""
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

    # FIX: Also block if any leads are already CALL_INITIATED (campaign already running).
    # Without this, clicking Launch twice would trigger duplicate Vapi calls.
    initiated_count = await db.customers.count_documents({
        "company_id": company_oid,
        "status": "CALL_INITIATED"
    })
    if initiated_count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Campaign already running — {initiated_count} call(s) in progress. Wait or reset first."
        )

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


@router.post("/campaign/reset")
async def reset_campaign(request: CampaignStartRequest):
    """
    Reset all stuck CALL_INITIATED leads back to PENDING for a company.

    Use this when a campaign fails mid-way and leads are left in
    CALL_INITIATED state with no webhook ever arriving. Without this,
    those leads would be permanently stuck and the campaign couldn't
    be restarted.
    """
    db = get_db()

    try:
        company_oid = ObjectId(request.company_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid company_id format")

    result = await db.customers.update_many(
        {"company_id": company_oid, "status": "CALL_INITIATED"},
        {"$set": {"status": "PENDING", "updated_at": datetime.now(timezone.utc)}}
    )

    return {
        "status": "success",
        "message": f"Reset {result.modified_count} lead(s) back to PENDING.",
        "reset_count": result.modified_count
    }


@router.get("/campaign/call-logs")
async def get_call_logs(company_id: str):
    """
    Fetch all call logs for a company, newest first.
    Each log includes the transcript, outcome, duration, and customer info.
    Used by the frontend Call Logs panel.
    """
    db = get_db()

    try:
        company_oid = ObjectId(company_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid company_id format")

    logs = []
    cursor = db.call_logs.find({"company_id": company_oid}).sort("created_at", -1).limit(50)

    async for doc in cursor:
        # Fetch customer name for display
        customer = await db.customers.find_one({"_id": doc["customer_id"]})
        customer_name = customer["name"] if customer else "Unknown"

        logs.append({
            "id": str(doc["_id"]),
            "customer_id": str(doc["customer_id"]),
            "customer_name": customer_name,
            "vapi_call_id": doc.get("vapi_call_id", ""),
            "transcript": doc.get("transcript", ""),
            "summary": doc.get("summary", ""),
            "outcome": doc.get("outcome", "UNKNOWN"),
            "duration_seconds": doc.get("duration_seconds", 0),
            "created_at": doc["created_at"].isoformat()
        })

    return logs
