"""Methodology comparison endpoint."""

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
from app.schemas.compare import CompareRequest, CompareResponse
from app.services.research_service import ResearchService
from app.utils.converters import papers_to_responses

logger = get_logger(__name__)
router = APIRouter()


@router.post("/compare", response_model=CompareResponse)
async def compare_methodologies(
    request: CompareRequest,
    service: ResearchService = Depends(get_research_service),
) -> CompareResponse:
    try:
        comparison, papers = await service.compare_methodologies(
            query=request.query,
            paper_ids=request.paper_ids or None,
            max_papers=request.max_papers,
        )
        return CompareResponse(
            query=request.query,
            comparison=comparison,
            papers=papers_to_responses(papers),
        )
    except GeminiQuotaError as exc:
        handle_quota_error(exc, endpoint="/compare")
    except PaperNotFoundError as exc:
        raise bad_request_exception(exc.message) from exc
    except PaperPilotError as exc:
        logger.error("Comparison failed: %s", exc.message)
        raise bad_request_exception(exc.message) from exc
    except Exception as exc:
        logger.exception("Unexpected comparison error")
        raise internal_error_exception("Methodology comparison failed.") from exc
