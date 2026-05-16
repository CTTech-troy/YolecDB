import { useQuery } from '@tanstack/react-query';
import { subscribersApi } from '@/api';

export function useSubscribers(page = 1, limit = 50) {
  return useQuery({
    queryKey: ['subscribers', page, limit],
    queryFn: () => subscribersApi.list(page, limit),
  });
}
