import { apiClient } from '@/lib/apiClient';
import type {
  CreateTicketPayload,
  Ticket,
  TicketAttachment,
  TicketFilters,
  TicketSummary,
  TicketUserOption,
} from '@/types';

function queryString(filters?: TicketFilters) {
  const params = new URLSearchParams();
  Object.entries(filters ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.set(key, String(value));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const ticketsApi = {
  list: (filters?: TicketFilters) => apiClient.get<Ticket[]>(`/api/mgmt/tickets${queryString(filters)}`),
  summary: () => apiClient.get<TicketSummary>('/api/mgmt/tickets/summary'),
  users: () => apiClient.get<TicketUserOption[]>('/api/mgmt/tickets/users'),
  workflow: () =>
    apiClient.get<{
      statuses: Ticket['status'][];
      priorities: Ticket['priority'][];
      roles: Ticket['assignedRole'][];
      categories: Ticket['category'][];
    }>('/api/mgmt/tickets/workflow'),
  getById: (id: string) => apiClient.get<Ticket>(`/api/mgmt/tickets/${id}`),
  create: (body: CreateTicketPayload) => apiClient.post<{ id: string }>('/api/mgmt/tickets', body),
  update: (id: string, body: Partial<CreateTicketPayload & Pick<Ticket, 'status'>>) =>
    apiClient.patch<{ success: boolean }>(`/api/mgmt/tickets/${id}`, body),
  move: (id: string, status: Ticket['status']) =>
    apiClient.patch<{ success: boolean }>(`/api/mgmt/tickets/${id}/status`, { status }),
  addComment: (id: string, message: string, mentions?: string[]) =>
    apiClient.post<{ success: boolean }>(`/api/mgmt/tickets/${id}/comments`, { message, mentions }),
  addAttachment: (id: string, file: Pick<TicketAttachment, 'name' | 'url' | 'type' | 'size'>) =>
    apiClient.post<{ success: boolean }>(`/api/mgmt/tickets/${id}/attachments`, file),
  delete: (id: string) => apiClient.delete<{ success: boolean }>(`/api/mgmt/tickets/${id}`),
};
