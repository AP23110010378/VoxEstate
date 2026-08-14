"""
openai_service.py — OpenAI LLM Transcript Classification

This is the SECOND LLM in our system.
- LLM #1 (inside Vapi) handles the real-time conversation.
- LLM #2 (this one, OpenAI) analyzes the transcript AFTER the call.

WHAT IT DOES:
- Takes the full call transcript as input
- Reads the conversation and decides:
  QUALIFIED → person wants to buy/sell
  NOT_INTERESTED → person said no
  FAILED → call was unclear or disconnected
"""

from openai import AsyncOpenAI
from config import settings


# The classification prompt — this is where the magic happens
CLASSIFICATION_PROMPT = """You are analyzing a real estate lead qualification call transcript.
Based on the conversation, classify the lead as exactly one of:

QUALIFIED - person expressed interest in buying or selling property
NOT_INTERESTED - person declined or showed no interest
FAILED - call was unclear, disconnected, or inconclusive

Transcript:
{transcript}

Respond with ONLY one word: QUALIFIED, NOT_INTERESTED, or FAILED"""


async def classify_transcript(transcript: str) -> str:
    """
    Send a call transcript to OpenAI and get a classification.

    Args:
        transcript: The full conversation text from the Vapi call

    Returns:
        One of: "QUALIFIED", "NOT_INTERESTED", "FAILED"
    """
    # Handle empty or missing transcripts
    if not transcript or len(transcript.strip()) < 10:
        print("⚠️ Transcript too short or empty — marking as FAILED")
        return "FAILED"

    # Create the OpenAI client
    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    try:
        # Send the transcript to OpenAI's model
        response = await client.chat.completions.create(
            model="gpt-4o-mini",  # Extremely fast and cost-effective model
            messages=[
                {
                    "role": "user",
                    "content": CLASSIFICATION_PROMPT.format(transcript=transcript)
                }
            ],
            temperature=0,      # 0 = deterministic (same input → same output)
            max_tokens=10,       # We only need one word back
        )

        # Extract the classification from the response
        result = response.choices[0].message.content.strip().upper()

        # Validate the response is one of our expected values
        valid_outcomes = ["QUALIFIED", "NOT_INTERESTED", "FAILED"]
        if result not in valid_outcomes:
            print(f"⚠️ Unexpected OpenAI response: '{result}' — defaulting to FAILED")
            return "FAILED"

        print(f"🤖 OpenAI classification: {result}")
        return result

    except Exception as e:
        print(f"❌ OpenAI API error: {e}")
        return "FAILED"
