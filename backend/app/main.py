"""FastAPI application factory."""

import sys
import traceback
from contextlib import asynccontextmanager
from pathlib import Path
from typing import AsyncIterator

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.logging import get_logger, setup_logging
from app.core.startup import validate_settings

setup_logging()
logger = get_logger(__name__)


def _load_application_modules() -> tuple:
    """Import application modules with detailed startup error reporting."""
    try:
        from app.api.v1 import api_router
        from app.core.config import get_settings
        from app.core.exceptions import PaperPilotError

        return api_router, get_settings, PaperPilotError
    except Exception:
        logger.critical("Failed to import application modules during startup")
        logger.critical(traceback.format_exc())
        raise


api_router, get_settings, PaperPilotError = _load_application_modules()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    settings = get_settings()
    env_path = settings.env_file_path
    logger.info("Starting %s v%s", settings.app_name, settings.app_version)
    logger.info("Environment file: %s (exists=%s)", env_path, settings.env_file_exists)
    logger.info("Gemini model: %s", settings.gemini_model)
    logger.info("Chroma persist dir: %s", settings.chroma_persist_dir)
    validate_settings(settings)

    # Warm up SentenceTransformer model at startup to prevent blocking first requests
    try:
        from app.api.deps import get_embedding_service
        logger.info("Pre-warming embedding model...")
        _ = get_embedding_service().model
        logger.info("Embedding model pre-warmed successfully.")
    except Exception as exc:
        logger.error("Failed to pre-warm embedding model: %s", exc)

    yield

    logger.info("Shutting down %s", settings.app_name)
    try:
        from app.api.deps import close_http_clients
        logger.info("Closing shared HTTP clients...")
        import asyncio
        await close_http_clients()
    except Exception as exc:
        logger.error("Failed to close shared HTTP clients: %s", exc)


def create_app() -> FastAPI:
    try:
        settings = get_settings()
        application = FastAPI(
            title=settings.app_name,
            version=settings.app_version,
            description=(
                "AI-powered academic research platform with multi-agent LangGraph workflows."
            ),
            lifespan=lifespan,
        )

        application.add_middleware(
            CORSMiddleware,
            allow_origins=settings.cors_origins,
            allow_credentials=settings.cors_allow_credentials,
            allow_methods=["*"],
            allow_headers=["*"],
        )

        @application.exception_handler(PaperPilotError)
        async def paperpilot_exception_handler(
            request: Request, exc: PaperPilotError
        ) -> JSONResponse:
            logger.exception("PaperPilot error on %s", request.url.path)
            return JSONResponse(
                status_code=400,
                content={"error": type(exc).__name__, "message": exc.message},
            )

        @application.exception_handler(Exception)
        async def generic_exception_handler(
            request: Request, exc: Exception
        ) -> JSONResponse:
            logger.exception("Unhandled error on %s", request.url.path)
            return JSONResponse(
                status_code=500,
                content={"error": "internal_error", "message": "An unexpected error occurred. Please try again later."},
            )

        @application.get("/health")
        async def health_check() -> JSONResponse:
            from app.api.deps import get_gemini_service, get_paper_repository, get_chroma_service
            
            gemini_ok = False
            if settings.has_google_api_key:
                try:
                    _ = get_gemini_service()._get_llm()
                    gemini_ok = True
                except Exception:
                    pass

            db_ok = False
            try:
                db_ok = get_paper_repository().check_health()
            except Exception:
                pass

            chroma_ok = False
            try:
                chroma_service = get_chroma_service()
                # Run count in a background thread to prevent blocking event loop
                import asyncio
                count = await asyncio.to_thread(chroma_service.collection.count)
                chroma_ok = True
            except Exception:
                pass

            status = "healthy"
            if not (db_ok and chroma_ok):
                status = "unhealthy"

            content = {
                "status": status,
                "gemini": gemini_ok,
                "papers_db": db_ok,
                "chroma": chroma_ok
            }
            status_code = 200 if status == "healthy" else 503
            return JSONResponse(status_code=status_code, content=content)

        application.include_router(api_router, prefix=settings.api_v1_prefix)
        logger.info("FastAPI application created successfully")
        return application
    except Exception:
        logger.critical("Failed to create FastAPI application")
        logger.critical(traceback.format_exc())
        raise


try:
    app = create_app()
except Exception:
    logger.critical("Startup aborted: could not initialize app.main:app")
    sys.exit(1)
