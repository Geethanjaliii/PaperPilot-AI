"""Data access layer for papers using SQLite."""

import json
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Optional

from app.core.logging import get_logger
from app.models.paper import Paper

logger = get_logger(__name__)


class PaperRepository:
    """Paper store backed by an SQLite database for process safety and concurrency."""

    def __init__(self, persist_path: Path | str, legacy_json_path: Path | str | None = None) -> None:
        path = Path(persist_path)
        if path.suffix == ".json":
            self._db_path = path.with_suffix(".db")
            self._legacy_json_path = path
        else:
            self._db_path = path
            self._legacy_json_path = Path(legacy_json_path) if legacy_json_path else None

        self._db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()
        self._import_legacy_json()

    @contextmanager
    def _connection(self):
        conn = sqlite3.connect(str(self._db_path), timeout=30.0)
        # Enable WAL mode for high concurrency
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.execute("PRAGMA synchronous=NORMAL;")
        try:
            yield conn
        finally:
            conn.close()

    def _init_db(self) -> None:
        with self._connection() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS papers (
                    id TEXT PRIMARY KEY,
                    title TEXT,
                    year INTEGER,
                    arxiv_id TEXT,
                    semantic_scholar_id TEXT,
                    data TEXT
                )
            """)
            conn.commit()
        logger.info("Initialized SQLite paper database at %s", self._db_path)

    def _import_legacy_json(self) -> None:
        if not self._legacy_json_path or not self._legacy_json_path.exists():
            return
        try:
            logger.info("Migrating legacy papers cache from %s to SQLite", self._legacy_json_path)
            raw = json.loads(self._legacy_json_path.read_text(encoding="utf-8"))
            papers = []
            for item in raw:
                try:
                    paper = Paper.model_validate(item)
                    papers.append(paper)
                except Exception as e:
                    logger.warning("Failed to validate legacy paper item during migration: %s", e)
            if papers:
                self.save_many(papers)
            logger.info("Successfully migrated %d papers from legacy cache", len(papers))
            
            # Rename legacy file to prevent re-migrating on next startups
            converted_path = self._legacy_json_path.with_suffix(".json.converted")
            self._legacy_json_path.rename(converted_path)
            logger.info("Renamed legacy cache to %s", converted_path)
        except Exception:
            logger.exception("Failed to migrate legacy papers cache from %s", self._legacy_json_path)

    def save(self, paper: Paper) -> Paper:
        with self._connection() as conn:
            conn.execute(
                "INSERT OR REPLACE INTO papers (id, title, year, arxiv_id, semantic_scholar_id, data) VALUES (?, ?, ?, ?, ?, ?)",
                (
                    paper.id,
                    paper.title,
                    paper.year,
                    paper.arxiv_id,
                    paper.semantic_scholar_id,
                    paper.model_dump_json(),
                ),
            )
            conn.commit()
        return paper

    def save_many(self, papers: list[Paper]) -> list[Paper]:
        if not papers:
            return papers
        with self._connection() as conn:
            conn.executemany(
                "INSERT OR REPLACE INTO papers (id, title, year, arxiv_id, semantic_scholar_id, data) VALUES (?, ?, ?, ?, ?, ?)",
                [
                    (
                        p.id,
                        p.title,
                        p.year,
                        p.arxiv_id,
                        p.semantic_scholar_id,
                        p.model_dump_json(),
                    )
                    for p in papers
                ],
            )
            conn.commit()
        return papers

    def get(self, paper_id: str) -> Optional[Paper]:
        with self._connection() as conn:
            cursor = conn.execute("SELECT data FROM papers WHERE id = ?", (paper_id,))
            row = cursor.fetchone()
            if row:
                return Paper.model_validate_json(row[0])
        return None

    def get_many(self, paper_ids: list[str]) -> list[Paper]:
        if not paper_ids:
            return []
        placeholders = ",".join("?" for _ in paper_ids)
        with self._connection() as conn:
            cursor = conn.execute(
                f"SELECT data FROM papers WHERE id IN ({placeholders})",
                tuple(paper_ids),
            )
            rows = cursor.fetchall()
            papers = [Paper.model_validate_json(r[0]) for r in rows]
            paper_map = {p.id: p for p in papers}
            return [paper_map[pid] for pid in paper_ids if pid in paper_map]

    def list_all(self) -> list[Paper]:
        with self._connection() as conn:
            cursor = conn.execute("SELECT data FROM papers")
            rows = cursor.fetchall()
            return [Paper.model_validate_json(r[0]) for r in rows]

    def count(self) -> int:
        with self._connection() as conn:
            cursor = conn.execute("SELECT COUNT(*) FROM papers")
            return cursor.fetchone()[0]

    def exists(self, paper_id: str) -> bool:
        with self._connection() as conn:
            cursor = conn.execute("SELECT 1 FROM papers WHERE id = ?", (paper_id,))
            return cursor.fetchone() is not None

    def check_health(self) -> bool:
        try:
            with self._connection() as conn:
                cursor = conn.execute("SELECT 1")
                return cursor.fetchone() is not None
        except Exception:
            return False
