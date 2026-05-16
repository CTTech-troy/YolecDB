/**
 * Events API service with full TypeScript types
 */

import { apiClient } from '@/lib/apiClient';
import { Event, PaginatedResponse } from '@/types';

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
