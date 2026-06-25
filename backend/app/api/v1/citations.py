"""Citation generation endpoint."""

from fastapi import APIRouter, Depends

from app.api.deps import get_research_service
from app.api.quota import handle_quota_error
from app.core.exceptions import (
    GeminiQuotaError,
    PaperNotFoundError,
    PaperPilotError,
    bad_request_exception,
    internal_error_exception,
)
from app.core.logging import get_logger
from app.schemas.citation import CitationRequest, CitationResponse
from app.services.research_service import ResearchService
from app.utils.converters import papers_to_responses

logger = get_logger(__name__)
router = APIRouter()


@router.post("/citations", response_model=CitationResponse)
async def generate_citations(
    request: CitationRequest,
    service: ResearchService = Depends(get_research_service),
) -> CitationResponse:
    try:
        citations, papers = await service.generate_citations(
            paper_ids=request.paper_ids,
            formats=request.formats,
        )
        return CitationResponse(
            citations=citations,
            papers=papers_to_responses(papers),
        )
    except GeminiQuotaError as exc:
        handle_quota_error(exc, endpoint="/citations")
    except PaperNotFoundError as exc:
        raise bad_request_exception(exc.message) from exc
    except PaperPilotError as exc:
        logger.error("Citation generation failed: %s", exc.message)
        raise bad_request_exception(exc.message) from exc
    except Exception as exc:
        logger.exception("Unexpected citation error")
        raise internal_error_exception("Citation generation failed.") from exc
