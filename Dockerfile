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
ENV LANGGRAPH_HOST=0.0.0.0
CMD ["langgraph", "dev", "--no-browser"]
