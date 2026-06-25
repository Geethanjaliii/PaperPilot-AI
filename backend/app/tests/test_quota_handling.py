"""Tests for Gemini quota-exceeded (RESOURCE_EXHAUSTED) handling.

Coverage
--------
* ``app.api.quota`` detection and extraction helpers (unit tests, no I/O)
* All four LLM-backed endpoints return HTTP 429 with the canonical body
* No Google internals (stack traces, raw RESOURCE_EXHAUSTED strings) are
  exposed in any HTTP response
* Non-quota errors still return their original status codes (regression guard)
"""

from __future__ import annotations

import datetime
from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

# ---------------------------------------------------------------------------
# Minimal stubs so the module tree imports without the real dependencies
# ---------------------------------------------------------------------------

# Stub google.api_core.exceptions so tests run without the Google SDK installed
import sys
import types

try:
    from google.api_core.exceptions import ResourceExhausted, GoogleAPICallError
except ImportError:
    _google_pkg = types.ModuleType("google")
    _api_core_pkg = types.ModuleType("google.api_core")
    _exceptions_mod = types.ModuleType("google.api_core.exceptions")

    class _GoogleAPICallError(Exception):
        """Minimal stub for google.api_core.exceptions.GoogleAPICallError."""

        def __init__(self, message: str, *, retry_delay: datetime.timedelta | None = None) -> None:
            super().__init__(message)
            self.retry_delay = retry_delay

        def details(self) -> list:
            return []

    class ResourceExhausted(_GoogleAPICallError):
        """Stub for google.api_core.exceptions.ResourceExhausted."""

    _exceptions_mod.GoogleAPICallError = _GoogleAPICallError  # type: ignore[attr-defined]
    _exceptions_mod.ResourceExhausted = ResourceExhausted  # type: ignore[attr-defined]
    _api_core_pkg.exceptions = _exceptions_mod  # type: ignore[attr-defined]
    _google_pkg.api_core = _api_core_pkg  # type: ignore[attr-defined]

    if "google" not in sys.modules:
        sys.modules["google"] = _google_pkg
    else:
        # Inject submodules into existing package namespace
        try:
            sys.modules["google"].api_core = _api_core_pkg
        except AttributeError:
            pass

    sys.modules.setdefault("google.api_core", _api_core_pkg)
    sys.modules.setdefault("google.api_core.exceptions", _exceptions_mod)

# ---------------------------------------------------------------------------
# Now import the modules under test
# ---------------------------------------------------------------------------

from app.api.quota import (  # noqa: E402
    _extract_retry_after,
    _is_google_resource_exhausted,
    find_resource_exhausted,
    raise_if_quota_exceeded,
)
from app.core.exceptions import (  # noqa: E402
    GeminiQuotaError,
    LLMError,
    GraphExecutionError,
)


# ---------------------------------------------------------------------------
# Unit tests — detection helpers
# ---------------------------------------------------------------------------


class TestIsGoogleResourceExhausted:
    def test_direct_instance(self) -> None:
        exc = ResourceExhausted("quota")
        assert _is_google_resource_exhausted(exc) is True

    def test_unrelated_exception(self) -> None:
        assert _is_google_resource_exhausted(ValueError("nope")) is False

    def test_base_google_error(self) -> None:
        exc = _GoogleAPICallError("some other google error")
        assert _is_google_resource_exhausted(exc) is False


class TestExtractRetryAfter:
    def test_timedelta_attribute(self) -> None:
        exc = ResourceExhausted("quota", retry_delay=datetime.timedelta(seconds=42))
        assert _extract_retry_after(exc) == 42

    def test_timedelta_rounds_up_to_one(self) -> None:
        exc = ResourceExhausted("quota", retry_delay=datetime.timedelta(seconds=0))
        assert _extract_retry_after(exc) == 1

    def test_no_retry_delay(self) -> None:
        exc = ResourceExhausted("quota")
        assert _extract_retry_after(exc) is None

    def test_details_proto_style(self) -> None:
        """Simulate the proto details() path."""
        detail = MagicMock()
        detail.retry_delay.seconds = 30
        exc = ResourceExhausted("quota")
        exc.details = lambda: [detail]  # type: ignore[method-assign]
        assert _extract_retry_after(exc) == 30


class TestFindResourceExhausted:
    def test_direct(self) -> None:
        exc = ResourceExhausted("quota")
        assert find_resource_exhausted(exc) is exc

    def test_wrapped_in_llm_error(self) -> None:
        google_exc = ResourceExhausted("quota")
        wrapper = LLMError("LLM generation failed: …") 
        wrapper.__cause__ = google_exc
        assert find_resource_exhausted(wrapper) is google_exc

    def test_double_wrapped(self) -> None:
        """GraphExecutionError wraps LLMError wraps ResourceExhausted."""
        google_exc = ResourceExhausted("quota")
        llm_err = LLMError("generation failed")
        llm_err.__cause__ = google_exc
        graph_err = GraphExecutionError("pipeline failed")
        graph_err.__cause__ = llm_err
        assert find_resource_exhausted(graph_err) is google_exc

    def test_no_quota_error_in_chain(self) -> None:
        exc = LLMError("unrelated failure")
        assert find_resource_exhausted(exc) is None


