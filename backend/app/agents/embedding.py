"""Embedding agent node."""

from typing import Any

from app.core.logging import get_logger
from app.graphs.state import ResearchState
from app.services.chroma_service import ChromaService
from app.services.embedding_service import EmbeddingService

logger = get_logger(__name__)


class EmbeddingAgent:
    def __init__(
        self,
        embedding_service: EmbeddingService,
        chroma_service: ChromaService,
    ) -> None:
        self._embedding = embedding_service
        self._chroma = chroma_service

    async def run(self, state: ResearchState) -> dict[str, Any]:
        papers = state.get("ranked_papers", [])
        logger.info("Embedding agent processing %d papers", len(papers))
        await self._embedding.embed_and_store(papers, self._chroma)
        return {}
