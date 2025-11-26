import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";
import type { Assessment } from "@/mocks/db";

export function useAssessment(jobId: string) {
  const queryClient = useQueryClient();
  const queryKey = ["assessment", jobId];

  const query = useQuery({
    queryKey,
    queryFn: () => apiClient<Assessment>(`/assessments/${jobId}`),
    enabled: !!jobId,
  });

  const saveMutation = useMutation({
    mutationFn: (data: Assessment) => apiClient(`/assessments/${jobId}`, { method: "PUT", data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Assessment saved successfully");
    },
  });

  const submitMutation = useMutation({
    mutationFn: (responses: any) => apiClient(`/assessments/${jobId}/submit`, { method: "POST", data: responses }),
    onSuccess: () => {
      toast.success("Assessment submitted successfully");
    },
  });

  return { query, saveMutation, submitMutation };
}
