# Deployment Guide — DeepAgents Open Lovable

Deploy the repo **as-is** using **AWS Bedrock** for the LLM. Run the **agent on AWS Lambda** (or ECS/App Runner/Docker) and the **GUI on Vercel or AWS Amplify**. No extra code; only config and env.

---

## 1. AWS Bedrock (LLM)

The agent uses **Anthropic API** or **AWS Bedrock** (Claude on Bedrock). Use Bedrock to stay in AWS.

### Enable Bedrock

1. **Bedrock model access** (once per account):  
   [AWS Console → Bedrock → Model access](https://console.aws.amazon.com/bedrock/home#/modelaccess) → enable **Claude** (e.g. Claude 3.5 Sonnet or Claude Sonnet 4.5).

2. **Credentials:**
   - **Local:** `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` (and `AWS_SESSION_TOKEN` if using temporary creds).
   - **Lambda / ECS / App Runner:** IAM role with `bedrock:InvokeModel` (and `bedrock:InvokeModelWithResponseStream` if streaming).

3. **Agent env** (`.env` or platform env):

   ```bash
   USE_BEDROCK=true
   AWS_REGION=us-east-1
   ```

   Do **not** set `ANTHROPIC_API_KEY` when using Bedrock.

---

## 2. Repo layout

| Part    | Stack           | Role                          |
|---------|-----------------|-------------------------------|
| **agent** | Python, LangGraph | Backend API (port 8080 in container) |
| **gui**   | React, Vite     | Frontend (needs `VITE_API_URL` at build) |

Deploy the **agent** first, then deploy the **GUI** with `VITE_API_URL` set to the agent URL.

---

## 3. Deploy Backend (Agent)

### Option A: AWS Lambda (recommended)

Use a **Lambda container image** + **Lambda Web Adapter** so the GUI can call the agent over HTTP.

→ **See [DEPLOY_AWS_LAMBDA.md](DEPLOY_AWS_LAMBDA.md)** for: build image → push to ECR → create Lambda from image → add Web Adapter → create Function URL → set `VITE_API_URL` in the GUI.

### Option B: Docker (any host)

```bash
cd agent
docker build -t deepagents-agent .
docker run -p 8080:8080 \
  -e USE_BEDROCK=true \
  -e AWS_REGION=us-east-1 \
  -e AWS_ACCESS_KEY_ID=... \
  -e AWS_SECRET_ACCESS_KEY=... \
  deepagents-agent
```

Point the GUI at `http://<host>:8080`.

### Option C: Railway (LangGraph-friendly; no Lambda constraints)

Deploy the agent on **Railway** for a writable filesystem and no init timeout. Uses `Dockerfile.railway` (no Lambda Web Adapter).

→ **See [DEPLOY_RAILWAY.md](DEPLOY_RAILWAY.md)** for: connect repo → set Dockerfile path to `Dockerfile.railway` → set env (USE_BEDROCK, AWS_*, MODEL) → deploy → set `VITE_API_URL` in the GUI.

### Option D: AWS ECS / App Runner

- **ECS:** Build from **agent/Dockerfile**, push to ECR, run as a service on port 8080 with IAM for Bedrock.
- **App Runner:** Source = ECR image (same Dockerfile), port 8080, env `USE_BEDROCK=true`, `AWS_REGION`, IAM for Bedrock.

Use the resulting API URL as `VITE_API_URL` for the GUI.

---

## 4. Deploy Frontend (GUI)

Set **VITE_API_URL** to your **agent URL** (Lambda Function URL, or ECS/App Runner/Docker URL). No API key needed for Lambda Function URL unless you enable IAM auth.

### Option A: Vercel

1. [Vercel](https://vercel.com/) → Import repo.
2. **Root Directory:** `gui` (or use repo root with `vercel.json` that builds from `gui`).
3. **Environment variables:** `VITE_API_URL` = `https://<your-agent-url>` (no trailing slash).
4. Deploy.

### Option B: AWS Amplify

1. [Amplify Console](https://console.aws.amazon.com/amplify/) → New app → Host web app → GitHub.
2. **Monorepo:** Set repo and branch; set **App build specification** to the repo’s **amplify.yml** (builds `gui`).
3. **Environment variables:** `VITE_API_URL` = `https://<your-agent-url>`.
4. Save and redeploy.

### Option C: Docker (GUI only)

```bash
cd gui
docker build --build-arg VITE_API_URL=https://<your-agent-url> -t deepagents-gui .
docker run -p 80:80 deepagents-gui
```

---

## 5. Quick reference

| Goal           | Action |
|----------------|--------|
| Use AWS for LLM | Set `USE_BEDROCK=true`, `AWS_REGION`, and IAM/creds; enable Bedrock model access. |
| Deploy agent   | **Lambda** ([DEPLOY_AWS_LAMBDA.md](DEPLOY_AWS_LAMBDA.md)), or Docker/ECS/App Runner. |
| Deploy GUI     | Vercel or Amplify with `VITE_API_URL` = agent URL. |

---

## 6. Checklist

- [ ] Bedrock model access enabled; IAM or AWS keys for Bedrock.
- [ ] Agent env: `USE_BEDROCK=true`, `AWS_REGION`; no `ANTHROPIC_API_KEY` if using Bedrock.
- [ ] Agent deployed and reachable at a URL (Lambda Function URL, ECS, App Runner, or Docker).
- [ ] GUI build has `VITE_API_URL` = that agent URL.
- [ ] GUI deployed (Vercel or Amplify).
