/**
 * Events API service with full TypeScript types
 */

import { auth } from '@/config/firebase';
import { apiClient, API_BASE_URL, resolveApiUrl } from '@/lib/apiClient';
import { Event, PaginatedResponse, Registration, RegistrationAnalytics, RegistrationFilters } from '@/types';

function toQuery(params: object = {}) {
  const q = new URLSearchParams();
  Object.entries(params as Record<string, unknown>).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') q.set(key, String(value));
  });
  const query = q.toString();
  return query ? `?${query}` : '';
}

async function downloadFile(endpoint: string, filename: string) {
  const token = await auth.currentUser?.getIdToken();
  const res = await fetch(resolveApiUrl(API_BASE_URL, endpoint), {
    credentials: 'include',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Export failed');
  const blob = await res.blob();
  const href = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(href);
}

export const eventsApi = {
  /**
   * List all events (admin, paginated)
   */
  async list(page = 1, limit = 20): Promise<PaginatedResponse<Event>> {
    return apiClient.get(`/api/mgmt/events?page=${page}&limit=${limit}`);
  },

  /**
   * Get event by ID
   */
  async getById(id: string): Promise<Event> {
    return apiClient.get(`/api/mgmt/events/${id}`);
  },

  /**
   * Create a new event
   */
  async create(data: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ id: string }> {
    return apiClient.post('/api/mgmt/events', data);
  },

  /**
   * Update an event
   */
  async update(id: string, data: Partial<Event>): Promise<{ success: boolean }> {
    return apiClient.put(`/api/mgmt/events/${id}`, data);
  },

  /**
   * Toggle publish status
   */
  async togglePublish(id: string, publish: boolean): Promise<{ success: boolean }> {
    return apiClient.patch(`/api/mgmt/events/${id}/publish`, { publish });
  },

  /**
   * Delete an event
   */
  async delete(id: string): Promise<void> {
    return apiClient.delete(`/api/mgmt/events/${id}`);
  },

  async generateQr(id: string): Promise<Pick<Event, 'qrToken' | 'qrSlug' | 'registrationUrl' | 'qrStatus' | 'qrExpiresAt'>> {
    return apiClient.post(`/api/mgmt/events/${id}/generate-qr`, {});
  },

  async regenerateQr(id: string): Promise<Pick<Event, 'qrToken' | 'qrSlug' | 'registrationUrl' | 'qrStatus' | 'qrExpiresAt'>> {
    return apiClient.post(`/api/mgmt/events/${id}/regenerate-qr`, {});
  },

  async setQrExpiry(id: string, expiresAt?: number | null): Promise<{ success: boolean }> {
    return apiClient.patch(`/api/mgmt/events/${id}/qr-expiry`, { expiresAt: expiresAt || null });
  },

  async listRegistrations(
    id: string,
    filters: RegistrationFilters = {},
    page = 1,
    limit = 25
  ): Promise<PaginatedResponse<Registration>> {
    return apiClient.get(`/api/mgmt/events/${id}/registrations${toQuery({ ...filters, page, limit })}`);
  },

  async getAnalytics(id: string): Promise<RegistrationAnalytics> {
    return apiClient.get(`/api/mgmt/events/${id}/analytics`);
  },

  async downloadRegistrationsCsv(id: string, filters: RegistrationFilters = {}) {
    await downloadFile(
      `/api/mgmt/events/${id}/registrations/export.csv${toQuery(filters)}`,
      'event-registrations.csv'
    );
  },

  async downloadRegistrationsExcel(id: string, filters: RegistrationFilters = {}) {
    await downloadFile(
      `/api/mgmt/events/${id}/registrations/export.xls${toQuery(filters)}`,
      'event-registrations.xls'
    );
  },

  /**
   * List published events (public)
   */
  async listPublished(page = 1, limit = 20): Promise<Event[]> {
    return apiClient.get(`/api/public/events?page=${page}&limit=${limit}`);
  },

  /**
   * List upcoming events (public)
   */
  async listUpcoming(): Promise<Event[]> {
    return apiClient.get('/api/public/events/upcoming');
  },
};
