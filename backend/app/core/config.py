"""Application configuration loaded from environment variables."""

from functools import lru_cache
from pathlib import Path

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE = BACKEND_DIR / ".env"


class Settings(BaseSettings):
    """Central application settings."""

    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE) if ENV_FILE.exists() else None,
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = "PaperPilot AI"
    app_version: str = "1.0.0"
    debug: bool = False
    api_v1_prefix: str = "/api/v1"

    google_api_key: str = Field(
        default="",
        validation_alias=AliasChoices("GOOGLE_API_KEY", "GEMINI_API_KEY", "google_api_key"),
    )
    gemini_model: str = "gemini-2.5-flash"

    embedding_model: str = "all-MiniLM-L6-v2"
    chroma_persist_dir: str = "./data/chroma"
    chroma_collection_name: str = "papers"
    papers_cache_path: str = "./data/papers_cache.json"
    papers_db_path: str = "./data/papers.db"

    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]
    cors_allow_credentials: bool = True

    arxiv_max_results: int = 10
    semantic_scholar_max_results: int = 10
    semantic_scholar_api_key: str = ""

    rag_top_k: int = 5
    max_papers_per_query: int = 20

    log_level: str = "INFO"

    @property
    def env_file_path(self) -> Path:
        return ENV_FILE

    @property
    def env_file_exists(self) -> bool:
        return ENV_FILE.exists()

    @property
    def has_google_api_key(self) -> bool:
        return bool(self.google_api_key.strip())

    @property
    def has_gemini_api_key(self) -> bool:
        """Alias for has_google_api_key (GEMINI_API_KEY or GOOGLE_API_KEY)."""
        return self.has_google_api_key

    @property
    def chroma_path(self) -> Path:
        return Path(self.chroma_persist_dir)

    @property
    def papers_cache_file(self) -> Path:
        return Path(self.papers_cache_path)

    @property
    def papers_db_file(self) -> Path:
        return Path(self.papers_db_path)

    def require_google_api_key(self) -> None:
        if not self.has_google_api_key:
            raise ValueError(
                "GOOGLE_API_KEY is not configured. "
                f"Create {ENV_FILE} from .env.example and set GOOGLE_API_KEY."
            )


@lru_cache
def get_settings() -> Settings:
    return Settings()
