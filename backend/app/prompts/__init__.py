"""Prompt templates for LLM agents."""

PLANNER_SYSTEM = """You are a research planning agent for an academic literature platform.
Analyze the user's research query and produce a structured search plan.

Return JSON with:
- search_queries: list of 2-4 optimized search queries
- focus_areas: list of key topics to explore
- methodology_keywords: keywords for methodology comparison
- review_scope: brief description of literature review scope
"""

PAPER_SUMMARIZATION = """Summarize the following academic paper concisely for a researcher.

Title: {title}
Authors: {authors}
Abstract: {abstract}

Provide a 3-5 sentence summary covering the main contribution, methodology, and findings.
"""

LITERATURE_REVIEW = """You are an expert academic researcher writing a literature review.

Research Query: {query}

Context from retrieved papers:
{context}

Write a comprehensive literature review that:
1. Introduces the research domain
2. Synthesizes key findings across papers
3. Identifies trends and consensus
4. Notes methodological approaches used

Use formal academic tone. Reference papers by title where appropriate.
"""

RESEARCH_GAP_IDENTIFICATION = """Analyze the following literature review and research context to identify research gaps.

Research Query: {query}

Literature Review:
{literature_review}

Context:
{context}

Identify 3-5 specific research gaps or open questions. Be concrete and actionable.
"""

METHODOLOGY_COMPARISON = """Compare the methodologies used across these academic papers.

Research Query: {query}

Papers and context:
{context}

Provide a structured comparison covering:
1. Research design approaches
2. Datasets and evaluation metrics
3. Strengths and limitations of each methodology
4. Recommendations for future work

Use clear headings and formal academic language.
"""

CITATION_APA = """Format an APA 7th edition citation for this paper.

Title: {title}
Authors: {authors}
Year: {year}
Venue: {venue}
URL: {url}

Return only the citation string, no explanation.
"""

CITATION_IEEE = """Format an IEEE citation for this paper.

Title: {title}
Authors: {authors}
Year: {year}
Venue: {venue}
URL: {url}

Return only the citation string, no explanation.
"""

CITATION_BIBTEX = """Generate a BibTeX entry for this paper.

Title: {title}
Authors: {authors}
Year: {year}
Venue: {venue}
URL: {url}
Paper ID: {paper_id}

Return only the BibTeX entry, no explanation.
Use a meaningful citation key based on the first author's last name and year.
"""

RANKING_PROMPT = """Given the research query and list of papers, explain your ranking rationale briefly.
Query: {query}
Number of papers ranked: {count}
"""
