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

# Expose port (Railway uses 8080 by default)
EXPOSE 8080

# Railway injects PORT at runtime. App must listen on 0.0.0.0:$PORT.
CMD ["sh", "-c", "exec langgraph dev --no-browser --host 0.0.0.0 --port ${PORT:-8080}"]
