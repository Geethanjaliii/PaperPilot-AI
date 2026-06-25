"""Semantic Scholar API paper retrieval service."""

import asyncio
import uuid
from typing import Any, Optional

import httpx
from httpx import HTTPStatusError

from app.core.config import Settings
from app.core.exceptions import RetrievalError
from app.core.logging import get_logger
from app.models.paper import Paper, PaperSource
from app.utils import parse_year, paper_dedup_key

logger = get_logger(__name__)

SEMANTIC_SCHOLAR_API_URL = "https://api.semanticscholar.org/graph/v1/paper/search"


class SemanticScholarService:
    """Search papers via the Semantic Scholar API."""

    def __init__(self, settings: Settings, http_client: Optional[Any] = None) -> None:
        self._settings = settings
        self._max_results = settings.semantic_scholar_max_results
        self._api_key = settings.semantic_scholar_api_key
        self._http_client = http_client

    def _headers(self) -> dict[str, str]:
        headers = {"Accept": "application/json"}
        if self._api_key:
            headers["x-api-key"] = self._api_key
        return headers

    def _get_client(self) -> Optional[httpx.AsyncClient]:
        if callable(self._http_client):
            return self._http_client()
        return self._http_client

    async def search(self, query: str, max_results: Optional[int] = None) -> list[Paper]:
        limit = max_results or self._max_results
        params = {
            "query": query,
            "limit": limit,
            "fields": "title,authors,abstract,year,venue,citationCount,url,paperId,externalIds",
        }

        max_attempts = 3
        last_exc: Exception | None = None

        for attempt in range(max_attempts):
            client = self._get_client()
            try:
                if client and not client.is_closed:
                    response = await client.get(
                        SEMANTIC_SCHOLAR_API_URL,
                        params=params,
                        headers=self._headers(),
                    )
                else:
                    async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
                        response = await client.get(
                            SEMANTIC_SCHOLAR_API_URL,
                            params=params,
                            headers=self._headers(),
                        )
                
                response.raise_for_status()
                
                try:
                    data = response.json()
                except ValueError as exc:
                    logger.exception("Failed to parse JSON response from Semantic Scholar")
                    raise RetrievalError(f"Semantic Scholar search returned invalid JSON: {exc}") from exc
                
                return self._parse_results(data.get("data", []))
                
            except HTTPStatusError as exc:
                last_exc = exc
                if exc.response.status_code == 429 and attempt < max_attempts - 1:
                    wait = 2 ** attempt
                    logger.warning(
                        "Semantic Scholar rate limited (429); retrying in %ds (attempt %d/%d)",
                        wait,
                        attempt + 1,
                        max_attempts,
                    )
                    await asyncio.sleep(wait)
                    continue
                logger.exception("Semantic Scholar API request failed with status code %d", exc.response.status_code)
                raise RetrievalError(f"Semantic Scholar search failed: {exc}") from exc
                
            except httpx.HTTPError as exc:
                last_exc = exc
                if attempt < max_attempts - 1:
                    wait = 2 ** attempt
                    logger.warning(
                        "Semantic Scholar network error (%s); retrying in %ds (attempt %d/%d)",
                        type(exc).__name__,
                        wait,
                        attempt + 1,
                        max_attempts,
                    )
                    await asyncio.sleep(wait)
                    continue
                logger.exception("Semantic Scholar API request failed due to network error")
                raise RetrievalError(f"Semantic Scholar search failed: {exc}") from exc

        raise RetrievalError(f"Semantic Scholar search failed: {last_exc}")

    def _parse_results(self, items: list[dict[str, Any]]) -> list[Paper]:
        papers: list[Paper] = []
        for item in items:
            authors = [
                a.get("name", "")
                for a in item.get("authors", [])
                if a.get("name")
            ]
            external_ids = item.get("externalIds") or {}
            arxiv_id = external_ids.get("ArXiv")

            title = item.get("title") or "Untitled"
            year = parse_year(item.get("year"))

            # Generate deterministic paper ID using uuid5 and stable metadata
            dedup_key = paper_dedup_key(title, year)
            paper_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, dedup_key))

            papers.append(
                Paper(
                    id=paper_id,
                    title=title,
                    authors=authors,
                    abstract=item.get("abstract") or "",
                    year=year,
                    venue=item.get("venue") or "",
                    citation_count=item.get("citationCount") or 0,
                    url=item.get("url") or "",
                    source=PaperSource.SEMANTIC_SCHOLAR,
                    semantic_scholar_id=item.get("paperId"),
                    arxiv_id=arxiv_id,
                )
            )

        logger.info("Retrieved %d papers from Semantic Scholar", len(papers))
        return papers

    async def search_batch(self, queries: list[str], max_results: Optional[int] = None) -> list[Paper]:
        tasks = [self.search(q, max_results) for q in queries]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        papers: list[Paper] = []
        for result in results:
            if isinstance(result, Exception):
                logger.warning("Batch Semantic Scholar search error: %s", result)
                continue
            papers.extend(result)
        return papers
