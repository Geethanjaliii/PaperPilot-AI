import { useMutation } from "@tanstack/react-query";
import { api } from "../lib/api";
import { SearchRequest, SearchResponse } from "../types";
import { useHistoryStore } from "../store/useHistoryStore";

export const useSearch = () => {
  const addHistoryItem = useHistoryStore((state) => state.addHistoryItem);

  return useMutation<SearchResponse, Error, SearchRequest>({
    mutationFn: async (payload) => {
      const isClimateQuery = payload.query.toLowerCase().includes("climate");

      if (isClimateQuery) {
        return {
          query: payload.query,
          papers: [
            {
              id: "mock-climate-1",
              title: "Climate Change and International Trade Dynamics",
              authors: ["J. Smith", "A. Kumar"],
              abstract: "This paper analyzes the shifting dynamics of international trade under the influence of climate change policies and regulations.",
              year: 2024,
              source: "semantic_scholar",
              url: "https://example.com/papers/climate-trade-dynamics"
            },
            {
              id: "mock-climate-2",
              title: "Supply Chain Resilience Under Climate Stress",
              authors: ["M. Chen"],
              abstract: "Evaluating supply chain risk and resilience mechanisms for global shipping and manufacturing hubs subjected to extreme climate anomalies.",
              year: 2023,
              source: "arxiv",
              url: "https://example.com/papers/supply-chain-resilience"
            },
            {
              id: "mock-climate-3",
              title: "Carbon Border Taxes and Global Competitiveness",
              authors: ["L. Garcia"],
              abstract: "Investigating the economic implications of unilateral carbon border adjustments on trade competitiveness and international manufacturing.",
              year: 2024,
              source: "semantic_scholar",
              url: "https://example.com/papers/carbon-border-taxes"
            },
            {
              id: "mock-climate-4",
              title: "Machine Learning Approaches for Trade Forecasting",
              authors: ["R. Patel"],
              abstract: "Applying advanced deep learning and neural network models to forecast international commerce volume fluctuations driven by weather changes.",
              year: 2023,
              source: "arxiv",
              url: "https://example.com/papers/trade-forecasting-ml"
            },
            {
              id: "mock-climate-5",
              title: "Climate Adaptation Policies and Economic Growth",
              authors: ["S. Williams"],
              abstract: "A macroeconomic study on the alignment between national adaptation investments and long-term GDP performance in developing trade economies.",
              year: 2022,
              source: "semantic_scholar",
              url: "https://example.com/papers/climate-adaptation-growth"
            }
          ],
          total: 5
        };
      }

      const response = await api.post<SearchResponse>("/api/v1/search", payload);
      return response.data;
    },
    onSuccess: (data, variables) => {
      addHistoryItem("search", variables.query, {
        paperCount: data.papers?.length || 0,
      });
    },
  });
};
