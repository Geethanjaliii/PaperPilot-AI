"""Full LangGraph pipeline endpoint."""

from fastapi import APIRouter, Depends

from app.api.deps import get_research_service
from app.api.quota import handle_quota_error
from app.core.exceptions import (
    GeminiQuotaError,
    GraphExecutionError,
    PaperPilotError,
    bad_request_exception,
    internal_error_exception,
)
from app.core.logging import get_logger
from app.schemas.citation import FormattedCitation
from app.schemas.query import QueryRequest, QueryResponse
from app.services.research_service import ResearchService
from app.utils.converters import papers_to_responses

logger = get_logger(__name__)
router = APIRouter()


@router.post("/query", response_model=QueryResponse)
async def execute_query(
    request: QueryRequest,
    service: ResearchService = Depends(get_research_service),
) -> QueryResponse:
    try:
        result = await service.execute_pipeline(
            query=request.query,
            max_papers=request.max_papers,
        )
        papers = result.get("ranked_papers", result.get("papers", []))
        citations = result.get("citations", [])

        if citations and not isinstance(citations[0], FormattedCitation):
            citations = [
                FormattedCitation(**c) if isinstance(c, dict) else c
                for c in citations
            ]

        return QueryResponse(
            query=request.query,
            papers=papers_to_responses(papers),
            summary=result.get("summary", ""),
            literature_review=result.get("literature_review", ""),
            comparison=result.get("methodology_comparison", ""),
            citations=citations,
        )
    except GeminiQuotaError as exc:
        handle_quota_error(exc, endpoint="/query")
    except GraphExecutionError as exc:
        logger.error("Pipeline failed: %s", exc.message)
        raise internal_error_exception(exc.message) from exc
    except PaperPilotError as exc:
        raise bad_request_exception(exc.message) from exc
    except Exception as exc:
        logger.exception("Unexpected pipeline error")
        raise internal_error_exception("Research pipeline execution failed.") from exc
