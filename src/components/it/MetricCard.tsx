import { Card } from '@/components/ui';
import { StatusPill } from './StatusPill';

interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  status?: 'ok' | 'degraded' | 'down' | 'warn' | 'error';
}

export function MetricCard({ label, value, sub, status }: MetricCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        {status && <StatusPill status={status} label={status} />}
      </div>
      <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900 dark:text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{sub}</p>}
    </Card>
  );
}
