import { apiClient } from '@/lib/apiClient';
import { PaginatedResponse } from '@/types';

export interface EventMoment {
  id: string;
  imageUrl: string;
  thumbnailUrl: string;
  uploadedBy: string;
  eventId: string | null;
  caption: string;
  uploadDate: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  isFeatured: boolean;
  likesCount: number;
  viewsCount: number;
  createdAt?: string;
}

export const eventMomentsApi = {
  list: (params: {
    page?: number;
    limit?: number;
    status?: string;
    eventId?: string;
    search?: string;
  }) => {
    const q = new URLSearchParams();
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    if (params.status) q.set('status', params.status);
    if (params.eventId) q.set('eventId', params.eventId);
    if (params.search) q.set('search', params.search);
    return apiClient.get<PaginatedResponse<EventMoment>>(
      `/api/mgmt/event-moments?${q}`
    );
  },
  approve: (id: string) => apiClient.patch<EventMoment>(`/api/mgmt/event-moments/${id}/approve`),
  reject: (id: string) => apiClient.patch<EventMoment>(`/api/mgmt/event-moments/${id}/reject`),
  feature: (id: string) => apiClient.patch<EventMoment>(`/api/mgmt/event-moments/${id}/feature`),
  delete: (id: string) => apiClient.delete(`/api/mgmt/event-moments/${id}`),
  bulk: (ids: string[], action: 'approve' | 'reject' | 'delete') =>
    apiClient.post<{ results: unknown[] }>('/api/mgmt/event-moments/bulk', { ids, action }),
};
