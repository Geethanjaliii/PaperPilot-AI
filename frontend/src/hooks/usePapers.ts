import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Paper, PaperListResponse } from "../types";

export const useGetPapers = () => {
  return useQuery<PaperListResponse, Error>({
    queryKey: ["papers"],
    queryFn: async () => {
      const response = await api.get<PaperListResponse>("/api/v1/papers");
      return response.data;
    },
  });
};

export const useGetPaperDetails = (paperId: string) => {
  return useQuery<Paper, Error>({
    queryKey: ["paper", paperId],
    queryFn: async () => {
      const response = await api.get<Paper>(`/api/v1/papers/${paperId}`);
      return response.data;
    },
    enabled: !!paperId,
  });
};
