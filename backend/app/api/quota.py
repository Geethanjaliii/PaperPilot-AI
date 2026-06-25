"""Gemini quota-error detection and router helper.

This module is the single source of truth for:
  - detecting a Google ``RESOURCE_EXHAUSTED`` error anywhere in an exception chain
  - extracting the ``retry_after`` hint from the Google error
  - raising ``GeminiQuotaError`` (service layer)
  - converting ``GeminiQuotaError`` → HTTP 429 with structured logging (router layer)

Design goals
------------
* No hard dependency on ``google-api-core`` — all imports are guarded so the
  module loads even when the package is absent or has a different layout.
* Detection walks the full ``__cause__`` / ``__context__`` chain so the error
  is caught whether it surfaces unwrapped, wrapped in ``LLMError``, or wrapped
  in ``GraphExecutionError``.
* Raw Google stack traces and message strings never reach HTTP responses.
"""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    pass

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Detection helpers
# ---------------------------------------------------------------------------


def _is_google_resource_exhausted(exc: BaseException) -> bool:
    """Return True if *exc* is a Google RESOURCE_EXHAUSTED error."""
    # Primary path: isinstance against the canonical class
    try:
        from google.api_core.exceptions import ResourceExhausted  # type: ignore[import]

        if isinstance(exc, ResourceExhausted):
            return True
    except ImportError:
        pass

    # Secondary path: gRPC status code attribute (some LangChain wrappers)
    grpc_code = getattr(exc, "grpc_status_code", None)
    if grpc_code is not None:
        try:
            import grpc  # type: ignore[import]

            if grpc_code == grpc.StatusCode.RESOURCE_EXHAUSTED:
                return True
        except ImportError:
            pass

    return False


def _extract_retry_after(exc: BaseException) -> int | None:
    """Return retry-after seconds from a Google ResourceExhausted error, or None.

    Google surfaces the value in two places depending on SDK version:
    1. ``exc.retry_delay``  — a ``datetime.timedelta`` on newer google-api-core.
    2. ``exc.details()``    — a list of RPC detail protos that may contain a
                              ``RetryInfo`` message with ``retry_delay.seconds``.
    """
    # Approach 1: timedelta attribute
    retry_delay = getattr(exc, "retry_delay", None)
    if retry_delay is not None:
        try:
            return max(1, int(retry_delay.total_seconds()))
        except (AttributeError, TypeError, ValueError):
            pass

    # Approach 2: structured details list
    get_details = getattr(exc, "details", None)
    if callable(get_details):
        try:
            for detail in get_details():
                seconds = getattr(
                    getattr(detail, "retry_delay", None), "seconds", None
                )
                if seconds is not None:
                    return max(1, int(seconds))
        except Exception:  # noqa: BLE001
            pass

    return None


def find_resource_exhausted(exc: BaseException) -> BaseException | None:
    """Walk the full exception chain; return the first RESOURCE_EXHAUSTED error or None."""
    seen: set[int] = set()
    current: BaseException | None = exc
    while current is not None:
        eid = id(current)
        if eid in seen:
            break
        seen.add(eid)
        if _is_google_resource_exhausted(current):
            return current
        current = current.__cause__ or current.__context__
    return None


# ---------------------------------------------------------------------------
# Service-layer helper
# ---------------------------------------------------------------------------


def raise_if_quota_exceeded(exc: BaseException) -> None:
    """Re-raise as ``GeminiQuotaError`` if *exc* or its chain contains a ``GeminiQuotaError`` or ``RESOURCE_EXHAUSTED``.

    Call this at the point where you first catch an exception from a Gemini
    call, *before* converting it to a generic ``LLMError`` or other opaque exceptions.
    """
    from app.core.exceptions import GeminiQuotaError  # local import avoids circularity

    # 1. Walk chain to find if GeminiQuotaError is already present
    seen: set[int] = set()
    current: BaseException | None = exc
    while current is not None:
        eid = id(current)
        if eid in seen:
            break
        seen.add(eid)
        if isinstance(current, GeminiQuotaError):
            raise current
        current = current.__cause__ or current.__context__

    # 2. Otherwise find if Google RESOURCE_EXHAUSTED is present
    google_exc = find_resource_exhausted(exc)
    if google_exc is not None:
        retry_after = _extract_retry_after(google_exc)
        raise GeminiQuotaError(
            "Gemini API quota exceeded. Please retry after some time.",
            retry_after=retry_after,
        ) from exc


# ---------------------------------------------------------------------------
# Router-layer helper
# ---------------------------------------------------------------------------


def handle_quota_error(exc: Exception, *, endpoint: str) -> None:
    """Log a structured WARNING and raise HTTP 429 for a ``GeminiQuotaError``.

    Call this as the *first* except clause in every LLM-backed router::

        except GeminiQuotaError as exc:
            handle_quota_error(exc, endpoint="/review")

    Raises
    ------
    HTTPException
        Always raises HTTP 429 with the canonical quota-exceeded body.
        Never propagates the raw Google error string or traceback.
    """
    from app.core.exceptions import GeminiQuotaError, quota_exceeded_exception

    if not isinstance(exc, GeminiQuotaError):  # defensive guard
        raise exc

    retry_after = exc.retry_after

    # Structured log at WARNING — no traceback, no Google internals
    logger.warning(
        "Gemini quota exceeded",
        extra={
            "event": "gemini_quota_exceeded",
            "endpoint": endpoint,
            "retry_after_seconds": retry_after,
        },
    )
    # Full traceback only at DEBUG so it is available for local dev / tail -f
    logger.debug("Gemini quota exceeded — full chain", exc_info=exc)

    raise quota_exceeded_exception(retry_after=retry_after)
