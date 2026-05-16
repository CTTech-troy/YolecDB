/**
 * Audit Logs API service
 */

import { apiClient } from '@/lib/apiClient';
import { AuditLog, PaginatedResponse } from '@/types';

export const auditLogsApi = {
  /**
   * List audit logs with optional filters (admin, paginated)
   */
  async list(params: {
    page?: number;
    limit?: number;
    action?: string;
    actorUid?: string;
    resourceType?: string;
    startDate?: number;
    endDate?: number;
  } = {}): Promise<PaginatedResponse<AuditLog>> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.set('page', params.page.toString());
    if (params.limit) queryParams.set('limit', params.limit.toString());
    if (params.action) queryParams.set('action', params.action);
    if (params.actorUid) queryParams.set('actorUid', params.actorUid);
    if (params.resourceType) queryParams.set('resourceType', params.resourceType);
    if (params.startDate) queryParams.set('startDate', params.startDate.toString());
    if (params.endDate) queryParams.set('endDate', params.endDate.toString());

    return apiClient.get(`/api/mgmt/audit-logs?${queryParams.toString()}`);
  },
};
