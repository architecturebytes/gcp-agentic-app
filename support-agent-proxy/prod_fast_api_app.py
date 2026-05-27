import os
import asyncio
import logging
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import vertexai
from vertexai import agent_engines

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# The full Resource Name of your Agent Runtime (configured via env var)
AGENT_RESOURCE_NAME = os.environ.get("AGENT_RESOURCE_NAME")

if not AGENT_RESOURCE_NAME:
    raise ValueError("AGENT_RESOURCE_NAME environment variable is not set")

# Initialize Vertex AI
vertexai.init(project="bytesproj", location="us-east1")

app = FastAPI(title="support-agent-proxy")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/run")
async def run_agent(request: Request):
    try:
        # 1. Parse incoming frontend request
        data = await request.json()
        input_text = data.get('newMessage', {}).get('parts', [{}])[0].get('text', '')
        
        if not input_text:
            raise HTTPException(status_code=400, detail="No prompt text provided")
        
        # 2. Get the remote app engine
        remote_app = agent_engines.get(AGENT_RESOURCE_NAME)
        
        # 3. Create a session
        user_id = "default_web_user"
        remote_session = await remote_app.async_create_session(user_id=user_id)
        
        # 4. Stream query to the agent and collect ALL events
        all_events = []
        
        async for event in remote_app.async_stream_query(
            user_id=user_id,
            session_id=remote_session['id'],
            message=input_text,
        ):
            all_events.append(event)
                        
        # 5. Return the raw array directly to match frontend's expected format
        return all_events

    except Exception as e:
        # Log the full exception for debugging
        logger.error(f"Error processing agent query: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# Mock session endpoint to keep frontend happy
@app.post("/apps/app/users/{user_id}/sessions")
async def create_session(user_id: str):
    return {"id": "session_123"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
