"""Paper-related API schemas."""

from typing import Optional

from pydantic import BaseModel, Field

from app.models.paper import PaperSource


class PaperResponse(BaseModel):
    id: str
    title: str
    authors: list[str]
    abstract: str
    year: Optional[int] = None
    venue: str = ""
    citation_count: int = 0
    url: str = ""
    source: PaperSource


class PaperListResponse(BaseModel):
    papers: list[PaperResponse]
    total: int


class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=500)
    max_results: int = Field(default=10, ge=1, le=50)
    sources: list[PaperSource] = Field(
        default=[PaperSource.ARXIV, PaperSource.SEMANTIC_SCHOLAR]
    )


class SearchResponse(BaseModel):
    query: str
    papers: list[PaperResponse]
    total: int
