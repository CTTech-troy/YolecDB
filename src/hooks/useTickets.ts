import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ticketsApi } from '@/api/tickets';
import type { CreateTicketPayload, Ticket, TicketFilters } from '@/types';

export function useTickets(filters?: TicketFilters) {
  return useQuery({
    queryKey: ['tickets', filters],
    queryFn: () => ticketsApi.list(filters),
    refetchInterval: 10_000,
  });
}

export function useTicketSummary() {
  return useQuery({
    queryKey: ['tickets', 'summary'],
    queryFn: () => ticketsApi.summary(),
    refetchInterval: 30_000,
  });
}

export function useTicketUsers(enabled = true) {
  return useQuery({
    queryKey: ['tickets', 'users'],
    queryFn: () => ticketsApi.users(),
    enabled,
  });
}

export function useTicket(id: string | undefined) {
  return useQuery({
    queryKey: ['tickets', id],
    queryFn: () => ticketsApi.getById(id!),
    enabled: Boolean(id),
    refetchInterval: 10_000,
  });
}

export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTicketPayload) => ticketsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Ticket created');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useMoveTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Ticket['status'] }) => ticketsApi.move(id, status),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['tickets'] });
      qc.invalidateQueries({ queryKey: ['tickets', vars.id] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & Parameters<typeof ticketsApi.update>[1]) =>
      ticketsApi.update(id, body),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['tickets'] });
      qc.invalidateQueries({ queryKey: ['tickets', vars.id] });
      toast.success('Ticket updated');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useAddTicketComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, message, mentions }: { id: string; message: string; mentions?: string[] }) =>
      ticketsApi.addComment(id, message, mentions),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['tickets'] });
      qc.invalidateQueries({ queryKey: ['tickets', vars.id] });
      toast.success('Comment added');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useAddTicketAttachment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: Parameters<typeof ticketsApi.addAttachment>[1] }) =>
      ticketsApi.addAttachment(id, file),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['tickets'] });
      qc.invalidateQueries({ queryKey: ['tickets', vars.id] });
      toast.success('Attachment added');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ticketsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Ticket deleted');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
