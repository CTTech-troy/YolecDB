/**
 * Contacts API service
 */

import { apiClient } from '@/lib/apiClient';
import { Contact, PaginatedResponse } from '@/types';

export const contactsApi = {
  /**
   * List all contacts (admin, paginated)
   */
  async list(page = 1, limit = 50): Promise<PaginatedResponse<Contact>> {
    return apiClient.get(`/api/mgmt/contacts?page=${page}&limit=${limit}`);
  },
};
