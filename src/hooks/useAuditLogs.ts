import { useQuery } from '@tanstack/react-query';
import { auditLogsApi } from '@/api';

export function useAuditLogs(
  params: {
    page?: number;
    limit?: number;
    action?: string;
    actorUid?: string;
    resourceType?: string;
    startDate?: number;
    endDate?: number;
  } = {}
) {
  return useQuery({
    queryKey: ['audit-logs', params],
    queryFn: () => auditLogsApi.list(params),
  });
}
