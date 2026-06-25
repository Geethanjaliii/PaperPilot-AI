"""RAG retrieval agent node."""

from typing import Any

from app.core.logging import get_logger
from app.graphs.state import ResearchState
from app.services.rag_service import RAGService

logger = get_logger(__name__)


class RAGRetrievalAgent:
    def __init__(self, rag_service: RAGService) -> None:
        self._rag = rag_service

    async def run(self, state: ResearchState) -> dict[str, Any]:
        query = state["query"]
        papers = state.get("ranked_papers", [])

        logger.info("RAG agent retrieving context for %d papers", len(papers))
        context = await self._rag.retrieve(query, papers)
        return {"retrieved_context": context}
