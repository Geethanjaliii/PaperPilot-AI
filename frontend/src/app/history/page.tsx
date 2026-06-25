"use client";

import { useState } from "react";
import PageContainer from "../../components/layout/PageContainer";
import { useHistoryStore, HistoryItem } from "../../store/useHistoryStore";
import { 
  History, 
  Search, 
  Trash2, 
  BookOpen, 
  Sparkles, 
  GitPullRequest,
  CheckCircle,
  HelpCircle,
  Clock,
  ExternalLink
} from "lucide-react";
import Link from "next/link";

export default function HistoryPage() {
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const historyItems = useHistoryStore((state) => state.historyItems);
  const removeHistoryItem = useHistoryStore((state) => state.removeHistoryItem);
  const clearHistory = useHistoryStore((state) => state.clearHistory);

  const filteredItems = historyItems.filter((item) => {
    const matchesType = filterType === "all" || item.type === filterType;
    const matchesQuery = 
      !searchQuery.trim() || 
      item.query.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesQuery;
  });

  const getHistoryIcon = (type: string) => {
    switch (type) {
      case "search":
        return <Search className="w-4 h-4 text-primary-accent" />;
      case "review":
        return <BookOpen className="w-4 h-4 text-secondary-accent" />;
      case "compare":
        return <GitPullRequest className="w-4 h-4 text-violet-400" />;
      case "ask":
        return <Sparkles className="w-4 h-4 text-hover-accent" />;
      default:
        return <History className="w-4 h-4 text-text-secondary" />;
    }
  };

  const getRedirectLink = (item: HistoryItem) => {
    switch (item.type) {
      case "search":
        return `/search?query=${encodeURIComponent(item.query)}`;
      case "review":
        return `/review?query=${encodeURIComponent(item.query)}`;
      case "compare":
        return `/compare?query=${encodeURIComponent(item.query)}`;
      case "ask":
        return `/ask?query=${encodeURIComponent(item.query)}`;
      default:
        return "/";
    }
  };

  const getRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return "just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return "N/A";
    }
  };

  return (
    <PageContainer 
      title="History" 
      subtitle="Track your academic literature search, comparison matrices, and pipeline summaries."
      actions={
        historyItems.length > 0 ? (
          <button
            onClick={clearHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/20 hover:bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs font-bold text-rose-300 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        ) : undefined
      }
    >
      <div className="flex-1 flex flex-col gap-6 max-w-4xl mx-auto w-full">
        {/* Filters and search logs toolbar */}
        <div className="bg-card-bg border border-border-color rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap gap-1.5">
            {["all", "search", "review", "compare", "ask"].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border capitalize transition-all ${
                  filterType === type
                    ? "bg-primary-accent/15 border-primary-accent/30 text-primary-accent"
                    : "border-border-color text-text-secondary hover:text-text-primary hover:bg-white/5"
                }`}
              >
                {type === "all" ? "All Logs" : type}
              </button>
            ))}
          </div>

          <div className="relative flex items-center bg-background border border-border-color rounded-xl p-1 w-full sm:max-w-xs transition-all">
            <Search className="w-4 h-4 text-text-secondary ml-2 shrink-0" />
            <input
              type="text"
              placeholder="Search history query..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-xs text-text-primary outline-none py-1.5 px-2 placeholder:text-text-secondary/50"
            />
          </div>
        </div>

        {/* History log timeline */}
        <div className="flex flex-col gap-3">
          {filteredItems.length === 0 ? (
            <div className="bg-card-bg/40 border border-border-color border-dashed rounded-2xl p-16 text-center text-text-secondary text-xs">
              No history logs match the filters.
            </div>
          ) : (
            filteredItems.map((item) => (
              <div 
                key={item.id} 
                className="bg-card-bg border border-border-color hover:border-primary-accent/25 rounded-2xl p-4 flex justify-between items-center gap-4 transition-all group"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-9 h-9 bg-background border border-border-color rounded-xl flex items-center justify-center shrink-0">
                    {getHistoryIcon(item.type)}
                  </div>
                  <div className="flex flex-col overflow-hidden gap-0.5">
                    <span className="text-[10px] font-extrabold text-primary-accent tracking-widest uppercase">
                      {item.type}
                    </span>
                    <Link 
                      href={getRedirectLink(item)}
                      className="text-xs md:text-sm font-bold text-text-primary truncate hover:underline hover:text-primary-accent transition-colors"
                    >
                      {item.query}
                    </Link>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-[10px] font-bold text-text-secondary">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-text-secondary/80" />
                    {getRelativeTime(item.timestamp)}
                  </span>
                  <button
                    onClick={() => removeHistoryItem(item.id)}
                    className="p-2 hover:bg-white/5 text-text-secondary hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </PageContainer>
  );
}
