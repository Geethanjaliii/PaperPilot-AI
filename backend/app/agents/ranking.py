"""Ranking agent node."""

from typing import Any

from app.core.logging import get_logger
from app.graphs.state import ResearchState
from app.services.ranking_service import RankingService

logger = get_logger(__name__)


class RankingAgent:
    def __init__(self, ranking_service: RankingService) -> None:
        self._ranking = ranking_service

    async def run(self, state: ResearchState) -> dict[str, Any]:
        query = state["query"]
        papers = state.get("papers", [])
        max_papers = state.get("max_papers", 10)

        logger.info("Ranking agent processing %d papers", len(papers))
        ranked = self._ranking.rank(query, papers, limit=max_papers)
        return {"ranked_papers": ranked}
