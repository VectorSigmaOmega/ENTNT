import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";
import type { Candidate } from "@/mocks/db";

interface CandidatesResponse {
  data: Candidate[];
  total: number;
}

interface CandidatesParams {
  page: number;
  pageSize: number;
  search: string;
  stage: string;
}

export function useCandidates(params: CandidatesParams) {
  const queryClient = useQueryClient();
  const queryKey = ["candidates", params];

  // --- FETCH CANDIDATES ---
  const query = useQuery({
    queryKey,
    queryFn: () => {
      const searchParams = new URLSearchParams({
        page: params.page.toString(),
        pageSize: params.pageSize.toString(),
        search: params.search,
        stage: params.stage,
      });
      return apiClient<CandidatesResponse>(`/candidates?${searchParams}`);
    },
    placeholderData: (prev) => prev,
  });

  // --- CREATE CANDIDATE ---
  const createMutation = useMutation({
    mutationFn: (data: Omit<Candidate, "id">) => apiClient("/candidates", { data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      toast.success("Candidate created successfully");
    },
  });

  // --- UPDATE CANDIDATE ---
  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: Partial<Candidate> & { id: string }) =>
      apiClient(`/candidates/${id}`, { method: "PATCH", data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      toast.success("Candidate updated successfully");
    },
  });

  return { query, createMutation, updateMutation };
}
