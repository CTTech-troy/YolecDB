import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, Card, Input, Select } from '@/components/ui';
import { StatusPill } from '@/components/it/StatusPill';
import {
  useAddIncidentNote,
  useItIncident,
  useUpdateIncident,
} from '@/hooks/useItOps';
import type { IncidentStatus } from '@/types/it-ops';

const statusOptions = [
  { value: 'open', label: 'Open' },
  { value: 'investigating', label: 'Investigating' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

export function ITIncidentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: incident, isLoading } = useItIncident(id);
  const updateMutation = useUpdateIncident();
  const noteMutation = useAddIncidentNote();
  const [note, setNote] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  if (isLoading || !incident) {
    return <p className="text-slate-500">Loading incident…</p>;
  }

  const handleStatus = (status: IncidentStatus) => {
    updateMutation.mutate({
      id: incident.id,
      status,
      resolutionNotes: resolutionNotes || incident.resolutionNotes,
    });
  };

  return (
    <div className="space-y-6">
      <Link to="/it/incidents" className="text-sm text-cyan-600 hover:underline dark:text-cyan-400">
        ← Back to incidents
      </Link>

      <PageHeader
        title={incident.title}
        description={incident.description}
        action={
          <div className="flex flex-wrap gap-2">
            <StatusPill
              status={
                incident.severity === 'critical' || incident.severity === 'high'
                  ? 'error'
                  : 'warn'
              }
              label={incident.severity}
            />
            <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs uppercase dark:bg-slate-800">
              {incident.type}
            </span>
            {incident.autoDetected && (
              <span className="rounded-lg bg-violet-100 px-2 py-1 text-xs text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                Auto-detected
              </span>
            )}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {incident.errorMessage && (
            <Card className="p-4">
              <h3 className="mb-2 text-sm font-semibold">Error message</h3>
              <pre className="max-h-40 overflow-auto rounded-lg bg-slate-900 p-3 text-xs text-red-200">
                {incident.errorMessage}
              </pre>
            </Card>
          )}

          {incident.stackTrace && (
            <Card className="p-4">
              <h3 className="mb-2 text-sm font-semibold">Stack trace</h3>
              <pre className="max-h-64 overflow-auto rounded-lg bg-slate-950 p-3 text-xs text-slate-300">
                {incident.stackTrace}
              </pre>
            </Card>
          )}

          <Card className="p-4">
            <h3 className="mb-3 text-sm font-semibold">Timeline</h3>
            <ul className="space-y-3">
              {(incident.logs ?? []).length === 0 ? (
                <li className="text-sm text-slate-500">No timeline entries</li>
              ) : (
                [...(incident.logs ?? [])]
                  .reverse()
                  .map((entry, i) => (
                    <li
                      key={`${entry.at}-${i}`}
                      className="border-l-2 border-cyan-500/40 pl-3 text-sm"
                    >
                      <p className="font-medium text-slate-800 dark:text-slate-200">
                        {entry.action}
                      </p>
                      <p className="text-slate-600 dark:text-slate-400">{entry.message}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(entry.at).toLocaleString()}
                        {entry.actorEmail ? ` · ${entry.actorEmail}` : ''}
                      </p>
                    </li>
                  ))
              )}
            </ul>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="space-y-3 p-4">
            <p className="text-xs text-slate-500">Status: {incident.status}</p>
            <p className="text-xs text-slate-500">
              Created {new Date(incident.createdAt).toLocaleString()}
            </p>
            {incident.source && (
              <p className="text-xs text-slate-500 break-all">Source: {incident.source}</p>
            )}
            {incident.affectedService && (
              <p className="text-xs text-slate-500">Service: {incident.affectedService}</p>
            )}
            {(incident.occurrenceCount ?? 0) > 1 && (
              <p className="text-xs text-amber-600">
                {incident.occurrenceCount} occurrences
              </p>
            )}
            <Select
              label="Update status"
              value={incident.status}
              onChange={(e) => handleStatus(e.target.value as IncidentStatus)}
              options={statusOptions}
            />
            <Input
              label="Assignee"
              value={incident.assignee ?? ''}
              onChange={(e) =>
                updateMutation.mutate({ id: incident.id, assignee: e.target.value })
              }
            />
            <div>
              <label className="mb-1 block text-sm font-medium">Resolution notes</label>
              <textarea
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
                rows={3}
                value={resolutionNotes || incident.resolutionNotes || ''}
                onChange={(e) => setResolutionNotes(e.target.value)}
              />
            </div>
            <Button
              size="sm"
              onClick={() =>
                updateMutation.mutate({
                  id: incident.id,
                  resolutionNotes,
                  status: 'resolved',
                })
              }
            >
              Mark resolved
            </Button>
          </Card>

          <Card className="p-4">
            <h3 className="mb-2 text-sm font-semibold">Add note</h3>
            <textarea
              className="mb-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <Button
              size="sm"
              loading={noteMutation.isPending}
              disabled={!note.trim()}
              onClick={() => {
                noteMutation.mutate({ id: incident.id, note });
                setNote('');
              }}
            >
              Add note
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
