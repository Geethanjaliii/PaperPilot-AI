"""FastAPI dependency injection."""

from functools import lru_cache

from app.core.config import Settings, get_settings
from app.graphs.research_graph import ResearchGraph
from app.repositories.paper_repository import PaperRepository
from app.services.arxiv_service import ArxivService
from app.services.chroma_service import ChromaService
from app.services.embedding_service import EmbeddingService
from app.services.gemini_service import GeminiService
from app.services.paper_retrieval_service import PaperRetrievalService
from app.services.rag_service import RAGService
from app.services.ranking_service import RankingService
from app.services.research_service import ResearchService
from app.services.semantic_scholar_service import SemanticScholarService
import httpx
import asyncio

_http_client: httpx.AsyncClient | None = None
_client_loop: asyncio.AbstractEventLoop | None = None


def get_http_client() -> httpx.AsyncClient:
    global _http_client, _client_loop
    try:
        current_loop = asyncio.get_running_loop()
    except RuntimeError:
        current_loop = None

    if _http_client is None or _http_client.is_closed or _client_loop is not current_loop:
        # Create a new client bound to the current running loop
        _http_client = httpx.AsyncClient(timeout=30.0, follow_redirects=True)
        _client_loop = current_loop
    return _http_client


async def close_http_clients() -> None:
    global _http_client, _client_loop
    if _http_client is not None and not _http_client.is_closed:
        await _http_client.aclose()
        _http_client = None
        _client_loop = None


@lru_cache
def get_paper_repository() -> PaperRepository:
    settings = get_settings()
    return PaperRepository(settings.papers_db_file, settings.papers_cache_file)


@lru_cache
def get_arxiv_service() -> ArxivService:
    return ArxivService(get_settings(), get_http_client)


@lru_cache
def get_semantic_scholar_service() -> SemanticScholarService:
    return SemanticScholarService(get_settings(), get_http_client)


@lru_cache
def get_retrieval_service() -> PaperRetrievalService:
    settings = get_settings()
    return PaperRetrievalService(
        settings,
        get_arxiv_service(),
        get_semantic_scholar_service(),
    )


@lru_cache
def get_chroma_service() -> ChromaService:
    return ChromaService(get_settings())


@lru_cache
def get_embedding_service() -> EmbeddingService:
    return EmbeddingService(get_settings())


@lru_cache
def get_gemini_service() -> GeminiService:
    return GeminiService(get_settings())


@lru_cache
def get_ranking_service() -> RankingService:
    return RankingService()


@lru_cache
def get_rag_service() -> RAGService:
    return RAGService(
        get_settings(),
        get_embedding_service(),
        get_chroma_service(),
    )


@lru_cache
def get_research_graph() -> ResearchGraph:
    return ResearchGraph(
        gemini_service=get_gemini_service(),
        retrieval_service=get_retrieval_service(),
        ranking_service=get_ranking_service(),
        embedding_service=get_embedding_service(),
        chroma_service=get_chroma_service(),
        rag_service=get_rag_service(),
        paper_repository=get_paper_repository(),
    )


def get_research_service() -> ResearchService:
    return ResearchService(
        retrieval_service=get_retrieval_service(),
        ranking_service=get_ranking_service(),
        embedding_service=get_embedding_service(),
        chroma_service=get_chroma_service(),
        rag_service=get_rag_service(),
        gemini_service=get_gemini_service(),
        paper_repository=get_paper_repository(),
        research_graph=get_research_graph(),
    )
