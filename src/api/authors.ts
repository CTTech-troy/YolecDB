import { apiClient } from '@/lib/apiClient';

export interface Author {
  id: string;
  name: string;
  slug: string;
  role: string;
  bio: string;
  avatar_url: string;
}

export const authorsApi = {
  list: () => apiClient.get<Author[]>('/api/mgmt/authors'),
  create: (data: Partial<Author>) => apiClient.post<{ id: string }>('/api/mgmt/authors', data),
  update: (id: string, data: Partial<Author>) =>
    apiClient.put(`/api/mgmt/authors/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/mgmt/authors/${id}`),
};
