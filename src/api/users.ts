/**
 * Users API service (for RBAC user management)
 */

import { apiClient } from '@/lib/apiClient';
import { UserMeta, PaginatedResponse } from '@/types';

export const usersApi = {
  /**
   * List all users (admin, paginated)
   */
  async list(page = 1, limit = 50): Promise<PaginatedResponse<UserMeta>> {
    return apiClient.get(`/api/mgmt/users?page=${page}&limit=${limit}`);
  },

  /**
   * Get user by UID
   */
  async getByUid(uid: string): Promise<UserMeta> {
    return apiClient.get(`/api/mgmt/users/${uid}`);
  },

  /**
   * Create a new user
   */
  async create(data: {
    email: string;
    displayName: string;
    roleId: string;
  }): Promise<{ uid: string; inviteSent: boolean; inviteEmailError?: string }> {
    return apiClient.post('/api/mgmt/users', data);
  },

  async resendInvite(uid: string): Promise<{ success: boolean; inviteSent: boolean; resendId?: string }> {
    return apiClient.post(`/api/mgmt/users/${uid}/invite/resend`, {});
  },

  /**
   * Update user role
   */
  async updateRole(uid: string, roleId: string): Promise<{ success: boolean }> {
    return apiClient.put(`/api/mgmt/users/${uid}/role`, { roleId });
  },

  /**
   * Deactivate user
   */
  async deactivate(uid: string): Promise<{ success: boolean }> {
    return apiClient.patch(`/api/mgmt/users/${uid}/deactivate`);
  },

  /**
   * Reactivate user
   */
  async reactivate(uid: string): Promise<{ success: boolean }> {
    return apiClient.patch(`/api/mgmt/users/${uid}/reactivate`);
  },

  async delete(uid: string): Promise<{ success: boolean }> {
    return apiClient.delete(`/api/mgmt/users/${uid}`);
  },
};
