import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";
import type { Candidate, TimelineEvent, Note } from "@/mocks/db";

export function useCandidateDetails(id: string) {
  const queryClient = useQueryClient();

  // --- FETCH CANDIDATE ---
  // We can reuse the list endpoint with search or just filter from cache if we had a single get endpoint.
  // But the mock handlers don't have a GET /candidates/:id. 
  // We can add it or just use the list and find.
  // Actually, let's add GET /candidates/:id to handlers if possible, or just use the list.
  // The requirements said: "Candidate profile route: /candidates/:id".
  // The mock handlers provided in the prompt had:
  // GET /candidates?search=...
  // PATCH /candidates/:id
  // GET /candidates/:id/timeline
  // It didn't explicitly show GET /candidates/:id.
  // I will assume I can fetch the list and find, or I should add the handler.
  // Adding the handler is cleaner. I'll check handlers.ts again.
  
  // Checking handlers.ts... it has PATCH /candidates/:id but not GET.
  // I'll add GET /candidates/:id to handlers.ts first.

  const candidateQuery = useQuery({
    queryKey: ["candidate", id],
    queryFn: () => apiClient<Candidate>(`/candidates/${id}`),
    enabled: !!id,
  });

  const timelineQuery = useQuery({
    queryKey: ["candidate", id, "timeline"],
    queryFn: () => apiClient<{ candidateId: string; timeline: TimelineEvent[] }>(`/candidates/${id}/timeline`),
    enabled: !!id,
  });

  const notesQuery = useQuery({
    queryKey: ["candidate", id, "notes"],
    queryFn: () => apiClient<Note[]>(`/candidates/${id}/notes`),
    enabled: !!id,
  });

  const addNoteMutation = useMutation({
    mutationFn: (content: string) => apiClient(`/candidates/${id}/notes`, { data: { content } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidate", id, "notes"] });
      toast.success("Note added");
    },
  });

  return { candidateQuery, timelineQuery, notesQuery, addNoteMutation };
}
