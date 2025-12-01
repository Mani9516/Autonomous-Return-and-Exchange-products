import os
from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from opik import Opik, track
from backend.graph import app as agent_workflow
from backend.models import User, Order
from pydantic import BaseModel

# Initialize FastAPI
app = FastAPI(title="AutoReturn AI Backend")
opik = Opik(project_name="autoreturn-agent")

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Schemas ---
class ChatInput(BaseModel):
    message: str
    order_id: str
    image_url: str | None = None

# --- Endpoints ---

@app.get("/")
def health_check():
    return {"status": "running", "service": "AutoReturn AI"}

@app.post("/auth/token")
@track(name="auth_login")
async def login(form_data: dict):
    # Simulated JWT generation
    return {"access_token": "ey...mock.jwt", "token_type": "bearer"}

@app.post("/agent/chat")
@track(name="agent_workflow_execution")
async def chat_endpoint(data: ChatInput):
    """
    Triggers the LangGraph workflow.
    """
    inputs = {
        "user_input": data.message,
        "order_id": data.order_id,
        "image_path": data.image_url,
        "messages": []
    }
    
    # Run the graph
    try:
        final_state = agent_workflow.invoke(inputs)
        return {
            "response": final_state['messages'][-1],
            "trace_id": opik.get_trace_id(),
            "policy_decision": final_state.get('policy_outcome')
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
