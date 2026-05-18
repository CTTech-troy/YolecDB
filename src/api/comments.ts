import { apiClient } from '@/lib/apiClient';
import { PaginatedResponse } from '@/types';

export interface BlogComment {
  id: string;
  post_id: string;
  author_name: string;
  body: string;
  status: 'pending' | 'approved' | 'rejected' | 'spam';
  created_at: string;
}

export const commentsApi = {
  list: (page = 1, limit = 20, status?: string) => {
    const q = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) q.set('status', status);
    return apiClient.get<PaginatedResponse<BlogComment>>(
      `/api/mgmt/blog/comments?${q}`
    );
  },
  updateStatus: (id: string, status: string) =>
    apiClient.patch(`/api/mgmt/blog/comments/${id}/status`, { status }),
  delete: (id: string) => apiClient.delete(`/api/mgmt/blog/comments/${id}`),
};
