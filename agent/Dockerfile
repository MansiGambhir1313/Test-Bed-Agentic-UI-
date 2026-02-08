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

# Bind to 0.0.0.0 so Railway/proxy can reach the app; use PORT if set by host
ENV PORT=2024
CMD ["sh", "-c", "langgraph dev --no-browser --host 0.0.0.0 --port ${PORT:-2024}"]
