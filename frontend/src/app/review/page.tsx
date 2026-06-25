"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PageContainer from "../../components/layout/PageContainer";
import { useReview } from "../../hooks/useReview";
import { useSavedStore } from "../../store/useSavedStore";
import { 
  BookOpen, 
  Loader2, 
  Copy, 
  Check, 
  RefreshCw, 
  Download, 
  ArrowRight,
  TrendingUp,
  Award,
  CircleDot,
  FileCode,
  Building,
  CheckCircle2,
  Calendar,
  AlertCircle
} from "lucide-react";
import MarkdownRenderer from "../../components/shared/MarkdownRenderer";

function ReviewContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("query") || "";
  const initialPaperIds = searchParams.get("paper_ids")?.split(",") || [];

  const [topic, setTopic] = useState(initialQuery);
  const [selectedPaperIds, setSelectedPaperIds] = useState<string[]>(initialPaperIds);
  const [maxPapers, setMaxPapers] = useState(10);
  const [copied, setCopied] = useState(false);

  const reviewMutation = useReview();
  const savedPapers = useSavedStore((state) => state.savedPapers);
  const savedList = Object.values(savedPapers);

  useEffect(() => {
    if (initialQuery) {
      reviewMutation.mutate({
        query: initialQuery,
        paper_ids: initialPaperIds.filter(Boolean),
        max_papers: maxPapers,
      });
    }
  }, [initialQuery]);

  const handleSynthesize = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      reviewMutation.mutate({
        query: topic,
        paper_ids: selectedPaperIds,
        max_papers: maxPapers,
      });
    }
  };

  const handlePaperToggle = (paperId: string) => {
    if (selectedPaperIds.includes(paperId)) {
      setSelectedPaperIds(selectedPaperIds.filter((id) => id !== paperId));
    } else {
      setSelectedPaperIds([...selectedPaperIds, paperId]);
    }
  };

  const handleCopyReview = () => {
    if (reviewMutation.data) {
      const fullText = `# ${reviewMutation.data.query}\n\n${reviewMutation.data.literature_review}\n\n## Research Gaps\n${reviewMutation.data.research_gaps}`;
      navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <PageContainer 
      title="Literature Review" 
      subtitle="Synthesize comprehensive multi-paper summaries and methodology grids."
      actions={reviewMutation.isSuccess ? (
        <div className="flex items-center gap-2">
          <button 
            onClick={handleCopyReview}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-accent hover:bg-hover-accent text-background font-bold rounded-xl text-xs transition-all cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy</span>
          </button>
          <button 
            onClick={() => reviewMutation.mutate({ query: topic, paper_ids: selectedPaperIds, max_papers: maxPapers })}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-card-bg hover:bg-white/5 border border-border-color rounded-xl text-xs font-semibold text-text-primary transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Regenerate</span>
          </button>
        </div>
      ) : undefined}
    >
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Setup Form / Options Panel */}
        <div className="lg:col-span-4 bg-card-bg border border-border-color rounded-2xl p-5 flex flex-col gap-5">
          <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary-accent" />
            Review Parameters
          </h3>

          <form onSubmit={handleSynthesize} className="flex flex-col gap-4">
            {/* Topic Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-text-secondary font-bold uppercase tracking-wider">Research Topic:</label>
              <textarea
                rows={3}
                placeholder="Enter review topic, e.g. transformer architectures, vaccine development, etc."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="bg-background border border-border-color focus:border-primary-accent rounded-xl p-3 text-xs md:text-sm text-text-primary outline-none resize-none leading-normal"
                required
              />
            </div>

            {/* Max Papers selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-text-secondary font-bold uppercase tracking-wider">Max Source Papers:</label>
              <select
                value={maxPapers}
                onChange={(e) => setMaxPapers(Number(e.target.value))}
                className="bg-background border border-border-color focus:border-primary-accent rounded-xl p-2.5 text-xs text-text-primary outline-none"
              >
                <option value={5}>Top 5 papers</option>
                <option value={10}>Top 10 papers</option>
                <option value={15}>Top 15 papers</option>
                <option value={20}>Top 20 papers</option>
              </select>
            </div>

            {/* Saved Papers Selection (Multi-select checklist) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-text-secondary font-bold uppercase tracking-wider">
                Select Source Papers ({selectedPaperIds.length} chosen):
              </label>
              {savedList.length === 0 ? (
                <div className="text-[10px] text-text-secondary/70 italic bg-background border border-border-color rounded-xl p-3 text-center">
                  No saved papers in bookmarks. The review will automatically search external repositories for relevant sources.
                </div>
              ) : (
                <div className="max-h-[160px] overflow-y-auto bg-background border border-border-color rounded-xl p-2 flex flex-col gap-1">
                  {savedList.map(({ paper }) => {
                    const selected = selectedPaperIds.includes(paper.id);
                    return (
                      <button
                        key={paper.id}
                        type="button"
                        onClick={() => handlePaperToggle(paper.id)}
                        className={`flex items-center text-left gap-2.5 p-2 rounded-lg text-xs transition-colors ${
                          selected 
                            ? "bg-primary-accent/15 text-primary-accent font-semibold" 
                            : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          readOnly
                          className="rounded border-border-color accent-primary-accent cursor-pointer"
                        />
                        <span className="truncate flex-1">{paper.title}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Synthesize Button */}
            <button
              type="submit"
              disabled={reviewMutation.isPending}
              className="w-full bg-primary-accent hover:bg-hover-accent disabled:bg-primary-accent/40 disabled:cursor-not-allowed text-background font-bold text-sm py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary-accent/5"
            >
              {reviewMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Synthesizing...
                </>
              ) : (
                <>
                  Synthesize Review <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Side: Generated Review Viewport */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {reviewMutation.isPending && (
            <div className="bg-card-bg border border-border-color rounded-2xl p-16 flex flex-col items-center justify-center gap-4 text-center min-h-[300px]">
              <Loader2 className="w-8 h-8 text-primary-accent animate-spin" />
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-bold text-text-primary">Generating Literature Review Draft</span>
                <span className="text-xs text-text-secondary max-w-sm">Comparing methodology details, outlining key findings, and referencing source nodes...</span>
              </div>
            </div>
          )}

          {reviewMutation.isError && (
            <div className="bg-rose-950/20 border border-rose-500/20 rounded-2xl p-6 text-center flex flex-col items-center gap-3">
              <AlertCircle className="w-8 h-8 text-rose-400" />
              <p className="text-sm font-semibold text-rose-300">Literature Synthesis Failed</p>
              <p className="text-xs text-rose-400/80 max-w-md">
                {reviewMutation.error.message || "An unexpected error occurred while communicating with research APIs. Please check backend status."}
              </p>
            </div>
          )}

          {/* Default state */}
          {!reviewMutation.isPending && !reviewMutation.isSuccess && !reviewMutation.isError && (
            <div className="bg-card-bg/40 border border-border-color border-dashed rounded-2xl p-12 text-center flex flex-col items-center gap-2 min-h-[300px] justify-center">
              <BookOpen className="w-8 h-8 text-text-secondary/60" />
              <span className="text-sm font-bold text-text-primary">Ready to Synthesize</span>
              <span className="text-xs text-text-secondary max-w-xs leading-normal">
                Enter your research topic and choose reference papers on the left. We will organize sections into introduction, methodology comparison, and citations.
              </span>
            </div>
          )}

          {/* Stitch Style Literature Review Rendering */}
          {reviewMutation.isSuccess && (
            <div className="flex flex-col gap-6 select-text">
              {/* Header section card */}
              <div className="bg-card-bg border border-border-color rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary-accent to-secondary-accent"></div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold tracking-widest text-primary-accent bg-primary-accent/10 border border-primary-accent/30 rounded px-2 py-0.5 uppercase">
                    AI Generated Review
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-black text-text-primary leading-tight">
                  {reviewMutation.data.query}
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-[10px] text-text-secondary font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-primary-accent/70" />
                    Synthesized: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </span>
                  <span>•</span>
                  <span>Based on {reviewMutation.data.papers?.length || 0} publications</span>
                </div>
              </div>

              {/* Introduction Card */}
              <div className="flex flex-col gap-2">
                <h4 className="text-sm font-extrabold tracking-wider text-primary-accent">
                  — Introduction
                </h4>
                <div className="bg-card-bg border border-border-color rounded-2xl p-4 md:p-5 text-xs md:text-sm text-text-secondary leading-relaxed space-y-4">
                  <MarkdownRenderer content={reviewMutation.data.literature_review} />
                </div>
              </div>

              {/* Key Findings Card */}
              <div className="flex flex-col gap-2">
                <h4 className="text-sm font-extrabold tracking-wider text-primary-accent">
                  — Key Findings
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Card 1 */}
                  <div className="bg-card-bg border border-border-color rounded-2xl p-4 flex gap-4 hover:border-primary-accent/30 transition-all duration-300">
                    <div className="w-9 h-9 rounded-xl bg-primary-accent/10 border border-primary-accent/20 flex items-center justify-center text-primary-accent shrink-0">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs md:text-sm font-bold text-text-primary">Efficiency Gains</span>
                      <span className="text-[11px] md:text-xs text-text-secondary leading-normal">
                        Hybrid models demonstrate a significant reduction in computational overhead for deep molecular dynamics and structural prediction.
                      </span>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-card-bg border border-border-color rounded-2xl p-4 flex gap-4 hover:border-secondary-accent/30 transition-all duration-300">
                    <div className="w-9 h-9 rounded-xl bg-secondary-accent/10 border border-secondary-accent/20 flex items-center justify-center text-secondary-accent shrink-0">
                      <Award className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs md:text-sm font-bold text-text-primary">Generalization</span>
                      <span className="text-[11px] md:text-xs text-text-secondary leading-normal">
                        Pre-trained chemical language models generalize across unrelated molecular tasks with minimal fine-tuning or zero-shot setups.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Research Trends Card */}
              <div className="flex flex-col gap-2">
                <h4 className="text-sm font-extrabold tracking-wider text-primary-accent">
                  — Research Trends
                </h4>
                <div className="bg-card-bg border border-border-color rounded-2xl p-5 flex flex-col gap-4 relative">
                  <div className="absolute left-[33px] top-6 bottom-6 w-[1px] bg-border-color"></div>
                  
                  {/* Timeline 1 */}
                  <div className="flex gap-4 relative">
                    <div className="w-9 h-9 rounded-full bg-surface border border-border-color flex items-center justify-center text-xs font-bold text-primary-accent shrink-0 z-10">
                      <CircleDot className="w-4 h-4 text-primary-accent" />
                    </div>
                    <div className="flex flex-col gap-1 pt-1">
                      <span className="text-[10px] font-extrabold text-primary-accent">2021-2022</span>
                      <span className="text-xs md:text-sm font-bold text-text-primary">Static Graph Convolution</span>
                      <span className="text-[11px] md:text-xs text-text-secondary">Focus on Graph Neural Networks (GNNs) mapped to static atomic coordinates and descriptors.</span>
                    </div>
                  </div>

                  {/* Timeline 2 */}
                  <div className="flex gap-4 relative">
                    <div className="w-9 h-9 rounded-full bg-surface border border-border-color flex items-center justify-center text-xs font-bold text-secondary-accent shrink-0 z-10">
                      <CircleDot className="w-4 h-4 text-secondary-accent animate-pulse" />
                    </div>
                    <div className="flex flex-col gap-1 pt-1">
                      <span className="text-[10px] font-extrabold text-secondary-accent">2023-CURRENT</span>
                      <span className="text-xs md:text-sm font-bold text-text-primary">Diffusion State-Space Models</span>
                      <span className="text-[11px] md:text-xs text-text-secondary">Shifting paradigms toward conditional generative diffusion dynamics and physics-informed structural constraints.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Research Gaps / Methodologies Card */}
              <div className="flex flex-col gap-2">
                <h4 className="text-sm font-extrabold tracking-wider text-primary-accent">
                  — Methodologies & Research Gaps
                </h4>
                <div className="bg-card-bg border border-border-color rounded-2xl p-4 md:p-5 text-xs md:text-sm text-text-secondary leading-relaxed space-y-4">
                  <MarkdownRenderer content={reviewMutation.data.research_gaps} />
                </div>
              </div>

              {/* References List */}
              {reviewMutation.data.papers && reviewMutation.data.papers.length > 0 && (
                <div className="flex flex-col gap-2">
                  <h4 className="text-sm font-extrabold tracking-wider text-primary-accent">
                    — References
                  </h4>
                  <div className="bg-card-bg border border-border-color rounded-2xl p-4 md:p-5 flex flex-col gap-4">
                    {reviewMutation.data.papers.map((paper, idx) => (
                      <div key={paper.id} className="flex gap-3 text-xs md:text-sm">
                        <span className="font-extrabold text-primary-accent shrink-0">[{idx + 1}]</span>
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-text-primary">
                            {paper.authors?.[0] || "Unknown author"}, et al. ({paper.year || "N/A"}). "{paper.title}."
                          </span>
                          {paper.url && (
                            <a 
                              href={paper.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-[11px] text-primary-accent/80 hover:text-primary-accent hover:underline flex items-center gap-1 font-semibold"
                            >
                              View Publication source →
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={
      <PageContainer title="Literature Review" subtitle="Loading review interface...">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary-accent animate-spin" />
        </div>
      </PageContainer>
    }>
      <ReviewContent />
    </Suspense>
  );
}
