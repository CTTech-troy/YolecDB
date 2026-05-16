/**
 * Subscribers API service
 */

import { apiClient } from '@/lib/apiClient';
import { Subscriber, PaginatedResponse } from '@/types';

export const subscribersApi = {
  /**
   * List all subscribers (admin, paginated)
   */
  async list(page = 1, limit = 50): Promise<PaginatedResponse<Subscriber>> {
    return apiClient.get(`/api/mgmt/subscribers?page=${page}&limit=${limit}`);
  },
};
