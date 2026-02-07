# Complete backend setup — do this once

**Note:** I can’t access your Railway or Vercel accounts from here, so these steps must be done in your browser. Follow them in order; each step is copy-paste where possible.

You’ll deploy the **agent** on Railway, then point **Vercel** at it.

---

## Step 1: Deploy the agent on Railway

1. Open: **https://railway.app/**
2. Sign in with **GitHub**.
3. Click **New Project** → **Deploy from GitHub repo**.
4. Choose repo: **MansiGambhir1313/Test-Bed-Agentic-UI-** (or your repo name).
5. After the first deployment, you’ll have one service. We want the **agent** only:
   - Click the new service → **Settings** (or the gear icon).
   - **Root Directory:** set to **`agent`** (type exactly: `agent`).
   - **Builder:** leave as **Dockerfile** (Railway will use `agent/Dockerfile`).
6. **Variables** (Settings → **Variables**, or the **Variables** tab):
   - Click **+ New Variable** and add these **one by one** (values from your `agent/.env` on your PC):

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
