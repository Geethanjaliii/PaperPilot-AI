"""Domain model for academic papers."""

from enum import Enum
from typing import Optional
from uuid import uuid4

from pydantic import BaseModel, Field


class PaperSource(str, Enum):
    ARXIV = "arxiv"
    SEMANTIC_SCHOLAR = "semantic_scholar"
    INTERNAL = "internal"


class Paper(BaseModel):
    """Normalized academic paper representation."""

    id: str = Field(default_factory=lambda: str(uuid4()))
    title: str
    authors: list[str] = Field(default_factory=list)
    abstract: str = ""
    year: Optional[int] = None
    venue: str = ""
    citation_count: int = 0
    url: str = ""
    source: PaperSource = PaperSource.INTERNAL
    arxiv_id: Optional[str] = None
    semantic_scholar_id: Optional[str] = None

    def embedding_text(self) -> str:
        return f"{self.title}\n\n{self.abstract}"
