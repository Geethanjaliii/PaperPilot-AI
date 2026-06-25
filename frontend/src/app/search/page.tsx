"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PageContainer from "../../components/layout/PageContainer";
import PaperCard from "../../components/shared/PaperCard";
import { useSearch } from "../../hooks/useSearch";
import { useCitations } from "../../hooks/useCitations";
import { Paper, PaperSource } from "../../types";
import { 
  Search as SearchIcon, 
  Settings2, 
  Loader2, 
  HelpCircle,
  AlertCircle,
  Copy,
  Check,
  X
} from "lucide-react";

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("query") || "";

  const [query, setQuery] = useState(initialQuery);
  const [sources, setSources] = useState<PaperSource[]>(["arxiv", "semantic_scholar"]);
  const [maxResults, setMaxResults] = useState(10);
  const [showFilters, setShowFilters] = useState(false);

  // Citation modal states
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [citationFormat, setCitationFormat] = useState<"apa" | "ieee" | "bibtex">("apa");
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const searchMutation = useSearch();
  const citationMutation = useCitations();

  // Trigger search on mount if query param is set
  useEffect(() => {
    if (initialQuery) {
      searchMutation.mutate({
        query: initialQuery,
        max_results: maxResults,
        sources,
      });
    }
  }, [initialQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      searchMutation.mutate({
        query,
        max_results: maxResults,
        sources,
      });
    }
  };

  const handleSourceToggle = (source: PaperSource) => {
    if (sources.includes(source)) {
      if (sources.length > 1) {
        setSources(sources.filter((s) => s !== source));
      }
    } else {
      setSources([...sources, source]);
    }
  };

  const triggerCitation = (paper: Paper) => {
    setSelectedPaper(paper);
    citationMutation.mutate({
      paper_ids: [paper.id],
      formats: ["apa", "ieee", "bibtex"],
    });
  };

  const handleCopyCitation = (text: string, format: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  return (
    <PageContainer title="Search Papers" subtitle="Scan arXiv and Semantic Scholar databases concurrently.">
      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="flex flex-col gap-3 w-full mb-6">
        <div className="flex gap-2 w-full">
          <div className="flex-1 relative flex items-center bg-card-bg border border-border-color focus-within:border-primary-accent/50 focus-within:shadow-glow rounded-2xl p-1 transition-all">
            <SearchIcon className="w-5 h-5 text-text-secondary ml-3 shrink-0" />
            <input
              type="text"
              placeholder="Search by keywords, title, or authors..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-text-primary outline-none py-2 px-3 placeholder:text-text-secondary/50"
            />
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-xl transition-all mr-2 ${showFilters ? "bg-primary-accent/15 text-primary-accent" : "text-text-secondary hover:text-text-primary hover:bg-white/5"}`}
            >
              <Settings2 className="w-4 h-4" />
            </button>
          </div>
          <button
            type="submit"
            disabled={searchMutation.isPending}
            className="bg-primary-accent hover:bg-hover-accent disabled:bg-primary-accent/50 disabled:cursor-not-allowed text-background font-bold text-sm px-6 py-3 rounded-2xl transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            {searchMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Search
          </button>
        </div>

        {/* Filters and Options Drawer */}
        {showFilters && (
          <div className="bg-card-bg border border-border-color rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-in">
            {/* Sources selection */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-text-secondary font-bold uppercase tracking-wider">Sources:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleSourceToggle("arxiv")}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                    sources.includes("arxiv")
                      ? "bg-primary-accent/10 border-primary-accent/30 text-primary-accent"
                      : "border-border-color text-text-secondary hover:text-text-primary"
                  }`}
                >
                  arXiv AI
                </button>
                <button
                  type="button"
                  onClick={() => handleSourceToggle("semantic_scholar")}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                    sources.includes("semantic_scholar")
                      ? "bg-primary-accent/10 border-primary-accent/30 text-primary-accent"
                      : "border-border-color text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Semantic Scholar
                </button>
              </div>
            </div>

            {/* Max Results selection */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-text-secondary font-bold uppercase tracking-wider">Max Results:</span>
              <select
                value={maxResults}
                onChange={(e) => setMaxResults(Number(e.target.value))}
                className="bg-background border border-border-color rounded-xl px-3 py-1.5 text-xs text-text-primary outline-none focus:border-primary-accent"
              >
                <option value={5}>5 Papers</option>
                <option value={10}>10 Papers</option>
                <option value={20}>20 Papers</option>
                <option value={30}>30 Papers</option>
              </select>
            </div>
          </div>
        )}
      </form>

      {/* Main viewport results layout */}
      <div className="flex-1 flex flex-col gap-4">
        {searchMutation.isPending && (
          <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 text-primary-accent animate-spin" />
            <p className="text-sm text-text-secondary">Searching external databases, indexing metadata...</p>
          </div>
        )}

        {searchMutation.isError && (
          <div className="bg-rose-950/20 border border-rose-500/20 rounded-2xl p-6 text-center flex flex-col items-center gap-3">
            <AlertCircle className="w-8 h-8 text-rose-400" />
            <p className="text-sm font-semibold text-rose-300">Database Search Failed</p>
            <p className="text-xs text-rose-400/80 max-w-md">
              {searchMutation.error.message || "An unexpected error occurred while communicating with research APIs. Please check backend status."}
            </p>
          </div>
        )}

        {searchMutation.isSuccess && (
          <>
            <div className="text-xs text-text-secondary font-bold uppercase tracking-widest mb-2">
              SEARCH RESULTS ({searchMutation.data.papers?.length || 0})
            </div>

            {searchMutation.data.papers?.length === 0 ? (
              <div className="bg-card-bg/50 border border-border-color rounded-2xl p-12 text-center flex flex-col items-center gap-2">
                <HelpCircle className="w-8 h-8 text-text-secondary" />
                <p className="text-sm font-semibold text-text-primary">No papers matches found</p>
                <p className="text-xs text-text-secondary max-w-sm">Try using broader search terms or adjusting your datasource filters.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {searchMutation.data.papers.map((paper) => (
                  <PaperCard 
                    key={paper.id} 
                    paper={paper} 
                    onCiteClick={triggerCitation}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Citation Generator modal */}
      {selectedPaper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface border border-border-color rounded-2xl p-5 w-full max-w-lg shadow-2xl relative flex flex-col gap-4 animate-slide-in">
            <button 
              onClick={() => setSelectedPaper(null)} 
              className="absolute top-4 right-4 p-1 hover:bg-white/5 rounded-lg text-text-secondary"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col gap-1 pr-6">
              <span className="text-[10px] font-extrabold text-primary-accent tracking-widest uppercase">FORMATTED CITATIONS</span>
              <h3 className="text-sm font-bold text-text-primary truncate">{selectedPaper.title}</h3>
            </div>

            {/* Citation Formatter mutation states */}
            {citationMutation.isPending && (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <Loader2 className="w-6 h-6 text-primary-accent animate-spin" />
                <span className="text-xs text-text-secondary">Generating citations...</span>
              </div>
            )}

            {citationMutation.isError && (
              <div className="text-xs text-rose-400 bg-rose-950/20 border border-rose-500/20 p-4 rounded-xl">
                Failed to format citations. Please check backend integration.
              </div>
            )}

            {citationMutation.isSuccess && (
              <div className="flex flex-col gap-4">
                {/* Format selection Tabs */}
                <div className="flex border-b border-border-color text-xs">
                  {(["apa", "ieee", "bibtex"] as const).map((format) => (
                    <button
                      key={format}
                      onClick={() => setCitationFormat(format)}
                      className={`px-4 py-2 border-b-2 font-bold uppercase transition-all ${
                        citationFormat === format
                          ? "border-primary-accent text-primary-accent"
                          : "border-transparent text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      {format}
                    </button>
                  ))}
                </div>

                {/* Selected Citation Body */}
                <div className="bg-card-bg border border-border-color/60 rounded-xl p-3.5 relative min-h-[90px] flex items-center justify-between gap-3 group">
                  <p className="text-xs md:text-sm text-text-secondary leading-relaxed select-all">
                    {citationMutation.data.citations?.[0]?.[citationFormat] || "No citation style available."}
                  </p>
                  <button
                    onClick={() => handleCopyCitation(
                      citationMutation.data.citations?.[0]?.[citationFormat] || "",
                      citationFormat
                    )}
                    className="p-2 bg-white/5 border border-border-color hover:border-primary-accent/40 rounded-xl text-text-secondary hover:text-primary-accent transition-all shrink-0 cursor-pointer"
                  >
                    {copiedFormat === citationFormat ? <Check className="w-3.5 h-3.5 text-primary-accent" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </PageContainer>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <PageContainer title="Search Papers" subtitle="Loading search interface...">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary-accent animate-spin" />
        </div>
      </PageContainer>
    }>
      <SearchContent />
    </Suspense>
  );
}
