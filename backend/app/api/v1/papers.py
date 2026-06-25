"""Paper listing and detail endpoints."""

from fastapi import APIRouter, Depends

from app.api.deps import get_research_service
from app.core.exceptions import (
    PaperNotFoundError,
    paper_not_found_exception,
    internal_error_exception,
)
from app.core.logging import get_logger
from app.schemas.paper import PaperListResponse, PaperResponse
from app.services.research_service import ResearchService
from app.utils.converters import paper_to_response, papers_to_responses

logger = get_logger(__name__)
router = APIRouter()


@router.get("/papers", response_model=PaperListResponse)
async def list_papers(
    service: ResearchService = Depends(get_research_service),
) -> PaperListResponse:
    try:
        papers = await service.list_papers()
        responses = papers_to_responses(papers)
        return PaperListResponse(papers=responses, total=len(responses))
    except Exception as exc:
        logger.exception("Failed to list papers")
        raise internal_error_exception("Failed to retrieve papers.") from exc


@router.get("/papers/{paper_id}", response_model=PaperResponse)
async def get_paper(
    paper_id: str,
    service: ResearchService = Depends(get_research_service),
) -> PaperResponse:
    try:
        paper = await service.get_paper(paper_id)
        return paper_to_response(paper)
    except PaperNotFoundError:
        raise paper_not_found_exception(paper_id)
    except Exception as exc:
        logger.exception("Failed to get paper %s", paper_id)
        raise internal_error_exception("Failed to retrieve paper.") from exc
