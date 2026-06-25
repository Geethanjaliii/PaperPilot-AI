"""Literature review agent node."""

from typing import Any

from app.core.logging import get_logger
from app.graphs.state import ResearchState
from app.services.gemini_service import GeminiService

logger = get_logger(__name__)


class LiteratureReviewAgent:
    def __init__(self, gemini_service: GeminiService) -> None:
        self._gemini = gemini_service

    async def run(self, state: ResearchState) -> dict[str, Any]:
        query = state["query"]
        context = state.get("retrieved_context", "")
        papers = state.get("ranked_papers", [])

        logger.info("Literature review agent generating review")
        literature_review = await self._gemini.generate_literature_review(query, context)
        research_gaps = await self._gemini.identify_research_gaps(
            query, literature_review, context
        )
        summary = await self._gemini.summarize_papers_batch(papers)

        return {
            "literature_review": literature_review,
            "research_gaps": research_gaps,
            "summary": summary,
        }
