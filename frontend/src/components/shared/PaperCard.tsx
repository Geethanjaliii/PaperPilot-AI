"use client";

import { useState } from "react";
import { Paper } from "../../types";
import { useSavedStore } from "../../store/useSavedStore";
import { 
  Bookmark, 
  BookmarkCheck, 
  BookOpen, 
  GitCompare, 
  Quote, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Calendar,
  Building
} from "lucide-react";
import Link from "next/link";

interface PaperCardProps {
  paper: Paper;
  onCiteClick?: (paper: Paper) => void;
}

export default function PaperCard({ paper, onCiteClick }: PaperCardProps) {
  const [expanded, setExpanded] = useState(false);
  const savedPapers = useSavedStore((state) => state.savedPapers);
  const savePaper = useSavedStore((state) => state.savePaper);
  const removePaper = useSavedStore((state) => state.removePaper);

  const isSaved = !!savedPapers[paper.id];

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaved) {
      removePaper(paper.id);
    } else {
      savePaper(paper);
    }
  };

  return (
    <div className="bg-card-bg border border-border-color rounded-2xl p-4 md:p-5 flex flex-col gap-4 hover:border-primary-accent/30 transition-all duration-300 relative group overflow-hidden">
      {/* Decorative top-border glow on hover */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary-accent to-secondary-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* Header Info */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          {/* Metadata row */}
          <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-text-secondary font-medium">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-primary-accent/70" />
              {paper.year || "N/A"}
            </span>
            {paper.venue && (
              <span className="flex items-center gap-1 truncate max-w-[150px]">
                <Building className="w-3.5 h-3.5 text-secondary-accent/70" />
                {paper.venue}
              </span>
            )}
            <span className="bg-white/[0.04] border border-white/[0.06] rounded px-1.5 py-0.5 text-text-secondary text-[10px] uppercase font-bold tracking-wider">
              {paper.source === "arxiv" ? "arXiv AI" : "Semantic Scholar"}
            </span>
            {paper.citation_count !== undefined && paper.citation_count > 0 && (
              <span className="text-primary-accent/80 font-bold bg-primary-accent/5 px-1.5 py-0.5 rounded border border-primary-accent/10">
                {paper.citation_count} Citations
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-base md:text-lg font-bold text-text-primary group-hover:text-primary-accent transition-colors duration-200 leading-snug">
            {paper.url ? (
              <a href={paper.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:underline">
                {paper.title}
                <ExternalLink className="w-4 h-4 text-text-secondary group-hover:text-primary-accent shrink-0 inline" />
              </a>
            ) : (
              paper.title
            )}
          </h3>
        </div>

        {/* Bookmark action */}
        <button 
          onClick={handleSaveToggle}
          className={`p-2 rounded-xl transition-all duration-200 border shrink-0 ${
            isSaved 
              ? "bg-primary-accent/10 border-primary-accent/30 text-primary-accent shadow-md shadow-primary-accent/5" 
              : "border-border-color text-text-secondary hover:text-text-primary hover:bg-white/[0.03]"
          }`}
        >
          {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
        </button>
      </div>

      {/* Authors list */}
      {paper.authors && paper.authors.length > 0 && (
        <div className="text-xs text-text-secondary font-medium">
          <span className="text-text-primary/70">Authors: </span>
          {paper.authors.join(", ")}
        </div>
      )}

      {/* Abstract summary */}
      <div className="flex flex-col gap-2">
        <p className={`text-xs md:text-sm text-text-secondary leading-relaxed ${expanded ? "" : "line-clamp-2 md:line-clamp-3"}`}>
          {paper.abstract || "No abstract details available for this scientific publication."}
        </p>
        
        {paper.abstract && paper.abstract.length > 150 && (
          <button 
            onClick={() => setExpanded(!expanded)} 
            className="flex items-center gap-1 text-[11px] font-bold text-primary-accent/80 hover:text-primary-accent w-fit transition-colors"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" /> Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" /> Read Full Abstract
              </>
            )}
          </button>
        )}
      </div>

      {/* Quick Action Badges */}
      <div className="flex flex-wrap items-center gap-2 border-t border-border-color/60 pt-3.5 mt-1">
        <Link 
          href={`/review?query=${encodeURIComponent(paper.title)}&paper_ids=${paper.id}`}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.02] hover:bg-primary-accent/10 border border-border-color hover:border-primary-accent/30 text-text-secondary hover:text-primary-accent rounded-xl text-xs font-semibold transition-all duration-200"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Synthesis Review</span>
        </Link>

        <Link 
          href={`/compare?query=${encodeURIComponent(paper.title)}&paper_ids=${paper.id}`}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.02] hover:bg-secondary-accent/10 border border-border-color hover:border-secondary-accent/30 text-text-secondary hover:text-secondary-accent rounded-xl text-xs font-semibold transition-all duration-200"
        >
          <GitCompare className="w-3.5 h-3.5" />
          <span>Compare Methods</span>
        </Link>

        <Link 
          href={`/ask?query=${encodeURIComponent("Explain the methodology in: " + paper.title)}`}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.02] hover:bg-hover-accent/10 border border-border-color hover:border-hover-accent/30 text-text-secondary hover:text-hover-accent rounded-xl text-xs font-semibold transition-all duration-200"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ask Pilot</span>
        </Link>

        {onCiteClick && (
          <button 
            onClick={() => onCiteClick(paper)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.02] hover:bg-white/[0.06] border border-border-color text-text-secondary hover:text-text-primary rounded-xl text-xs font-semibold transition-all duration-200 ml-auto"
          >
            <Quote className="w-3.5 h-3.5" />
            <span>Generate Citation</span>
          </button>
        )}
      </div>
    </div>
  );
}
