"use client";

import { useState, useEffect, useRef } from "react";
import PageContainer from "../../components/layout/PageContainer";
import { useCitations } from "../../hooks/useCitations";
import { useSavedStore } from "../../store/useSavedStore";
import { 
  Quote, 
  Loader2, 
  Check, 
  Copy, 
  X,
  History,
  Download,
  Lightbulb,
  Plus,
  Trash2,
  AlertCircle
} from "lucide-react";

// Pre-computed high-fidelity citations mapping to the pre-staged papers
const MOCK_CITATIONS: Record<string, { title: string; authors: string; year: number; apa: string; ieee: string; bibtex: string }> = {
  "arxiv-1706.03762": {
    title: "Attention Is All You Need",
    authors: "Vaswani, A., Shazeer, N., Parmar, N., et al.",
    year: 2017,
    apa: "Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., Kaiser, L., & Polosukhin, I. (2017). Attention is all you need. Advances in Neural Information Processing Systems, 30, 5998-6008.",
    ieee: "[1] A. Vaswani et al., \"Attention is all you need,\" in Advances in Neural Information Processing Systems, vol. 30, 2017, pp. 5998-6008.",
    bibtex: `@inproceedings{vaswani2017attention,
  author    = {Vaswani, Ashish and Shazeer, Noam and Parmar, Niki and Uszkoreit, Jakob and Jones, Llion and Gomez, Aidan N and Kaiser, Lukasz and Polosukhin, Illia},
  title     = {Attention is all you need},
  booktitle = {Advances in Neural Information Processing Systems},
  volume    = {30},
  year      = {2017}
}`
  },
  "arxiv-1810.04805": {
    title: "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding",
    authors: "Devlin, J., Chang, M.-W., Lee, K., et al.",
    year: 2018,
    apa: "Devlin, J., Chang, M.-W., Lee, K., & Toutanova, K. (2018). BERT: Pre-training of deep bidirectional transformers for language understanding. arXiv preprint arXiv:1810.04805.",
    ieee: "[2] J. Devlin, M.-W. Chang, K. Lee, and K. Toutanova, \"BERT: Pre-training of deep bidirectional transformers for language understanding,\" arXiv preprint arXiv:1810.04805, 2018.",
    bibtex: `@article{devlin2018bert,
  author    = {Devlin, Jacob and Chang, Ming-Wei and Lee, Kenton and Toutanova, Kristina},
  title     = {BERT: Pre-training of deep bidirectional transformers for language understanding},
  journal   = {arXiv preprint arXiv:1810.04805},
  year      = {2018}
}`
  },
  "arxiv-1907.11692": {
    title: "RoBERTa: A Robustly Optimized BERT Pretraining Approach",
    authors: "Liu, Y., Ott, M., Goyal, N., et al.",
    year: 2019,
    apa: "Liu, Y., Ott, M., Goyal, N., Du, J., Joshi, M., Chen, D., Levy, O., Lewis, M., Zettlemoyer, L., & Stoyanov, V. (2019). RoBERTa: A robustly optimized BERT pretraining approach. arXiv preprint arXiv:1907.11692.",
    ieee: "[3] Y. Liu et al., \"RoBERTa: A robustly optimized BERT pretraining approach,\" arXiv preprint arXiv:1907.11692, 2019.",
    bibtex: `@article{liu2019roberta,
  author    = {Liu, Yinhan and Ott, Myle and Goyal, Naman and Du, Jingfei and Joshi, Mandar and Chen, Danqi and Levy, Omer and Lewis, Mike and Zettlemoyer, Luke and Stoyanov, Veselin},
  title     = {RoBERTa: A robustly optimized BERT pretraining approach},
  journal   = {arXiv preprint arXiv:1907.11692},
  year      = {2019}
}`
  },
  "arxiv-2010.11929": {
    title: "An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale",
    authors: "Dosovitskiy, A., Beyer, L., Kolesnikov, A., et al.",
    year: 2020,
    apa: "Dosovitskiy, A., Beyer, L., Kolesnikov, A., Weissenborn, D., Zhai, X., Unterthiner, T., Dehghani, M., Minderer, M., Heigold, G., Gelly, S., Uszkoreit, J., & Houlsby, N. (2020). An image is worth 16x16 words: Transformers for image recognition at scale. arXiv preprint arXiv:2010.11929.",
    ieee: "[4] A. Dosovitskiy et al., \"An image is worth 16x16 words: Transformers for image recognition at scale,\" arXiv preprint arXiv:2010.11929, 2020.",
    bibtex: `@article{dosovitskiy2020image,
  author    = {Dosovitskiy, Alexey and Beyer, Lucas and Kolesnikov, Alexander and Weissenborn, Dirk and Zhai, Xiaohua and Unterthiner, Thomas and Dehghani, Mostafa and Minderer, Matthias and Heigold, Georg and Gelly, Sylvain and Uszkoreit, Jakob and Houlsby, Neil},
  title     = {An image is worth 16x16 words: Transformers for image recognition at scale},
  journal   = {arXiv preprint arXiv:2010.11929},
  year      = {2020}
}`
  },
  "arxiv-2001.08361": {
    title: "Scaling Laws for Neural Language Models",
    authors: "Kaplan, J., McCandlish, S., Henighan, T., et al.",
    year: 2020,
    apa: "Kaplan, J., McCandlish, S., Henighan, T., Brown, T. B., Chess, B., Child, R., ... & Amodei, D. (2020). Scaling laws for neural language models. arXiv preprint arXiv:2001.08361.",
    ieee: "[5] J. Kaplan et al., \"Scaling laws for neural language models,\" arXiv preprint arXiv:2001.08361, 2020.",
    bibtex: `@article{kaplan2020scaling,
  author    = {Kaplan, Jared and McCandlish, Sam and Henighan, Tom and Brown, Tom B and Chess, Benjamin and Child, Rewon and Gray, Scott and Radford, Alec and Wu, Jeffrey and Amodei, Dario},
  title     = {Scaling laws for neural language models},
  journal   = {arXiv preprint arXiv:2001.08361},
  year      = {2020}
}`
  },
  "econ-2022-climate-trade": {
    title: "The Impact of Climate Change on Global Trade",
    authors: "Carlton, T., et al.",
    year: 2022,
    apa: "Carlton, T., et al. (2022). The Impact of Climate Change on Global Trade. Journal of Environmental Economics, 45(2), 123-145.",
    ieee: "[6] T. Carlton et al., \"The Impact of Climate Change on Global Trade,\" Journal of Environmental Economics, vol. 45, no. 2, pp. 123-145, 2022.",
    bibtex: `@article{carlton2022impact,
  author    = {Carlton, Tamma and others},
  title     = {The Impact of Climate Change on Global Trade},
  journal   = {Journal of Environmental Economics},
  volume    = {45},
  number    = {2},
  pages     = {123--145},
  year      = {2022}
}`
  }
};

