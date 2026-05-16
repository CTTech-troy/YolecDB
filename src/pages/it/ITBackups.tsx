import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, Card, Input, Modal } from '@/components/ui';
import { StatusPill } from '@/components/it/StatusPill';
import { useItBackups, useRunBackup } from '@/hooks/useItOps';
import { tableText } from '@/lib/tableStyles';

function formatBytes(bytes?: number) {
  if (bytes == null) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function backupStatus(status: string): 'ok' | 'warn' | 'error' {
  if (status === 'completed') return 'ok';
  if (status === 'running') return 'warn';
  return 'error';
}

export function ITBackupsPage() {
  const { data: backups = [], isLoading, refetch, isFetching } = useItBackups();
  const runMutation = useRunBackup();
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState('');

  const handleRun = async () => {
    await runMutation.mutateAsync(label.trim() || undefined);
    setOpen(false);
    setLabel('');
  };

  const running = backups.some((b) => b.status === 'running');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Firebase backups"
        description="Snapshot critical RTDB paths into system_backups in Firebase for disaster recovery"
        action={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => refetch()} loading={isFetching}>
              Refresh
            </Button>
            <Button icon="ri-cloud-upload-line" onClick={() => setOpen(true)} disabled={running}>
              Run backup
            </Button>
          </div>
        }
      />

      <Card className="border-cyan-500/20 bg-cyan-500/5 p-4 text-sm text-slate-600 dark:text-slate-300">
        <p>
          Each backup copies configured RTDB roots into{' '}
          <code className="rounded bg-slate-200/80 px-1 dark:bg-slate-800">system_backups/&lt;id&gt;/data/</code>{' '}
          in Firebase. Use before major changes or on a schedule.
        </p>
      </Card>

      <Card padding="none" className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
              <th className="px-4 py-3 text-left">Label</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Size</th>
              <th className="px-4 py-3 text-left">Paths</th>
              <th className="px-4 py-3 text-left">Created</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Loading…
                </td>
              </tr>
            ) : backups.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No backups yet — run your first snapshot
                </td>
              </tr>
            ) : (
              backups.map((b) => (
                <tr key={b.id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-3">
                    <p className={tableText.primary}>{b.label}</p>
                    {b.error && <p className="mt-1 text-xs text-red-500">{b.error}</p>}
                    <p className={`${tableText.secondary} font-mono text-xs`}>{b.storagePath}</p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={backupStatus(b.status)} label={b.status} />
                  </td>
                  <td className="px-4 py-3 tabular-nums">{formatBytes(b.sizeBytes)}</td>
                  <td className="px-4 py-3">
                    <p className="max-w-xs truncate text-xs text-slate-500" title={b.paths.join(', ')}>
                      {b.paths.length} path{b.paths.length === 1 ? '' : 's'}
                    </p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                    {new Date(b.createdAt).toLocaleString()}
                    {b.completedAt && (
                      <span className="block text-xs">
                        Done {new Date(b.completedAt).toLocaleTimeString()}
                      </span>
                    )}
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
        title="Run Firebase backup"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRun} loading={runMutation.isPending}>
              Start backup
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Label (optional)"
            placeholder="e.g. Pre-deploy 2026-05-15"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
          <p className="text-sm text-slate-500">
            This may take a minute depending on database size. Do not close the tab while status is running.
          </p>
        </div>
      </Modal>
    </div>
  );
}
