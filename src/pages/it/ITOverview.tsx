import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, Button } from '@/components/ui';
import { MetricCard } from '@/components/it/MetricCard';
import { useItOverview } from '@/hooks/useItOps';

const links = [
  { to: '/it/logs', label: 'Logs Viewer', icon: 'ri-terminal-box-line', desc: 'Live terminal logs and diagnostics' },
  { to: '/it/api', label: 'API latency & flow', icon: 'ri-pulse-line', desc: 'Endpoint probes and service flow' },
  { to: '/it/database', label: 'Database realtime', icon: 'ri-database-2-line', desc: 'RTDB & Redis latency' },
  { to: '/it/security', label: 'Security overview', icon: 'ri-shield-keyhole-line', desc: 'Auth failures and blocked IPs' },
  { to: '/it/audit', label: 'Full audit trail', icon: 'ri-file-list-2-line', desc: 'All application actions' },
  { to: '/it/incidents', label: 'Incident response', icon: 'ri-alarm-warning-line', desc: 'Track and resolve incidents' },
  { to: '/it/backups', label: 'Firebase backups', icon: 'ri-cloud-line', desc: 'Snapshot RTDB to Firebase' },
];

export function ITOverviewPage() {
  const { data, isLoading, refetch, isFetching } = useItOverview();

  return (
    <div className="space-y-6">
      <PageHeader
        title="IT operations"
        description="Platform health, security, backups, and incident management"
        action={
          <Button variant="ghost" onClick={() => refetch()} loading={isFetching}>
            Refresh
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="API"
          value={isLoading ? '…' : data?.services.api ?? '—'}
          status={data?.services.api === 'ok' ? 'ok' : data?.services.api === 'degraded' ? 'warn' : 'error'}
        />
        <MetricCard
          label="Database"
          value={isLoading ? '…' : data?.services.database ?? '—'}
          status={
            data?.services.database === 'ok'
              ? 'ok'
              : data?.services.database === 'degraded'
                ? 'warn'
                : 'error'
          }
        />
        <MetricCard
          label="Open incidents"
          value={isLoading ? '…' : String(data?.openIncidents ?? 0)}
          status={(data?.openIncidents ?? 0) > 0 ? 'warn' : 'ok'}
        />
        <MetricCard
          label="Audit (24h)"
          value={isLoading ? '…' : String(data?.recentAuditCount ?? 0)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((item) => (
          <Link key={item.to} to={item.to}>
            <Card className="flex h-full items-start gap-4 p-5 transition hover:border-cyan-500/40 hover:shadow-md dark:hover:border-cyan-400/30">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                <i className={`${item.icon} text-xl`} />
              </span>
              <span>
                <span className="font-semibold text-slate-900 dark:text-white">{item.label}</span>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
              </span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
