import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, Button } from '@/components/ui';
import { securityApi } from '@/api/security';

export function ITSecurityPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['security', 'overview'],
    queryFn: () => securityApi.getOverview(),
  });

  const unblock = useMutation({
    mutationFn: (ip: string) => securityApi.unblockIp(ip),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['security', 'overview'] }),
  });

  if (isLoading) {
    return <p className="text-slate-500">Loading security overview…</p>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Security"
        description="Threat monitoring, blocked IPs, and authentication events"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs uppercase text-slate-500">Failed logins (24h)</p>
          <p className="text-2xl font-bold">{data?.failedLogins24h ?? 0}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase text-slate-500">Rate limit hits (24h)</p>
          <p className="text-2xl font-bold">{data?.rateLimitHits24h ?? 0}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase text-slate-500">Blocked IPs</p>
          <p className="text-2xl font-bold">{data?.blockedIpCount ?? 0}</p>
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="mb-3 font-semibold">Blocked IP addresses</h3>
        {(data?.blockedIps || []).length === 0 ? (
          <p className="text-sm text-slate-500">No blocked IPs</p>
        ) : (
          <ul className="space-y-2">
            {data!.blockedIps.map((ip) => (
              <li key={ip} className="flex items-center justify-between text-sm">
                <span className="font-mono">{ip}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  loading={unblock.isPending}
                  onClick={() => unblock.mutate(ip)}
                >
                  Unblock
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="p-4">
        <h3 className="mb-3 font-semibold">Recent failed logins</h3>
        <ul className="space-y-2 text-sm">
          {(data?.recentFailedLogins || []).map((row, i) => (
            <li key={`${row.ip}-${row.at}-${i}`} className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="font-mono">{row.ip}</span>
              <span className="text-slate-500">{row.email || '—'}</span>
              <span className="text-slate-400">{new Date(row.at).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
