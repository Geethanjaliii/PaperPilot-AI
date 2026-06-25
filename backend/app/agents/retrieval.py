"""Paper retrieval agent node."""

import asyncio
from typing import Any

from app.core.logging import get_logger
from app.graphs.state import ResearchState
from app.repositories.paper_repository import PaperRepository
from app.services.paper_retrieval_service import PaperRetrievalService

logger = get_logger(__name__)


class PaperRetrievalAgent:
    def __init__(
        self,
        retrieval_service: PaperRetrievalService,
        paper_repository: PaperRepository,
    ) -> None:
        self._retrieval = retrieval_service
        self._repository = paper_repository

    async def run(self, state: ResearchState) -> dict[str, Any]:
        query = state["query"]
        plan = state.get("plan", {})
        max_papers = state.get("max_papers", 10)
        search_queries = plan.get("search_queries", [query])

        logger.info("Retrieval agent searching with %d queries", len(search_queries))
        papers = await self._retrieval.search_with_queries(search_queries, max_papers)
        papers = [self._retrieval.normalize_paper(p) for p in papers]
        await asyncio.to_thread(self._repository.save_many, papers)

        return {"papers": papers}
