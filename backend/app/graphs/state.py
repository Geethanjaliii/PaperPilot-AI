"""LangGraph workflow state definition."""

from typing import Any, Optional, TypedDict

from app.models.paper import Paper
from app.schemas.citation import FormattedCitation


class ResearchState(TypedDict, total=False):
    query: str
    plan: dict[str, Any]
    papers: list[Paper]
    ranked_papers: list[Paper]
    retrieved_context: str
    summary: str
    literature_review: str
    research_gaps: str
    methodology_comparison: str
    citations: list[FormattedCitation]
    max_papers: int
    error: Optional[str]
