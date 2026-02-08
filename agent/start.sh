#!/bin/sh
# Ensure we see output in Lambda CloudWatch logs (no set -e: avoids "Illegal option" with CRLF/minimal sh)
echo "[agent] Starting LangGraph dev on 0.0.0.0:${PORT:-8080}..." 1>&2
# Lambda /app is read-only; LangGraph creates .langgraph_api in cwd. Copy to /tmp and run with cwd so spawn inherits it.
cp -r /app/. /tmp/agent 2>/dev/null || true
export PYTHONUNBUFFERED=1
export PYTHONPATH="${PYTHONPATH:+$PYTHONPATH:}/tmp/agent"
# Run langgraph dev via Python subprocess with explicit cwd so the uvicorn worker subprocess inherits /tmp/agent (writable).
exec 2>&1
exec python -c "
import os
import subprocess
import sys
os.chdir('/tmp/agent')
sys.exit(subprocess.call(['langgraph', 'dev', '--no-browser', '--host', '0.0.0.0', '--port', os.environ.get('PORT', '8080')], cwd='/tmp/agent'))
"
