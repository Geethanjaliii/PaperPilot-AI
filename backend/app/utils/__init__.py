"""Utility helpers."""

import hashlib
import re
from typing import Optional


def normalize_title(title: str) -> str:
    return re.sub(r"\s+", " ", title.strip().lower())


def paper_dedup_key(title: str, year: Optional[int] = None) -> str:
    normalized = normalize_title(title)
    return hashlib.md5(f"{normalized}:{year or ''}".encode()).hexdigest()


def truncate_text(text: str, max_length: int = 2000) -> str:
    if len(text) <= max_length:
        return text
    return text[: max_length - 3] + "..."


def format_authors_list(authors: list[str]) -> str:
    if not authors:
        return "Unknown"
    if len(authors) <= 3:
        return ", ".join(authors)
    return f"{', '.join(authors[:3])}, et al."


def parse_year(value: Optional[str | int]) -> Optional[int]:
    if value is None:
        return None
    if isinstance(value, int):
        return value
    match = re.search(r"\d{4}", str(value))
    return int(match.group()) if match else None
