"""
nodes.py — LangGraph Node Functions

WHAT ARE NODES?
In LangGraph, a "node" is just a Python function that:
1. Receives the current state
2. Does some work (API calls, database updates, etc.)
3. Returns updates to the state

Our system has 3 nodes:
1. dispatch_node — Fetches leads and triggers Vapi calls
2. evaluation_node — Sends transcript to Groq for classification
3. state_update_node — Updates MongoDB with the result

Each node is a simple async function. LangGraph handles the wiring.
"""

from bson import ObjectId
from datetime import datetime, timezone
from database import get_db
from services.vapi_service import trigger_call
from services.openai_service import classify_transcript
from agent.state import VoiceAgentState


async def dispatch_node(state: VoiceAgentState) -> dict:
    """
    NODE 1 — Dispatch (Campaign Trigger)

    Job: Fetch all PENDING leads for a company and trigger Vapi calls.

    This is called when the manager clicks "Launch Campaign".
    It doesn't wait for calls to complete — it just triggers them
    and marks leads as CALL_INITIATED.
    """
    db = get_db()
    company_id = state["company_id"]

    print(f"\n🚀 DISPATCH NODE — Starting campaign for company {company_id}")

    # Fetch the company details (we need the prompt)
    company = await db.companies.find_one({"_id": ObjectId(company_id)})
    if not company:
        return {"error": f"Company {company_id} not found"}

    # Fetch all PENDING customers for this company
    customers = []
    cursor = db.customers.find({
        "company_id": ObjectId(company_id),
        "status": "PENDING"
    })

    async for doc in cursor:
        customers.append(doc)

    print(f"📋 Found {len(customers)} pending leads")

    if not customers:
        return {"error": "No pending leads found", "customers": []}

    # Trigger a Vapi call for each customer
    for customer in customers:
        try:
            # Trigger the AI voice call
            vapi_call_id = await trigger_call(customer, company)

            # Update customer status to CALL_INITIATED in MongoDB
            await db.customers.update_one(
                {"_id": customer["_id"]},
                {
                    "$set": {
                        "status": "CALL_INITIATED",
                        "updated_at": datetime.now(timezone.utc)
                    }
                }
            )
            print(f"  ✅ Call triggered for {customer['name']} ({customer['phone']})")

        except Exception as e:
            # If a call fails, mark the lead as FAILED but continue with others
            print(f"  ❌ Call failed for {customer['name']}: {e}")
            await db.customers.update_one(
                {"_id": customer["_id"]},
                {
                    "$set": {
                        "status": "FAILED",
                        "updated_at": datetime.now(timezone.utc)
                    }
                }
            )

    return {"customers": [str(c["_id"]) for c in customers]}


async def evaluation_node(state: VoiceAgentState) -> dict:
    """
    NODE 2 — Evaluation (Transcript Classification)

    Job: Take the call transcript and ask OpenAI to classify it.

    This is called after Vapi sends us the webhook with the transcript.
    The Groq LLM reads the conversation and decides:
    - QUALIFIED: person wants to buy/sell
    - NOT_INTERESTED: person said no
    - FAILED: unclear/disconnected
    """
    transcript = state.get("transcript", "")

    print(f"\n🧠 EVALUATION NODE — Classifying transcript ({len(transcript)} chars)")

    # Send transcript to OpenAI for classification
    outcome = await classify_transcript(transcript)

    print(f"   Result: {outcome}")

    return {"outcome": outcome}


async def state_update_node(state: VoiceAgentState) -> dict:
    """
    NODE 3 — State Update (MongoDB Write)

    Job: Save the classification result to MongoDB.

    Two things happen:
    1. Customer status gets updated (e.g., QUALIFIED)
    2. A call_log document is created (for records/debugging)
    """
    db = get_db()

    customer_id = state.get("customer_id", "")
    company_id = state.get("company_id", "")
    outcome = state.get("outcome", "FAILED")
    vapi_call_id = state.get("vapi_call_id", "")
    transcript = state.get("transcript", "")
    summary = state.get("summary", "")
    duration_seconds = state.get("duration_seconds", 0)

    print(f"\n💾 STATE UPDATE NODE — Updating customer {customer_id} → {outcome}")

    # 1. Update customer status in MongoDB
    await db.customers.update_one(
        {"_id": ObjectId(customer_id)},
        {
            "$set": {
                "status": outcome,
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )

    # 2. Create a call_log document for this call
    call_log = {
        "customer_id": ObjectId(customer_id),
        "company_id": ObjectId(company_id),
        "vapi_call_id": vapi_call_id,
        "transcript": transcript,
        "summary": summary,
        "outcome": outcome,
        "duration_seconds": duration_seconds,
        "created_at": datetime.now(timezone.utc)
    }

    await db.call_logs.insert_one(call_log)
    print(f"   ✅ Customer updated and call log created")

    return {"outcome": outcome}
