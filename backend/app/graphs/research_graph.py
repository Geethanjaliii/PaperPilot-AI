"""LangGraph research workflow."""

from langgraph.graph import END, StateGraph

from app.agents.citation import CitationAgent
from app.agents.embedding import EmbeddingAgent
from app.agents.literature_review import LiteratureReviewAgent
from app.agents.methodology_comparison import MethodologyComparisonAgent
from app.agents.planner import PlannerAgent
from app.agents.rag import RAGRetrievalAgent
from app.agents.ranking import RankingAgent
from app.agents.retrieval import PaperRetrievalAgent
from app.core.logging import get_logger
from app.graphs.state import ResearchState
from app.repositories.paper_repository import PaperRepository
from app.services.chroma_service import ChromaService
from app.services.embedding_service import EmbeddingService
from app.services.gemini_service import GeminiService
from app.services.paper_retrieval_service import PaperRetrievalService
from app.services.rag_service import RAGService
from app.services.ranking_service import RankingService

logger = get_logger(__name__)


class ResearchGraph:
    """Multi-agent LangGraph pipeline for academic research."""

    def __init__(
        self,
        gemini_service: GeminiService,
        retrieval_service: PaperRetrievalService,
        ranking_service: RankingService,
        embedding_service: EmbeddingService,
        chroma_service: ChromaService,
        rag_service: RAGService,
        paper_repository: PaperRepository,
    ) -> None:
        self._planner = PlannerAgent(gemini_service)
        self._retrieval = PaperRetrievalAgent(retrieval_service, paper_repository)
        self._ranking = RankingAgent(ranking_service)
        self._embedding = EmbeddingAgent(embedding_service, chroma_service)
        self._rag = RAGRetrievalAgent(rag_service)
        self._literature_review = LiteratureReviewAgent(gemini_service)
        self._methodology = MethodologyComparisonAgent(gemini_service)
        self._citation = CitationAgent(gemini_service)
        self._graph = self._build_graph()

    def _build_graph(self):
        workflow = StateGraph(ResearchState)

        workflow.add_node("planner", self._planner_node)
        workflow.add_node("retrieval", self._retrieval_node)
        workflow.add_node("ranking", self._ranking_node)
        workflow.add_node("embedding", self._embedding_node)
        workflow.add_node("rag_retrieval", self._rag_node)
        workflow.add_node("literature_review", self._literature_review_node)
        workflow.add_node("methodology_comparison", self._methodology_node)
        workflow.add_node("citation", self._citation_node)

        workflow.set_entry_point("planner")
        workflow.add_edge("planner", "retrieval")
        workflow.add_edge("retrieval", "ranking")
        workflow.add_edge("ranking", "embedding")
        workflow.add_edge("embedding", "rag_retrieval")
        workflow.add_edge("rag_retrieval", "literature_review")
        workflow.add_edge("literature_review", "methodology_comparison")
        workflow.add_edge("methodology_comparison", "citation")
        workflow.add_edge("citation", END)

        return workflow.compile()

    async def _planner_node(self, state: ResearchState) -> dict:
        return await self._planner.run(state)

    async def _retrieval_node(self, state: ResearchState) -> dict:
        return await self._retrieval.run(state)

    async def _ranking_node(self, state: ResearchState) -> dict:
        return await self._ranking.run(state)

    async def _embedding_node(self, state: ResearchState) -> dict:
        return await self._embedding.run(state)

    async def _rag_node(self, state: ResearchState) -> dict:
        return await self._rag.run(state)

    async def _literature_review_node(self, state: ResearchState) -> dict:
        return await self._literature_review.run(state)

    async def _methodology_node(self, state: ResearchState) -> dict:
        return await self._methodology.run(state)

    async def _citation_node(self, state: ResearchState) -> dict:
        return await self._citation.run(state)

    async def execute(self, query: str, max_papers: int = 10) -> ResearchState:
        logger.info("Executing research graph for query: %s", query[:80])
        initial_state: ResearchState = {
            "query": query,
            "max_papers": max_papers,
            "papers": [],
            "ranked_papers": [],
            "retrieved_context": "",
            "literature_review": "",
            "methodology_comparison": "",
            "citations": [],
        }
        result = await self._graph.ainvoke(initial_state)
        logger.info("Research graph execution complete")
        return result
