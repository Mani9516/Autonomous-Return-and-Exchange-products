from langchain_google_genai import ChatGoogleGenerativeAI
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
