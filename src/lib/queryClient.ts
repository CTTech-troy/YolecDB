import { QueryClient } from '@tanstack/react-query';
import { NetworkError } from '@/lib/apiClient';

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= 2) return false;
  if (error instanceof NetworkError) return true;
  if (error instanceof Error && error.message.includes('Cannot reach API')) return true;
  return false;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      gcTime: 1000 * 60 * 10,
      retry: (failureCount, error) => shouldRetry(failureCount, error),
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
      refetchOnWindowFocus: false,
      throwOnError: false,
    },
    mutations: {
      retry: false,
    },
  },
});
