"""
vapi_service.py — Vapi API Integration

This service triggers outbound AI voice calls via Vapi's REST API.

HOW VAPI WORKS:
- Vapi is an AI voice platform. It handles: phone dialing, speech-to-text,
  LLM conversation, and text-to-speech — all in one API call.
- We just tell it: "Call this number, use this assistant, with this prompt."
- Vapi calls the person, has an AI conversation, then sends us the result via webhook.

We DON'T handle any audio processing ourselves. Vapi does everything.
"""

import httpx
from config import settings


# Vapi API base URL
VAPI_BASE_URL = "https://api.vapi.ai"


async def trigger_call(customer: dict, company: dict) -> str:
    """
    Trigger an outbound AI voice call to a customer via Vapi.

    Args:
        customer: dict with keys: _id, name, phone, company_id
        company: dict with keys: _id, name, prompt

    Returns:
        vapi_call_id: string — Vapi's unique ID for tracking this call

    The key trick: We pass customer_id and company_id as "metadata"
    so that when Vapi calls our webhook later, we know which customer
    this call was for.
    """
    # Build the API request to Vapi
    headers = {
        "Authorization": f"Bearer {settings.VAPI_API_KEY}",
        "Content-Type": "application/json"
    }

    # The call payload — tells Vapi what to do
    payload = {
        # The phone number to call FROM (our Twilio/Vapi number)
        "phoneNumberId": settings.VAPI_PHONE_NUMBER_ID,

        # The customer's phone number to call
        "customer": {
            "number": customer["phone"],
            "name": customer["name"]
        },

        # Override the assistant's system prompt with company-specific prompt
        # This is the "Dynamic Prompting" feature — each company gets
        # a personalized AI caller
        "assistant": {
            "serverUrl": f"{settings.BACKEND_URL}/api/webhooks/vapi",
            "firstMessage": f"Hi {customer['name']}, I'm calling from {company['name']}. How are you doing today?",
            "voicemailMessage": "Hi, I missed you. Please call us back.",
            "endCallMessage": "Thank you for your time, goodbye.",
            "model": {
                "provider": "openai",
                "model": "gpt-3.5-turbo",
                "messages": [
                    {
                        "role": "system",
                        "content": company["prompt"]
                    }
                ]
            }
        },

        # IMPORTANT: Metadata that comes back in the webhook
        # This is how we link the Vapi call back to our database records
        "metadata": {
            "customer_id": str(customer["_id"]),
            "company_id": str(company["_id"])
        },
        
        # COST-SAVING MEASURES:
        # 1. Limit max duration to 3 minutes to avoid huge bills on long voicemails
        "maxDurationSeconds": 200
    }

    # Make the API call to Vapi
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"{VAPI_BASE_URL}/call/phone",
            headers=headers,
            json=payload
        )

        if response.status_code != 201:
            error_detail = response.text
            print(f"❌ Vapi API error: {response.status_code} — {error_detail}")
            raise Exception(f"Vapi call failed: {error_detail}")

        result = response.json()
        vapi_call_id = result.get("id", "")
        print(f"📞 Call triggered for {customer['name']} — Vapi Call ID: {vapi_call_id}")

        return vapi_call_id