interface HistoryItem {
  id: string;
  style: "apa" | "ieee" | "bibtex";
  paperIds: string[];
  paperCount: number;
  timestamp: string;
}

export default function CitationsPage() {
  // Pre-populate with first 4 default papers from the screenshot
  const [selectedPaperIds, setSelectedPaperIds] = useState<string[]>([
    "arxiv-1706.03762",
    "arxiv-1810.04805",
    "arxiv-1907.11692",
    "arxiv-2010.11929"
  ]);
  const [activeStyle, setActiveStyle] = useState<"apa" | "ieee" | "bibtex">("apa");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [addDropdownOpen, setAddDropdownOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [citationHistory, setCitationHistory] = useState<HistoryItem[]>([
    {
      id: "hist-1",
      style: "apa",
      paperIds: ["arxiv-1706.03762", "arxiv-1810.04805", "arxiv-1907.11692", "arxiv-2010.11929"],
      paperCount: 4,
      timestamp: "10 mins ago"
    },
    {
      id: "hist-2",
      style: "bibtex",
      paperIds: ["arxiv-1706.03762"],
      paperCount: 1,
      timestamp: "2 hours ago"
    },
    {
      id: "hist-3",
      style: "ieee",
      paperIds: ["arxiv-2001.08361", "econ-2022-climate-trade"],
      paperCount: 2,
      timestamp: "Yesterday"
    }
  ]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const citationMutation = useCitations();
  const savedPapers = useSavedStore((state) => state.savedPapers);
  const savedList = Object.values(savedPapers);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAddDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Format a paper dynamically or fetch from mock mapping
  const getFormattedCitation = (paperId: string, index: number, style: "apa" | "ieee" | "bibtex") => {
    const paperItem = savedPapers[paperId];
    if (!paperItem) return "";
    const paper = paperItem.paper;

    const mock = MOCK_CITATIONS[paper.id];
    if (mock) {
      if (style === "apa") return mock.apa;
      if (style === "ieee") {
        // Adjust IEEE number dynamically to match layout order
        return mock.ieee.replace(/\[\d+\]/, `[${index}]`);
      }
      return mock.bibtex;
    }

    // Dynamic fallback format
    const authorStr = paper.authors && paper.authors.length > 0 ? paper.authors.join(", ") : "Unknown Authors";
    const yearVal = paper.year || new Date().getFullYear();
    const venueVal = paper.venue || "arXiv preprint";
    const cleanId = paper.id.replace(/[^a-zA-Z0-9]/g, "");

    if (style === "apa") {
      return `${authorStr} (${yearVal}). ${paper.title}. ${venueVal}.${paper.url ? ` Retrieved from ${paper.url}` : ""}`;
    }
    if (style === "ieee") {
      return `[${index}] ${authorStr}, "${paper.title}," ${venueVal}, ${yearVal}.`;
    }
    return `@article{${cleanId}_${yearVal},
  author    = {${authorStr}},
  title     = {${paper.title}},
  journal   = {${venueVal}},
  year      = {${yearVal}}${paper.url ? `,\n  url       = {${paper.url}}` : ""}
}`;
  };

  const handleRemovePaper = (id: string) => {
    setSelectedPaperIds(selectedPaperIds.filter((pId) => pId !== id));
  };

  const handleAddPaper = (id: string) => {
    if (!selectedPaperIds.includes(id)) {
      setSelectedPaperIds([...selectedPaperIds, id]);
    }
    setAddDropdownOpen(false);
  };

  const handleGenerate = () => {
    if (selectedPaperIds.length === 0) return;
    
    // Call backend mutation for synchronization/storing if available
    citationMutation.mutate({
      paper_ids: selectedPaperIds,
      formats: [activeStyle],
    });

    // Premium UI animation loader
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      // Append to local history
      const newHistory: HistoryItem = {
        id: `hist-${Date.now()}`,
        style: activeStyle,
        paperIds: [...selectedPaperIds],
        paperCount: selectedPaperIds.length,
        timestamp: "Just now"
      };
      setCitationHistory([newHistory, ...citationHistory]);
    }, 600);
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAll = () => {
    if (selectedPaperIds.length === 0) return;
    const allText = selectedPaperIds
      .map((id, index) => getFormattedCitation(id, index + 1, activeStyle))
      .filter(Boolean)
      .join("\n\n");

    navigator.clipboard.writeText(allText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleExportAll = () => {
    if (selectedPaperIds.length === 0) return;
    const allText = selectedPaperIds
      .map((id, index) => getFormattedCitation(id, index + 1, activeStyle))
      .filter(Boolean)
      .join("\n\n");

    const extension = activeStyle === "bibtex" ? "bib" : "txt";
    const blob = new Blob([allText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `paperpilot_citations_${activeStyle}.${extension}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleClearHistory = () => {
    setCitationHistory([]);
  };

  const handleLoadHistory = (item: HistoryItem) => {
    setSelectedPaperIds(item.paperIds);
    setActiveStyle(item.style);
    setHistoryOpen(false);
  };

  const handleDeleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCitationHistory(citationHistory.filter((item) => item.id !== id));
  };

  const styleLabel = activeStyle === "apa" 
    ? "APA 7th Citations" 
    : activeStyle === "ieee" 
      ? "IEEE Citations" 
      : "BibTeX Citations";

  const unselectedPapers = savedList.filter(({ paper }) => !selectedPaperIds.includes(paper.id));

  // Render actions for PageContainer
  const headerActions = (
    <div className="flex items-center gap-2.5">
      <button 
        onClick={() => setHistoryOpen(true)}
        className="px-4 py-2 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-text-primary rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
      >
        <History className="w-3.5 h-3.5 text-text-secondary" />
        Citation History
      </button>
      <button 
        onClick={handleExportAll}
        disabled={selectedPaperIds.length === 0}
        className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] disabled:bg-[#10B981]/40 disabled:cursor-not-allowed text-[#070A13] rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer"
      >
        <Download className="w-3.5 h-3.5" />
        Export All
      </button>
    </div>
  );

  return (
    <PageContainer 
      title="Citations" 
      subtitle="Generate and organize academic citation formats including APA, IEEE, and BibTeX."
      actions={headerActions}
    >
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        {/* Left Side: Staging / Selected Papers List */}
        <div className="lg:col-span-5 bg-[#0B0F19]/60 border border-white/10 rounded-2xl p-5 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest">
              Selected Papers ({selectedPaperIds.length})
            </h3>
          </div>

          <div className="flex flex-col gap-3">
            {/* Scrollable list of paper cards */}
            <div className="flex flex-col gap-2.5 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin">
              {selectedPaperIds.length === 0 ? (
                <div className="text-xs text-text-secondary/70 italic text-center py-10 bg-white/5 rounded-xl border border-white/5">
                  No papers selected. Staging list is empty.
                </div>
              ) : (
                selectedPaperIds.map((pId, idx) => {
                  const paperItem = savedPapers[pId];
                  if (!paperItem) return null;
                  const { paper } = paperItem;
                  return (
                    <div 
                      key={pId} 
                      className="bg-[#0E1527] border border-white/5 p-3.5 rounded-xl flex items-center justify-between gap-4 group hover:border-emerald-500/20 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Green badge with number */}
                        <div className="w-6 h-6 rounded-md bg-[#10B981]/15 text-[#10B981] flex items-center justify-center font-bold text-xs shrink-0 border border-[#10B981]/25">
                          {idx + 1}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[13px] font-semibold text-text-primary truncate">{paper.title}</span>
                          <span className="text-[11px] text-text-secondary truncate mt-0.5">
                            {paper.authors ? paper.authors.join(", ") : "Unknown"} ({paper.year || "N/A"})
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleRemovePaper(pId)}
                        className="text-text-secondary hover:text-rose-400 p-1 rounded-md hover:bg-white/5 transition-all shrink-0 cursor-pointer"
                        title="Remove paper"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Add Paper button & menu */}
            {unselectedPapers.length > 0 && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setAddDropdownOpen(!addDropdownOpen)}
                  className="w-full py-2.5 border border-dashed border-white/10 hover:border-emerald-500/30 bg-white/5 hover:bg-white/10 text-text-secondary hover:text-emerald-400 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Staged Paper
                </button>

                {addDropdownOpen && (
                  <div className="absolute left-0 bottom-full mb-2 w-full max-h-[220px] overflow-y-auto bg-[#0d1224] border border-white/10 rounded-xl shadow-2xl z-20 p-2 flex flex-col gap-1">
                    <div className="text-[10px] text-text-secondary uppercase font-bold tracking-wider px-2 py-1 border-b border-white/5 mb-1">
                      Choose from bookmarked papers
                    </div>
                    {unselectedPapers.map(({ paper }) => (
                      <button
                        key={paper.id}
                        onClick={() => handleAddPaper(paper.id)}
                        className="w-full text-left px-2 py-2 rounded-lg text-xs hover:bg-[#10B981]/10 hover:text-emerald-400 text-text-primary transition-all truncate cursor-pointer"
                      >
                        {paper.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-white/5 pt-4 flex flex-col gap-3">
            {/* Citation Style Selector Label */}
            <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">
              Citation Style
            </span>

            {/* Tab pills */}
            <div className="flex gap-2">
              {(["apa", "ieee", "bibtex"] as const).map((style) => {
                const label = style === "apa" ? "APA 7th" : style === "ieee" ? "IEEE" : "BibTeX";
                const active = activeStyle === style;
                return (
                  <button
                    key={style}
                    onClick={() => setActiveStyle(style)}
                    className={`flex-1 text-center py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      active 
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" 
                        : "bg-white/5 border-white/5 text-text-secondary hover:text-text-primary hover:bg-white/10"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Generate Citations action */}
            <button
              onClick={handleGenerate}
              disabled={selectedPaperIds.length === 0 || isGenerating}
              className="w-full mt-2 bg-[#10B981] hover:bg-[#059669] disabled:bg-[#10B981]/40 disabled:cursor-not-allowed text-[#070A13] font-bold text-xs py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10 uppercase tracking-wider"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  Generate Citations
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Side: Citations output layout */}
        <div className="lg:col-span-7 flex flex-col min-h-full">
          {/* Dynamic Style title header above container */}
          <h3 className="text-sm font-bold text-text-primary mb-3">
            {styleLabel}
          </h3>

          <div className="bg-card-bg border border-border-color rounded-2xl p-6 flex flex-col min-h-[400px] justify-between relative overflow-hidden">
            {isGenerating && (
              <div className="absolute inset-0 bg-[#0B0F19]/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-4 text-center">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                <span className="text-sm font-bold text-text-primary">Generating Citations List</span>
                <span className="text-xs text-text-secondary max-w-sm">Resolving metadata parameters, constructing {activeStyle.toUpperCase()} references...</span>
              </div>
            )}

            {/* Render List */}
            {selectedPaperIds.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-16">
                <Quote className="w-8 h-8 text-text-secondary/30" />
                <span className="text-sm font-bold text-text-primary">No Citations Generated</span>
                <span className="text-xs text-text-secondary max-w-xs leading-normal">
                  Add staged papers on the left and click Generate Citations to render the reference entries.
                </span>
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-1">
                <div className="flex flex-col max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
                  {selectedPaperIds.map((pId, idx) => {
                    const citationText = getFormattedCitation(pId, idx + 1, activeStyle);
                    if (!citationText) return null;
                    const cleanIndex = idx + 1;
                    return (
                      <div 
                        key={pId} 
                        className="flex items-start gap-4 py-4 border-b border-white/5 last:border-b-0 group/item"
                      >
                        <span className="text-xs font-bold text-emerald-400 shrink-0 pt-0.5">
                          {cleanIndex}.
                        </span>
                        
                        {activeStyle === "bibtex" ? (
                          <pre className="text-[11px] text-text-secondary font-mono overflow-x-auto whitespace-pre-wrap select-all leading-normal flex-1 max-w-full">
                            {citationText}
                          </pre>
                        ) : (
                          <p className="text-xs text-text-secondary leading-relaxed select-all flex-1 font-medium font-sans">
                            {citationText}
                          </p>
                        )}

                        <button
                          onClick={() => handleCopyText(citationText, `${pId}-${activeStyle}`)}
                          className="p-1.5 border border-white/10 bg-white/5 hover:bg-emerald-500/10 text-text-secondary hover:text-emerald-400 rounded-lg transition-all shrink-0 cursor-pointer"
                          title="Copy citation"
                        >
                          {copiedId === `${pId}-${activeStyle}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom row actions inside card */}
                <div className="border-t border-white/5 pt-4 mt-auto flex justify-end">
                  <button
                    onClick={handleCopyAll}
                    className="px-4 py-2 border border-white/10 bg-white/5 hover:bg-white/10 text-text-primary rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                  >
                    {copiedAll ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        Copied All
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-text-secondary" />
                        Copy All
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Tip Banner below Citations Card */}
          <div className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400 shrink-0 mt-0.5">
              <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1 .3 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
              <path d="M9 18h6" />
              <path d="M10 22h4" />
            </svg>
            <p className="text-xs text-amber-200/80 font-medium leading-relaxed">
              Tip: You can export citations in your preferred format and use them in your research papers.
            </p>
          </div>
        </div>
      </div>

      {/* Slide-out Citation History panel */}
      {historyOpen && (
        <>
          {/* Backdrop */}
          <div 
            onClick={() => setHistoryOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity animate-fade-in"
          />

          {/* Drawer container */}
          <div className="fixed top-0 right-0 h-full w-[380px] bg-[#0E1527] border-l border-white/10 shadow-2xl z-50 p-6 flex flex-col justify-between transition-transform duration-300 transform translate-x-0">
            <div className="flex flex-col gap-6 overflow-y-auto flex-1">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                  <History className="w-4 h-4 text-emerald-400" />
                  Citation History
                </h3>
                <button
                  onClick={() => setHistoryOpen(false)}
                  className="text-text-secondary hover:text-text-primary p-1 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {citationHistory.length === 0 ? (
                <div className="text-xs text-text-secondary/70 italic text-center py-12">
                  No history records found.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {citationHistory.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleLoadHistory(item)}
                      className="bg-white/5 border border-white/5 hover:border-emerald-500/30 p-3.5 rounded-xl flex items-center justify-between gap-3 cursor-pointer group transition-all"
                    >
                      <div className="flex flex-col gap-1 min-w-0">
                        <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">
                          {item.style.toUpperCase()} style
                        </span>
                        <span className="text-xs text-text-primary truncate font-semibold">
                          {item.paperCount} paper{item.paperCount > 1 ? "s" : ""} selected
                        </span>
                        <span className="text-[10px] text-text-secondary">
                          {item.timestamp}
                        </span>
                      </div>

                      <button
                        onClick={(e) => handleDeleteHistoryItem(item.id, e)}
                        className="text-text-secondary hover:text-rose-400 p-1.5 rounded-md hover:bg-white/5 transition-colors shrink-0 cursor-pointer"
                        title="Delete from history"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {citationHistory.length > 0 && (
              <div className="border-t border-white/5 pt-4 mt-auto">
                <button
                  onClick={handleClearHistory}
                  className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/20 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear All History
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </PageContainer>
  );
}
