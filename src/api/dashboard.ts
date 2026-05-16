import { apiClient } from '@/lib/apiClient';
import { DashboardSummary } from '@/types';

export const dashboardApi = {
  getSummary(): Promise<DashboardSummary> {
    return apiClient.get<DashboardSummary>('/api/mgmt/dashboard-summary');
  },
};
