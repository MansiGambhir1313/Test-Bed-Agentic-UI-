# Start Deployment — Step by Step

Deploy **agent** (backend) first, then **GUI** (frontend). Use **Railway** for both (one project, two services). No local Python/Node required — everything runs in the cloud.

---

## Before you start

- [ ] Repo is on **GitHub** (see **Push to GitHub** below if you only have a local clone).
- [ ] You have **AWS Bedrock** access and credentials in `agent/.env` (or you’ll set them in Railway).
- [ ] **Railway** account: [railway.app](https://railway.app/) → Sign in with GitHub.

### Push to GitHub (if needed)

If you only have a local clone and no GitHub repo yet:

1. On [GitHub](https://github.com/new) create a **new repository** (e.g. `deepagents-open-lovable`), **do not** add a README.
2. In a terminal (PowerShell or Command Prompt) in your project folder:

   ```powershell
   cd "c:\Users\Kanak\Desktop\AI Lovable\deepagents-open-lovable"
   git remote add origin https://github.com/YOUR_USERNAME/deepagents-open-lovable.git
   git branch -M main
   git push -u origin main
   ```

   Replace `YOUR_USERNAME` with your GitHub username. Use the repo URL GitHub shows after creating the repo.

---

## Step 1: Deploy the Agent (Backend) on Railway

1. Go to **[railway.app](https://railway.app/)** → **New Project**.
2. Choose **Deploy from GitHub repo**.
3. Select your **deepagents-open-lovable** repo (or the repo that contains it).
4. **Add a service** for the agent:
   - Click **+ New** → **GitHub Repo** (or **Empty Service** then connect repo).
   - In **Settings** for this service:
     - **Root Directory:** `agent`
     - **Builder:** **Dockerfile** (Railway should detect `agent/Dockerfile`).
     - **Start Command:** leave default (Dockerfile `CMD`).
   - **Variables** (Settings → Variables, or **Variables** tab):
     ```
     USE_BEDROCK=true
     AWS_REGION=us-east-1
     AWS_ACCESS_KEY_ID=<your-access-key>
     AWS_SECRET_ACCESS_KEY=<your-secret-key>
     ```
     Use the same values as in your `agent/.env`. Do **not** commit these; set them only in Railway.
   - **Networking:** Generate a **public domain** (e.g. **Settings** → **Networking** → **Generate Domain**). Note the URL, e.g. `https://xxx.up.railway.app`.
5. **Deploy.** Wait until the build finishes and the service is **Active**.
6. Copy the **public URL** (e.g. `https://your-agent-name.up.railway.app`) — you need it for the GUI.

**Important:** The LangGraph API runs on port **2024** inside the container. Railway exposes the service port automatically when the Dockerfile `EXPOSE 2024` is used. If the generated URL doesn’t work, add a **custom domain** or check that the service is listening on the port Railway expects (usually the exposed port).

---

## Step 2: Deploy the GUI (Frontend) on Railway

1. In the **same Railway project**, click **+ New** → **GitHub Repo** (same repo).
2. **Settings** for this service:
   - **Root Directory:** `gui`
   - **Builder:** **Dockerfile** (use `gui/Dockerfile`).
   - **Build / Deploy:**  
     Set a **build argument** (if your Dockerfile uses it):  
     `VITE_API_URL` = **the agent URL from Step 1** (e.g. `https://your-agent-name.up.railway.app`).  
     In Railway: **Variables** tab → add `VITE_API_URL` = `https://...` (agent URL). For Dockerfile build-arg, some setups use **Settings** → **Build** → Build arguments; if not, add `VITE_API_URL` as an env var — the Dockerfile may need to read it at build time.
3. **Networking:** Generate a **public domain** for the GUI service.
4. **Deploy.** Wait until the GUI build finishes.
5. Open the **GUI URL** in your browser. The app will call the agent at the URL you set.

**If the GUI Dockerfile doesn’t get `VITE_API_URL` at build time:** In **Variables**, add `VITE_API_URL` = agent URL. If the image still has a hardcoded URL, we may need to use a runtime config; for now the Dockerfile uses `ARG VITE_API_URL` and `ENV VITE_API_URL` so setting it in Railway Variables (as a build-time variable) should work when Railway runs `docker build`.

---

## Step 3: Verify

- Open the **GUI** URL.
- Start a new thread and send a prompt (e.g. “Build a simple todo list page”).
- The GUI should talk to the **agent**; the agent uses **Bedrock** with the credentials you set in Step 1.

---

## Alternative: Deploy GUI on Vercel

1. **[vercel.com](https://vercel.com/)** → **Add New** → **Project** → Import your **GitHub** repo.
2. **Root Directory:** `gui`.
3. **Environment variables:**  
   `VITE_API_URL` = **agent URL** (e.g. `https://your-agent-name.up.railway.app`).
4. Deploy. Vercel will run `npm run build` (from `vercel.json`) and host the GUI.

You still need the **agent** deployed (e.g. on Railway) and its URL for `VITE_API_URL`.

---

## Troubleshooting

| Issue | What to do |
|-------|-------------|
| Agent build fails on Railway | Check **Root Directory** is `agent` and **Dockerfile** is used. Check **Build logs** for missing deps or wrong Python version. |
| GUI shows “can’t reach API” | Ensure `VITE_API_URL` is exactly the **agent** public URL (with `https://`), and that the agent service is **Active**. |
| Bedrock errors in agent | In Railway **Variables**, confirm `USE_BEDROCK=true`, `AWS_REGION`, and both AWS keys. Check [Bedrock model access](https://console.aws.amazon.com/bedrock/home#/modelaccess) in AWS. |

---

## Quick checklist

- [ ] Repo on GitHub
- [ ] Railway project created
- [ ] **Agent** service: root `agent`, Dockerfile, env vars (USE_BEDROCK, AWS_*), public domain
- [ ] **GUI** service: root `gui`, Dockerfile, `VITE_API_URL` = agent URL, public domain
- [ ] Open GUI URL and test a prompt

Once these are done, deployment is complete.
