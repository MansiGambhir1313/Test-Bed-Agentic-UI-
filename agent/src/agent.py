"""Frontend Agent factory."""

import os
from pathlib import Path

from deepagents import create_deep_agent
from deepagents.backends import StateBackend

from src.prompts import SYSTEM_PROMPT
from src.skills import SkillsMiddleware
from src.subagents import SUBAGENTS
from src.tools import build_app, fetch_url, http_request, web_search

# Skills directory path
SKILLS_DIR = Path(__file__).parent.parent / "skills"
ASSISTANT_ID = "frontend-agent"

# Map common model names to AWS Bedrock model IDs (Claude on Bedrock)
BEDROCK_MODEL_IDS = {
    "claude-sonnet-4-5-20250929": "us.anthropic.claude-sonnet-4-5-20250929-v1:0",
    "claude-sonnet-4-5-20250514": "us.anthropic.claude-sonnet-4-5-20250514-v1:0",
    "claude-3-5-sonnet-20241022": "anthropic.claude-3-5-sonnet-20241022-v2:0",
    "claude-3-5-sonnet-20240620": "anthropic.claude-3-5-sonnet-20240620-v1:0",
    "claude-3-5-haiku": "anthropic.claude-3-5-haiku-20241022-v1:0",
    "claude-opus-4-5-20251101": "anthropic.claude-opus-4-20250514-v1:0",
}


def _get_model():
    """Create LLM: AWS Bedrock (preferred when USE_BEDROCK or AWS) or Anthropic API."""
    use_bedrock = os.environ.get("USE_BEDROCK", "").lower() in ("1", "true", "yes")
    aws_region = os.environ.get("AWS_REGION", os.environ.get("AWS_DEFAULT_REGION", "us-east-1"))

    # Use AWS Bedrock when USE_BEDROCK is set (credentials via AWS_* env or IAM)
    if use_bedrock:
        try:
            from langchain_aws import ChatBedrockConverse
        except ImportError:
            raise ImportError(
                "USE_BEDROCK is set but langchain-aws is not installed. Run: pip install langchain-aws"
            )
        model_id = os.environ.get("BEDROCK_MODEL_ID")
        if not model_id:
            model_name = os.environ.get("MODEL", "claude-sonnet-4-5-20250929")
            if ":" in model_name:
                model_name = model_name.split(":", 1)[1]
            model_id = BEDROCK_MODEL_IDS.get(model_name, "us.anthropic.claude-sonnet-4-5-20250514-v1:0")
        return ChatBedrockConverse(
            model_id=model_id,
            region_name=aws_region,
            max_tokens=20000,
        )
    # Anthropic API (direct)
    from langchain_anthropic import ChatAnthropic

    model_name = os.environ.get("MODEL", "claude-sonnet-4-5-20250929")
    if ":" in model_name:
        model_name = model_name.split(":", 1)[1]
    return ChatAnthropic(
        model_name=model_name,
        max_tokens=20000,
    )


def create_frontend_agent():
    """Create frontend development agent with StateBackend.

    All files stored in LangGraph state and streamed to UI.
    File organization by path convention:
    - /memory/* → Agent memory files (shown in memory panel)
    - Everything else → App/code files (shown in filesystem panel)

    No persistent filesystem - everything is per-session and virtual.
    """
    tools = [http_request, web_search, fetch_url, build_app]

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

    model = _get_model()

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