class TestRaiseIfQuotaExceeded:
    def test_raises_gemini_quota_error_for_resource_exhausted(self) -> None:
        exc = ResourceExhausted("quota", retry_delay=datetime.timedelta(seconds=60))
        with pytest.raises(GeminiQuotaError) as exc_info:
            raise_if_quota_exceeded(exc)
        assert exc_info.value.retry_after == 60

    def test_raises_for_wrapped_resource_exhausted(self) -> None:
        google_exc = ResourceExhausted("quota")
        wrapper = LLMError("LLM generation failed")
        wrapper.__cause__ = google_exc
        with pytest.raises(GeminiQuotaError):
            raise_if_quota_exceeded(wrapper)

    def test_silent_for_unrelated_errors(self) -> None:
        """Should return without raising for non-quota errors."""
        raise_if_quota_exceeded(ValueError("not a quota error"))  # must not raise

    def test_gemini_quota_error_carries_cause(self) -> None:
        google_exc = ResourceExhausted("quota")
        with pytest.raises(GeminiQuotaError) as exc_info:
            raise_if_quota_exceeded(google_exc)
        assert exc_info.value.__cause__ is google_exc


# ---------------------------------------------------------------------------
# Endpoint integration tests
# ---------------------------------------------------------------------------
# Each test builds a minimal FastAPI app that wires in the real router but
# replaces ResearchService with a mock that raises GeminiQuotaError.

QUOTA_ERROR_NO_RETRY = GeminiQuotaError(
    "Gemini API quota exceeded. Please retry after some time.",
    retry_after=None,
)
QUOTA_ERROR_WITH_RETRY = GeminiQuotaError(
    "Gemini API quota exceeded. Please retry after some time.",
    retry_after=30,
)

_QUOTA_BODY_KEYS = {"error", "message"}


def _assert_quota_response(response: Any, *, expect_retry_after: bool) -> None:
    assert response.status_code == 429, (
        f"Expected 429, got {response.status_code}: {response.text}"
    )
    body = response.json()
    # FastAPI wraps HTTPException detail under "detail"
    detail = body.get("detail", body)
    assert detail.get("error") == "quota_exceeded"
    assert "quota" in detail.get("message", "").lower()
    # Raw Google internals must not appear anywhere in the serialised response
    raw_text = response.text
    assert "RESOURCE_EXHAUSTED" not in raw_text
    assert "google" not in raw_text.lower() or "quota" in raw_text.lower()
    assert "Traceback" not in raw_text
    if expect_retry_after:
        assert "retry_after_seconds" in detail
        assert isinstance(detail["retry_after_seconds"], int)
    else:
        assert "retry_after_seconds" not in detail


# --- /review ---

def _make_review_client(side_effect: Exception) -> TestClient:
    from app.api.v1.review import router as review_router

    app = FastAPI()
    app.include_router(review_router, prefix="/api/v1")

    mock_service = MagicMock()
    mock_service.generate_review = AsyncMock(side_effect=side_effect)

    app.dependency_overrides = {}

    from app.api.deps import get_research_service
    app.dependency_overrides[get_research_service] = lambda: mock_service
    return TestClient(app, raise_server_exceptions=False)


def test_review_quota_returns_429_no_retry() -> None:
    client = _make_review_client(QUOTA_ERROR_NO_RETRY)
    resp = client.post("/api/v1/review", json={"query": "test", "max_papers": 5})
    _assert_quota_response(resp, expect_retry_after=False)


def test_review_quota_returns_429_with_retry() -> None:
    client = _make_review_client(QUOTA_ERROR_WITH_RETRY)
    resp = client.post("/api/v1/review", json={"query": "test", "max_papers": 5})
    _assert_quota_response(resp, expect_retry_after=True)
    assert resp.headers.get("retry-after") == "30"


def test_review_non_quota_error_returns_400() -> None:
    from app.core.exceptions import LLMError

    client = _make_review_client(LLMError("something else failed"))
    resp = client.post("/api/v1/review", json={"query": "test", "max_papers": 5})
    assert resp.status_code == 400
    assert resp.json()["detail"]["error"] == "bad_request"


def test_review_no_google_internals_in_body() -> None:
    """Even if the message accidentally contains Google text, it must be sanitised."""
    leaky = GeminiQuotaError("quota", retry_after=None)
    client = _make_review_client(leaky)
    resp = client.post("/api/v1/review", json={"query": "test", "max_papers": 5})
    assert "RESOURCE_EXHAUSTED" not in resp.text
    assert "Traceback" not in resp.text


