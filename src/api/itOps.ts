import { apiClient } from '@/lib/apiClient';
import type {
  ApiFlowSnapshot,
  DatabaseMetrics,
  IncidentReportSummary,
  ITBackupRecord,
  ITIncident,
  ITOverview,
} from '@/types/it-ops';

export const itOpsApi = {
  getOverview: () => apiClient.get<ITOverview>('/api/mgmt/it/overview'),
  getApiFlow: () => apiClient.get<ApiFlowSnapshot>('/api/mgmt/it/metrics/api'),
  getDatabaseMetrics: () => apiClient.get<DatabaseMetrics>('/api/mgmt/it/metrics/database'),
  getDatabaseHistory: (limit = 30) =>
    apiClient.get<DatabaseMetrics[]>(`/api/mgmt/it/metrics/database/history?limit=${limit}`),
  getIncidentSummary: () =>
    apiClient.get<IncidentReportSummary>('/api/mgmt/it/incidents/summary'),
  listIncidents: () => apiClient.get<ITIncident[]>('/api/mgmt/it/incidents'),
  getIncident: (id: string) => apiClient.get<ITIncident>(`/api/mgmt/it/incidents/${id}`),
  runMonitoring: () => apiClient.post<{ success: boolean; ranAt: number }>('/api/mgmt/it/incidents/monitor/run', {}),
  createIncident: (body: {
    title: string;
    description: string;
    severity: ITIncident['severity'];
    assignee?: string;
  }) => apiClient.post<{ id: string }>('/api/mgmt/it/incidents', body),
  updateIncident: (
    id: string,
    body: Partial<{
      title: string;
      description: string;
      severity: ITIncident['severity'];
      status: ITIncident['status'];
      assignee: string;
      resolutionNotes: string;
    }>
  ) => apiClient.patch(`/api/mgmt/it/incidents/${id}`, body),
  addIncidentNote: (id: string, note: string) =>
    apiClient.post(`/api/mgmt/it/incidents/${id}/notes`, { note }),
  listBackups: () => apiClient.get<ITBackupRecord[]>('/api/mgmt/it/backups'),
  runBackup: (label?: string) =>
    apiClient.post<{ id: string }>('/api/mgmt/it/backups', { label }),
  getBackup: (id: string) => apiClient.get<ITBackupRecord>(`/api/mgmt/it/backups/${id}`),
};
