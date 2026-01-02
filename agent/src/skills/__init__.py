"""Skills module for the frontend agent.

Public API:
- SkillsMiddleware: Middleware for integrating skills into agent execution
"""

from src.skills.middleware import SkillsMiddleware

__all__ = [
    "SkillsMiddleware",
]
