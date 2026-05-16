/**
 * Roles API service
 */

import { apiClient } from '@/lib/apiClient';
import { Role, PaginatedResponse } from '@/types';

export const rolesApi = {
  /**
   * List all roles (admin, paginated)
   */
  async list(page = 1, limit = 50): Promise<PaginatedResponse<Role>> {
    return apiClient.get(`/api/mgmt/roles?page=${page}&limit=${limit}`);
  },

  /**
   * Get role by ID
   */
  async getById(id: string): Promise<Role> {
    return apiClient.get(`/api/mgmt/roles/${id}`);
  },

  /**
   * Create a new role
   */
  async create(data: {
    name: string;
    displayName: string;
    permissions: string[];
  }): Promise<{ id: string }> {
    return apiClient.post('/api/mgmt/roles', data);
  },

  /**
   * Update a role
   */
  async update(
    id: string,
    data: {
      displayName?: string;
      permissions?: string[];
    }
  ): Promise<{ success: boolean }> {
    return apiClient.put(`/api/mgmt/roles/${id}`, data);
  },

  /**
   * Delete a role
   */
  async delete(id: string): Promise<void> {
    return apiClient.delete(`/api/mgmt/roles/${id}`);
  },

  async syncSystem(): Promise<{
    rolesUpdated: number;
    usersReassigned: number;
    claimsUpdated: number;
  }> {
    return apiClient.post('/api/mgmt/roles/sync-system');
  },
};
