"""Literature review API schemas."""

from pydantic import BaseModel, Field

from app.schemas.paper import PaperResponse


class ReviewRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=500)
    paper_ids: list[str] = Field(default_factory=list)
    max_papers: int = Field(default=10, ge=1, le=30)


class ReviewResponse(BaseModel):
    query: str
    literature_review: str
    research_gaps: str
    papers: list[PaperResponse]
