import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui';

interface ITSectionPageProps {
  title: string;
  description: string;
  metrics?: { label: string; value: string; status?: 'ok' | 'warn' | 'error' }[];
}

export function ITSectionPage({ title, description, metrics = [] }: ITSectionPageProps) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((m) => (
          <Card key={m.label} className="p-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">{m.label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{m.value}</p>
            {m.status && (
              <span
                className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                  m.status === 'ok'
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                    : m.status === 'warn'
                      ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                      : 'bg-red-500/15 text-red-700 dark:text-red-400'
                }`}
              >
                {m.status}
              </span>
            )}
          </Card>
        ))}
      </div>
      <Card className="p-6 text-sm text-slate-600 dark:text-slate-400">
        Live metrics from your API and Firebase will appear here as integrations are connected.
      </Card>
    </div>
  );
}
