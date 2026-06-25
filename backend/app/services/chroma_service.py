"""ChromaDB vector store service."""

from typing import Any, Optional

import chromadb
from chromadb.config import Settings as ChromaSettings

from app.core.config import Settings
from app.core.exceptions import EmbeddingError
from app.core.logging import get_logger
from app.models.paper import Paper

logger = get_logger(__name__)


class ChromaService:
    """Manage paper embeddings in ChromaDB."""

    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._persist_dir = str(settings.chroma_path)
        settings.chroma_path.mkdir(parents=True, exist_ok=True)

        self._client = chromadb.PersistentClient(
            path=self._persist_dir,
            settings=ChromaSettings(anonymized_telemetry=False),
        )
        self._collection = self._client.get_or_create_collection(
            name=settings.chroma_collection_name,
            metadata={"hnsw:space": "cosine"},
        )
        logger.info("ChromaDB collection '%s' ready", settings.chroma_collection_name)

    @property
    def collection(self):
        return self._collection

    def upsert_papers(
        self,
        papers: list[Paper],
        title_embeddings: list[list[float]],
        abstract_embeddings: list[list[float]],
    ) -> None:
        if not papers:
            return
        if len(papers) != len(title_embeddings) or len(papers) != len(abstract_embeddings):
            raise EmbeddingError("Paper and embedding count mismatch")

        ids = [p.id for p in papers]
        documents = [p.embedding_text() for p in papers]
        combined_embeddings = [
            self._combine_embeddings(t, a)
            for t, a in zip(title_embeddings, abstract_embeddings)
        ]
        metadatas = [self._paper_metadata(p) for p in papers]

        self._collection.upsert(
            ids=ids,
            embeddings=combined_embeddings,
            documents=documents,
            metadatas=metadatas,
        )
        logger.info("Upserted %d papers into ChromaDB", len(papers))

    def query(
        self,
        query_embedding: list[float],
        top_k: Optional[int] = None,
        paper_ids: Optional[list[str]] = None,
    ) -> dict[str, Any]:
        k = top_k or self._settings.rag_top_k
        where_filter = {"paper_id": {"$in": paper_ids}} if paper_ids else None

        results = self._collection.query(
            query_embeddings=[query_embedding],
            n_results=k,
            where=where_filter,
            include=["documents", "metadatas", "distances"],
        )
        return results

    def get_by_ids(self, paper_ids: list[str]) -> list[dict[str, Any]]:
        if not paper_ids:
            return []
        result = self._collection.get(ids=paper_ids, include=["documents", "metadatas"])
        items: list[dict[str, Any]] = []
        for idx, doc_id in enumerate(result.get("ids", [])):
            items.append(
                {
                    "id": doc_id,
                    "document": result["documents"][idx] if result.get("documents") else "",
                    "metadata": result["metadatas"][idx] if result.get("metadatas") else {},
                }
            )
        return items

    @staticmethod
    def _combine_embeddings(
        title_emb: list[float],
        abstract_emb: list[float],
        title_weight: float = 0.3,
    ) -> list[float]:
        abstract_weight = 1.0 - title_weight
        return [
            title_weight * t + abstract_weight * a
            for t, a in zip(title_emb, abstract_emb)
        ]

    @staticmethod
    def _paper_metadata(paper: Paper) -> dict[str, Any]:
        return {
            "paper_id": paper.id,
            "title": paper.title,
            "authors": ", ".join(paper.authors),
            "year": paper.year or 0,
            "venue": paper.venue,
            "source": paper.source.value,
            "url": paper.url,
        }
