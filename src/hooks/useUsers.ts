import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/api';
import { toast } from 'react-hot-toast';

export function useUsers(page = 1, limit = 50) {
  return useQuery({
    queryKey: ['users', page, limit],
    queryFn: () => usersApi.list(page, limit),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      email: string;
      displayName: string;
      roleId: string;
      roleLabel?: string;
    }) =>
      usersApi.create({
        email: vars.email,
        displayName: vars.displayName,
        roleId: vars.roleId,
      }),
    onSuccess: (data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      const rolePart = vars.roleLabel ? ` as ${vars.roleLabel}` : '';
      if (data.inviteSent) {
        toast.success(`Invitation sent to ${vars.email}${rolePart}`);
      } else {
        toast.success(`User created${rolePart} - invitation email could not be sent`);
      }
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ uid, roleId }: { uid: string; roleId: string }) =>
      usersApi.updateRole(uid, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Role updated');
    },
    onError: (e: Error) => toast.error(e.message || 'Failed to update role'),
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (uid: string) => usersApi.deactivate(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deactivated');
    },
    onError: (e: Error) => toast.error(e.message || 'Failed to deactivate user'),
  });
}

export function useReactivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (uid: string) => usersApi.reactivate(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User reactivated');
    },
    onError: (e: Error) => toast.error(e.message || 'Failed to reactivate user'),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (uid: string) => usersApi.delete(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted');
    },
    onError: (e: Error) => toast.error(e.message || 'Failed to delete user'),
  });
}
