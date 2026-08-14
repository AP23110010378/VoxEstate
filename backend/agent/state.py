"""
state.py — LangGraph State Schema

WHAT IS LANGGRAPH STATE?
Think of it like a "shared clipboard" that every node in the graph can read and write.
When Node 1 finishes, it passes data to Node 2 through this state.

WHY TypedDict?
LangGraph requires state to be a TypedDict so it knows the exact shape of data
flowing through the graph. This prevents bugs like "I expected a string but got a list."
"""

from typing import TypedDict, Optional


class VoiceAgentState(TypedDict):
    """
    The state that flows through our LangGraph.

    For DISPATCH flow (campaign start):
        company_id → dispatch_node reads this and fetches leads

    For EVALUATION flow (webhook):
        customer_id, company_id, vapi_call_id, transcript → evaluation reads these
    """
    # Which company triggered the campaign
    company_id: str

    # List of customer documents fetched from MongoDB
    customers: list

    # The customer currently being processed
    current_customer: dict

    # Vapi's unique ID for the call
    vapi_call_id: str

    # Full transcript from the call
    transcript: str

    # The call summary from Vapi
    summary: str

    # Duration of the call in seconds
    duration_seconds: int

    # Customer's MongoDB ID (for webhook flow)
    customer_id: str

    # Classification result: QUALIFIED / NOT_INTERESTED / FAILED
    outcome: str

    # Error message if something went wrong
    error: str
