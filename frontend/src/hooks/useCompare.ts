import { useMutation } from "@tanstack/react-query";
import { api } from "../lib/api";
import { CompareRequest, CompareResponse } from "../types";
import { useHistoryStore } from "../store/useHistoryStore";

export const useCompare = () => {
  const addHistoryItem = useHistoryStore((state) => state.addHistoryItem);

  return useMutation<CompareResponse, Error, CompareRequest>({
    mutationFn: async (payload) => {
      const response = await api.post<CompareResponse>("/api/v1/compare", payload);
      return response.data;
    },
    onSuccess: (data, variables) => {
      addHistoryItem("compare", variables.query, {
        paperCount: data.papers?.length || 0,
      });
    },
  });
};
