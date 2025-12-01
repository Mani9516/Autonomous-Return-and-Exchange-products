from langchain_google_genai import ChatGoogleGenerativeAI
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
    Refund: ${state['refund_amount']}
    """
    
    response = llm.invoke(prompt)
    
    return {"communication_draft": response.content}
