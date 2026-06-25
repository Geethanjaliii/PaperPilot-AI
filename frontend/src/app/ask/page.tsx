"use client";

import { useState, useRef, useEffect } from "react";
import PageContainer from "../../components/layout/PageContainer";
import { useQuery } from "../../hooks/useQuery";
import { Paper, FormattedCitation } from "../../types";
import { 
  Sparkles, 
  Loader2, 
  Send, 
  Paperclip, 
  Image as ImageIcon,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  ExternalLink,
  BookOpen,
  History,
  Trash2
} from "lucide-react";
import MarkdownRenderer from "../../components/shared/MarkdownRenderer";

interface Message {
  id: string;
  sender: "user" | "pilot";
  text: string;
  papers?: Paper[];
  citations?: FormattedCitation[];
}

export default function AskPage() {
  const [queryInput, setQueryInput] = useState("");
  const [deepScan, setDeepScan] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-1",
      sender: "user",
      text: "Summarize the recent breakthroughs in transformer efficiency for mobile devices.",
    },
    {
      id: "msg-2",
      sender: "pilot",
      text: "Recent breakthroughs in transformer efficiency focus on **Linear Attention mechanisms** and **Dynamic Token Pruning**. Researchers have successfully reduced computational complexity from quadratic to linear [1].\n\nKey developments include:\n- **MobileViT v3**: Optimizing global representations with local convolution for edge devices [2].\n- **FlashAttention-2**: While primarily for GPUs, the memory-bound principles are being adapted for mobile NPUs [3].",
      papers: [
        {
          id: "p1",
          title: "Linear Attention Mechanisms for Device Transformers",
          authors: ["Smith, J.", "Doe, A."],
          abstract: "Abstract summary of device transformers...",
          year: 2023,
          source: "arxiv",
          url: "https://arxiv.org",
        },
        {
          id: "p2",
          title: "MobileViT v3: Mobile Vision Transformers at Scale",
          authors: ["Mehta, S.", "Rastegari, M."],
          abstract: "Abstract details...",
          year: 2023,
          source: "arxiv",
        },
        {
          id: "p3",
          title: "FlashAttention-2: Faster Attention with Better Parallelism",
          authors: ["Dao, T."],
          abstract: "Faster attention mechanisms...",
          year: 2023,
          source: "semantic_scholar",
        },
      ],
    },
  ]);

  const queryMutation = useQuery();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, queryMutation.isPending]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInput.trim() || queryMutation.isPending) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: queryInput,
    };

    setMessages((prev) => [...prev, userMessage]);
    const activeQuery = queryInput;
    setQueryInput("");

    queryMutation.mutate(
      { query: activeQuery, max_papers: deepScan ? 10 : 3 },
      {
        onSuccess: (data) => {
          const pilotMessage: Message = {
            id: `pilot-${Date.now()}`,
            sender: "pilot",
            text: data.summary || data.literature_review,
            papers: data.papers,
            citations: data.citations,
          };
          setMessages((prev) => [...prev, pilotMessage]);
        },
        onError: (error) => {
          const errorMessage: Message = {
            id: `err-${Date.now()}`,
            sender: "pilot",
            text: `Error parsing query pipeline. Details: ${error.message || "Gemini API rate limit exceeded."}`,
          };
          setMessages((prev) => [...prev, errorMessage]);
        },
      }
    );
  };

  const handleClearHistory = () => {
    setMessages([]);
  };

  return (
    <PageContainer 
      title="Ask Papers" 
      subtitle="Perplexity-style academic research assistant querying multiple papers."
      actions={
        <button
          onClick={handleClearHistory}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-card-bg hover:bg-white/5 border border-border-color rounded-xl text-xs text-text-secondary hover:text-text-primary transition-all cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Feed</span>
        </button>
      }
    >
      <div className="flex-1 flex flex-col gap-6 max-w-4xl mx-auto w-full pb-28">
        {/* Chat Feed */}
        <div className="flex-1 flex flex-col gap-6">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center gap-3">
              <Sparkles className="w-8 h-8 text-primary-accent animate-pulse" />
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-text-primary">Academic Conversational Assistant</span>
                <span className="text-xs text-text-secondary max-w-xs leading-normal">
                  Ask questions about specific paper details, methodologies, or mathematical properties.
                </span>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              if (msg.sender === "user") {
                return (
                  <div key={msg.id} className="flex justify-end pl-12 select-text">
                    <div className="bg-card-bg border border-border-color rounded-2xl p-4 text-xs md:text-sm text-text-primary max-w-xl">
                      {msg.text}
                    </div>
                  </div>
                );
              } else {
                // Pilot Analysis rendering
                const isError = msg.text.startsWith("Error");
                return (
                  <div key={msg.id} className="flex flex-col gap-3 pr-12 select-text">
                    {/* Header bar */}
                    <div className="flex items-center gap-2 text-xs font-extrabold text-primary-accent uppercase tracking-widest">
                      <Sparkles className="w-4 h-4 text-primary-accent" />
                      Pilot Analysis
                    </div>

                    {/* Content card */}
                    <div className="border-l-2 border-primary-accent bg-card-bg/60 border-y border-r border-border-color rounded-r-2xl p-4 md:p-5 flex flex-col gap-4">
                      <MarkdownRenderer content={msg.text} />

                      {/* References / Sources nested section */}
                      {msg.papers && msg.papers.length > 0 && (
                        <div className="border-t border-border-color/60 pt-4 mt-2">
                          <h5 className="text-[10px] font-extrabold text-text-secondary uppercase tracking-widest mb-3 flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-text-secondary/80" />
                            SOURCES ({msg.papers.length})
                          </h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {msg.papers.map((paper, idx) => (
                              <div key={paper.id} className="bg-card-bg border border-border-color/60 rounded-xl p-3 flex justify-between gap-3 items-start hover:border-primary-accent/30 transition-all">
                                <div className="flex flex-col gap-1 overflow-hidden">
                                  <span className="text-[10px] font-extrabold text-primary-accent">[{idx + 1}] Source Node</span>
                                  <span className="text-xs font-bold text-text-primary truncate" title={paper.title}>
                                    {paper.title}
                                  </span>
                                  <span className="text-[9px] text-text-secondary font-medium truncate">
                                    {paper.authors?.[0] || "Unknown"} et al. • {paper.year || "N/A"}
                                  </span>
                                </div>
                                {paper.url && (
                                  <a 
                                    href={paper.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-text-secondary hover:text-text-primary transition-colors shrink-0"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
            })
          )}

          {/* Pending / Generation State */}
          {queryMutation.isPending && (
            <div className="flex flex-col gap-3 pr-12">
              <div className="flex items-center gap-2 text-xs font-extrabold text-primary-accent uppercase tracking-widest">
                <Loader2 className="w-4 h-4 text-primary-accent animate-spin" />
                PILOT IS SCROLLING DATA...
              </div>
              <div className="border-l-2 border-primary-accent bg-card-bg/60 border-y border-r border-border-color rounded-r-2xl p-4 text-xs text-text-secondary animate-pulse">
                Querying multi-agent LangGraph workflow nodes, parsing vector databases...
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form Box (Fixed at the bottom above the mobile bottom nav / screen padding) */}
        <div className="fixed bottom-14 md:bottom-6 left-0 md:left-64 right-0 z-30 px-4 md:px-8">
          <form 
            onSubmit={handleSend}
            className="max-w-4xl mx-auto w-full bg-surface/95 border border-border-color rounded-2xl p-2 flex flex-col gap-2 shadow-2xl backdrop-blur-md"
          >
            {/* Input area */}
            <div className="flex items-center gap-2 px-2">
              <input
                type="text"
                placeholder="Ask a follow-up or query research topics..."
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                className="flex-1 bg-transparent text-xs md:text-sm text-text-primary outline-none py-2 px-1 placeholder:text-text-secondary/50"
                disabled={queryMutation.isPending}
              />
              <button
                type="submit"
                disabled={!queryInput.trim() || queryMutation.isPending}
                className="w-8 h-8 rounded-xl bg-primary-accent hover:bg-hover-accent disabled:bg-primary-accent/40 disabled:cursor-not-allowed text-background flex items-center justify-center transition-all cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Toolbar row */}
            <div className="flex items-center justify-between border-t border-border-color/60 pt-2 px-1 text-xs">
              <div className="flex items-center gap-1">
                <button type="button" className="p-1.5 hover:bg-white/5 rounded-lg text-text-secondary hover:text-text-primary transition-colors">
                  <Paperclip className="w-4 h-4" />
                </button>
                <button type="button" className="p-1.5 hover:bg-white/5 rounded-lg text-text-secondary hover:text-text-primary transition-colors">
                  <ImageIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Deep Scan Toggle Button */}
              <button
                type="button"
                onClick={() => setDeepScan(!deepScan)}
                className="flex items-center gap-2 px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-extrabold transition-all border border-border-color"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${deepScan ? "bg-primary-accent animate-pulse" : "bg-text-secondary"}`}></span>
                {deepScan ? "DEEP SCAN ON" : "SIMPLE SEARCH"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageContainer>
  );
}
