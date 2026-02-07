# DeepAgents Open Lovable - Agent (LangGraph API)
# Use with Railway, ECS, App Runner, or any container host.
FROM python:3.11-slim

WORKDIR /app

# Install deps from langgraph.json + CLI for dev server
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir "langgraph-cli[inmem]"

COPY langgraph.json .
COPY src ./src
COPY skills ./skills

# Optional: copy .env at build time (prefer runtime env for secrets)
COPY .env.example .env.example

# Expose LangGraph API port
EXPOSE 2024

# Bind to 0.0.0.0 so container accepts external connections
ENV LANGGRAPH_HOST=0.0.0.0
CMD ["langgraph", "dev", "--no-browser"]
