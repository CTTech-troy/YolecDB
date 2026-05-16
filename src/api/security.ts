import { apiClient } from '@/lib/apiClient';

export interface SecurityOverview {
  failedLogins24h: number;
  rateLimitHits24h: number;
  blockedIpCount: number;
  blockedIps: string[];
  recentFailedLogins: Array<{ ip: string; email: string | null; at: number }>;
}

export const securityApi = {
  getOverview: () => apiClient.get<SecurityOverview>('/api/mgmt/security/overview'),
  unblockIp: (ip: string) => apiClient.delete(`/api/mgmt/security/blocked-ips/${encodeURIComponent(ip)}`),
  getSecurityIncidents: () =>
    apiClient.get<{ incidents: unknown[] }>('/api/mgmt/security/incidents'),
};
