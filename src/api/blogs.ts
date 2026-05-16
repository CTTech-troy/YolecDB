/**
 * Blog API service with full TypeScript types
 */

import { apiClient } from '@/lib/apiClient';
import { Blog, CreateBlogDto, PaginatedResponse } from '@/types';

export const blogsApi = {
  /**
   * List all blogs (admin, paginated)
   */
  async list(page = 1, limit = 20): Promise<PaginatedResponse<Blog>> {
    return apiClient.get(`/api/mgmt/blog?page=${page}&limit=${limit}`);
  },

  /**
   * Get blog by ID
   */
  async getById(id: string): Promise<Blog> {
    return apiClient.get(`/api/mgmt/blog/${id}`);
  },

  /**
   * Create a new blog
   */
  async create(data: CreateBlogDto): Promise<{ id: string }> {
    return apiClient.post('/api/mgmt/blog', data);
  },

  /**
   * Update a blog
   */
  async update(id: string, data: Partial<CreateBlogDto>): Promise<{ success: boolean }> {
    return apiClient.patch(`/api/mgmt/blog/${id}`, data);
  },

  /**
   * Toggle publish status
   */
  async togglePublish(id: string, publish: boolean): Promise<{ success: boolean }> {
    return apiClient.patch(`/api/mgmt/blog/${id}/publish`, { publish });
  },

  /**
   * Delete a blog
   */
  async delete(id: string): Promise<void> {
    return apiClient.delete(`/api/mgmt/blog/${id}`);
  },

  /**
   * List published blogs (public)
   */
  async listPublished(page = 1, limit = 20): Promise<Blog[]> {
    return apiClient.get(`/api/public/blog?page=${page}&limit=${limit}`);
  },

  /**
   * Get published blog by ID (public)
   */
  async getPublishedById(id: string): Promise<Blog> {
    return apiClient.get(`/api/public/blog/${id}`);
  },
};
