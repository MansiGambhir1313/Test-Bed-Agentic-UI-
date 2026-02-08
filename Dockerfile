# Root Dockerfile: builds the agent (LangGraph API) from repo root.
# Use for Lambda (ECR), ECS, or any container host. For GUI, use gui/Dockerfile.
FROM python:3.11-slim

# Lambda Web Adapter (required for Lambda container image HTTP; layers not supported for images)
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.9.1 /lambda-adapter /opt/extensions/lambda-adapter

WORKDIR /app

COPY agent/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir "langgraph-cli[inmem]"

COPY agent/langgraph.json .
COPY agent/src ./src
COPY agent/skills ./skills
COPY agent/.env.example .env.example
# LangGraph CLI expects .env when "env" is set in langgraph.json; use safe defaults (Lambda overrides at runtime)
COPY agent/.env.example .env
COPY agent/start.sh ./start.sh
RUN sed -i 's/\r$//' ./start.sh && chmod +x ./start.sh

EXPOSE 8080
# Lambda / ECS inject PORT at runtime (usually 8080). App must listen on 0.0.0.0:$PORT.
# start.sh logs to stdout so Lambda CloudWatch shows app startup/errors (not just adapter logs).
CMD ["sh", "./start.sh"]
