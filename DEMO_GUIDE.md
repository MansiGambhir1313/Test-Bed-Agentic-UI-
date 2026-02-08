# DeepAgents Open Lovable — Demo Guide for Your Technical Manager

Step-by-step guide to run and demo the platform, with all practical options (local, remote, backup).

---

## Part 1: Before the Demo (Do This Once)

### Option A: Local setup (recommended for in-person demo)

#### 1. Prerequisites

| Requirement | How to check | Where to get |
|-------------|--------------|--------------|
| **Python 3.11+** | `python --version` | [python.org](https://www.python.org/downloads/) |
| **Node.js 18+** | `node --version` | [nodejs.org](https://nodejs.org/) |
| **Anthropic API key** | — | [console.anthropic.com](https://console.anthropic.com/) → API Keys |
| **Git** | `git --version` | Usually pre-installed / [git-scm.com](https://git-scm.com/) |

#### 2. Backend (agent)

```powershell
cd "c:\Users\Kanak\Desktop\AI Lovable\deepagents-open-lovable\agent"

# Virtual environment
python -m venv .venv
.venv\Scripts\activate

# Dependencies (includes LangGraph; CLI is separate)
pip install -r requirements.txt
pip install "langgraph-cli[inmem]"

# Environment
copy .env.example .env
# Edit .env and set: ANTHROPIC_API_KEY=sk-ant-api03-...
```

**Required in `.env`:**
- `ANTHROPIC_API_KEY` — get from [Anthropic Console](https://console.anthropic.com/).

**Optional:**
- `TAVILY_API_KEY` — [tavily.com](https://tavily.com/) — for web search in the agent.
- `MODEL` — e.g. `anthropic:claude-sonnet-4-5-20250929` (default).

#### 3. Frontend (GUI)

```powershell
cd "c:\Users\Kanak\Desktop\AI Lovable\deepagents-open-lovable\gui"

npm install

# Optional: point to a remote backend later
copy .env.example .env
# Edit .env if needed: VITE_API_URL, VERCEL_API_TOKEN
```

**Optional in `.env`:**
- `VITE_API_URL` — backend URL (default `http://localhost:2024`).
- `VERCEL_API_TOKEN` — for “Deploy to Vercel” in the UI ([vercel.com/account/tokens](https://vercel.com/account/tokens)).

---

## Part 2: How to Run the Demo

### Option 1: Local (two terminals) — best for in-person

**Terminal 1 — Backend**

```powershell
cd "c:\Users\Kanak\Desktop\AI Lovable\deepagents-open-lovable\agent"
.venv\Scripts\activate
langgraph dev
```

- Server: **http://localhost:2024**
- Leave this running.

**Terminal 2 — Frontend**

```powershell
cd "c:\Users\Kanak\Desktop\AI Lovable\deepagents-open-lovable\gui"
npm run dev
```

- App: **http://localhost:5173**

**Demo:** Open **http://localhost:5173** in the browser and use the app.

---

### Option 2: Expose locally for a remote manager (tunnel)

If your manager is not in the same room, expose your local app with a tunnel:

| Tool | Install | Command | Use case |
|------|---------|--------|----------|
| **ngrok** | [ngrok.com](https://ngrok.com/) | `ngrok http 5173` | Quick share of GUI (GUI only; backend still must be reachable). |
| **Cloudflare Tunnel** | `winget install cloudflare.cloudflared` | `cloudflared tunnel --url http://localhost:5173` | Free, no account required for quick tunnel. |
| **localtunnel** | `npm i -g localtunnel` | `lt --port 5173` | No install for backend; GUI only. |

**Important:** The GUI (port 5173) talks to the backend (port 2024). If the manager opens the app in their browser via the tunnel, their browser will call **your** `VITE_API_URL`. So:

- Either keep `VITE_API_URL=http://localhost:2024` and run **both** backend and frontend on your machine; then share only the **GUI** URL (e.g. `https://xxx.ngrok.io`). The tunnel sends their requests to your machine, and your frontend will call localhost:2024 on your machine — **this works**.
- Or you deploy the backend somewhere (see Option 3) and set `VITE_API_URL` to that URL when building the frontend, then share the frontend URL.

For “demo from your PC with manager remote”, Option 1 (two terminals) + one tunnel to port 5173 is enough.

---

### Option 3: Backend in the cloud (optional)

If you want the backend hosted (e.g. so others can use it without your laptop):

| Option | Notes |
|--------|--------|
| **AWS Lambda** | See [DEPLOY_AWS_LAMBDA.md](DEPLOY_AWS_LAMBDA.md). Build agent image → ECR → Lambda + Web Adapter → Function URL. Set `VITE_API_URL` to that URL. |
| **Docker** | Run the agent image on port 8080 and set `VITE_API_URL` to that host. |

For a **single demo**, Option 1 (local) or Option 2 (tunnel) is usually enough.

---

### Option 4: Vercel deploy (from inside the app)

- In the GUI, use the “Deploy to Vercel” flow.
- Needs `VERCEL_API_TOKEN` in `gui/.env`.
- This deploys the **generated app** (the thing the agent built), not the Lovable GUI itself. Good to show “we can ship to production with one click.”

---

## Part 3: What to Show Your Technical Manager (script)

### 1. One-line pitch

> “This is an open-source, AI-powered frontend dev environment. We describe an app in natural language; the agent writes React/Next/shadcn and we get a live preview and optional Vercel deploy.”

### 2. Demo flow (5–10 minutes)

1. **Start**  
   - Open http://localhost:5173.  
   - Show the main UI: chat, file tree (empty at first), preview area.

2. **Conversational UI**  
   - In chat, type something like:  
     *“Build a simple landing page for a developer tool called CodeCraft. Hero with headline and CTA, short feature list, and footer with links.”*  
   - Send. Point out: task list, agent “thinking”, tool calls (write file, etc.).

3. **Live preview**  
   - As files appear, show the **live preview** updating.  
   - Mention: React, Tailwind, shadcn-style components.

4. **File system**  
   - Open the **file tree**, show generated files (e.g. `App.tsx`, components, `index.html`).  
   - Optional: open a file and show code quality (structure, Tailwind, components).

5. **Sub-agents (if time)**  
   - If the run uses the “designer” or “image research” sub-agent, point it out: “Specialized agents handle design and assets.”

6. **Deploy (optional)**  
   - If Vercel is configured: use “Deploy to Vercel” and show the resulting URL.  
   - Message: “From conversation to production URL in one flow.”

### 3. Technical talking points

- **Stack:** React 18, TypeScript, Vite, Tailwind, Sandpack (preview), LangGraph (orchestration), Claude (LLM).
- **Architecture:** LangGraph backend (Python), React GUI, optional Vercel for generated apps.
- **Extensibility:** Custom tools, sub-agents, and skills (e.g. in `agent/skills/`).
- **Open source:** No vendor lock-in; can host and modify everything.

---

## Part 4: Backup Plans (if something fails)

| Risk | Backup |
|------|--------|
| **Anthropic API down or key invalid** | Pre-record a 3–5 min screen recording (same flow as above) and play it; explain “same flow, recorded earlier.” |
| **Network/firewall blocks localhost** | Use Option 2 (tunnel) so manager uses a public URL that hits your machine. |
| **Python/Node missing or wrong version** | Use a colleague’s machine or a cloud dev environment (e.g. GitHub Codespaces, Gitpod) with the same setup. |
| **Manager wants to try later** | Send: repo link, this DEMO_GUIDE.md, and a one-line: “Backend: `cd agent && .venv\Scripts\activate && langgraph dev`; Frontend: `cd gui && npm run dev`; open http://localhost:5173.” |

---

## Part 5: Quick reference

| What | Where |
|------|--------|
| Repo | https://github.com/emanueleielo/deepagents-open-lovable |
| Backend (after setup) | `cd agent` → `.venv\Scripts\activate` → `langgraph dev` → http://localhost:2024 |
| Frontend | `cd gui` → `npm run dev` → http://localhost:5173 |
| Anthropic key | [console.anthropic.com](https://console.anthropic.com/) |
| Vercel token (optional) | [vercel.com/account/tokens](https://vercel.com/account/tokens) |

---

## Checklist before the meeting

- [ ] Python 3.11+ and Node 18+ installed
- [ ] `agent/.venv` created, `pip install -r requirements.txt` and `pip install "langgraph-cli[inmem]"`
- [ ] `agent/.env` has valid `ANTHROPIC_API_KEY`
- [ ] `gui` has `npm install` done
- [ ] Test run: both terminals started, http://localhost:5173 loads and one test prompt works
- [ ] (Optional) Screen recording saved as backup
- [ ] (If remote) Tunnel chosen and tested (e.g. ngrok or Cloudflare)

Once this is done, you can run the demo confidently and adapt (local vs tunnel vs backup video) to the situation.
