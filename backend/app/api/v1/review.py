"""Literature review endpoint."""

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
from app.schemas.review import ReviewRequest, ReviewResponse
from app.services.research_service import ResearchService
from app.utils.converters import papers_to_responses

logger = get_logger(__name__)
router = APIRouter()


@router.post("/review", response_model=ReviewResponse)
async def generate_review(
    request: ReviewRequest,
    service: ResearchService = Depends(get_research_service),
) -> ReviewResponse:
    try:
        logger.info(
            "POST /review query=%r paper_ids=%s max_papers=%d",
            request.query,
            request.paper_ids,
            request.max_papers,
        )
        review, gaps, papers = await service.generate_review(
            query=request.query,
            paper_ids=request.paper_ids or None,
            max_papers=request.max_papers,
        )
        full_review = f"{review}\n\n## Research Gaps\n\n{gaps}"
        return ReviewResponse(
            query=request.query,
            literature_review=full_review,
            research_gaps=gaps,
            papers=papers_to_responses(papers),
        )
    except GeminiQuotaError as exc:
        # Must be first — GeminiQuotaError IS-A PaperPilotError, so it would
        # otherwise fall into the generic PaperPilotError handler below and
        # produce HTTP 400 with the raw message.
        handle_quota_error(exc, endpoint="/review")
    except PaperNotFoundError as exc:
        raise bad_request_exception(exc.message) from exc
    except PaperPilotError as exc:
        logger.error("Review generation failed: %s", exc.message)
        raise bad_request_exception(exc.message) from exc
    except Exception as exc:
        logger.exception("Unexpected review error")
        raise internal_error_exception("Literature review generation failed.") from exc
