"""RAG retrieval service."""

import asyncio
from typing import Any

from app.core.config import Settings
from app.core.logging import get_logger
from app.models.paper import Paper
from app.services.chroma_service import ChromaService
from app.services.embedding_service import EmbeddingService

logger = get_logger(__name__)


class RAGService:
    """Retrieve relevant context using semantic search over ChromaDB."""

    def __init__(
        self,
        settings: Settings,
        embedding_service: EmbeddingService,
        chroma_service: ChromaService,
    ) -> None:
        self._settings = settings
        self._embedding = embedding_service
        self._chroma = chroma_service

    async def retrieve(
        self,
        query: str,
        papers: list[Paper],
        top_k: int | None = None,
    ) -> str:
        if not papers:
            return ""

        query_embedding = await self._embedding.embed_query(query)
        paper_ids = [p.id for p in papers]
        results = await asyncio.to_thread(
            self._chroma.query,
            query_embedding=query_embedding,
            top_k=top_k or self._settings.rag_top_k,
            paper_ids=paper_ids,
        )
        return self._format_context(results, papers)

    def _format_context(self, chroma_results: dict[str, Any], papers: list[Paper]) -> str:
        paper_map = {p.id: p for p in papers}
        documents = chroma_results.get("documents", [[]])[0]
        metadatas = chroma_results.get("metadatas", [[]])[0]
        distances = chroma_results.get("distances", [[]])[0]

        if not documents:
            return self._fallback_context(papers)

        sections: list[str] = []
        for idx, doc in enumerate(documents):
            meta = metadatas[idx] if idx < len(metadatas) else {}
            paper_id = meta.get("paper_id", "")
            paper = paper_map.get(paper_id)
            title = paper.title if paper else meta.get("title", "Unknown")
            distance = distances[idx] if idx < len(distances) else 0.0
            sections.append(
                f"### {title}\n"
                f"Relevance: {1 - distance:.3f}\n"
                f"{doc}\n"
            )

        context = "\n".join(sections)
        logger.info("Retrieved RAG context with %d chunks", len(sections))
        return context

    @staticmethod
    def _fallback_context(papers: list[Paper]) -> str:
        sections = []
        for paper in papers:
            sections.append(
                f"### {paper.title}\n"
                f"Authors: {', '.join(paper.authors)}\n"
                f"Abstract: {paper.abstract}\n"
            )
        return "\n".join(sections)
