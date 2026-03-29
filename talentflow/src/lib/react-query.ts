import { QueryClient, type DefaultOptions } from "@tanstack/react-query";

const queryConfig: DefaultOptions = {
  queries: {
    // Disable automatic refetching for this assignment to make the 
    // simulated errors (5-10% rate) easier to observe and debug.
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
  },
};

export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
});