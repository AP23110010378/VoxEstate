"""
graph.py — LangGraph Graph Definition

WHAT IS LANGGRAPH?
LangGraph lets you build AI agent workflows as a graph of nodes and edges.
- Nodes = functions that do work
- Edges = connections that define the order of execution

OUR TWO GRAPHS:

Graph 1 — DISPATCH (campaign start):
  START → dispatch_node → END
  "Fetch all leads, call them all"

Graph 2 — EVALUATION (webhook):
  START → evaluation_node → state_update_node → END
  "Classify transcript, update database"

WHY two separate graphs instead of one big one?
Because they run at DIFFERENT TIMES:
- Dispatch runs when manager clicks "Launch Campaign"
- Evaluation runs minutes later when Vapi finishes a call
They are triggered by different events, so they're separate flows.
"""

from langgraph.graph import StateGraph, END
from agent.state import VoiceAgentState
from agent.nodes import dispatch_node, evaluation_node, state_update_node


def build_dispatch_graph():
    """
    Build the campaign dispatch graph.
    START → dispatch_node → END
    """
    # Create a new graph with our state schema
    graph = StateGraph(VoiceAgentState)

    # Add the dispatch node
    graph.add_node("dispatch", dispatch_node)

    # Set entry point — where the graph starts
    graph.set_entry_point("dispatch")

    # Connect dispatch to END — graph finishes after dispatching
    graph.add_edge("dispatch", END)

    # Compile the graph into a runnable
    return graph.compile()


def build_evaluation_graph():
    """
    Build the webhook evaluation graph.
    START → evaluation_node → state_update_node → END
    """
    graph = StateGraph(VoiceAgentState)

    # Add both nodes
    graph.add_node("evaluation", evaluation_node)
    graph.add_node("state_update", state_update_node)

    # Set entry point
    graph.set_entry_point("evaluation")

    # Wire the edges: evaluation → state_update → END
    graph.add_edge("evaluation", "state_update")
    graph.add_edge("state_update", END)

    return graph.compile()


# Pre-build the graphs at module load time
# This is more efficient than building them on every request
dispatch_graph = build_dispatch_graph()
evaluation_graph = build_evaluation_graph()


async def run_dispatch_graph(company_id: str) -> dict:
    """
    Run the dispatch graph for a campaign.
    Called from POST /campaign/start endpoint.
    """
    # Create the initial state
    initial_state = {
        "company_id": company_id,
        "customers": [],
        "current_customer": {},
        "vapi_call_id": "",
        "transcript": "",
        "summary": "",
        "duration_seconds": 0,
        "customer_id": "",
        "outcome": "",
        "error": ""
    }

    # Run the graph — ainvoke = async invoke
    result = await dispatch_graph.ainvoke(initial_state)
    return result


async def run_evaluation_graph(
    customer_id: str,
    company_id: str,
    vapi_call_id: str,
    transcript: str,
    summary: str,
    duration_seconds: int
) -> dict:
    """
    Run the evaluation graph for a completed call.
    Called from POST /api/webhooks/vapi endpoint.
    """
    initial_state = {
        "company_id": company_id,
        "customers": [],
        "current_customer": {},
        "vapi_call_id": vapi_call_id,
        "transcript": transcript,
        "summary": summary,
        "duration_seconds": duration_seconds,
        "customer_id": customer_id,
        "outcome": "",
        "error": ""
    }

    result = await evaluation_graph.ainvoke(initial_state)
    return result
