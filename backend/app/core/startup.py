"""Startup configuration validation."""

from app.core.config import Settings
from app.core.logging import get_logger

logger = get_logger(__name__)


def validate_settings(settings: Settings) -> dict[str, object]:
    """Validate configuration and return a startup report."""
    report: dict[str, object] = {
        "env_file_exists": settings.env_file_exists,
        "google_api_key_configured": settings.has_google_api_key,
        "semantic_scholar_api_key_configured": bool(settings.semantic_scholar_api_key),
        "warnings": [],
        "errors": [],
    }

    if not settings.env_file_exists:
        report["warnings"].append(
            f"No .env file found at {settings.env_file_path}. "
            "Copy .env.example to .env and set GOOGLE_API_KEY for LLM endpoints."
        )

    if not settings.has_google_api_key:
        report["warnings"].append(
            "GOOGLE_API_KEY is not set. Search and paper listing will work, "
            "but /query, /review, /compare, and /citations require Gemini."
        )

    for warning in report["warnings"]:
        logger.warning(warning)

    for error in report["errors"]:
        logger.error(error)

    logger.info(
        "Startup config: env_file=%s google_api_key=%s chroma_dir=%s",
        settings.env_file_exists,
        settings.has_google_api_key,
        settings.chroma_persist_dir,
    )
    return report