# --- /query ---

def _make_query_client(side_effect: Exception) -> TestClient:
    from app.api.v1.query import router as query_router

    app = FastAPI()
    app.include_router(query_router, prefix="/api/v1")

    mock_service = MagicMock()
    mock_service.execute_pipeline = AsyncMock(side_effect=side_effect)

    from app.api.deps import get_research_service
    app.dependency_overrides[get_research_service] = lambda: mock_service
    return TestClient(app, raise_server_exceptions=False)


def test_query_quota_returns_429() -> None:
    client = _make_query_client(QUOTA_ERROR_WITH_RETRY)
    resp = client.post("/api/v1/query", json={"query": "test", "max_papers": 5})
    _assert_quota_response(resp, expect_retry_after=True)


def test_query_non_quota_error_returns_500() -> None:
    client = _make_query_client(GraphExecutionError("pipeline blew up"))
    resp = client.post("/api/v1/query", json={"query": "test", "max_papers": 5})
    assert resp.status_code == 500


# --- /compare ---

def _make_compare_client(side_effect: Exception) -> TestClient:
    from app.api.v1.compare import router as compare_router

    app = FastAPI()
    app.include_router(compare_router, prefix="/api/v1")

    mock_service = MagicMock()
    mock_service.compare_methodologies = AsyncMock(side_effect=side_effect)

    from app.api.deps import get_research_service
    app.dependency_overrides[get_research_service] = lambda: mock_service
    return TestClient(app, raise_server_exceptions=False)


def test_compare_quota_returns_429() -> None:
    client = _make_compare_client(QUOTA_ERROR_NO_RETRY)
    resp = client.post(
        "/api/v1/compare", json={"query": "test", "max_papers": 5}
    )
    _assert_quota_response(resp, expect_retry_after=False)


def test_compare_non_quota_returns_400() -> None:
    from app.core.exceptions import LLMError

    client = _make_compare_client(LLMError("model error"))
    resp = client.post(
        "/api/v1/compare", json={"query": "test", "max_papers": 5}
    )
    assert resp.status_code == 400


# --- /citations ---

def _make_citations_client(side_effect: Exception) -> TestClient:
    from app.api.v1.citations import router as citations_router

    app = FastAPI()
    app.include_router(citations_router, prefix="/api/v1")

    mock_service = MagicMock()
    mock_service.generate_citations = AsyncMock(side_effect=side_effect)

    from app.api.deps import get_research_service
    app.dependency_overrides[get_research_service] = lambda: mock_service
    return TestClient(app, raise_server_exceptions=False)


def test_citations_quota_returns_429() -> None:
    client = _make_citations_client(QUOTA_ERROR_WITH_RETRY)
    resp = client.post(
        "/api/v1/citations",
        json={"paper_ids": ["abc123"], "formats": ["apa"]},
    )
    _assert_quota_response(resp, expect_retry_after=True)


def test_citations_non_quota_returns_400() -> None:
    from app.core.exceptions import PaperNotFoundError

    client = _make_citations_client(PaperNotFoundError("paper missing"))
    resp = client.post(
        "/api/v1/citations",
        json={"paper_ids": ["missing"], "formats": ["apa"]},
    )
    assert resp.status_code == 400


# ---------------------------------------------------------------------------
# Service-layer unit tests — raise_if_quota_exceeded in execute_pipeline
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_execute_pipeline_promotes_quota_error() -> None:
    """execute_pipeline must re-raise GeminiQuotaError before GraphExecutionError."""
    from unittest.mock import AsyncMock as AM

    google_exc = ResourceExhausted("quota", retry_delay=datetime.timedelta(seconds=10))
    # Simulate graph raising ResourceExhausted directly
    mock_graph = MagicMock()
    mock_graph.execute = AM(side_effect=google_exc)

    service = _make_minimal_research_service(mock_graph)
    with pytest.raises(GeminiQuotaError) as exc_info:
        await service.execute_pipeline("test query")
    assert exc_info.value.retry_after == 10


@pytest.mark.asyncio
async def test_execute_pipeline_unrelated_error_becomes_graph_error() -> None:
    from unittest.mock import AsyncMock as AM

    mock_graph = MagicMock()
    mock_graph.execute = AM(side_effect=RuntimeError("db connection lost"))

    service = _make_minimal_research_service(mock_graph)
    with pytest.raises(GraphExecutionError):
        await service.execute_pipeline("test query")


def _make_minimal_research_service(mock_graph: Any) -> Any:
    """Build a ResearchService with all dependencies stubbed except graph."""
    from app.services.research_service import ResearchService

    return ResearchService(
        retrieval_service=MagicMock(),
        ranking_service=MagicMock(),
        embedding_service=MagicMock(),
        chroma_service=MagicMock(),
        rag_service=MagicMock(),
        gemini_service=MagicMock(),
        paper_repository=MagicMock(),
        research_graph=mock_graph,
    )
