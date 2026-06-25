"""Citation generation agent node."""

import asyncio
from typing import Any

from app.core.logging import get_logger
from app.graphs.state import ResearchState
from app.schemas.citation import FormattedCitation
from app.services.gemini_service import GeminiService

logger = get_logger(__name__)


class CitationAgent:
    def __init__(self, gemini_service: GeminiService) -> None:
        self._gemini = gemini_service

    async def run(self, state: ResearchState) -> dict[str, Any]:
        papers = state.get("ranked_papers", [])
        logger.info("Citation agent formatting %d papers", len(papers))

        citations: list[FormattedCitation] = []
        for paper in papers:
            apa, ieee, bibtex = await asyncio.gather(
                self._gemini.format_citation_apa(paper),
                self._gemini.format_citation_ieee(paper),
                self._gemini.format_citation_bibtex(paper),
            )
            citations.append(
                FormattedCitation(
                    paper_id=paper.id,
                    title=paper.title,
                    apa=apa.strip(),
                    ieee=ieee.strip(),
                    bibtex=bibtex.strip(),
                )
            )

        return {"citations": citations}
