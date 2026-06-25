"""Google Gemini LLM service."""

import json
import asyncio
from typing import Any, Optional

import httpx
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage

from app.core.config import Settings
from app.api.quota import find_resource_exhausted, _extract_retry_after
from app.core.exceptions import LLMError, GeminiQuotaError
from app.core.logging import get_logger
from app.models.paper import Paper
from app.prompts import (
    CITATION_APA,
    CITATION_BIBTEX,
    CITATION_IEEE,
    LITERATURE_REVIEW,
    METHODOLOGY_COMPARISON,
    PAPER_SUMMARIZATION,
    PLANNER_SYSTEM,
    RESEARCH_GAP_IDENTIFICATION,
)
from app.utils import format_authors_list, truncate_text

logger = get_logger(__name__)


def _is_transient_error(exc: BaseException) -> bool:
    # 1. Google API core exceptions
    try:
        from google.api_core.exceptions import ServiceUnavailable, DeadlineExceeded, ResourceExhausted
        if isinstance(exc, (ServiceUnavailable, DeadlineExceeded, ResourceExhausted)):
            return True
    except ImportError:
        pass

    # 2. gRPC status codes
    grpc_code = getattr(exc, "grpc_status_code", None)
    if grpc_code is not None:
        try:
            import grpc
            if grpc_code in (
                grpc.StatusCode.RESOURCE_EXHAUSTED,
                grpc.StatusCode.UNAVAILABLE,
                grpc.StatusCode.DEADLINE_EXCEEDED,
            ):
                return True
        except ImportError:
            pass

    # 3. HTTPX timeouts/network errors
    if isinstance(exc, (httpx.TimeoutException, httpx.NetworkError)):
        return True

    # 4. Message pattern matches
    msg = str(exc).lower()
    if any(
        phrase in msg
        for phrase in [
            "resource_exhausted",
            "429",
            "quota",
            "temporarily unavailable",
            "service unavailable",
            "503",
            "deadline exceeded",
            "timeout",
        ]
    ):
        return True

    return False


class GeminiService:
    """LLM service using Google Gemini 2.5 Flash."""

    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._llm: Optional[ChatGoogleGenerativeAI] = None

    def _get_llm(self) -> ChatGoogleGenerativeAI:
        if self._llm is None:
            if not self._settings.has_google_api_key:
                raise LLMError(
                    "GOOGLE_API_KEY is not configured. "
                    "Set it in backend/.env to use Gemini-powered endpoints."
                )
            logger.info("Initializing Gemini client (model=%s)", self._settings.gemini_model)
            self._llm = ChatGoogleGenerativeAI(
                model=self._settings.gemini_model,
                google_api_key=self._settings.google_api_key,
                temperature=0.3,
            )
        return self._llm

    async def _invoke(self, system: str, human: str) -> str:
        max_attempts = 3
        for attempt in range(max_attempts):
            try:
                llm = self._get_llm()
                messages = [
                    SystemMessage(content=system),
                    HumanMessage(content=human),
                ]
                response = await llm.ainvoke(messages)
                content = response.content
                if isinstance(content, list):
                    return " ".join(str(part) for part in content)
                return str(content)
            except Exception as exc:
                if _is_transient_error(exc) and attempt < max_attempts - 1:
                    wait = 2 ** attempt
                    logger.warning(
                        "Gemini call encountered transient error (%s); retrying in %ds (attempt %d/%d)",
                        type(exc).__name__,
                        wait,
                        attempt + 1,
                        max_attempts,
                    )
                    await asyncio.sleep(wait)
                    continue

                # Check if it is a quota or transient error to promote to GeminiQuotaError
                google_exc = find_resource_exhausted(exc)
                if google_exc is not None:
                    retry_after = _extract_retry_after(google_exc)
                    raise GeminiQuotaError(
                        "Gemini API quota exceeded. Please retry after some time.",
                        retry_after=retry_after,
                    ) from exc

                if _is_transient_error(exc):
                    raise GeminiQuotaError(
                        "Gemini service is temporarily unavailable. Please retry after some time.",
                        retry_after=10,
                    ) from exc

                logger.exception("Gemini invocation failed with non-transient error")
                raise LLMError(f"LLM generation failed: {exc}") from exc

    async def plan_research(self, query: str) -> dict[str, Any]:
        human = f"Research query: {query}\n\nReturn valid JSON only."
        raw = await self._invoke(PLANNER_SYSTEM, human)
        return self._parse_json_response(raw, query)

    def _parse_json_response(self, raw: str, query: str) -> dict[str, Any]:
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[-1]
            cleaned = cleaned.rsplit("```", 1)[0]

        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            logger.warning("Failed to parse planner JSON, using defaults")
            return {
                "search_queries": [query],
                "focus_areas": [query],
                "methodology_keywords": [],
                "review_scope": query,
            }

    async def summarize_paper(self, paper: Paper) -> str:
        prompt = PAPER_SUMMARIZATION.format(
            title=paper.title,
            authors=format_authors_list(paper.authors),
            abstract=truncate_text(paper.abstract),
        )
        return await self._invoke(
            "You are an academic paper summarization expert.",
            prompt,
        )

    async def generate_literature_review(self, query: str, context: str) -> str:
        prompt = LITERATURE_REVIEW.format(
            query=query,
            context=truncate_text(context, 8000),
        )
        return await self._invoke(
            "You are an expert academic researcher.",
            prompt,
        )

    async def identify_research_gaps(
        self, query: str, literature_review: str, context: str
    ) -> str:
        prompt = RESEARCH_GAP_IDENTIFICATION.format(
            query=query,
            literature_review=literature_review,
            context=truncate_text(context, 4000),
        )
        return await self._invoke(
            "You are a research gap analysis expert.",
            prompt,
        )

    async def compare_methodologies(self, query: str, context: str) -> str:
        prompt = METHODOLOGY_COMPARISON.format(
            query=query,
            context=truncate_text(context, 8000),
        )
        return await self._invoke(
            "You are a methodology comparison expert.",
            prompt,
        )

    async def format_citation_apa(self, paper: Paper) -> str:
        prompt = CITATION_APA.format(
            title=paper.title,
            authors=format_authors_list(paper.authors),
            year=paper.year or "n.d.",
            venue=paper.venue or "Unknown",
            url=paper.url,
        )
        return await self._invoke("You format APA citations.", prompt)

    async def format_citation_ieee(self, paper: Paper) -> str:
        prompt = CITATION_IEEE.format(
            title=paper.title,
            authors=format_authors_list(paper.authors),
            year=paper.year or "n.d.",
            venue=paper.venue or "Unknown",
            url=paper.url,
        )
        return await self._invoke("You format IEEE citations.", prompt)

    async def format_citation_bibtex(self, paper: Paper) -> str:
        prompt = CITATION_BIBTEX.format(
            title=paper.title,
            authors=" and ".join(paper.authors) if paper.authors else "Unknown",
            year=paper.year or "",
            venue=paper.venue or "",
            url=paper.url,
            paper_id=paper.id,
        )
        return await self._invoke("You generate BibTeX entries.", prompt)

    async def summarize_papers_batch(self, papers: list[Paper]) -> str:
        if not papers:
            return "No papers available for summarization."
        summaries = []
        for paper in papers[:5]:
            summary = await self.summarize_paper(paper)
            summaries.append(f"**{paper.title}**: {summary}")
        return "\n\n".join(summaries)