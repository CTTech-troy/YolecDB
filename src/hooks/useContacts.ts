/**
 * React Query hooks for contacts
 */

import { useQuery } from '@tanstack/react-query';
import { contactsApi } from '@/api';

export function useContacts(page = 1, limit = 50) {
  return useQuery({
    queryKey: ['contacts', page, limit],
    queryFn: () => contactsApi.list(page, limit),
  });
}
