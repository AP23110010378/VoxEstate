"""
webhooks.py — Router for Vapi Webhook

POST /api/webhooks/vapi → receives call completion data from Vapi.

HOW WEBHOOKS WORK (for beginners):
1. Vapi makes an AI call to a lead's phone
2. When the call ends, Vapi sends an HTTP POST to OUR server
3. That POST contains the transcript, call duration, call ID, etc.
4. We process that data — classify the transcript, update the lead status

Think of it like a notification: "Hey, call is done. Here's what happened."
"""

from fastapi import APIRouter, Request, HTTPException
from database import get_db

router = APIRouter(tags=["Webhooks"])


@router.post("/api/webhooks/vapi")
async def vapi_webhook(request: Request):
    """
    Receive and process Vapi call completion webhook.

    Vapi sends different event types. We only care about "end-of-call-report"
    which contains the full transcript after the call ends.
    """
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    # Log the webhook for debugging (helpful during development)
    print(f"📞 Vapi webhook received: {payload.get('message', {}).get('type', 'unknown')}")

    # Vapi sends different message types. We want "end-of-call-report"
    message = payload.get("message", {})
    message_type = message.get("type", "")

    if message_type != "end-of-call-report":
        # Acknowledge other message types but don't process them
        return {"status": "ok", "message": f"Ignored message type: {message_type}"}

    # Extract the data we need from the webhook payload
    call_data = message.get("call", {})
    vapi_call_id = call_data.get("id", "")
    transcript = message.get("transcript", "")
    summary = message.get("summary", "")
    ended_reason = message.get("endedReason", "")

    # Calculate call duration
    started_at = call_data.get("startedAt", "")
    ended_at = call_data.get("endedAt", "")
    duration_seconds = 0
    if started_at and ended_at:
        from datetime import datetime
        try:
            start = datetime.fromisoformat(started_at.replace("Z", "+00:00"))
            end = datetime.fromisoformat(ended_at.replace("Z", "+00:00"))
            duration_seconds = int((end - start).total_seconds())
        except Exception:
            duration_seconds = 0

    # Extract customer_id and company_id from call metadata
    # We pass these as metadata when triggering the call via Vapi
    metadata = call_data.get("metadata", {})
    customer_id = metadata.get("customer_id", "")
    company_id = metadata.get("company_id", "")

    if not customer_id or not company_id:
        print("⚠️ Webhook missing customer_id or company_id in metadata")
        return {"status": "error", "message": "Missing metadata"}

    print(f"📝 Processing call for customer {customer_id}")
    print(f"   Transcript length: {len(transcript)} chars")
    print(f"   Duration: {duration_seconds}s")

    # Invoke the LangGraph evaluation flow
    from agent.graph import run_evaluation_graph

    try:
        result = await run_evaluation_graph(
            customer_id=customer_id,
            company_id=company_id,
            vapi_call_id=vapi_call_id,
            transcript=transcript,
            summary=summary,
            duration_seconds=duration_seconds
        )

        return {
            "status": "success",
            "outcome": result.get("outcome", "UNKNOWN"),
            "customer_id": customer_id
        }
    except Exception as e:
        print(f"❌ Error processing webhook: {e}")
        raise HTTPException(status_code=500, detail=str(e))
