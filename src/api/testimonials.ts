/**
 * Testimonials API service
 */

import { apiClient } from '@/lib/apiClient';
import { Testimonial, PaginatedResponse } from '@/types';

export const testimonialsApi = {
  /**
   * List all testimonials (admin, paginated)
   */
  async list(page = 1, limit = 20): Promise<PaginatedResponse<Testimonial>> {
    return apiClient.get(`/api/mgmt/testimonials?page=${page}&limit=${limit}`);
  },

  /**
   * Get testimonial by ID
   */
  async getById(id: string): Promise<Testimonial> {
    return apiClient.get(`/api/mgmt/testimonials/${id}`);
  },

  /**
   * Create a new testimonial
   */
  async create(data: Omit<Testimonial, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ id: string }> {
    return apiClient.post('/api/mgmt/testimonials', data);
  },

  /**
   * Update a testimonial
   */
  async update(id: string, data: Partial<Testimonial>): Promise<{ success: boolean }> {
    return apiClient.patch(`/api/mgmt/testimonials/${id}`, data);
  },

  /**
   * Delete a testimonial
   */
  async delete(id: string): Promise<void> {
    return apiClient.delete(`/api/mgmt/testimonials/${id}`);
  },
};
