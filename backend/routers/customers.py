"""
customers.py — Router for Customer (Lead) endpoints

GET /customers?company_id=... → returns all leads for a specific company.
The frontend uses this to populate the leads table when a company is selected.
"""

from fastapi import APIRouter, HTTPException, Query
from bson import ObjectId
from database import get_db
from models.customer import CustomerResponse

router = APIRouter(tags=["Customers"])


@router.get("/customers", response_model=list[CustomerResponse])
async def list_customers(company_id: str = Query(..., description="Company ObjectId")):
    """
    Fetch all customers/leads for a given company.

    WHY company_id as query param?
    - In multi-tenant apps, you always filter by tenant.
    - This prevents Company A from seeing Company B's leads.
    """
    db = get_db()

    # Validate that the company_id is a valid MongoDB ObjectId
    try:
        company_oid = ObjectId(company_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid company_id format")

    # Find all customers belonging to this company
    customers = []
    cursor = db.customers.find({"company_id": company_oid}).sort("created_at", 1)

    async for doc in cursor:
        customers.append(CustomerResponse(
            id=str(doc["_id"]),
            company_id=str(doc["company_id"]),
            name=doc["name"],
            phone=doc["phone"],
            status=doc["status"],
            created_at=doc["created_at"],
            updated_at=doc["updated_at"]
        ))

    return customers
