import { useState } from 'react';
import { useSubscribers } from '@/hooks/useSubscribers';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, Pagination, Table } from '@/components/ui';
import { Subscriber } from '@/types';
import { tableText, statusBadge } from '@/lib/tableStyles';

export function NewsletterPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useSubscribers(page, 50);

  const columns = [
    {
      key: 'email',
      header: 'Email',
      render: (s: Subscriber) => <span className={tableText.primary}>{s.email}</span>,
    },
    {
      key: 'name',
      header: 'Name',
      render: (s: Subscriber) => <span className={tableText.muted}>{s.name || '—'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (s: Subscriber) => (
        <span
          className={s.status === 'active' ? statusBadge.success : statusBadge.neutral}
        >
          {s.status}
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Subscribed',
      render: (s: Subscriber) => (
        <span className={tableText.muted}>
          {s.subscriptionDate
            ? new Date(s.subscriptionDate).toLocaleDateString()
            : '—'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Newsletter" description="Email subscribers" />

      <Card padding="none">
        <Table
          data={data?.data || []}
          columns={columns}
          loading={isLoading}
          emptyMessage="No subscribers yet"
        />
        {data && data.totalPages > 1 && (
          <div className="px-6 pb-6">
            <Pagination
              currentPage={page}
              totalPages={data.totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
