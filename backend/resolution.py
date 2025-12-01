from state import ReturnState
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
