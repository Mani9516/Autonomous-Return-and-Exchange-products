from typing import TypedDict
from langgraph.graph import StateGraph, END
from backend.agents import VisionAgent, PolicyAgent, ResolutionAgent, CommunicationAgent

class AgentState(TypedDict):
    messages: list
    user_input: str
    image_path: str | None
    order_id: str
    vision_findings: dict
    policy_outcome: dict
    final_response: str

vision = VisionAgent()
policy = PolicyAgent()
resolution = ResolutionAgent()
comm = CommunicationAgent()

def vision_node(state):
    return {"vision_findings": vision.analyze_media(state['image_path'])}

def policy_node(state):
    return {"policy_outcome": policy.check_eligibility(state['user_input'], 10, state['vision_findings'])}

def resolution_node(state):
    return {"final_response": resolution.execute_resolution(state['order_id'], state['policy_outcome'])}

def communication_node(state):
    return {"messages": [comm.generate_response(state)]}

workflow = StateGraph(AgentState)
workflow.add_node("vision", vision_node)
workflow.add_node("policy", policy_node)
workflow.add_node("resolution", resolution_node)
workflow.add_node("communication", communication_node)

workflow.set_entry_point("vision")
workflow.add_edge("vision", "policy")
workflow.add_edge("policy", "resolution")
workflow.add_edge("resolution", "communication")
workflow.add_edge("communication", END)

app = workflow.compile()
