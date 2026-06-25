"""Paper to schema conversion utilities."""

from app.models.paper import Paper
from app.schemas.paper import PaperResponse


def paper_to_response(paper: Paper) -> PaperResponse:
    return PaperResponse(
        id=paper.id,
        title=paper.title,
        authors=paper.authors,
        abstract=paper.abstract,
        year=paper.year,
        venue=paper.venue,
        citation_count=paper.citation_count,
        url=paper.url,
        source=paper.source,
    )


def papers_to_responses(papers: list[Paper]) -> list[PaperResponse]:
    return [paper_to_response(p) for p in papers]
