"""Sentence-transformers embedding service."""

import asyncio
from functools import lru_cache
from typing import Optional

from sentence_transformers import SentenceTransformer

from app.core.config import Settings
from app.core.exceptions import EmbeddingError
from app.core.logging import get_logger
from app.models.paper import Paper

logger = get_logger(__name__)


@lru_cache(maxsize=1)
def _load_model(model_name: str) -> SentenceTransformer:
    logger.info("Loading embedding model: %s", model_name)
    return SentenceTransformer(model_name)


class EmbeddingService:
    """Generate embeddings for paper titles and abstracts."""

    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._model_name = settings.embedding_model
        self._model: Optional[SentenceTransformer] = None

    @property
    def model(self) -> SentenceTransformer:
        if self._model is None:
            self._model = _load_model(self._model_name)
        return self._model

    async def embed_texts(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []
        try:
            loop = asyncio.get_event_loop()
            embeddings = await loop.run_in_executor(
                None, lambda: self.model.encode(texts, show_progress_bar=False)
            )
            return embeddings.tolist()
        except Exception as exc:
            logger.error("Embedding generation failed: %s", exc)
            raise EmbeddingError(f"Failed to generate embeddings: {exc}") from exc

    async def embed_query(self, query: str) -> list[float]:
        results = await self.embed_texts([query])
        return results[0] if results else []

    async def embed_papers(
        self, papers: list[Paper]
    ) -> tuple[list[list[float]], list[list[float]]]:
        titles = [p.title for p in papers]
        abstracts = [p.abstract or p.title for p in papers]

        title_embeddings, abstract_embeddings = await asyncio.gather(
            self.embed_texts(titles),
            self.embed_texts(abstracts),
        )
        return title_embeddings, abstract_embeddings

    async def embed_and_store(
        self,
        papers: list[Paper],
        chroma_service: "ChromaService",
    ) -> None:
        from app.services.chroma_service import ChromaService

        if not papers:
            return
        title_emb, abstract_emb = await self.embed_papers(papers)
        await asyncio.to_thread(chroma_service.upsert_papers, papers, title_emb, abstract_emb)
        logger.info("Embedded and stored %d papers", len(papers))
