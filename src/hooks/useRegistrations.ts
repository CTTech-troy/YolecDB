import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { registrationsApi } from '@/api';
import { RegistrationFilters } from '@/types';
import { toast } from 'react-hot-toast';

export function useBlogRegistrations(filters?: RegistrationFilters) {
  return useQuery({
    queryKey: ['registrations', 'blog', filters],
    queryFn: () => registrationsApi.listBlog(filters),
  });
}

export function useEventRegistrations(filters?: RegistrationFilters) {
  return useQuery({
    queryKey: ['registrations', 'event', filters],
    queryFn: () => registrationsApi.listEvent(filters),
  });
}

export function useRegistrationAnalytics(scope: 'event' | 'blog', targetId?: string) {
  return useQuery({
    queryKey: ['registrations', 'analytics', scope, targetId],
    queryFn: () => registrationsApi.getAnalytics(scope, targetId),
  });
}

export function useRegistrationCounts() {
  return useQuery({
    queryKey: ['registrations', 'counts'],
    queryFn: () => registrationsApi.getCounts(),
  });
}

export function useDeleteEventRegistration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => registrationsApi.deleteEventRegistration(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
      toast.success('Registration deleted');
    },
    onError: (e: Error) => toast.error(e.message || 'Failed to delete'),
  });
}

export function useDeleteAllEventRegistrations() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => registrationsApi.deleteAllEventRegistrations(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
      toast.success('All event registrations deleted');
    },
    onError: (e: Error) => toast.error(e.message || 'Failed to delete'),
  });
}

export function useExportRegistrations() {
  return useMutation({
    mutationFn: async ({
      scope,
      filters,
    }: {
      scope: 'event' | 'blog';
      filters?: RegistrationFilters;
    }) => {
      if (scope === 'event') await registrationsApi.downloadEventCsv(filters);
      else await registrationsApi.downloadBlogCsv(filters);
    },
    onSuccess: () => toast.success('Export downloaded'),
    onError: (e: Error) => toast.error(e.message || 'Export failed'),
  });
}
