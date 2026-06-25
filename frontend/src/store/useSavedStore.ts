import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Paper } from "../types";

export interface Collection {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface SavedPaperState {
  savedPapers: Record<string, { paper: Paper; collectionIds: string[]; tags: string[]; savedAt: string }>;
  collections: Collection[];
  tags: string[];
  
  // Actions
  savePaper: (paper: Paper, collectionId?: string, tags?: string[]) => void;
  removePaper: (paperId: string) => void;
  addPaperToCollection: (paperId: string, collectionId: string) => void;
  removePaperFromCollection: (paperId: string, collectionId: string) => void;
  addTagToPaper: (paperId: string, tag: string) => void;
  removeTagFromPaper: (paperId: string, tag: string) => void;
  
  // Collection Actions
  createCollection: (name: string, description?: string) => void;
  deleteCollection: (collectionId: string) => void;
  
  // Tag Actions
  createGlobalTag: (tag: string) => void;
}

export const useSavedStore = create<SavedPaperState>()(
  persist(
    (set, get) => ({
      savedPapers: {
        "arxiv-1706.03762": {
          paper: {
            id: "arxiv-1706.03762",
            title: "Attention Is All You Need",
            authors: ["Vaswani et al."],
            abstract: "Introduces the Transformer architecture based solely on attention mechanisms.",
            year: 2017,
            source: "arxiv",
            venue: "NeurIPS",
            url: "https://arxiv.org/abs/1706.03762"
          },
          collectionIds: ["all", "ml", "transformers", "deep-learning"],
          tags: ["Transformers", "Deep Learning", "Machine Learning"],
          savedAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString()
        },
        "arxiv-1810.04805": {
          paper: {
            id: "arxiv-1810.04805",
            title: "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding",
            authors: ["Devlin et al."],
            abstract: "BERT model pre-trained on large text corpora for a wide range of NLP tasks.",
            year: 2018,
            source: "arxiv",
            venue: "NAACL",
            url: "https://arxiv.org/abs/1810.04805"
          },
          collectionIds: ["all", "ml", "nlp", "transformers", "deep-learning"],
          tags: ["NLP", "Transformers", "Deep Learning"],
          savedAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString()
        },
        "arxiv-1907.11692": {
          paper: {
            id: "arxiv-1907.11692",
            title: "RoBERTa: A Robustly Optimized BERT Pretraining Approach",
            authors: ["Liu et al."],
            abstract: "An optimized BERT pretraining method with larger batch size, more data, and longer training.",
            year: 2019,
            source: "arxiv",
            venue: "arXiv",
            url: "https://arxiv.org/abs/1907.11692"
          },
          collectionIds: ["all", "ml", "nlp", "transformers", "deep-learning"],
          tags: ["NLP", "Transformers", "Deep Learning"],
          savedAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString()
        },
        "arxiv-2010.11929": {
          paper: {
            id: "arxiv-2010.11929",
            title: "An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale",
            authors: ["Dosovitskiy et al."],
            abstract: "Applies Transformers directly to images by treating patches as sequences.",
            year: 2020,
            source: "arxiv",
            venue: "ICLR",
            url: "https://arxiv.org/abs/2010.11929"
          },
          collectionIds: ["all", "ml", "computer-vision", "transformers", "deep-learning"],
          tags: ["Vision", "Transformers", "Deep Learning"],
          savedAt: new Date(Date.now() - 3600 * 1000 * 48).toISOString()
        },
        "arxiv-2001.08361": {
          paper: {
            id: "arxiv-2001.08361",
            title: "Scaling Laws for Neural Language Models",
            authors: ["Kaplan et al."],
            abstract: "Empirical analysis of how model size, dataset size, and compute affect performance.",
            year: 2020,
            source: "arxiv",
            venue: "arXiv",
            url: "https://arxiv.org/abs/2001.08361"
          },
          collectionIds: ["all", "ml", "deep-learning"],
          tags: ["LLM", "Deep Learning"],
          savedAt: new Date(Date.now() - 3600 * 1000 * 72).toISOString()
        },
        "econ-2022-climate-trade": {
          paper: {
            id: "econ-2022-climate-trade",
            title: "The Impact of Climate Change on Global Trade",
            authors: ["Carlton et al."],
            abstract: "Journal: Environmental Econ. 45(2) - Examines how climate change influences international trade patterns.",
            year: 2022,
            source: "semantic_scholar",
            venue: "Journal of Environmental Economics",
            url: "https://example.com/papers/climate-trade-impact"
          },
          collectionIds: ["all", "economics"],
          tags: ["Economics", "Climate"],
          savedAt: new Date(Date.now() - 3600 * 1000 * 96).toISOString()
        }
      },
      collections: [
        { id: "all", name: "All Papers", description: "All bookmarked scientific articles", createdAt: new Date().toISOString() },
        { id: "ml", name: "Machine Learning", description: "General machine learning publications", createdAt: new Date().toISOString() },
        { id: "deep-learning", name: "Deep Learning", description: "Neural networks and deep models", createdAt: new Date().toISOString() },
        { id: "transformers", name: "Transformers", description: "Self-attention and transformer architectures", createdAt: new Date().toISOString() },
        { id: "computer-vision", name: "Computer Vision", description: "Image recognition and ViTs", createdAt: new Date().toISOString() },
        { id: "nlp", name: "NLP", description: "Natural Language Processing models", createdAt: new Date().toISOString() },
        { id: "economics", name: "Economics", description: "Macroeconomics, trade, and climate", createdAt: new Date().toISOString() }
      ],
      tags: ["Deep Learning", "Transformers", "NLP", "Vision", "LLM", "Economics", "Climate", "Machine Learning"],

      savePaper: (paper, collectionId = "all", initialTags = []) => {
        const paperId = paper.id;
        const current = get().savedPapers;
        const alreadySaved = current[paperId];

        const existingCollections = alreadySaved ? alreadySaved.collectionIds : [];
        const existingTags = alreadySaved ? alreadySaved.tags : [];

        const newCollections = Array.from(new Set([...existingCollections, collectionId]));
        const newTags = Array.from(new Set([...existingTags, ...initialTags]));

        set({
          savedPapers: {
            ...current,
            [paperId]: {
              paper,
              collectionIds: newCollections,
              tags: newTags,
              savedAt: alreadySaved ? alreadySaved.savedAt : new Date().toISOString(),
            },
          },
        });
      },

      removePaper: (paperId) => {
        const current = { ...get().savedPapers };
        delete current[paperId];
        set({ savedPapers: current });
      },

      addPaperToCollection: (paperId, collectionId) => {
        const current = get().savedPapers;
        const item = current[paperId];
        if (!item) return;

        set({
          savedPapers: {
            ...current,
            [paperId]: {
              ...item,
              collectionIds: Array.from(new Set([...item.collectionIds, collectionId])),
            },
          },
        });
      },

      removePaperFromCollection: (paperId, collectionId) => {
        const current = get().savedPapers;
        const item = current[paperId];
        if (!item) return;

        set({
          savedPapers: {
            ...current,
            [paperId]: {
              ...item,
              collectionIds: item.collectionIds.filter((id) => id !== collectionId),
            },
          },
        });
      },

      addTagToPaper: (paperId, tag) => {
        const current = get().savedPapers;
        const item = current[paperId];
        if (!item) return;

        // Add to global tags as well
        const globalTags = get().tags;
        const newGlobalTags = globalTags.includes(tag) ? globalTags : [...globalTags, tag];

        set({
          tags: newGlobalTags,
          savedPapers: {
            ...current,
            [paperId]: {
              ...item,
              tags: Array.from(new Set([...item.tags, tag])),
            },
          },
        });
      },

      removeTagFromPaper: (paperId, tag) => {
        const current = get().savedPapers;
        const item = current[paperId];
        if (!item) return;

        set({
          savedPapers: {
            ...current,
            [paperId]: {
              ...item,
              tags: item.tags.filter((t) => t !== tag),
            },
          },
        });
      },

      createCollection: (name, description) => {
        const newCollection: Collection = {
          id: `col-${Date.now()}`,
          name,
          description,
          createdAt: new Date().toISOString(),
        };
        set({
          collections: [...get().collections, newCollection],
        });
      },

      deleteCollection: (collectionId) => {
        if (collectionId === "all") return; // prevent deleting default
        
        // Remove collection from all papers first
        const papers = { ...get().savedPapers };
        Object.keys(papers).forEach((paperId) => {
          papers[paperId].collectionIds = papers[paperId].collectionIds.filter((id) => id !== collectionId);
        });

        set({
          collections: get().collections.filter((c) => c.id !== collectionId),
          savedPapers: papers,
        });
      },

      createGlobalTag: (tag) => {
        const current = get().tags;
        if (!current.includes(tag)) {
          set({ tags: [...current, tag] });
        }
      },
    }),
    {
      name: "paperpilot-saved-store",
    }
  )
);
