type ServiceStatus = 'ok' | 'degraded' | 'down' | 'warn' | 'error';

const styles: Record<ServiceStatus, string> = {
  ok: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  degraded: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  down: 'bg-red-500/15 text-red-700 dark:text-red-400',
  warn: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  error: 'bg-red-500/15 text-red-700 dark:text-red-400',
};

export function StatusPill({ status, label }: { status: ServiceStatus; label: string }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${styles[status]}`}>
      {label}
    </span>
  );
}
