"""Paper ranking service."""

from app.core.logging import get_logger
from app.models.paper import Paper

logger = get_logger(__name__)


class RankingService:
    """Rank papers by relevance heuristics and citation impact."""

    def rank(self, query: str, papers: list[Paper], limit: int = 10) -> list[Paper]:
        if not papers:
            return []

        query_terms = set(query.lower().split())
        scored: list[tuple[float, Paper]] = []

        for paper in papers:
            score = self._score_paper(paper, query_terms)
            scored.append((score, paper))

        scored.sort(key=lambda x: x[0], reverse=True)
        ranked = [p for _, p in scored[:limit]]
        logger.info("Ranked %d papers for query '%s'", len(ranked), query[:50])
        return ranked

    def _score_paper(self, paper: Paper, query_terms: set[str]) -> float:
        text = f"{paper.title} {paper.abstract}".lower()
        text_terms = set(text.split())

        overlap = len(query_terms & text_terms)
        term_score = overlap / max(len(query_terms), 1)

        citation_score = min(paper.citation_count / 100.0, 1.0)
        recency_score = 0.0
        if paper.year:
            recency_score = min((paper.year - 2000) / 25.0, 1.0)

        title_bonus = sum(1 for t in query_terms if t in paper.title.lower()) * 0.1

        return (term_score * 0.5) + (citation_score * 0.25) + (recency_score * 0.15) + title_bonus
