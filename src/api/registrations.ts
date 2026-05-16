/**
 * Registrations API service
 */

import { apiClient, resolveApiUrl, API_BASE_URL } from '@/lib/apiClient';
import { auth } from '@/config/firebase';
import {
  Registration,
  BlogRegistrationsResponse,
  RegistrationCounts,
  RegistrationFilters,
  RegistrationAnalytics,
} from '@/types';

function toQuery(filters: RegistrationFilters = {}) {
  const q = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v) q.set(k, v);
  });
  const s = q.toString();
  return s ? `?${s}` : '';
}

export const registrationsApi = {
  async listBlog(filters?: RegistrationFilters): Promise<BlogRegistrationsResponse> {
    return apiClient.get(`/api/mgmt/registrations/blog${toQuery(filters)}`);
  },

  async listEvent(filters?: RegistrationFilters): Promise<Registration[]> {
    return apiClient.get(`/api/mgmt/registrations/event${toQuery(filters)}`);
  },

  async getAnalytics(
    scope: 'event' | 'blog',
    targetId?: string
  ): Promise<RegistrationAnalytics> {
    const q = new URLSearchParams({ scope });
    if (scope === 'event' && targetId) q.set('eventId', targetId);
    if (scope === 'blog' && targetId) q.set('blogId', targetId);
    return apiClient.get(`/api/mgmt/registrations/analytics?${q}`);
  },

  async getCounts(): Promise<RegistrationCounts> {
    return apiClient.get('/api/mgmt/registrations/counts');
  },

  async deleteEventRegistration(id: string): Promise<void> {
    return apiClient.delete(`/api/mgmt/registrations/event/${id}`);
  },

  async deleteAllEventRegistrations(): Promise<void> {
    return apiClient.delete('/api/mgmt/registrations/event');
  },

  async downloadEventCsv(filters?: RegistrationFilters): Promise<void> {
    await downloadCsv(`/api/mgmt/registrations/event/export.csv${toQuery(filters)}`, 'event-registrations.csv');
  },

  async downloadBlogCsv(filters?: RegistrationFilters): Promise<void> {
    await downloadCsv(`/api/mgmt/registrations/blog/export.csv${toQuery(filters)}`, 'blog-registrations.csv');
  },
};

async function downloadCsv(endpoint: string, filename: string) {
  const user = auth.currentUser;
  const token = user ? await user.getIdToken() : null;
  const url = resolveApiUrl(API_BASE_URL, endpoint);
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Export failed');
  const blob = await res.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
