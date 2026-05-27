# Agentic Customer Support Solution - Agents CLI Tutorial

YouTube Ref: https://www.youtube.com/watch?v=jCAilNutWu8

This is an Agentic Application comprising:
- `support-agent`: The core ADK agent.
- `support-agent-proxy`: Proxy service for the agent (for `gcloud run`).
- `support-frontend`: A React-based UI.

## Setup

1. Clone the repository.
2. Ensure you have the required tools (`python`, `uv`, `gcloud`, `agents-cli`, `npm`) installed.
3. Configure your environment variables as indicated by the `.env.example` files in each project.

## GCP Project
Make sure that you have a Project in Google Cloud Platform that you can use.<br>
gcloud should be configured with this project as default.

## Deployment Guide

### 1. Support Agent (`support-agent`)

#### Prepare Agent for Deployment
1. Navigate to `support-agent` directory.
2. Enhance for deployment: `agents-cli scaffold enhance . --deployment-target agent_runtime`
3. Install dependencies: `agents-cli install`

#### Deploy to Agent Runtime
1. Deploy: `agents-cli deploy`

### 2. Support Agent Proxy (`support-agent-proxy`)
Deploy the proxy service to Google Cloud Run:

```bash
cd support-agent-proxy
gcloud run deploy support-agent-proxy --source . --region us-east1 --min-instances 0 --allow-unauthenticated --set-env-vars AGENT_RESOURCE_NAME="<YOUR_AGENT_RESOURCE_NAME>"
```

*Example:*
`gcloud run deploy support-agent-proxy --source . --region us-east1 --min-instances 0 --allow-unauthenticated --set-env-vars AGENT_RESOURCE_NAME="projects/yourproj/locations/us-east1/reasoningEngines/7297449871111289733"`

### 3. Support Frontend (`support-frontend`)

#### Connect Frontend to Backend
1. After the `gcloud run deploy` command finishes, copy the **Service URL** from the output (e.g., `https://support-agent-proxy-12345.us-east1.run.app`).
2. Open `support-frontend/.env` and update `REACT_APP_AGENT_SERVER_URL` with that URL.

#### Launch the Front End
1. Navigate to `support-frontend` directory.
2. Install dependencies: `npm install`
3. Run locally: `npm start`


