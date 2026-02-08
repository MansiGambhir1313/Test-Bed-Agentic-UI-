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

EXPOSE 2024
# Bind to 0.0.0.0 so Railway's proxy can reach the app; use PORT if Railway sets it
ENV PORT=2024
CMD ["sh", "-c", "langgraph dev --no-browser --host 0.0.0.0 --port ${PORT:-2024}"]
