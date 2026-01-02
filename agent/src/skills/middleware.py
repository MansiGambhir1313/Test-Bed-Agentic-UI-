"""Middleware for loading and exposing agent skills to the system prompt.

This middleware implements Anthropic's "Agent Skills" pattern:
1. Parse YAML frontmatter from SKILL.md files at session start
2. Inject skills metadata (name + description) into system prompt
3. Store full skill content in state for direct injection when needed

Skills directory structure (per-agent + project):
User-level: ~/.deepagents/{AGENT_NAME}/skills/
Project-level: {PROJECT_ROOT}/.deepagents/skills/

Example structure:
~/.deepagents/{AGENT_NAME}/skills/
├── web-research/
│   ├── SKILL.md        # Required: YAML frontmatter + instructions
│   └── helper.py       # Optional: supporting files
├── code-review/
│   ├── SKILL.md
│   └── checklist.md

.deepagents/skills/
├── project-specific/
│   └── SKILL.md        # Project-specific skills
"""

import asyncio
from collections.abc import Awaitable, Callable
from pathlib import Path
from typing import NotRequired, TypedDict, cast

from langchain.agents.middleware.types import (
    AgentMiddleware,
    AgentState,
    ModelRequest,
    ModelResponse,
)
from langgraph.runtime import Runtime

from src.skills.load import SkillMetadata, list_skills


class SkillContent(TypedDict):
    """Full content of a skill."""

    name: str
    description: str
    content: str


class SkillsState(AgentState):
    """State for the skills middleware."""

    skills_metadata: NotRequired[list[SkillMetadata]]
    """List of loaded skill metadata (name, description, path)."""

    skills_content: NotRequired[dict[str, SkillContent]]
    """Full content of skills, keyed by skill name."""


class SkillsStateUpdate(TypedDict, total=False):
    """State update for the skills middleware."""

    skills_metadata: list[SkillMetadata]
    """List of loaded skill metadata (name, description, path)."""

    skills_content: dict[str, SkillContent]
    """Full content of skills, keyed by skill name."""


# Skills System Documentation
SKILLS_SYSTEM_PROMPT = """

## Skills System

You have access to a skills library that provides specialized capabilities and domain knowledge.

**Available Skills:**

{skills_list}

**How to Use Skills:**

When a task matches a skill's domain, the full skill instructions will be provided to you automatically based on context. Skills provide:
- Step-by-step workflows
- Best practices and patterns
- Domain-specific guidance

**When Skills Apply:**
- When the user's request matches a skill's domain (e.g., frontend work → frontend-design skill)
- When you need specialized knowledge or structured workflows
- When a skill provides proven patterns for complex tasks

Remember: Skills are tools to make you more capable and consistent!
"""


