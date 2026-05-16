import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rolesApi } from '@/api';
import { toast } from 'react-hot-toast';

export function useRoles(page = 1, limit = 50) {
  return useQuery({
    queryKey: ['roles', page, limit],
    queryFn: () => rolesApi.list(page, limit),
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rolesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role created');
    },
    onError: (e: Error) => toast.error(e.message || 'Failed to create role'),
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { displayName?: string; permissions?: string[] };
    }) => rolesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role updated');
    },
    onError: (e: Error) => toast.error(e.message || 'Failed to update role'),
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rolesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role deleted');
    },
    onError: (e: Error) => toast.error(e.message || 'Failed to delete role'),
  });
}

export function useSyncSystemRoles() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => rolesApi.syncSystem(),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success(
        `Synced: ${result.rolesUpdated} roles, ${result.usersReassigned} users reassigned, ${result.claimsUpdated} claims refreshed`
      );
    },
    onError: (e: Error) => toast.error(e.message || 'Failed to sync system roles'),
  });
}
