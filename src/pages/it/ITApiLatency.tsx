import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, Card } from '@/components/ui';
import { MetricCard } from '@/components/it/MetricCard';
import { StatusPill } from '@/components/it/StatusPill';
import { useItApiFlow } from '@/hooks/useItOps';
import { tableText } from '@/lib/tableStyles';

export function ITApiLatencyPage() {
  const { data, isLoading, refetch, isFetching } = useItApiFlow();

  const chartData =
    data?.probes
      .filter((p) => p.latencyMs >= 0)
      .map((p) => ({
        name: p.name.length > 18 ? `${p.name.slice(0, 16)}…` : p.name,
        ms: p.latencyMs,
        status: p.status,
      })) ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="API latency & flow"
        description="Live probes across API, database, cache, and external services"
        action={
          <Button variant="ghost" onClick={() => refetch()} loading={isFetching}>
            Run probes
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Average latency"
          value={isLoading ? '…' : `${data?.summary.avgLatencyMs ?? 0} ms`}
        />
        <MetricCard label="Healthy probes" value={isLoading ? '…' : String(data?.summary.okCount ?? 0)} status="ok" />
        <MetricCard
          label="Failed probes"
          value={isLoading ? '…' : String(data?.summary.errorCount ?? 0)}
          status={(data?.summary.errorCount ?? 0) > 0 ? 'error' : 'ok'}
        />
      </div>

      <Card className="p-4">
        <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">Latency by probe</h3>
        {isLoading ? (
          <p className="text-sm text-slate-500">Running probes…</p>
        ) : chartData.length === 0 ? (
          <p className="text-sm text-slate-500">No latency data</p>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 48 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" height={60} />
                <YAxis unit="ms" tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`${Number(v ?? 0)} ms`, 'Latency']} />
                <Bar dataKey="ms" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <Card padding="none" className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
              <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Service</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Category</th>
              <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-300">Latency</th>
              <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-300">Status</th>
            </tr>
          </thead>
          <tbody>
            {(data?.probes ?? []).map((p) => (
              <tr key={p.name} className="border-b border-slate-100 dark:border-slate-800">
                <td className="px-4 py-3">
                  <p className={tableText.primary}>{p.name}</p>
                  {p.detail && <p className={tableText.secondary}>{p.detail}</p>}
                </td>
                <td className="px-4 py-3 capitalize text-slate-600 dark:text-slate-400">{p.category}</td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {p.latencyMs >= 0 ? `${p.latencyMs} ms` : '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  <StatusPill status={p.status} label={p.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
