"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageContainer from "../components/layout/PageContainer";
import { useSavedStore } from "../store/useSavedStore";
import { useHistoryStore } from "../store/useHistoryStore";
import { 
  Search, 
  ArrowRight, 
  BookOpen, 
  Sparkles, 
  Bookmark, 
  History, 
  Plus, 
  Zap,
  TrendingUp,
  FileCheck2,
  GitPullRequest
} from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  
  const savedCount = Object.keys(useSavedStore((state) => state.savedPapers)).length;
  const historyItems = useHistoryStore((state) => state.historyItems);
  const recentResearch = historyItems.slice(0, 4); // get top 4 recent history logs

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery)}`);
    }
  };

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

  const formatHistoryType = (type: string) => {
    switch (type) {
      case "search": return "Paper Analysis";
      case "review": return "Literature Review";
      case "compare": return "Citation Map";
      case "ask": return "Pilot Conversation";
      default: return "Research Query";
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
      return "Yesterday";
    } catch {
      return "Recently";
    }
  };

  return (
    <PageContainer title="Dashboard" subtitle="Welcome to your AI-Powered Research Operating System.">
      {/* Hero Section */}
      <div className="flex flex-col items-center text-center my-8 max-w-2xl mx-auto gap-4">
        <h2 className="text-3xl md:text-5xl font-black tracking-tight text-text-primary leading-tight">
          Accelerate Research <br />
          <span className="bg-gradient-to-r from-primary-accent to-secondary-accent bg-clip-text text-transparent">with AI Co-Pilot</span>
        </h2>
        <p className="text-sm md:text-base text-text-secondary max-w-lg">
          Analyze thousands of papers in seconds, compare methodologies side-by-side, and synthesize academic literature reviews.
        </p>

        {/* Hero Search Bar */}
        <form onSubmit={handleSearchSubmit} className="w-full mt-4">
          <div className="relative flex items-center bg-card-bg/90 border border-border-color focus-within:border-primary-accent/50 focus-within:shadow-glow rounded-2xl p-1.5 transition-all duration-300">
            <Search className="w-5 h-5 text-text-secondary ml-3 shrink-0" />
            <div className="w-[1px] h-5 bg-border-color mx-3 shrink-0"></div>
            <Zap className="w-4 h-4 text-primary-accent mr-2 shrink-0 animate-pulse" />
            <input
              type="text"
              placeholder="Search for papers by keywords, title, or authors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-text-primary outline-none py-2 placeholder:text-text-secondary/50"
            />
            <button
              type="submit"
              className="bg-primary-accent hover:bg-hover-accent text-background font-bold text-sm px-5 py-2.5 rounded-xl transition-all duration-200 shrink-0 cursor-pointer"
            >
              Find
            </button>
          </div>
        </form>
      </div>

      {/* Global Stats Grid */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[11px] font-extrabold tracking-widest text-text-secondary uppercase">
            GLOBAL STATS
          </h3>
          <Link href="/history" className="text-xs text-primary-accent hover:text-hover-accent font-bold flex items-center gap-1">
            View Insights <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Stat 1 */}
          <div className="bg-card-bg border border-border-color rounded-2xl p-5 flex items-center gap-4 hover:border-primary-accent/25 transition-all">
            <div className="w-10 h-10 rounded-xl bg-primary-accent/10 border border-primary-accent/20 flex items-center justify-center text-primary-accent">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-text-primary">1,284</span>
              <span className="text-xs text-text-secondary font-medium">Papers Indexed</span>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="bg-card-bg border border-border-color rounded-2xl p-5 flex items-center gap-4 hover:border-secondary-accent/25 transition-all">
            <div className="w-10 h-10 rounded-xl bg-secondary-accent/10 border border-secondary-accent/20 flex items-center justify-center text-secondary-accent">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-text-primary">42</span>
              <span className="text-xs text-text-secondary font-medium">Reviews Gen</span>
            </div>
          </div>

          {/* Stat 3 */}
          <div className="bg-card-bg border border-border-color rounded-2xl p-5 flex items-center gap-4 hover:border-violet-500/25 transition-all">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <Bookmark className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-text-primary">{savedCount}</span>
              <span className="text-xs text-text-secondary font-medium">Saved Bookmarks</span>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Research (Stitch style list timeline) */}
      <section className="mb-8">
        <h3 className="text-[11px] font-extrabold tracking-widest text-text-secondary uppercase mb-6">
          RECENT RESEARCH
        </h3>

        {recentResearch.length === 0 ? (
          <div className="bg-card-bg/40 border border-border-color rounded-2xl p-8 text-center text-text-secondary text-sm">
            No research logs found. Search for topics above to begin!
          </div>
        ) : (
          <div className="relative pl-6 border-l border-border-color flex flex-col gap-6">
            {recentResearch.map((item) => (
              <div key={item.id} className="relative group">
                {/* Timeline green circle node indicator */}
                <div className="absolute -left-[31px] top-1.5 w-[11px] h-[11px] rounded-full bg-primary-accent border-2 border-background group-hover:scale-110 transition-transform duration-200"></div>

                <div className="bg-card-bg border border-border-color rounded-2xl p-4 flex flex-col gap-2 hover:border-primary-accent/30 transition-all duration-300">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-primary-accent font-bold flex items-center gap-1.5">
                      {getHistoryIcon(item.type)}
                      {formatHistoryType(item.type)}
                    </span>
                    <span className="text-[10px] text-text-secondary font-medium">
                      {getRelativeTime(item.timestamp)}
                    </span>
                  </div>

                  <h4 className="text-sm md:text-base font-bold text-text-primary">
                    {item.query}
                  </h4>

                  {item.metadata?.paperCount !== undefined && (
                    <span className="text-xs text-text-secondary/80 font-medium">
                      Processed with {item.metadata.paperCount} relevant publication sources.
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </PageContainer>
  );
}
