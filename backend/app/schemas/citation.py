from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.paper import PaperResponse


class CitationRequest(BaseModel):
    paper_ids: list[str] = Field(..., min_length=1)
    formats: list[Literal["apa", "ieee", "bibtex"]] = Field(
        default=["apa", "ieee", "bibtex"],
        description="Supported formats: apa, ieee, bibtex",
    )


class FormattedCitation(BaseModel):
    paper_id: str
    title: str
    apa: str = ""
    ieee: str = ""
    bibtex: str = ""


class CitationResponse(BaseModel):
    citations: list[FormattedCitation]
    papers: list[PaperResponse]
