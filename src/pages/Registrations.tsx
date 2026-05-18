import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  useBlogRegistrations,
  useEventRegistrations,
  useRegistrationAnalytics,
  useDeleteEventRegistration,
  useDeleteAllEventRegistrations,
  useExportRegistrations,
} from '@/hooks/useRegistrations';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, Card, ConfirmModal, Input, Modal, Select } from '@/components/ui';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { PERMISSIONS, Registration } from '@/types';

const ATTENDEE_TYPES = [
  '',
  'Student',
  'Government Worker',
  'Private Sector Employee',
  'Entrepreneur',
  'NGO/Non-Profit',
  'Religious Leader',
  'Media Personnel',
  'Other',
];

function formatDate(ms?: number) {
  if (!ms) return '—';
  try {
    return new Date(ms).toLocaleString();
  } catch {
    return '—';
  }
}

function displayName(r: Registration) {
  return r.fullName || r.name || '—';
}

function profSummary(r: Registration) {
  if (r.studentDetails?.schoolName) return String(r.studentDetails.schoolName);
  if (r.governmentDetails?.agency) return String(r.governmentDetails.agency);
  if (r.companyDetails?.companyName) return String(r.companyDetails.companyName);
  if (r.entrepreneurDetails?.businessName) return String(r.entrepreneurDetails.businessName);
  if (r.mediaDetails?.mediaHouse) return String(r.mediaDetails.mediaHouse);
  return r.school || '—';
}