class SkillsMiddleware(AgentMiddleware):
    """Middleware for loading and exposing agent skills.

    This middleware implements Anthropic's agent skills pattern:
    - Loads skills metadata (name, description) from YAML frontmatter at session start
    - Loads full skill content and stores in state
    - Injects skills list into system prompt for discoverability
    - Injects relevant skill content directly into system prompt based on context

    Supports both user-level and project-level skills:
    - User skills: ~/.deepagents/{AGENT_NAME}/skills/
    - Project skills: {PROJECT_ROOT}/.deepagents/skills/
    - Project skills override user skills with the same name

    Args:
        skills_dir: Path to the user-level skills directory (per-agent).
        assistant_id: The agent identifier for path references in prompts.
        project_skills_dir: Optional path to project-level skills directory.
        auto_inject_skills: List of skill names to always inject into system prompt.
    """

    state_schema = SkillsState

    def __init__(
        self,
        *,
        skills_dir: str | Path,
        assistant_id: str,
        project_skills_dir: str | Path | None = None,
        auto_inject_skills: list[str] | None = None,
    ) -> None:
        """Initialize the skills middleware.

        Args:
            skills_dir: Path to the user-level skills directory.
            assistant_id: The agent identifier.
            project_skills_dir: Optional path to the project-level skills directory.
            auto_inject_skills: List of skill names to always inject into system prompt.
        """
        self.skills_dir = Path(skills_dir).expanduser()
        self.assistant_id = assistant_id
        self.project_skills_dir = (
            Path(project_skills_dir).expanduser() if project_skills_dir else None
        )
        self.auto_inject_skills = auto_inject_skills or []
        self.system_prompt_template = SKILLS_SYSTEM_PROMPT

    def _load_skill_contents(self, skills: list[SkillMetadata]) -> dict[str, SkillContent]:
        """Load full content of all skills.

        Args:
            skills: List of skill metadata with real filesystem paths.

        Returns:
            Dict mapping skill names to their full content.
        """
        contents: dict[str, SkillContent] = {}

        for skill in skills:
            real_path = Path(skill["path"])
            if real_path.exists():
                try:
                    content = real_path.read_text(encoding="utf-8")
                    contents[skill["name"]] = SkillContent(
                        name=skill["name"],
                        description=skill["description"],
                        content=content,
                    )
                except (OSError, UnicodeDecodeError):
                    # Skip files that can't be read
                    pass

        return contents

    def _format_skills_list(self, skills: list[SkillMetadata]) -> str:
        """Format skills metadata for display in system prompt."""
        if not skills:
            return "(No skills available yet.)"

        lines = []
        for skill in skills:
            lines.append(f"- **{skill['name']}**: {skill['description']}")

        return "\n".join(lines)

    def _format_injected_skills(self, skills_content: dict[str, SkillContent]) -> str:
        """Format auto-injected skills for the system prompt.

        Args:
            skills_content: Dict of all skill contents.

        Returns:
            Formatted string with full content of auto-injected skills.
        """
        if not self.auto_inject_skills:
            return ""

        sections = []
        for skill_name in self.auto_inject_skills:
            if skill_name in skills_content:
                skill = skills_content[skill_name]
                sections.append(f"\n\n## Skill: {skill['name']}\n\n{skill['content']}")

        return "".join(sections)

    def before_agent(
        self, state: SkillsState, runtime: Runtime
    ) -> SkillsStateUpdate | None:
        """Load skills metadata and content before agent execution (sync version).

        Args:
            state: Current agent state.
            runtime: Runtime context.

        Returns:
            Updated state with skills_metadata and skills_content populated.
        """
        # Load skills metadata
        skills = list_skills(
            user_skills_dir=self.skills_dir,
            project_skills_dir=self.project_skills_dir,
        )

        # Load full skill contents
        skills_content = self._load_skill_contents(skills)

        return SkillsStateUpdate(
            skills_metadata=skills,
            skills_content=skills_content,
        )

    async def abefore_agent(
        self, state: SkillsState, runtime: Runtime
    ) -> SkillsStateUpdate | None:
        """Load skills metadata and content before agent execution (async version).

        Args:
            state: Current agent state.
            runtime: Runtime context.

        Returns:
            Updated state with skills_metadata and skills_content populated.
        """
        # Load skills metadata
        skills = await asyncio.to_thread(
            list_skills,
            user_skills_dir=self.skills_dir,
            project_skills_dir=self.project_skills_dir,
        )

        # Load full skill contents
        skills_content = await asyncio.to_thread(self._load_skill_contents, skills)

        return SkillsStateUpdate(
            skills_metadata=skills,
            skills_content=skills_content,
        )

    def wrap_model_call(
        self,
        request: ModelRequest,
        handler: Callable[[ModelRequest], ModelResponse],
    ) -> ModelResponse:
        """Inject skills documentation into the system prompt.

        This runs on every model call to ensure skills info is always available.

        Args:
            request: The model request being processed.
            handler: The handler function to call with the modified request.

        Returns:
            The model response from the handler.
        """
        # Get skills metadata and content from state
        skills_metadata = request.state.get("skills_metadata", [])
        skills_content = request.state.get("skills_content", {})

        # Format skills list
        skills_list = self._format_skills_list(skills_metadata)

        # Format the skills documentation
        skills_section = self.system_prompt_template.format(
            skills_list=skills_list,
        )

        # Add auto-injected skill contents
        injected_skills = self._format_injected_skills(skills_content)

        if request.system_prompt:
            system_prompt = request.system_prompt + "\n\n" + skills_section + injected_skills
        else:
            system_prompt = skills_section + injected_skills

        return handler(request.override(system_prompt=system_prompt))

    async def awrap_model_call(
        self,
        request: ModelRequest,
        handler: Callable[[ModelRequest], Awaitable[ModelResponse]],
    ) -> ModelResponse:
        """(async) Inject skills documentation into the system prompt.

        Args:
            request: The model request being processed.
            handler: The handler function to call with the modified request.

        Returns:
            The model response from the handler.
        """
        # The state is guaranteed to be SkillsState due to state_schema
        state = cast("SkillsState", request.state)
        skills_metadata = state.get("skills_metadata", [])
        skills_content = state.get("skills_content", {})

        # Format skills list
        skills_list = self._format_skills_list(skills_metadata)

        # Format the skills documentation
        skills_section = self.system_prompt_template.format(
            skills_list=skills_list,
        )

        # Add auto-injected skill contents
        injected_skills = self._format_injected_skills(skills_content)

        # Inject into system prompt
        if request.system_prompt:
            system_prompt = request.system_prompt + "\n\n" + skills_section + injected_skills
        else:
            system_prompt = skills_section + injected_skills

        return await handler(request.override(system_prompt=system_prompt))
