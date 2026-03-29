// Generic fetch wrapper to handle the simulated API responses
export async function apiClient<T>(
  endpoint: string,
  { data, headers: customHeaders, ...customConfig }: RequestInit & { data?: unknown } = {}
): Promise<T> {
  const config: RequestInit = {
    method: data ? "POST" : "GET",
    body: data ? JSON.stringify(data) : undefined,
    headers: {
      "Content-Type": data ? "application/json" : "",
      ...customHeaders,
    },
    ...customConfig,
  };

  // Ensure we don't send content-type for GET requests if not needed
  if (!data) {
    delete (config.headers as Record<string, string>)["Content-Type"];
  }

  const response = await fetch(endpoint, config);
  
  // Handle the artificial 500 errors from MSW
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const errorMessage = errorBody.error || `Error: ${response.statusText}`;
    throw new Error(errorMessage);
  }

  // Handle empty responses (like 204 No Content)
  const text = await response.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
}