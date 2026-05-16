import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, Card, Input, Modal, Select } from '@/components/ui';
import { MetricCard } from '@/components/it/MetricCard';
import { StatusPill } from '@/components/it/StatusPill';
import {
  useCreateIncident,
  useIncidentSummary,
  useItIncidents,
  useRunMonitoring,
  useUpdateIncident,
} from '@/hooks/useItOps';
import type { ITIncident, IncidentSeverity, IncidentStatus } from '@/types/it-ops';
import { tableText } from '@/lib/tableStyles';

const severityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

function severityStatus(s: IncidentSeverity): 'ok' | 'warn' | 'error' {
  if (s === 'critical' || s === 'high') return 'error';
  if (s === 'medium') return 'warn';
  return 'ok';
}

function formatMttr(ms: number | null) {
  if (ms == null) return '—';
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins}m`;
  return `${(mins / 60).toFixed(1)}h`;
}

export function ITIncidentsPage() {
  const { data: summary } = useIncidentSummary();
  const { data: incidents = [], isLoading } = useItIncidents();
  const createMutation = useCreateIncident();
  const updateMutation = useUpdateIncident();
  const monitorMutation = useRunMonitoring();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<'active' | 'all'>('active');
  const [form, setForm] = useState({
    title: '',
    description: '',
    severity: 'medium' as IncidentSeverity,
    assignee: '',
  });

  const visible = useMemo(() => {
    const list =
      filter === 'active'
        ? incidents.filter((i) => !['resolved', 'closed'].includes(i.status))
        : incidents;
    return list;
  }, [incidents, filter]);

  const handleCreate = async () => {
    if (!form.title || !form.description) return;
    await createMutation.mutateAsync({
      title: form.title,
      description: form.description,
      severity: form.severity,
      assignee: form.assignee || undefined,
    });
    setOpen(false);
    setForm({ title: '', description: '', severity: 'medium', assignee: '' });
  };

  const setStatus = async (incident: ITIncident, status: IncidentStatus) => {
    await updateMutation.mutateAsync({ id: incident.id, status });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Incident response"
        description="Automated detection, alerts, and resolution tracking"
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              icon="ri-radar-line"
              onClick={() => monitorMutation.mutate()}
              loading={monitorMutation.isPending}
            >
              Run health check
            </Button>
            <Button icon="ri-add-line" onClick={() => setOpen(true)}>
              Log incident
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          label="Open"
          value={String(summary?.open ?? 0)}
          status={(summary?.open ?? 0) > 0 ? 'warn' : 'ok'}
        />
        <MetricCard label="Investigating" value={String(summary?.investigating ?? 0)} />
        <MetricCard label="Critical" value={String(summary?.critical ?? 0)} status="error" />
        <MetricCard label="Last 24h" value={String(summary?.last24h ?? 0)} />
        <MetricCard label="MTTR" value={formatMttr(summary?.mttrMs ?? null)} />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setFilter('active')}
          className={`rounded-lg px-3 py-1.5 text-sm ${
            filter === 'active'
              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
              : 'text-slate-500'
          }`}
        >
          Active
        </button>
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`rounded-lg px-3 py-1.5 text-sm ${
            filter === 'all'
              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
              : 'text-slate-500'
          }`}
        >
          All
        </button>
      </div>

      <Card padding="none" className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
              <th className="px-4 py-3 text-left">Incident</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Severity</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Updated</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  Loading…
                </td>
              </tr>
            ) : visible.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  No incidents — monitoring is active
                </td>
              </tr>
            ) : (
              visible.map((inc) => (
                <tr key={inc.id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-3">
                    <Link
                      to={`/it/incidents/${inc.id}`}
                      className={`${tableText.primary} hover:text-cyan-600`}
                    >
                      {inc.title}
                    </Link>
                    <p className={`${tableText.secondary} line-clamp-1 max-w-md`}>
                      {inc.description}
                    </p>
                    {inc.autoDetected && (
                      <span className="text-xs text-violet-500">Auto-detected</span>
                    )}
                  </td>
                  <td className="px-4 py-3 capitalize">{inc.type ?? '—'}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={severityStatus(inc.severity)} label={inc.severity} />
                  </td>
                  <td className="px-4 py-3 capitalize">{inc.status.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                    {new Date(inc.updatedAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-wrap justify-end gap-1">
                      <Link to={`/it/incidents/${inc.id}`}>
                        <Button size="sm" variant="secondary">
                          View
                        </Button>
                      </Link>
                      {inc.status !== 'resolved' && inc.status !== 'closed' && (
                        <>
                          {inc.status === 'open' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setStatus(inc, 'investigating')}
                            >
                              Investigate
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setStatus(inc, 'resolved')}
                          >
                            Resolve
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Log incident"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} loading={createMutation.isPending}>
              Create
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium">Description</label>
            <textarea
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
              rows={4}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <Select
            label="Severity"
            value={form.severity}
            onChange={(e) =>
              setForm((f) => ({ ...f, severity: e.target.value as IncidentSeverity }))
            }
            options={severityOptions}
          />
          <Input
            label="Assignee"
            value={form.assignee}
            onChange={(e) => setForm((f) => ({ ...f, assignee: e.target.value }))}
          />
        </div>
      </Modal>
    </div>
  );
}
