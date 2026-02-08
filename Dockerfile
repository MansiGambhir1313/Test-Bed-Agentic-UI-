# Root Dockerfile: builds the agent (LangGraph API) when Railway builds from repo root.
# Use this for the AGENT service. For the GUI service, set Root Directory = gui.
FROM python:3.11-slim

WORKDIR /app

COPY agent/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir "langgraph-cli[inmem]"

COPY agent/langgraph.json .
COPY agent/src ./src
COPY agent/skills ./skills
COPY agent/.env.example .env.example

EXPOSE 8080
# Railway injects PORT at runtime (usually 8080). App must listen on 0.0.0.0:$PORT.
CMD ["sh", "-c", "exec langgraph dev --no-browser --host 0.0.0.0 --port ${PORT:-8080}"]
