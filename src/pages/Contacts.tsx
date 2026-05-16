/**
 * Contacts Page - TypeScript version
 */

import { useState } from 'react';
import { useContacts } from '@/hooks/useContacts';
import { Card, CardHeader, CardTitle, Table, Pagination } from '@/components/ui';
import { Contact } from '@/types';
import { tableText, statusBadge } from '@/lib/tableStyles';

export function ContactsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useContacts(page, 50);

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (contact: Contact) => (
        <div>
          <p className={tableText.primary}>{contact.name}</p>
          <p className={tableText.secondary}>{contact.email}</p>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (contact: Contact) => (
        <span className={tableText.muted}>{contact.phone || 'N/A'}</span>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (contact: Contact) => (
        <span className={tableText.muted}>{contact.category || 'General'}</span>
      ),
    },
    {
      key: 'source',
      header: 'Source',
      render: (contact: Contact) => (
        <span
          className={
            contact._source === 'contactsin' ? statusBadge.info : statusBadge.neutral
          }
        >
          {contact._source || 'unknown'}
        </span>
      ),
    },
    {
      key: 'timestamp',
      header: 'Date',
      render: (contact: Contact) => (
        <span className={tableText.muted}>{new Date(contact.timestamp).toLocaleString()}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Contacts
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          View all contact form submissions
        </p>
      </div>

      {/* Table */}
      <Card padding="none">
        <CardHeader>
          <CardTitle>All Contacts ({data?.total || 0})</CardTitle>
        </CardHeader>

        <Table
          data={data?.data || []}
          columns={columns}
          loading={isLoading}
          emptyMessage="No contacts found"
        />

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