export function RegistrationsPage() {
  const [tab, setTab] = useState<'blog' | 'event'>('event');
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [detail, setDetail] = useState<Registration | null>(null);
  const [filters, setFilters] = useState({
    attendeeType: '',
    state: '',
    city: '',
    q: '',
  });

  const eventFilters = useMemo(() => ({ ...filters }), [filters]);
  const blogFilters = useMemo(() => ({ ...filters }), [filters]);

  const { data: blogData, isLoading: blogLoading } = useBlogRegistrations(blogFilters);
  const { data: eventRows, isLoading: eventLoading } = useEventRegistrations(eventFilters);
  const { data: analytics } = useRegistrationAnalytics(tab);
  const deleteEventMutation = useDeleteEventRegistration();
  const deleteAllMutation = useDeleteAllEventRegistrations();
  const exportMutation = useExportRegistrations();

  const groups = blogData?.groups ?? [];
  const events = eventRows ?? [];

  const chartData = analytics
    ? Object.entries(analytics.byAttendeeType).map(([name, count]) => ({ name, count }))
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Registrations"
        description="Multi-category event and blog registrations with analytics"
        action={
          <Button
            variant="ghost"
            icon="ri-download-line"
            loading={exportMutation.isPending}
            onClick={() => exportMutation.mutate({ scope: tab, filters })}
          >
            Export CSV
          </Button>
        }
      />

      <Card className="p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            label="Attendee type"
            value={filters.attendeeType}
            onChange={(e) => setFilters((f) => ({ ...f, attendeeType: e.target.value }))}
            options={ATTENDEE_TYPES.map((t) => ({ value: t, label: t || 'All types' }))}
          />
          <Input
            label="State"
            value={filters.state}
            onChange={(e) => setFilters((f) => ({ ...f, state: e.target.value }))}
            placeholder="e.g. Lagos"
          />
          <Input
            label="City"
            value={filters.city}
            onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))}
            placeholder="e.g. Ikeja"
          />
          <Input
            label="Search"
            value={filters.q}
            onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
            placeholder="Name or email"
          />
        </div>
      </Card>

      {analytics && (
        <div className="grid gap-4 lg:grid-cols-4">
          <Card className="p-4">
            <p className="text-xs uppercase text-slate-500">Total</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{analytics.total}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs uppercase text-slate-500">Students</p>
            <p className="text-2xl font-bold">{analytics.byAttendeeType.Student ?? 0}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs uppercase text-slate-500">Gov. workers</p>
            <p className="text-2xl font-bold">{analytics.byAttendeeType['Government Worker'] ?? 0}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs uppercase text-slate-500">Top state</p>
            <p className="text-lg font-semibold">{analytics.topStates[0]?.name || '—'}</p>
          </Card>
        </div>
      )}

      {chartData.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="p-4 h-72 lg:col-span-2">
            <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">
              Attendee distribution
            </h3>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          {analytics && (
            <Card className="p-4">
              <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Top insights</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-xs uppercase text-slate-500 mb-1">States</p>
                  <ul className="space-y-1">
                    {(analytics.topStates || []).slice(0, 5).map((s) => (
                      <li key={s.name} className="flex justify-between">
                        <span>{s.name}</span>
                        <span className="text-slate-500">{s.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500 mb-1">Universities</p>
                  <ul className="space-y-1">
                    {(analytics.topUniversities || []).slice(0, 5).map((u) => (
                      <li key={u.name} className="flex justify-between">
                        <span className="truncate pr-2">{u.name}</span>
                        <span className="text-slate-500 shrink-0">{u.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500 mb-1">Agencies</p>
                  <ul className="space-y-1">
                    {(analytics.topAgencies || []).slice(0, 5).map((a) => (
                      <li key={a.name} className="flex justify-between">
                        <span className="truncate pr-2">{a.name}</span>
                        <span className="text-slate-500 shrink-0">{a.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        {(['blog', 'event'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize ${
              tab === t
                ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'blog' && (
        <>
          {blogLoading && <p className="text-slate-500">Loading blog registrations…</p>}
          {!blogLoading && groups.length === 0 && (
            <p className="text-slate-500">No blog registrations match your filters.</p>
          )}
          {groups.map((g) => (
            <section key={g.blogId} className="dashboard-table-section">
              <div className="dashboard-table-section-header">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{g.blogTitle}</h2>
                <p className="text-sm text-slate-600">{g.count} registration(s)</p>
              </div>
              <RegTable
                rows={g.registrations}
                onDetail={setDetail}
                onDelete={undefined}
              />
            </section>
          ))}
        </>
      )}

      {tab === 'event' && (
        <>
          <div className="flex justify-end">
            <PermissionGate permission={PERMISSIONS.DELETE_REGISTRATIONS}>
              <Button variant="danger" onClick={() => setConfirmDeleteAll(true)}>
                Delete all event registrations
              </Button>
            </PermissionGate>
          </div>
          {eventLoading && <p className="text-slate-500">Loading event registrations…</p>}
          {!eventLoading && events.length === 0 && (
            <p className="text-slate-500">No event registrations match your filters.</p>
          )}
          {events.length > 0 && (
            <RegTable
              rows={events}
              onDetail={setDetail}
              onDelete={(id) => deleteEventMutation.mutate(id)}
            />
          )}
        </>
      )}

      <Modal
        isOpen={Boolean(detail)}
        onClose={() => setDetail(null)}
        title="Registration detail"
        size="lg"
        footer={
          <Button variant="ghost" onClick={() => setDetail(null)}>
            Close
          </Button>
        }
      >
        <pre className="max-h-[60dvh] overflow-auto rounded-lg bg-slate-100 p-3 text-xs dark:bg-slate-900">
          {JSON.stringify(detail, null, 2)}
        </pre>
      </Modal>

      <ConfirmModal
        isOpen={confirmDeleteAll}
        onClose={() => setConfirmDeleteAll(false)}
        onConfirm={async () => {
          try {
            await deleteAllMutation.mutateAsync();
            setConfirmDeleteAll(false);
          } catch {
            // Error toast is handled by the mutation hook.
          }
        }}
        title="Delete all event registrations"
        message="This will permanently remove all event registrations."
        variant="danger"
        loading={deleteAllMutation.isPending}
      />
    </div>
  );
}

function RegTable({
  rows,
  onDetail,
  onDelete,
}: {
  rows: Registration[];
  onDetail: (r: Registration) => void;
  onDelete?: (id: string) => void;
}) {
  return (
    <div className="dashboard-table-wrap">
      <table className="dashboard-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Type</th>
            <th>Location</th>
            <th>Professional</th>
            <th>Date</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{displayName(r)}</td>
              <td>{r.email}</td>
              <td>{r.attendeeType || '—'}</td>
              <td>
                {[r.city, r.state].filter(Boolean).join(', ') || r.location || '—'}
              </td>
              <td>{profSummary(r)}</td>
              <td>{formatDate(r.createdAt)}</td>
              <td className="space-x-2">
                <Button size="sm" variant="ghost" onClick={() => onDetail(r)}>
                  View
                </Button>
                {onDelete && (
                  <PermissionGate permission={PERMISSIONS.DELETE_REGISTRATIONS}>
                    <Button size="sm" variant="ghost" onClick={() => onDelete(r.id)}>
                      Delete
                    </Button>
                  </PermissionGate>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
