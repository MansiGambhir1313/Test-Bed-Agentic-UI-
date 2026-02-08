# Fix: "Agent isn't working" after Vercel deployment

The UI loads but the Coding Agent doesn't respond (empty filesystem, no output) because the **frontend is calling `http://localhost:2024`** — which doesn't exist in production. You need to point the app to your **deployed agent (backend)**.

---

## Option 1: Set VITE_API_URL and redeploy (recommended)

1. **Agent URL** (saved in repo): `https://test-bed-agentic-ui-production.up.railway.app` (see `railway-agent-url.txt`).
   - If you haven’t deployed the agent yet, deploy it on [Railway](https://railway.app/) and use the URL from there.

2. **In Vercel:**
   - Open your project → **Settings** → **Environment Variables**.
   - Add:
     - **Name:** `VITE_API_URL`
     - **Value:** your agent URL (e.g. `https://xxx.up.railway.app`) — no trailing slash.
     - **Environments:** Production (and Preview if you use it).
   - Save.

3. **Redeploy:**
   - **Deployments** → **⋯** on the latest → **Redeploy**, or push a new commit.

After redeploy, the app will use your agent URL and the agent will respond.

---

## Option 2: Use `?api=` without redeploying

You can point to a backend **without redeploying** by adding a query param:

- Open:  
  `https://your-app.vercel.app/new?api=https://YOUR_AGENT_URL`
- Replace `YOUR_AGENT_URL` with your deployed agent URL (e.g. Railway: `https://xxx.up.railway.app`).

Example:  
`https://test-bed-agentic-c3csx300f-mansi-gambhirs-projects.vercel.app/new?api=https://my-agent.up.railway.app`

The app will use that URL for the backend for that session. You still need the agent deployed and reachable at that URL.

---

## Checklist

- [ ] Agent (backend) is deployed and has a public URL (e.g. Railway).
- [ ] In Vercel, `VITE_API_URL` is set to that URL and you redeployed **or** you use `?api=YOUR_AGENT_URL` in the browser.
- [ ] You see no "Backend not configured" banner (or you fixed it using one of the options above).

Once the frontend points to the correct agent URL, the Coding Agent will respond and the filesystem will populate.
