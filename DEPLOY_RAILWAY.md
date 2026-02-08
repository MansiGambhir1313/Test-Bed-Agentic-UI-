# Deploy the agent on Railway

Run the LangGraph agent on **Railway** (no Lambda; writable filesystem, no init timeout). Then point the GUI at the Railway URL.

---

## Prerequisites

- **Railway account** — [railway.app](https://railway.app)
- **Agent env** — `USE_BEDROCK=true`, AWS credentials (or IAM if supported), `AWS_REGION`
- **Bedrock** model access enabled in your AWS account

---

## 1. Deploy the agent to Railway

### From the repo (GitHub + Railway)

1. **Create a Railway project**  
   [railway.app/new](https://railway.app/new) → **Deploy from GitHub repo** → select this repo.

2. **Configure the service**
   - **Root Directory:** leave default (repo root).
   - **Dockerfile path:** set **Dockerfile path** to `Dockerfile.railway`  
     (in Service → Settings → Build → Dockerfile Path, or set env `RAILWAY_DOCKERFILE_PATH=Dockerfile.railway`).
   - **Watch Paths (optional):** `agent/**` so only agent changes trigger rebuilds.

3. **Environment variables** (Service → Variables):

   | Variable | Value |
   |----------|--------|
   | `USE_BEDROCK` | `true` |
   | `AWS_REGION` | `us-east-1` (or your region) |
   | `AWS_ACCESS_KEY_ID` | Your AWS access key |
   | `AWS_SECRET_ACCESS_KEY` | Your AWS secret key |
   | `MODEL` | `claude-sonnet-4-5-20250929` (optional) |
   | `LANGSMITH_TRACING` | `false` (optional) |

   Do **not** set `ANTHROPIC_API_KEY` if using Bedrock.

4. **Deploy**  
   Railway builds from `Dockerfile.railway` and runs the container. It will assign a public URL (e.g. `https://your-service.up.railway.app`).

5. **Get the agent URL**  
   Service → **Settings** → **Networking** → **Generate Domain**. Copy the URL (e.g. `https://deepagents-agent-production.up.railway.app`) — **no trailing slash**.

---

## 2. Point the GUI at the Railway URL

- **Vercel / Amplify:** In the GUI project’s **Environment variables**, set  
  `VITE_API_URL` = your Railway agent URL (no trailing slash).  
  Redeploy the GUI.

- **Local:** In `gui/.env`, set  
  `VITE_API_URL=https://your-app.up.railway.app`  
  and run the GUI.

---

## 3. Optional: deploy from CLI

If you use [Railway CLI](https://docs.railway.com/develop/cli):

```bash
# From repo root
railway link   # link to existing project or create one
railway up     # build and deploy (uses Dockerfile.railway if configured)
```

Ensure the service is configured to use `Dockerfile.railway` and the env vars above.

---

## Summary

| Step | Action |
|------|--------|
| 1 | New Railway project from GitHub (this repo). |
| 2 | Set Dockerfile path to `Dockerfile.railway`. |
| 3 | Set env: `USE_BEDROCK=true`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`. |
| 4 | Deploy; generate public domain. |
| 5 | Set `VITE_API_URL` in GUI (Vercel/Amplify or `gui/.env`) to the Railway URL. |

The agent runs with a writable filesystem and no Lambda init timeout; LangGraph can create `.langgraph_api` in `/app` and start normally.
