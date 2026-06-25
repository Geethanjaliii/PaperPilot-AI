"""arXiv API paper retrieval service."""

import asyncio
import uuid
from typing import Optional
from xml.etree import ElementTree

import httpx

from app.core.config import Settings
from app.core.exceptions import RetrievalError
from app.core.logging import get_logger
from app.models.paper import Paper, PaperSource
from app.utils import parse_year, paper_dedup_key

logger = get_logger(__name__)

ARXIV_API_URL = "https://export.arxiv.org/api/query"
ATOM_NS = {"atom": "http://www.w3.org/2005/Atom", "arxiv": "http://arxiv.org/schemas/atom"}


class ArxivService:
    """Search and fetch papers from the arXiv API."""

    def __init__(self, settings: Settings, http_client: Optional[any] = None) -> None:
        self._settings = settings
        self._max_results = settings.arxiv_max_results
        self._http_client = http_client

    def _get_client(self) -> Optional[httpx.AsyncClient]:
        if callable(self._http_client):
            return self._http_client()
        return self._http_client

    async def search(self, query: str, max_results: Optional[int] = None) -> list[Paper]:
        limit = max_results or self._max_results
        params = {
            "search_query": f"all:{query}",
            "start": 0,
            "max_results": limit,
            "sortBy": "relevance",
            "sortOrder": "descending",
        }

        client = self._get_client()
        try:
            if client and not client.is_closed:
                response = await client.get(ARXIV_API_URL, params=params)
                response.raise_for_status()
                return self._parse_feed(response.text)
            else:
                async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
                    response = await client.get(ARXIV_API_URL, params=params)
                    response.raise_for_status()
                    return self._parse_feed(response.text)
        except httpx.HTTPError as exc:
            logger.exception("arXiv API request failed")
            raise RetrievalError(f"arXiv search failed: {exc}") from exc

    def _parse_feed(self, xml_content: str) -> list[Paper]:
        try:
            root = ElementTree.fromstring(xml_content)
        except ElementTree.ParseError as exc:
            logger.exception("Failed to parse XML response from arXiv")
            raise RetrievalError(f"arXiv search returned malformed XML: {exc}") from exc

        papers: list[Paper] = []

        for entry in root.findall("atom:entry", ATOM_NS):
            title = (entry.findtext("atom:title", default="", namespaces=ATOM_NS) or "").strip()
            abstract = (
                entry.findtext("atom:summary", default="", namespaces=ATOM_NS) or ""
            ).strip()
            authors = [
                author.findtext("atom:name", default="", namespaces=ATOM_NS) or ""
                for author in entry.findall("atom:author", ATOM_NS)
            ]
            authors = [a for a in authors if a]

            published = entry.findtext("atom:published", default="", namespaces=ATOM_NS)
            year = parse_year(published[:4] if published else None)

            arxiv_id = (entry.findtext("atom:id", default="", namespaces=ATOM_NS) or "").split(
                "/abs/"
            )[-1]
            url = f"https://arxiv.org/abs/{arxiv_id}" if arxiv_id else ""

            # Generate deterministic paper ID using uuid5 and stable metadata
            dedup_key = paper_dedup_key(title, year)
            paper_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, dedup_key))

            papers.append(
                Paper(
                    id=paper_id,
                    title=title.replace("\n", " "),
                    authors=authors,
                    abstract=abstract.replace("\n", " "),
                    year=year,
                    venue="arXiv",
                    citation_count=0,
                    url=url,
                    source=PaperSource.ARXIV,
                    arxiv_id=arxiv_id,
                )
            )

        logger.info("Retrieved %d papers from arXiv for query", len(papers))
        return papers

    async def search_batch(self, queries: list[str], max_results: Optional[int] = None) -> list[Paper]:
        tasks = [self.search(q, max_results) for q in queries]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        papers: list[Paper] = []
        for result in results:
            if isinstance(result, Exception):
                logger.warning("Batch arXiv search error: %s", result)
                continue
            papers.extend(result)
        return papers
