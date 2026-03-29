import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";
import type { Job } from "@/mocks/db";

interface JobsResponse {
  data: Job[];
  total: number;
}

interface JobsParams {
  page: number;
  pageSize: number;
  search: string;
  status: string;
}

export function useJobs(params: JobsParams) {
  const queryClient = useQueryClient();
  const queryKey = ["jobs", params];

  // --- FETCH JOBS ---
  const query = useQuery({
    queryKey,
    queryFn: () => {
      const searchParams = new URLSearchParams({
        page: params.page.toString(),
        pageSize: params.pageSize.toString(),
        search: params.search,
        status: params.status,
      });
      return apiClient<JobsResponse>(`/jobs?${searchParams}`);
    },
    // Keep data fresh to avoid flickering during simple navigations
    placeholderData: (prev) => prev, 
  });

  // --- CREATE JOB ---
  const createMutation = useMutation({
    mutationFn: (data: Omit<Job, "id" | "order">) => apiClient("/jobs", { data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Job created successfully");
    },
  });

  // --- UPDATE JOB ---
  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: Partial<Job> & { id: string }) =>
      apiClient(`/jobs/${id}`, { method: "PATCH", data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Job updated successfully");
    },
  });

  // --- REORDER JOB (Optimistic Update) ---
  const reorderMutation = useMutation({
    mutationFn: (payload: { id: string; fromOrder: number; toOrder: number }) =>
      apiClient(`/jobs/${payload.id}/reorder`, {
        method: "PATCH",
        data: { fromOrder: payload.fromOrder, toOrder: payload.toOrder },
      }),
    
    onMutate: async ({ fromOrder, toOrder }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousJobs = queryClient.getQueryData<JobsResponse>(queryKey);

      // Optimistically update
      if (previousJobs) {
        const newJobs = [...previousJobs.data];
        
        // Find item moving
        const movedItem = newJobs.find(j => j.order === fromOrder);
        
        if (movedItem) {
          // Adjust orders for all items affected
          const updatedJobs = newJobs.map(job => {
            if (job.id === movedItem.id) {
              return { ...job, order: toOrder };
            }

            // Moving down (e.g. 1 -> 3): items (fromOrder+1 .. toOrder) decrement
            if (fromOrder < toOrder) {
              if (job.order > fromOrder && job.order <= toOrder) {
                return { ...job, order: job.order - 1 };
              }
            }
            // Moving up (e.g. 3 -> 1): items (toOrder .. fromOrder-1) increment
            else {
              if (job.order >= toOrder && job.order < fromOrder) {
                return { ...job, order: job.order + 1 };
              }
            }

            return job;
          });

          // Sort strictly by order for display
          updatedJobs.sort((a, b) => a.order - b.order);

          queryClient.setQueryData<JobsResponse>(queryKey, {
            ...previousJobs,
            data: updatedJobs
          });
        }
      }

      return { previousJobs };
    },
    
    onError: (_err, _variables, context) => {
      // Rollback on error (simulated 500s)
      if (context?.previousJobs) {
        queryClient.setQueryData(queryKey, context.previousJobs);
      }
      toast.error("Failed to reorder jobs. Changes reverted.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return { query, createMutation, updateMutation, reorderMutation };
}