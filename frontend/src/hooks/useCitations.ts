import { useMutation } from "@tanstack/react-query";
import { api } from "../lib/api";
import { CitationRequest, CitationResponse } from "../types";

export const useCitations = () => {
  return useMutation<CitationResponse, Error, CitationRequest>({
    mutationFn: async (payload) => {
      const response = await api.post<CitationResponse>("/api/v1/citations", payload);
      return response.data;
    },
  });
};
