# Deploy the agent on AWS Lambda

Run the LangGraph agent as a **Lambda container image** with **Lambda Web Adapter** so the GUI can call it over HTTP. No paid LangSmith; uses your AWS account and Bedrock.

---

## Prerequisites

- **AWS CLI** installed and in PATH — [Install guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html). On Windows: `winget install Amazon.AWSCLIV2` then restart the terminal.
- **Docker** (for building the image)
- **agent/.env** with `USE_BEDROCK=true`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
- **Bedrock** model access enabled in your AWS account

---

## One-command deploy (PowerShell)

From the **repo root** (Windows PowerShell):

```powershell
.\deploy-agent-lambda.ps1
```

The script will:

1. Load AWS credentials and region from **agent/.env**
2. Create ECR repo, build the agent image, push to ECR
3. Create IAM role for Lambda (Bedrock + CloudWatch Logs)
4. Create or update Lambda function (container image + Lambda Web Adapter layer)
5. Create Function URL (public, no auth)
6. Print the **agent URL** — set this as `VITE_API_URL` in Vercel/Amplify or `gui/.env`

**Options:**

- `.\deploy-agent-lambda.ps1 -Region us-west-2` — use a different region
- `.\deploy-agent-lambda.ps1 -SkipBuild -SkipPush` — skip Docker build/push (image already in ECR)

If AWS CLI or Docker is not installed, the script will exit with install instructions.

---

## Manual steps (if you prefer)

### 1. Build and push the agent image to ECR

From the **repo root**:

```bash
# Set your AWS account ID and region
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=us-east-1
ECR_URI=${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/deepagents-agent

# Create ECR repo (once)
aws ecr create-repository --repository-name deepagents-agent --region $AWS_REGION 2>/dev/null || true

# Build from repo root (uses root Dockerfile that builds agent)
docker build -t deepagents-agent -f Dockerfile .

# Tag and push
docker tag deepagents-agent:latest $ECR_URI:latest
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_URI
docker push $ECR_URI:latest
```

---

## 2. Create the Lambda function (container image + Web Adapter)

The agent listens on **port 8080**. Use **Lambda Web Adapter** so HTTP requests from a Function URL are forwarded to the container.

1. **Lambda** → Create function → **Container image**.
2. **Image:** Browse to the ECR image `deepagents-agent:latest` (or use the ECR URI above).
3. **Architecture:** x86_64 (or arm64 if you prefer).
4. **Configuration:**
   - **Memory:** 1024 MB or more (recommended 2048 for cold starts).
   - **Timeout:** 15 minutes (max).
   - **Environment variables:**  
     `USE_BEDROCK` = `true`  
     `AWS_REGION` = `us-east-1`  
     (Do **not** set `ANTHROPIC_API_KEY` if using Bedrock.)
   - **Execution role:** Must have `bedrock:InvokeModel` (and `bedrock:InvokeModelWithResponseStream` if you use streaming). Same role can have ECR read and CloudWatch Logs.

5. **Lambda Web Adapter (required):**
   - Add the **Lambda Web Adapter** layer to the function (use the [official layer ARN](https://github.com/awslabs/aws-lambda-web-adapter#lambda-layer) for your region).
   - In the function **Configuration** → **Environment variables**, add:
     - `AWS_LWA_INVOKE_MODE` = `response_stream` (if you use streaming) or `response` (otherwise).
   - Or in **Configuration** → **General configuration** → **Edit** → **Bootstrap**: set the Web Adapter as the bootstrap so the container receives HTTP on port 8080.

   **Alternative (simplest):** Use the **AWS base image for Lambda Web Adapter** as the base of your Dockerfile so the adapter is inside the image; then the default invoke sends HTTP to your app on 8080. If you keep the current Dockerfile, add the Web Adapter as a **layer** in the Lambda console and set the function’s **Bootstrap** (or equivalent) so the adapter starts and forwards to port 8080.

6. **Function URL:**  
   Create a **Function URL** (Auth: NONE or AWS_IAM). Copy the URL — this is your **agent API URL** for the GUI.

---

## 3. Point the GUI at the Lambda URL

- **Vercel:** In the project’s **Environment variables**, set **VITE_API_URL** = your Lambda Function URL (no trailing slash). Redeploy.
- **Amplify:** In **Environment variables**, set **VITE_API_URL** = same URL. Redeploy.
- **Local:** In `gui/.env`, set `VITE_API_URL` to the Lambda Function URL and run the GUI.

No API key is required for the Function URL unless you enable IAM auth; the GUI uses `VITE_API_URL` only.

---

## 4. Optional: use ECS Fargate instead of Lambda

For long-running or high-concurrency workloads, use **ECS Fargate** with the same agent image and an Application Load Balancer. See the repo’s main **DEPLOYMENT.md** and the [LangGraph AWS deployment template](https://github.com/al-mz/langgraph-aws-deployment) for an ECS/Fargate setup.

---

## Summary

| Step | Action |
|------|--------|
| 1 | Build agent image, push to ECR. |
| 2 | Create Lambda from that image; add Lambda Web Adapter (layer or base image); set env (USE_BEDROCK, AWS_REGION); create Function URL. |
| 3 | Set **VITE_API_URL** in Vercel/Amplify (or `gui/.env`) to the Function URL and redeploy/run the GUI. |
