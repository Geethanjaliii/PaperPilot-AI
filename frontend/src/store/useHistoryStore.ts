import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Paper } from "../types";

export interface HistoryItem {
  id: string;
  type: "search" | "review" | "compare" | "ask";
  query: string;
  timestamp: string;
  metadata?: any;
}

export interface HistoryState {
  historyItems: HistoryItem[];
  addHistoryItem: (type: HistoryItem["type"], query: string, metadata?: any) => void;
  clearHistory: () => void;
  removeHistoryItem: (id: string) => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      historyItems: [
        {
          id: "hist-1",
          type: "search",
          query: "large language models RLHF",
          timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2 hours ago
          metadata: { paperCount: 3 }
        },
        {
          id: "hist-2",
          type: "review",
          query: "Climate Impact on Global Trade",
          timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString(), // 6 hours ago
          metadata: { paperCount: 15, status: "Ready" }
        },
        {
          id: "hist-3",
          type: "compare",
          query: "transformer architectures",
          timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), // Yesterday
          metadata: { paperCount: 2 }
        }
      ],

      addHistoryItem: (type, query, metadata = {}) => {
        const newItem: HistoryItem = {
          id: `hist-${Date.now()}`,
          type,
          query,
          timestamp: new Date().toISOString(),
          metadata,
        };
        set((state) => ({
          historyItems: [newItem, ...state.historyItems],
        }));
      },

      clearHistory: () => set({ historyItems: [] }),

      removeHistoryItem: (id) =>
        set((state) => ({
          historyItems: state.historyItems.filter((item) => item.id !== id),
        })),
    }),
    {
      name: "paperpilot-history-store",
    }
  )
);
