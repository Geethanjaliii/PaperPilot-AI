"""Planner agent node."""

from typing import Any

from app.core.logging import get_logger
from app.graphs.state import ResearchState
from app.services.gemini_service import GeminiService

logger = get_logger(__name__)


class PlannerAgent:
    def __init__(self, gemini_service: GeminiService) -> None:
        self._gemini = gemini_service

    async def run(self, state: ResearchState) -> dict[str, Any]:
        query = state["query"]
        logger.info("Planner agent processing query: %s", query[:80])
        plan = await self._gemini.plan_research(query)
        return {"plan": plan}
