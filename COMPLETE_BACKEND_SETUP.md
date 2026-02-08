# Complete backend setup — do this once

**Note:** I can’t access your Railway or Vercel accounts from here, so these steps must be done in your browser. Follow them in order; each step is copy-paste where possible.

You’ll deploy the **agent** on Railway, then point **Vercel** at it.

---

## Step 1: Deploy the agent on Railway

1. Open: **https://railway.app/**
2. Sign in with **GitHub**.
3. Click **New Project** → **Deploy from GitHub repo**.
4. Choose repo: **MansiGambhir1313/Test-Bed-Agentic-UI-** (or your repo name).
5. After the first deployment, you’ll have one service. Configure it for the **agent**:
   - Click the new service → **Settings** (or the gear icon).
   - **Root Directory:** leave **empty** (so Railway builds from repo root and uses the root **Dockerfile**, which builds the agent). If you see “Error creating build plan with Railpack”, make sure Root Directory is **not** set, or set it to **`agent`** so Railway uses `agent/Dockerfile`.
   - Railway will detect the **Dockerfile** at repo root and use it (no Railpack).
6. **Variables** (Settings → **Variables**, or the **Variables** tab):
   - **Option A – From console (API, no login):** Create a token in Railway (Account → Tokens), then run:
     ```powershell
     $env:RAILWAY_TOKEN = "your-token"
     .\railway-setup-api.ps1
     ```
   - **Option B – From console (CLI):** After `railway login` in a terminal, run `.\railway-setup.ps1` (reads `agent/.env`, sets variables via CLI).
   - **Option C – In the dashboard:** Click **+ New Variable** and add these (values from your `agent/.env`):

   | Name | Value (from your agent/.env) |
   |------|-----------------------------|
   | `USE_BEDROCK` | `true` |
   | `AWS_REGION` | `us-east-1` |
   | `AWS_ACCESS_KEY_ID` | (copy from agent/.env) |
   | `AWS_SECRET_ACCESS_KEY` | (copy from agent/.env) |

7. **Networking:**
   - In the service, open **Settings** → **Networking** (or **Deploy** → **Settings**).
   - Click **Generate Domain** (or **Add a domain**). Railway will assign a URL like `https://something.up.railway.app`.
8. **Copy that URL** (e.g. `https://test-bed-agentic-agent.up.railway.app`) — you need it for Step 2 and Step 4.
9. Wait for the deployment to finish (status **Active** / **Success**). If it fails, check **Deploy logs** for errors.

### If you see “Error creating build plan with Railpack”

Railway uses **Railpack** when it doesn’t find a **Dockerfile**. That often happens in monorepos when the service builds from **repo root** and there was no root Dockerfile.

**Fix:** The repo now has a **Dockerfile at repo root** that builds the agent. Do this:

1. In the **agent** service → **Settings** → **Root Directory**.
2. **Leave Root Directory empty** (clear any value and save). Railway will then build from repo root and use the root **Dockerfile**.
3. **Redeploy** the service (Deployments → **⋯** → **Redeploy**).

If you prefer to build from the `agent` folder only: set **Root Directory** to **`agent`** (exactly). Then Railway uses `agent/Dockerfile`. Redeploy after changing.

---

## Step 2: Set VITE_API_URL in Vercel

1. Open: **https://vercel.com/** → your project (**test-bed-agentic** or the one that has your GUI).
2. Go to **Settings** → **Environment Variables**.
3. Click **Add New** (or **Add**):
   - **Name:** `VITE_API_URL`
   - **Value:** paste the **agent URL from Step 1** (e.g. `https://something.up.railway.app`) — **no trailing slash**.
   - **Environments:** check **Production** (and **Preview** if you use previews).
4. Click **Save**.

---

## Step 3: Redeploy the Vercel project

1. In the same Vercel project, go to **Deployments**.
2. Open the **⋯** menu on the **latest** deployment.
3. Click **Redeploy** → confirm.

When the new deployment is ready, the GUI will use your agent URL and the Coding Agent will work.

---

## Step 4: Quick test (Option B) — without waiting for redeploy

If you don’t want to wait for the Vercel redeploy, you can test **right away** with the query param:

1. Take your **agent URL** from Step 1 (e.g. `https://something.up.railway.app`).
2. Open this URL in your browser (replace `YOUR_AGENT_URL` with that URL):

   ```
   https://test-bed-agentic-c3csx300f-mansi-gambhirs-projects.vercel.app/new?api=YOUR_AGENT_URL
   ```

   Example (fake URL):

   ```
   https://test-bed-agentic-c3csx300f-mansi-gambhirs-projects.vercel.app/new?api=https://my-agent.up.railway.app
   ```

3. The app will use that backend for this session. Try sending a prompt (e.g. “create ui for e commerce platform”) and the agent should respond.

---

## Checklist

- [ ] Step 1: Agent deployed on Railway, **Root Directory** = `agent`, variables set, **domain generated**, URL copied.
- [ ] Step 2: In Vercel, **VITE_API_URL** = agent URL (no trailing slash), saved.
- [ ] Step 3: Vercel project **redeployed**.
- [ ] Step 4 (optional): Tested with **?api=** URL; agent responds and filesystem fills.

---

## Helper: get exact VITE_API_URL and ?api= URL

After you have your **agent URL** from Step 1:

1. Open the helper page: **Local:** open `gui/public/backend-url-helper.html` from the repo in your browser. **Or after deploy:** `https://test-bed-agentic-c3csx300f-mansi-gambhirs-projects.vercel.app/backend-url-helper.html`
2. Paste your **agent URL** and click **Generate**.
3. Use the shown **VITE_API_URL** value in Vercel (Step 2) and the **Quick-test link** for Option B (Step 4).

---

After this, the “Backend not configured” banner should disappear (once redeploy is live), and the Coding Agent will work from the main app URL as well.
