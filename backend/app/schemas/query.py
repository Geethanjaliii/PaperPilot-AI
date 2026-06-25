"""Full pipeline query API schemas."""

from pydantic import BaseModel, Field

from app.schemas.citation import FormattedCitation
from app.schemas.paper import PaperResponse


class QueryRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=500)
    max_papers: int = Field(default=10, ge=1, le=30)


class QueryResponse(BaseModel):
    query: str
    papers: list[PaperResponse]
    summary: str
    literature_review: str
    comparison: str
    citations: list[FormattedCitation]
