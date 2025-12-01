import os
from typing import TypedDict, List
from langgraph.graph import StateGraph, END
import opik

# Import separate agents
from agents.vision_agent import vision_agent
from agents.policy_agent import policy_agent
from agents.resolution_agent import resolution_agent
from agents.communication_agent import communication_agent
from state import ReturnState

# --- CONFIGURATION ---
os.environ["GOOGLE_API_KEY"] = "your_api_key_here"
os.environ["OPIK_API_KEY"] = "your_opik_key_here"

# Configure Observability
opik.configure(use_batching=True)

# --- GRAPH CONSTRUCTION ---
# Using LangGraph to orchestrate the multi-agent workflow

workflow = StateGraph(ReturnState)

# Add Agent Nodes
workflow.add_node("vision_node", vision_agent)
workflow.add_node("policy_node", policy_agent)
workflow.add_node("resolution_node", resolution_agent)
workflow.add_node("comm_node", communication_agent)

# Define Logic Flow
workflow.set_entry_point("vision_node")

# Vision -> Policy
workflow.add_edge("vision_node", "policy_node")

# Policy -> Resolution
workflow.add_edge("policy_node", "resolution_node")

# Resolution -> Communication
workflow.add_edge("resolution_node", "comm_node")

# Communication -> End
workflow.add_edge("comm_node", END)

# Compile Application
app = workflow.compile()

# --- EXECUTION ENTRY POINT ---
if __name__ == "__main__":
    initial_state = {
        "case_id": "CASE-101", 
        "user_id": "USER-55",
        "product_name": "Air Stride Running Shoes",
        "return_reason": "Sole separating after 2 days",
        "image_path": "./uploads/shoes_defect.jpg"
    }
    
    print("Starting Autonomous Return Workflow...")
    result = app.invoke(initial_state)
    print(f"Final Outcome: {result['policy_decision']}")
