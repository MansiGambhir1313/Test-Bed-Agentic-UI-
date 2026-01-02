"""Frontend Agent factory."""

import os
from pathlib import Path

from deepagents import create_deep_agent
from deepagents.backends import StateBackend
from langchain_anthropic import ChatAnthropic

from src.prompts import SYSTEM_PROMPT
from src.skills import SkillsMiddleware
from src.subagents import SUBAGENTS
from src.tools import fetch_url, http_request, web_search

# Skills directory path
SKILLS_DIR = Path(__file__).parent.parent / "skills"
ASSISTANT_ID = "frontend-agent"


def create_frontend_agent():
    """Create frontend development agent with StateBackend.

    All files stored in LangGraph state and streamed to UI.
    File organization by path convention:
    - /memory/* → Agent memory files (shown in memory panel)
    - Everything else → App/code files (shown in filesystem panel)

    No persistent filesystem - everything is per-session and virtual.
    """
    tools = [http_request, web_search, fetch_url]

    # Single StateBackend - paths are preserved as-is
    def backend_factory(rt):
        return StateBackend(rt)

    middleware = [
        SkillsMiddleware(
            skills_dir=SKILLS_DIR,
            assistant_id=ASSISTANT_ID,
            auto_inject_skills=["frontend-design"],  # Always inject this skill
        ),
    ]

    model_name = os.environ.get("MODEL", "claude-sonnet-4-5-20250929")
    # Strip provider prefix if present (e.g., "anthropic:claude-sonnet-4-5-20250929")
    if ":" in model_name:
        model_name = model_name.split(":", 1)[1]

    model = ChatAnthropic(
        model_name=model_name,
        max_tokens=20000,
    )

    return create_deep_agent(
        model=model,
        system_prompt=SYSTEM_PROMPT,
        tools=tools,
        middleware=middleware,
        backend=backend_factory,
        subagents=SUBAGENTS,
    )


# Entry point for langgraph.json
agent = create_frontend_agent()
