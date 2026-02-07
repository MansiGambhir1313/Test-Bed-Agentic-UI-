# Deployment Guide — DeepAgents Open Lovable

Deploy the repo **as-is** using **AWS Bedrock** for the LLM and one of **Vercel**, **Railway**, or **AWS Amplify** for the app. No extra code; only config and env.

---

## 1. AWS Bedrock (API / LLM)

The agent supports **Anthropic API** or **AWS Bedrock** (Claude on Bedrock). Use Bedrock to stay in the AWS ecosystem.

### Enable Bedrock

1. **Bedrock model access** (once per account):  
   [AWS Console → Bedrock → Model access](https://console.aws.amazon.com/bedrock/home#/modelaccess) → enable **Claude** (e.g. Claude 3.5 Sonnet or Claude Sonnet 4.5).

2. **Credentials** (for local or container):
   - **Local:** `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` (and `AWS_SESSION_TOKEN` if using temporary creds).  
   - **ECS / Lambda / App Runner / Railway:** Attach an IAM role with `bedrock:InvokeModel` (and `bedrock:InvokeModelWithResponseStream` if you use streaming).

3. **Agent env** (in `.env` or platform env):

   ```bash
   USE_BEDROCK=true
   AWS_REGION=us-east-1
   # Optional: explicit Bedrock model ID (defaults to Claude Sonnet 4.5)
   # BEDROCK_MODEL_ID=us.anthropic.claude-sonnet-4-5-20250514-v1:0
   ```

   Do **not** set `ANTHROPIC_API_KEY` when using Bedrock.

### Optional: AWS ecosystem

- **Secrets:** Store API keys in **AWS Secrets Manager** and inject at runtime (e.g. ECS task def, Lambda env).
- **IAM:** Prefer IAM roles over long-lived keys where possible (ECS, Lambda, App Runner).

---

## 2. Deploy “whole repo” (backend + frontend)

The repo has two parts:

| Part   | Stack        | Role                |
|--------|--------------|---------------------|
| **agent** | Python, LangGraph | Backend API (port 2024) |
| **gui**   | React, Vite  | Frontend (needs `VITE_API_URL` at build) |

Deploy **agent** once, then deploy **gui** and set `VITE_API_URL` to the agent URL.

---

## 3. Deploy Backend (Agent)

Runs the LangGraph API. Use **one** of the options below.

### Option A: Railway

1. [Railway](https://railway.app/) → New Project → **Deploy from GitHub**.
2. **Service 1 – Agent:**  
   - Root: `agent` (or path to folder with `Dockerfile`).  
   - Use the repo’s **agent/Dockerfile**.  
   - Env: `USE_BEDROCK=true`, `AWS_REGION=us-east-1`, and AWS credentials (or linked env).  
   - Expose port **2024**; Railway will assign a public URL, e.g. `https://xxx.up.railway.app`.
3. Copy the agent URL → use it as `VITE_API_URL` when building the GUI.

### Option B: Docker (any host)

From repo root:

```bash
cd agent
docker build -t deepagents-agent .
docker run -p 2024:2024 \
  -e USE_BEDROCK=true \
  -e AWS_REGION=us-east-1 \
  -e AWS_ACCESS_KEY_ID=... \
  -e AWS_SECRET_ACCESS_KEY=... \
  deepagents-agent
```

Then point the GUI at `http://<host>:2024` (or your reverse proxy URL).

### Option C: AWS (ECS / App Runner)

- **ECS:** Build image from **agent/Dockerfile**, push to ECR, run as a service with port 2024, IAM role for Bedrock.
- **App Runner:** Source = ECR image (same Dockerfile), port 2024, env `USE_BEDROCK=true`, `AWS_REGION`, and IAM for Bedrock.

Use the resulting API URL as `VITE_API_URL` for the GUI.

---

## 4. Deploy Frontend (GUI)

Build the GUI with **VITE_API_URL** set to your **deployed agent URL**. No code changes; only build config and env.

### Option A: Vercel

1. [Vercel](https://vercel.com/) → Import repo.
2. **Root Directory:** `gui`.
3. **Build:** Uses `gui/vercel.json` (Vite, output `dist`). No extra code.
4. **Environment variables:**
   - `VITE_API_URL` = `https://<your-agent-url>` (e.g. Railway or your backend URL).
5. Deploy. The GUI will call your backend at that URL.

### Option B: Railway (GUI as second service)

1. In the same (or new) Railway project, add a **second service**.
2. Root: `gui`.
3. Use **gui/Dockerfile**. Set build arg or env:
   - `VITE_API_URL` = `https://<your-agent-url>`.
4. Expose port **80** (or the port your Dockerfile uses). Railway gives a URL.

### Option C: AWS Amplify

1. [Amplify Console](https://console.aws.amazon.com/amplify/) → New app → Host web app → GitHub.
2. **Monorepo:** Set repository and branch; set **App build specification** to the repo’s **amplify.yml** (builds `gui`).
3. **Environment variables** (Amplify → App settings → Environment variables):
   - `VITE_API_URL` = `https://<your-agent-url>`.
4. Save and redeploy. Amplify builds from `amplify.yml` and deploys the GUI; no extra code.

### Option D: Docker (GUI only)

```bash
cd gui
docker build --build-arg VITE_API_URL=https://<your-agent-url> -t deepagents-gui .
docker run -p 80:80 deepagents-gui
```

---

## 5. Quick reference

| Goal              | Action |
|-------------------|--------|
| Use AWS for LLM   | Set `USE_BEDROCK=true`, `AWS_REGION`, and IAM/creds; enable Bedrock model access. |
| Deploy agent      | Railway (agent Dockerfile), or Docker/ECS/App Runner. |
| Deploy GUI        | Vercel (root `gui`, set `VITE_API_URL`), or Railway second service, or Amplify (`amplify.yml` + `VITE_API_URL`), or Docker. |
| No extra code     | Only env vars and the existing Dockerfiles / vercel.json / amplify.yml. |

---

## 6. Checklist

- [ ] Bedrock model access enabled; IAM or AWS keys for Bedrock.
- [ ] Agent env: `USE_BEDROCK=true`, `AWS_REGION`; no `ANTHROPIC_API_KEY` if using Bedrock.
- [ ] Agent deployed and reachable at a URL (e.g. Railway, ECS, App Runner).
- [ ] GUI build has `VITE_API_URL` = that agent URL.
- [ ] GUI deployed (Vercel / Railway / Amplify / Docker).

Once these are done, the whole repo runs with Bedrock and your chosen hosting, without adding extra application code.
