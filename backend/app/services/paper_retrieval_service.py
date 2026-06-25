"""Unified paper retrieval service combining multiple sources."""

import asyncio
from typing import Optional

from app.core.config import Settings
from app.core.logging import get_logger
from app.models.paper import Paper, PaperSource
from app.services.arxiv_service import ArxivService
from app.services.semantic_scholar_service import SemanticScholarService
from app.utils import paper_dedup_key

logger = get_logger(__name__)


class PaperRetrievalService:
    """Orchestrates paper retrieval from arXiv and Semantic Scholar."""

    def __init__(
        self,
        settings: Settings,
        arxiv_service: ArxivService,
        semantic_scholar_service: SemanticScholarService,
    ) -> None:
        self._settings = settings
        self._arxiv = arxiv_service
        self._semantic_scholar = semantic_scholar_service

    @staticmethod
    def _coerce_sources(sources: Optional[list[PaperSource | str]]) -> list[PaperSource]:
        if not sources:
            return [PaperSource.ARXIV, PaperSource.SEMANTIC_SCHOLAR]
        coerced: list[PaperSource] = []
        for source in sources:
            if isinstance(source, PaperSource):
                coerced.append(source)
            else:
                coerced.append(PaperSource(source))
        return coerced

    async def search(
        self,
        query: str,
        max_results: Optional[int] = None,
        sources: Optional[list[PaperSource | str]] = None,
    ) -> list[Paper]:
        limit = max_results or self._settings.max_papers_per_query
        active_sources = self._coerce_sources(sources)
        per_source = max(1, limit // len(active_sources))

        logger.info(
            "Searching papers: query=%r sources=%s limit=%d",
            query[:80],
            [s.value for s in active_sources],
            limit,
        )

        tasks: list[tuple[PaperSource, asyncio.Task[list[Paper]]]] = []
        if PaperSource.ARXIV in active_sources:
            tasks.append((PaperSource.ARXIV, asyncio.create_task(self._arxiv.search(query, per_source))))
        if PaperSource.SEMANTIC_SCHOLAR in active_sources:
            tasks.append(
                (
                    PaperSource.SEMANTIC_SCHOLAR,
                    asyncio.create_task(self._semantic_scholar.search(query, per_source)),
                )
            )

        if not tasks:
            return []

        source_errors: list[str] = []
        failed_sources: set[PaperSource] = set()
        papers: list[Paper] = []

        for source, task in tasks:
            try:
                result = await task
                papers.extend(result)
                logger.info("Source %s returned %d papers", source.value, len(result))
            except Exception as exc:
                logger.exception("Paper retrieval source %s failed", source.value)
                failed_sources.add(source)
                source_errors.append(f"{source.value}: {exc}")

        if not papers and source_errors:
            from app.core.exceptions import RetrievalError

            raise RetrievalError(
                "All paper retrieval sources failed. "
                + "; ".join(source_errors)
            )

        deduped = self._deduplicate(papers)
        if len(deduped) < limit and failed_sources:
            for source in active_sources:
                if source in failed_sources or len(deduped) >= limit:
                    continue
                try:
                    if source == PaperSource.ARXIV:
                        extra = await self._arxiv.search(query, limit)
                    elif source == PaperSource.SEMANTIC_SCHOLAR:
                        extra = await self._semantic_scholar.search(query, limit)
                    else:
                        continue
                    deduped = self._deduplicate(deduped + extra)
                    logger.info("Backfill from %s; total=%d", source.value, len(deduped))
                except Exception as exc:
                    logger.warning("Backfill from %s failed: %s", source.value, exc)

        logger.info("Retrieval complete: %d unique papers", len(deduped[:limit]))
        return deduped[:limit]

    async def search_with_queries(
        self,
        queries: list[str],
        max_results: Optional[int] = None,
    ) -> list[Paper]:
        limit = max_results or self._settings.max_papers_per_query
        per_query = max(1, limit // max(len(queries), 1))

        arxiv_task = self._arxiv.search_batch(queries, per_query)
        ss_task = self._semantic_scholar.search_batch(queries, per_query)
        arxiv_papers, ss_papers = await asyncio.gather(arxiv_task, ss_task)

        combined = self._deduplicate(arxiv_papers + ss_papers)
        return combined[:limit]

    @staticmethod
    def _deduplicate(papers: list[Paper]) -> list[Paper]:
        seen: set[str] = set()
        unique: list[Paper] = []
        for paper in papers:
            key = paper_dedup_key(paper.title, paper.year)
            if key in seen:
                continue
            seen.add(key)
            unique.append(paper)
        return unique

    def normalize_paper(self, paper: Paper) -> Paper:
        """Ensure paper conforms to the common schema."""
        return Paper(
            id=paper.id,
            title=(paper.title or "Untitled").strip(),
            authors=[a.strip() for a in paper.authors if a and str(a).strip()],
            abstract=(paper.abstract or "").strip(),
            year=paper.year,
            venue=(paper.venue or "").strip(),
            citation_count=max(0, paper.citation_count or 0),
            url=(paper.url or "").strip(),
            source=paper.source,
            arxiv_id=paper.arxiv_id,
            semantic_scholar_id=paper.semantic_scholar_id,
        )
