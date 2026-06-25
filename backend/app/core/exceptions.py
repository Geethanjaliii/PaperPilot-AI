"""Custom application exceptions."""

from __future__ import annotations

from fastapi import HTTPException, status


# ---------------------------------------------------------------------------
# Domain exceptions
# ---------------------------------------------------------------------------


class PaperPilotError(Exception):
    """Base exception for PaperPilot AI."""

    def __init__(self, message: str) -> None:
        self.message = message
        super().__init__(message)


class PaperNotFoundError(PaperPilotError):
    """Raised when a paper cannot be found."""


class RetrievalError(PaperPilotError):
    """Raised when paper retrieval fails."""


class EmbeddingError(PaperPilotError):
    """Raised when embedding generation fails."""


class LLMError(PaperPilotError):
    """Raised when LLM generation fails."""


class GeminiQuotaError(PaperPilotError):
    """Raised when the Gemini API returns RESOURCE_EXHAUSTED (HTTP 429).

    Attributes
    ----------
    retry_after:
        Suggested number of seconds to wait before retrying, or ``None`` when
        the API did not include a ``RetryInfo`` header / detail.
    """

    def __init__(self, message: str, *, retry_after: int | None = None) -> None:
        super().__init__(message)
        self.retry_after = retry_after


class GraphExecutionError(PaperPilotError):
    """Raised when LangGraph workflow execution fails."""


class ConfigurationError(PaperPilotError):
    """Raised when required configuration is missing."""


# ---------------------------------------------------------------------------
# HTTP exception factories
# ---------------------------------------------------------------------------


def paper_not_found_exception(paper_id: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Paper with id '{paper_id}' not found.",
    )


def bad_request_exception(message: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail={"error": "bad_request", "message": message},
    )


def quota_exceeded_exception(*, retry_after: int | None = None) -> HTTPException:
    """Return an HTTP 429 exception with the canonical quota-exceeded body.

    The ``Retry-After`` header is set when *retry_after* is provided so that
    well-behaved clients can back off automatically.
    """
    detail: dict[str, object] = {
        "error": "quota_exceeded",
        "message": "Gemini API quota exceeded. Please retry after some time.",
    }
    if retry_after is not None:
        detail["retry_after_seconds"] = retry_after

    headers: dict[str, str] = {}
    if retry_after is not None:
        headers["Retry-After"] = str(retry_after)

    return HTTPException(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        detail=detail,
        headers=headers,
    )


def service_unavailable_exception(
    message: str, *, sources: list[str] | None = None
) -> HTTPException:
    detail: dict[str, object] = {"error": "service_unavailable", "message": message}
    if sources:
        detail["failed_sources"] = sources
    return HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail=detail,
    )


def internal_error_exception(
    message: str, *, cause: str | None = None
) -> HTTPException:
    detail: dict[str, object] = {"error": "internal_error", "message": message}
    if cause:
        detail["cause"] = cause
    return HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=detail,
    )


def configuration_exception(message: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail={"error": "configuration_error", "message": message},
    )