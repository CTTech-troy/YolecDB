import { useState } from 'react';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, Input, Pagination, Table } from '@/components/ui';
import { AuditLog } from '@/types';
import { tableText } from '@/lib/tableStyles';

export function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState('');
  const [resourceType, setResourceType] = useState('');

  const { data, isLoading } = useAuditLogs({
    page,
    limit: 30,
    action: action || undefined,
    resourceType: resourceType || undefined,
  });

  const columns = [
    {
      key: 'timestamp',
      header: 'Time',
      render: (log: AuditLog) => (
        <span className={`${tableText.muted} whitespace-nowrap`}>
          {new Date(log.timestamp).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      render: (log: AuditLog) => <span className={tableText.primary}>{log.action}</span>,
    },
    {
      key: 'actor',
      header: 'Actor',
      render: (log: AuditLog) => (
        <span className={tableText.muted}>{log.actorEmail || log.actorUid}</span>
      ),
    },
    {
      key: 'resource',
      header: 'Resource',
      render: (log: AuditLog) => (
        <span className={tableText.muted}>
          {log.resourceType} / {log.resourceId}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Logs" description="Track administrative actions" />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Filter by action"
          value={action}
          onChange={(e) => {
            setAction(e.target.value);
            setPage(1);
          }}
          placeholder="e.g. user.create"
        />
        <Input
          label="Filter by resource type"
          value={resourceType}
          onChange={(e) => {
            setResourceType(e.target.value);
            setPage(1);
          }}
          placeholder="e.g. blog"
        />
      </div>

      <Card padding="none">
        <Table data={data?.data || []} columns={columns} loading={isLoading} />
        {data && data.totalPages > 1 && (
          <div className="px-6 pb-6">
            <Pagination
              currentPage={page}
              totalPages={data.totalPages}
              onPageChange={setPage}
              loading={isLoading}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
