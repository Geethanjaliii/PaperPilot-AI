"""Paper search endpoint."""

from fastapi import APIRouter, Depends

from app.api.deps import get_paper_repository, get_retrieval_service
from app.core.exceptions import (
    PaperPilotError,
    RetrievalError,
    bad_request_exception,
    internal_error_exception,
    service_unavailable_exception,
)
from app.core.logging import get_logger
from app.repositories.paper_repository import PaperRepository
from app.schemas.paper import SearchRequest, SearchResponse
from app.services.paper_retrieval_service import PaperRetrievalService
from app.utils.converters import papers_to_responses

logger = get_logger(__name__)
router = APIRouter()


@router.post("/search", response_model=SearchResponse)
async def search_papers(
    request: SearchRequest,
    retrieval_service: PaperRetrievalService = Depends(get_retrieval_service),
    paper_repository: PaperRepository = Depends(get_paper_repository),
) -> SearchResponse:
    try:
        logger.info("POST /search query=%r max_results=%d", request.query, request.max_results)
        papers = await retrieval_service.search(
            query=request.query,
            max_results=request.max_results,
            sources=request.sources,
        )
        papers = [retrieval_service.normalize_paper(p) for p in papers]
        paper_repository.save_many(papers)
        responses = papers_to_responses(papers)
        logger.info(
            "POST /search persisted %d papers (ids=%s, cache_count=%d)",
            len(responses),
            [p.id for p in responses],
            paper_repository.count(),
        )
        logger.info("POST /search returning %d papers", len(responses))
        return SearchResponse(
            query=request.query,
            papers=responses,
            total=len(responses),
        )
    except RetrievalError as exc:
        logger.exception("Search failed: all retrieval sources unavailable")
        raise service_unavailable_exception(exc.message) from exc
    except PaperPilotError as exc:
        logger.exception("Search failed with PaperPilotError")
        raise bad_request_exception(exc.message) from exc
    except Exception as exc:
        logger.exception("Unexpected search error")
        raise internal_error_exception("Paper search failed.") from exc
