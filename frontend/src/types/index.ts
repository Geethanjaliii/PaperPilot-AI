export type PaperSource = "arxiv" | "semantic_scholar";

export interface Paper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  year?: number;
  venue?: string;
  citation_count?: number;
  url?: string;
  source: PaperSource;
}

export interface PaperListResponse {
  papers: Paper[];
  total: number;
}

export interface SearchRequest {
  query: string;
  max_results?: number;
  sources?: PaperSource[];
}

export interface SearchResponse {
  query: string;
  papers: Paper[];
  total: number;
}

export interface ReviewRequest {
  query: string;
  paper_ids?: string[];
  max_papers?: number;
}

export interface ReviewResponse {
  query: string;
  literature_review: string;
  research_gaps: string;
  papers: Paper[];
}

export interface CompareRequest {
  query: string;
  paper_ids?: string[];
  max_papers?: number;
}

export interface CompareResponse {
  query: string;
  comparison: string;
  papers: Paper[];
}

export interface CitationRequest {
  paper_ids: string[];
  formats?: Array<"apa" | "ieee" | "bibtex">;
}

export interface FormattedCitation {
  paper_id: string;
  title: string;
  apa?: string;
  ieee?: string;
  bibtex?: string;
}

export interface CitationResponse {
  citations: FormattedCitation[];
  papers: Paper[];
}

export interface QueryRequest {
  query: string;
  max_papers?: number;
}

export interface QueryResponse {
  query: string;
  papers: Paper[];
  summary: string;
  literature_review: string;
  comparison: string;
  citations: FormattedCitation[];
}

export interface HealthCheckResponse {
  status: string;
  gemini: boolean;
  papers_db: boolean;
  chroma: boolean;
}
