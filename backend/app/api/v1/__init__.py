"""API v1 routes."""

from fastapi import APIRouter

from app.api.v1 import citations, compare, papers, query, review, search

api_router = APIRouter()
api_router.include_router(search.router, tags=["search"])
api_router.include_router(papers.router, tags=["papers"])
api_router.include_router(review.router, tags=["review"])
api_router.include_router(compare.router, tags=["compare"])
api_router.include_router(citations.router, tags=["citations"])
api_router.include_router(query.router, tags=["query"])
