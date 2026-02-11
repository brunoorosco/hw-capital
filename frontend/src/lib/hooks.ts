import { useQuery, useMutation, type UseQueryOptions, type UseMutationOptions } from "@tanstack/react-query";
import { api, isUnauthorizedError } from "./api";
import { getLoginUrl } from "./const";

// Query hook factory
export function useApiQuery<TData = unknown>(
  queryKey: any[],
  endpoint: string,
  params?: Record<string, any>,
  options?: Omit<UseQueryOptions<TData, Error>, "queryKey" | "queryFn">
) {
  return useQuery<TData, Error>({
    queryKey,
    queryFn: async () => {
      try {
        return await api.get<TData>(endpoint, params);
      } catch (error) {
        // Não redirecionar aqui, deixar o interceptor do axios fazer isso
        // ou o componente tratar o erro
        console.log('[useApiQuery] Erro na query:', endpoint, error);
        throw error;
      }
    },
    ...options,
  });
}

// Mutation hook factory
export function useApiMutation<TData = unknown, TVariables = unknown>(
  endpoint: string | ((variables: TVariables) => string),
  method: "POST" | "PATCH" | "DELETE" = "POST",
  options?: UseMutationOptions<TData, Error, TVariables>
) {

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables) => {
      try {
        const url = typeof endpoint === "function" ? endpoint(variables) : endpoint;
        
        if (method === "POST") {
          return await api.post<TData>(url, variables);
        } else if (method === "PATCH") {
          return await api.patch<TData>(url, variables);
        } else {
          return await api.delete<TData>(url);
        }
      } catch (error) {
        if (isUnauthorizedError(error)) {
          window.location.href = getLoginUrl();
        }
        throw error;
      }
    },
    ...options,
  });
}
