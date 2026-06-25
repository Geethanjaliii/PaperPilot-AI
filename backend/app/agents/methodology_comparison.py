"""Methodology comparison agent node."""

from typing import Any

from app.core.logging import get_logger
from app.graphs.state import ResearchState
from app.services.gemini_service import GeminiService

logger = get_logger(__name__)


class MethodologyComparisonAgent:
    def __init__(self, gemini_service: GeminiService) -> None:
        self._gemini = gemini_service

    async def run(self, state: ResearchState) -> dict[str, Any]:
        query = state["query"]
        context = state.get("retrieved_context", "")

        logger.info("Methodology comparison agent processing")
        comparison = await self._gemini.compare_methodologies(query, context)
        return {"methodology_comparison": comparison}
