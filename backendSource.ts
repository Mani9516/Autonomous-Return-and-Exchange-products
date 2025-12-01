export const BACKEND_FILES: Record<string, string> = {
  "main.py": `import os
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
`,
  "state.py": `from typing import TypedDict, Any

class ReturnState(TypedDict):
    case_id: str
    user_id: str
    product_name: str
    return_reason: str
    image_path: str
    
    # State populated by agents
    vision_analysis: dict      # From Vision Agent
    policy_decision: str       # From Policy Agent
    policy_reasoning: str      # From Policy Agent
    refund_amount: float       # From Resolution Agent
    communication_draft: str   # From Communication Agent
`,
  "agents/vision_agent.py": `from langchain_google_genai import ChatGoogleGenerativeAI
from state import ReturnState
import opik
import json

llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0)

@opik.track
def vision_agent(state: ReturnState):
    """
    Agent 1: Visual Inspection
    Uses Vision API to detect defects and verify item identity.
    """
    print(f"--> [Vision Agent] Scanning {state['image_path']}...")
    
    prompt = f"""
    Analyze the image provided. 
    1. Identify the object.
    2. Confirm if it matches the product name: '{state['product_name']}'.
    3. Describe any visible damage.
    
    Output JSON.
    """
    
    # Simulating Vision API response for demo
    # In production: response = llm.invoke(...)
    
    analysis_result = {
        "detected_object": "running shoe",
        "is_item_match": True,
        "damage_description": "Sole detachment visible at heel",
        "severity": 8
    }
    
    return {"vision_analysis": analysis_result}
`,
  "agents/policy_agent.py": `from langchain_google_genai import ChatGoogleGenerativeAI
from state import ReturnState
from vector_store import retrieve_policy_context
import opik

llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0)

@opik.track
def policy_agent(state: ReturnState):
    """
    Agent 2: Policy Enforcement
    Uses RAG to check defect against company policy.
    """
    print("--> [Policy Agent] Consulting Policy Vector DB...")
    
    # RAG: Retrieve relevant policy chunks
    policy_context = retrieve_policy_context(state['return_reason'])
    
    analysis = state['vision_analysis']
    
    if not analysis['is_item_match']:
        return {
            "policy_decision": "DENIED", 
            "policy_reasoning": "Item mismatch detected."
        }
        
    # Logic simulation
    decision = "APPROVED"
    reasoning = "Defect covered under manufacturing warranty (Sole Separation within 30 days)."
    
    return {
        "policy_decision": decision, 
        "policy_reasoning": reasoning
    }
`,
  "agents/resolution_agent.py": `from state import ReturnState
from database import get_product_price
import opik

@opik.track
def resolution_agent(state: ReturnState):
    """
    Agent 3: Resolution Strategy
    Calculates refunds, restocking fees, and generates shipping labels.
    """
    print("--> [Resolution Agent] Calculating final settlement...")
    
    decision = state['policy_decision']
    refund = 0.0
    
    if decision == "APPROVED":
        original_price = get_product_price(state['product_name'])
        refund = original_price  # Full refund
    
    return {"refund_amount": refund}
`,
  "agents/communication_agent.py": `from langchain_google_genai import ChatGoogleGenerativeAI
from state import ReturnState
import opik

llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.7)

@opik.track
def communication_agent(state: ReturnState):
    """
    Agent 4: Customer Communication
    Drafts the final email response using GenAI.
    """
    print("--> [Communication Agent] Drafting response...")
    
    prompt = f"""
    Write a customer service email.
    Decision: {state['policy_decision']}
    Reason: {state['policy_reasoning']}
    Refund: \${state['refund_amount']}
    """
    
    response = llm.invoke(prompt)
    
    return {"communication_draft": response.content}
`,
  "database.py": `import sqlite3

# Mock SQLite Interface
def get_product_price(product_name: str) -> float:
    # In real app: SELECT price FROM products WHERE name = ?
    mock_db = {
        "Air Stride Running Shoes": 120.00,
        "Quantum X1 Laptop": 1299.99
    }
    return mock_db.get(product_name, 0.0)

def save_case_to_db(state):
    print(f"Saving Case {state['case_id']} to SQLite DB.")
`,
  "vector_store.py": `import chromadb

# Mock ChromaDB Interface
def retrieve_policy_context(query: str) -> str:
    # In real app: collection.query(query_texts=[query])
    return """
    Policy 4.2: Footwear Returns
    - Worn soles are not returnable.
    - Manufacturing defects (gluing, stitching) covered for 60 days.
    """
`
};
