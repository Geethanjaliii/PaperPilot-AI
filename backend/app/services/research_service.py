"""High-level research orchestration service."""

import asyncio

from app.api.quota import raise_if_quota_exceeded
from app.core.exceptions import GraphExecutionError, PaperNotFoundError
from app.core.logging import get_logger
from app.graphs.research_graph import ResearchGraph
from app.models.paper import Paper
from app.repositories.paper_repository import PaperRepository
from app.schemas.citation import FormattedCitation
from app.services.embedding_service import EmbeddingService
from app.services.chroma_service import ChromaService
from app.services.gemini_service import GeminiService
from app.services.paper_retrieval_service import PaperRetrievalService
from app.services.rag_service import RAGService
from app.services.ranking_service import RankingService

logger = get_logger(__name__)


class ResearchService:
    """Orchestrates research workflows for API endpoints."""

    def __init__(
        self,
        retrieval_service: PaperRetrievalService,
        ranking_service: RankingService,
        embedding_service: EmbeddingService,
        chroma_service: ChromaService,
        rag_service: RAGService,
        gemini_service: GeminiService,
        paper_repository: PaperRepository,
        research_graph: ResearchGraph,
    ) -> None:
        self._retrieval = retrieval_service
        self._ranking = ranking_service
        self._embedding = embedding_service
        self._chroma = chroma_service
        self._rag = rag_service
        self._gemini = gemini_service
        self._repository = paper_repository
        self._graph = research_graph

    async def search_papers(
        self,
        query: str,
        max_results: int = 10,
        sources=None,
    ) -> list[Paper]:
        logger.info("ResearchService.search_papers query=%r", query[:80])
        try:
            papers = await self._retrieval.search(query, max_results, sources)
            papers = [self._retrieval.normalize_paper(p) for p in papers]
            await asyncio.to_thread(self._repository.save_many, papers)
            logger.info("ResearchService.search_papers found %d papers", len(papers))
            return papers
        except Exception:
            logger.exception("ResearchService.search_papers failed")
            raise

    async def get_paper(self, paper_id: str) -> Paper:
        paper = await asyncio.to_thread(self._repository.get, paper_id)
        if not paper:
            raise PaperNotFoundError(f"Paper {paper_id} not found")
        return paper

    async def list_papers(self) -> list[Paper]:
        return await asyncio.to_thread(self._repository.list_all)

    async def generate_review(
        self,
        query: str,
        paper_ids: list[str] | None = None,
        max_papers: int = 10,
    ) -> tuple[str, str, list[Paper]]:
        papers = await self._resolve_papers(query, paper_ids, max_papers)
        ranked = self._ranking.rank(query, papers, limit=max_papers)
        await self._embedding.embed_and_store(ranked, self._chroma)
        context = await self._rag.retrieve(query, ranked)
        try:
            review = await self._gemini.generate_literature_review(query, context)
            gaps = await self._gemini.identify_research_gaps(query, review, context)
        except Exception as exc:
            # Promote quota errors before any generic handler can swallow them.
            # raise_if_quota_exceeded() inspects the full __cause__ chain and
            # re-raises as GeminiQuotaError if RESOURCE_EXHAUSTED is found;
            # otherwise it returns silently and the existing error handling
            # below takes over.
            raise_if_quota_exceeded(exc)
            raise
        return review, gaps, ranked

    async def compare_methodologies(
        self,
        query: str,
        paper_ids: list[str] | None = None,
        max_papers: int = 10,
    ) -> tuple[str, list[Paper]]:
        papers = await self._resolve_papers(query, paper_ids, max_papers)
        ranked = self._ranking.rank(query, papers, limit=max_papers)
        await self._embedding.embed_and_store(ranked, self._chroma)
        context = await self._rag.retrieve(query, ranked)
        try:
            comparison = await self._gemini.compare_methodologies(query, context)
        except Exception as exc:
            raise_if_quota_exceeded(exc)
            raise
        return comparison, ranked

    async def generate_citations(
        self,
        paper_ids: list[str],
        formats: list[str] | None = None,
    ) -> tuple[list[FormattedCitation], list[Paper]]:
        papers = await asyncio.to_thread(self._repository.get_many, paper_ids)
        if not papers:
            raise PaperNotFoundError("No papers found for the given IDs")

        active_formats = formats or ["apa", "ieee", "bibtex"]
        citations: list[FormattedCitation] = []

        for paper in papers:
            apa = ieee = bibtex = ""
            tasks = []
            if "apa" in active_formats:
                tasks.append(("apa", self._gemini.format_citation_apa(paper)))
            if "ieee" in active_formats:
                tasks.append(("ieee", self._gemini.format_citation_ieee(paper)))
            if "bibtex" in active_formats:
                tasks.append(("bibtex", self._gemini.format_citation_bibtex(paper)))

            try:
                results = await asyncio.gather(*(t[1] for t in tasks))
            except Exception as exc:
                raise_if_quota_exceeded(exc)
                raise

            for (fmt, _), result in zip(tasks, results):
                if fmt == "apa":
                    apa = result.strip()
                elif fmt == "ieee":
                    ieee = result.strip()
                elif fmt == "bibtex":
                    bibtex = result.strip()

            citations.append(
                FormattedCitation(
                    paper_id=paper.id,
                    title=paper.title,
                    apa=apa,
                    ieee=ieee,
                    bibtex=bibtex,
                )
            )

        return citations, papers

    async def execute_pipeline(self, query: str, max_papers: int = 10) -> dict:
        try:
            result = await self._graph.execute(query, max_papers)
            return dict(result)
        except Exception as exc:
            # Check for quota before converting to the opaque GraphExecutionError
            # string (which would permanently hide the RESOURCE_EXHAUSTED signal).
            raise_if_quota_exceeded(exc)
            logger.error("Pipeline execution failed: %s", exc)
            raise GraphExecutionError(str(exc)) from exc

    async def _resolve_papers(
        self,
        query: str,
        paper_ids: list[str] | None,
        max_papers: int,
    ) -> list[Paper]:
        if paper_ids:
            logger.info("Resolve papers: incoming paper_ids=%s", paper_ids)
            papers, source = await self._lookup_papers_by_ids(paper_ids)
            logger.info(
                "Resolve papers: retrieved %d/%d papers (source=%s, titles=%s)",
                len(papers),
                len(paper_ids),
                source,
                [p.title[:40] for p in papers],
            )
            if not papers:
                raise PaperNotFoundError(
                    f"No papers found for the given IDs: {paper_ids}. "
                    "Run POST /api/v1/search first so paper metadata is persisted."
                )
            missing = [pid for pid in paper_ids if pid not in {p.id for p in papers}]
            if missing:
                raise PaperNotFoundError(
                    f"Papers not found for IDs: {missing}. "
                    f"Resolved {len(papers)}/{len(paper_ids)} from {source}. "
                    "Re-run POST /api/v1/search to refresh the paper cache."
                )
            return papers

        logger.info(
            "Resolve papers: no paper_ids provided; searching for query=%r", query[:80]
        )
        papers = await self.search_papers(query, max_papers)
        logger.info(
            "Resolve papers: retrieved %d papers via search (source=retrieval_api)",
            len(papers),
        )
        if not papers:
            raise PaperNotFoundError("No papers found for the query")
        return papers

    async def _lookup_papers_by_ids(
        self, paper_ids: list[str]
    ) -> tuple[list[Paper], str]:
        papers = await asyncio.to_thread(self._repository.get_many, paper_ids)
        if len(papers) == len(paper_ids):
            return papers, "paper_cache"

        found_ids = {p.id for p in papers}
        missing = [pid for pid in paper_ids if pid not in found_ids]

        chroma_papers = await asyncio.to_thread(self._papers_from_chroma, missing)
        if chroma_papers:
            await asyncio.to_thread(self._repository.save_many, chroma_papers)
            papers = await asyncio.to_thread(self._repository.get_many, paper_ids)
            if len(papers) == len(paper_ids):
                return papers, "chromadb"

        if papers:
            return papers, "paper_cache"
        return [], "none"

    def _papers_from_chroma(self, paper_ids: list[str]) -> list[Paper]:
        if not paper_ids:
            return []
        items = self._chroma.get_by_ids(paper_ids)
        papers: list[Paper] = []
        for item in items:
            paper = self._paper_from_chroma_item(item)
            if paper:
                papers.append(paper)
        if papers:
            logger.info(
                "Loaded %d papers from ChromaDB for ids=%s", len(papers), paper_ids
            )
        return papers

    @staticmethod
    def _paper_from_chroma_item(item: dict) -> Paper | None:
        from app.models.paper import PaperSource

        paper_id = item.get("id")
        metadata = item.get("metadata") or {}
        if not paper_id:
            return None

        document = item.get("document") or ""
        title, abstract = (document.split("\n\n", 1) + [""])[:2]
        title = metadata.get("title") or title
        authors_raw = metadata.get("authors") or ""
        authors = [a.strip() for a in authors_raw.split(",") if a.strip()]
        source_value = metadata.get("source") or PaperSource.INTERNAL.value

        try:
            source = PaperSource(source_value)
        except ValueError:
            source = PaperSource.INTERNAL

        year = metadata.get("year")
        return Paper(
            id=paper_id,
            title=title,
            authors=authors,
            abstract=abstract,
            year=int(year) if year else None,
            venue=metadata.get("venue") or "",
            url=metadata.get("url") or "",
            source=source,
        )
