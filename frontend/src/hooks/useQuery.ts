import { useMutation } from "@tanstack/react-query";
import { api } from "../lib/api";
import { QueryRequest, QueryResponse } from "../types";
import { useHistoryStore } from "../store/useHistoryStore";

export const useQuery = () => {
  const addHistoryItem = useHistoryStore((state) => state.addHistoryItem);

  return useMutation<QueryResponse, Error, QueryRequest>({
    mutationFn: async (payload) => {
      const response = await api.post<QueryResponse>("/api/v1/query", payload);
      return response.data;
    },
    onSuccess: (data, variables) => {
      addHistoryItem("ask", variables.query, {
        summaryLength: data.summary?.length || 0,
        paperCount: data.papers?.length || 0,
      });
    },
  });
};
