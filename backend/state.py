from typing import TypedDict, Any

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
