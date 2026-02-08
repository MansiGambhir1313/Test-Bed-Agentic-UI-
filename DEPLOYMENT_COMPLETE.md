# Finish deployment — 3 steps

Use this after the repo is connected to Railway. Completes agent + Vercel.

---

## Step 1: Railway variables (pick one)

**Option A — API (no browser login)**  
1. Railway dashboard → **Account** (profile) → **Tokens** → **Create Token**. Copy the token.  
2. In PowerShell:
   ```powershell
   cd "c:\Users\Kanak\Desktop\AI Lovable\deepagents-open-lovable"
   $env:RAILWAY_TOKEN = "paste-your-token-here"
   .\railway-setup-api.ps1
   ```
3. You should see "Variables set on Railway."

**Option B — Dashboard**  
1. Open [Railway → your service → Variables](https://railway.com/project/701c0236-967b-482d-a2c6-39fa77d50f85/service/2f98d2b6-a2e7-45e9-8af3-6abb64961467/variables?environmentId=cc0f343a-109c-4985-8984-4a312e1bcc29).  
2. Add: **USE_BEDROCK** = `true`, **AWS_REGION** = `us-east-1`, **AWS_ACCESS_KEY_ID**, **AWS_SECRET_ACCESS_KEY** (from `agent/.env`).

---

## Step 2: Railway build + domain + redeploy

1. [Service Settings](https://railway.com/project/701c0236-967b-482d-a2c6-39fa77d50f85/service/2f98d2b6-a2e7-45e9-8af3-6abb64961467/settings?environmentId=cc0f343a-109c-4985-8984-4a312e1bcc29) → **Root Directory** → leave **empty** → Save.  
2. **Networking** → **Generate Domain** → copy the URL (e.g. `https://xxx.up.railway.app`).  
3. **Deployments** → **⋯** on latest → **Redeploy**. Wait until status is Active.

---

## Step 3: Vercel + agent URL

1. Vercel → your project → **Settings** → **Environment Variables**.  
2. Add **VITE_API_URL** = `https://test-bed-agentic-ui-production.up.railway.app` (no trailing slash).  
3. **Deployments** → **⋯** → **Redeploy**.

Then open your Vercel app URL, or quick-test: `.../new?api=https://test-bed-agentic-ui-production.up.railway.app`. The Coding Agent should work.

**Saved agent URL:** see `railway-agent-url.txt` in the repo.

---

## If you see "Application failed to respond" on Railway

Per [Railway's docs](https://docs.railway.com/networking/troubleshooting/application-failed-to-respond):

1. **App must listen on 0.0.0.0 and on Railway's PORT** (Railway injects `PORT`, usually **8080**). The Dockerfile now runs:  
   `langgraph dev --no-browser --host 0.0.0.0 --port ${PORT:-8080}`

2. **Target port in Railway**  
   Service → **Settings** → **Networking** (or your domain) → **Target port** must match the port the app listens on. Set it to **8080** (or leave default if it’s already 8080). If it was 2024 or something else, change it to **8080** and save.

3. **No custom Start Command**  
   Service → **Settings** → **Build / Deploy** → ensure **Start Command** is **empty** so the Dockerfile `CMD` is used (with `--host 0.0.0.0` and `--port $PORT`).

4. **Redeploy**  
   **Deployments** → **⋯** on latest → **Redeploy** (or push a commit so Railway rebuilds). Wait until the new deployment is Active, then try the URL again.
