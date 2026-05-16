import { DragEvent, FormEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, Card, Input, Modal, Select } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { isItRole, isMediaRole, isSuperAdminRole } from '@/lib/roles';
import {
  useCreateTicket,
  useMoveTicket,
  useTicketSummary,
  useTicketUsers,
  useTickets,
} from '@/hooks/useTickets';
import type {
  CreateTicketPayload,
  Ticket,
  TicketCategory,
  TicketFilters,
  TicketPriority,
  TicketRole,
  TicketStatus,
} from '@/types';

const statuses: TicketStatus[] = ['todo', 'in_progress', 'qa_verify', 'done'];
const priorities: TicketPriority[] = ['low', 'medium', 'high', 'critical'];
const roles: TicketRole[] = ['SUPER_ADMIN', 'IT_TEAM', 'MEDIA'];

const statusLabels: Record<TicketStatus, string> = {
  todo: 'TODO',
  in_progress: 'IN PROGRESS',
  qa_verify: 'QA VERIFY',
  done: 'DONE',
};

const priorityStyles: Record<TicketPriority, string> = {
  low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  medium: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  critical: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
};

const categories: TicketCategory[] = [
  'infrastructure',
  'security',
  'server_incident',
  'api_issue',
  'cache',
  'deployment',
  'content_review',
  'blog_publishing',
  'event_media',
  'banner_update',
  'social_campaign',
  'general',
];

const categoryLabels: Record<TicketCategory, string> = {
  infrastructure: 'Infrastructure',
  security: 'Security',
  server_incident: 'Server incident',
  api_issue: 'API issue',
  cache: 'Redis/cache',
  deployment: 'Deployment',
  content_review: 'Content review',
  blog_publishing: 'Blog publishing',
  event_media: 'Event media',
  banner_update: 'Banner update',
  social_campaign: 'Social campaign',
  general: 'General',
};

const emptyForm: CreateTicketPayload = {
  title: '',
  description: '',
  priority: 'medium',
  assignedRole: 'IT_TEAM',
  assignedTo: '',
  dueDate: undefined,
  attachments: [],
  labels: [],
  category: 'general',
};

function formatDate(value?: number) {
  if (!value) return 'No due date';
  return new Date(value).toLocaleDateString();
}

function dateInputValue(value?: number) {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
}

function initials(name?: string) {
  return (name ?? 'Unassigned')
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function toDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function metricValue(value: number | null | undefined, suffix = '') {
  if (value === null || value === undefined) return '-';
  return `${value.toLocaleString()}${suffix}`;
}

function TicketCard({ ticket }: { ticket: Ticket }) {
  const navigate = useNavigate();
  const overdue = ticket.status !== 'done' && ticket.dueDate && ticket.dueDate < Date.now();

  return (
    <button
      type="button"
      draggable
      onDragStart={(event) => event.dataTransfer.setData('ticket/id', ticket.id)}
      onClick={() => navigate(`/tickets/${ticket.id}`)}
      className="w-full rounded-lg border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-600"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{ticket.ticketId}</span>
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase ${priorityStyles[ticket.priority]}`}>
          {ticket.priority}
        </span>
      </div>
      <h3 className="mt-2 line-clamp-2 text-sm font-semibold text-slate-900 dark:text-white">
        {ticket.title}
      </h3>
      <div className="mt-3 flex flex-wrap gap-1">
        {ticket.labels.slice(0, 3).map((label) => (
          <span key={label} className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {label}
          </span>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            {initials(ticket.assignedToName)}
          </span>
          <span className="truncate">{ticket.assignedToName ?? ticket.assignedRole}</span>
        </div>
        <span className={overdue ? 'font-semibold text-red-600 dark:text-red-300' : ''}>
          {formatDate(ticket.dueDate)}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
        <span className="inline-flex items-center gap-1"><i className="ri-attachment-2" />{ticket.attachments?.length ?? 0}</span>
        <span className="inline-flex items-center gap-1"><i className="ri-chat-3-line" />{ticket.comments?.length ?? 0}</span>
        <span className="ml-auto rounded bg-slate-50 px-1.5 py-0.5 text-[11px] uppercase text-slate-500 dark:bg-slate-800">
          {statusLabels[ticket.status]}
        </span>
      </div>
    </button>
  );
}

function AnalyticsPanel() {
  const { data: summary } = useTicketSummary();
  const statusData = summary
    ? Object.entries(summary.byStatus).map(([name, value]) => ({ name: statusLabels[name as TicketStatus], value }))
    : [];
  const roleData = summary
    ? Object.entries(summary.byRole).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <Card className="p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">Open tickets</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{metricValue(summary?.open)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">Closed tickets</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{metricValue(summary?.closed)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">Overdue</p>
          <p className="mt-2 text-2xl font-bold text-red-600 dark:text-red-300">{metricValue(summary?.overdue)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">Resolution rate</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{metricValue(summary?.resolutionRate, '%')}</p>
        </Card>
        <Card className="p-4 xl:col-span-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">Team performance</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(summary?.teamPerformance ?? []).map((row) => (
              <span key={row.role} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {row.role}: {row.done}/{row.assigned}
              </span>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Tickets per status</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Tickets per role</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roleData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#0891b2" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Completion trend</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={summary?.completionTrend ?? []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="created" stroke="#f59e0b" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="done" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

function TicketCreateModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState<CreateTicketPayload>(emptyForm);
  const [labelText, setLabelText] = useState('');
  const createTicket = useCreateTicket();
  const { data: users = [] } = useTicketUsers(open);

  const assigneeOptions = [
    { value: '', label: 'Unassigned' },
    ...users
      .filter((user) => user.role === form.assignedRole)
      .map((user) => ({ value: user.id, label: `${user.fullName} - ${user.role}` })),
  ];

  async function onFiles(files: FileList | null) {
    if (!files) return;
    const converted = await Promise.all(
      Array.from(files).slice(0, 5).map(async (file) => ({
        name: file.name,
        url: await toDataUrl(file),
        type: file.type,
        size: file.size,
      }))
    );
    setForm((current) => ({ ...current, attachments: [...current.attachments, ...converted].slice(0, 10) }));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const labels = labelText
      .split(',')
      .map((label) => label.trim())
      .filter(Boolean);
    createTicket.mutate(
      { ...form, labels, assignedTo: form.assignedTo || undefined },
      {
        onSuccess: () => {
          setForm(emptyForm);
          setLabelText('');
          onClose();
        },
      }
    );
  }

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Create ticket"
      size="xl"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="create-ticket-form" loading={createTicket.isPending}>Create ticket</Button>
        </>
      }
    >
      <form id="create-ticket-form" onSubmit={submit} className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <Input label="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
          <textarea
            required
            rows={5}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
        <Select
          label="Priority"
          value={form.priority}
          onChange={(e) => setForm({ ...form, priority: e.target.value as TicketPriority })}
          options={priorities.map((priority) => ({ value: priority, label: priority.toUpperCase() }))}
        />
        <Select
          label="Assigned role"
          value={form.assignedRole}
          onChange={(e) => setForm({ ...form, assignedRole: e.target.value as TicketRole, assignedTo: '' })}
          options={roles.map((role) => ({ value: role, label: role }))}
        />
        <Select
          label="Assigned user"
          value={form.assignedTo}
          onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
          options={assigneeOptions}
        />
        <Select
          label="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value as TicketCategory })}
          options={categories.map((category) => ({ value: category, label: categoryLabels[category] }))}
        />
        <Input
          label="Due date"
          type="date"
          value={dateInputValue(form.dueDate)}
          onChange={(e) => setForm({ ...form, dueDate: e.target.value ? new Date(e.target.value).getTime() : undefined })}
        />
        <Input
          label="Labels"
          placeholder="api, redis, urgent"
          value={labelText}
          onChange={(e) => setLabelText(e.target.value)}
        />
        <div className="md:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Attachments</label>
          <input
            type="file"
            multiple
            onChange={(e) => void onFiles(e.target.files)}
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium dark:text-slate-300 dark:file:bg-slate-800 dark:file:text-slate-200"
          />
          {form.attachments.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {form.attachments.map((file) => (
                <span key={file.name} className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {file.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}

export function TicketsPage() {
  const { authUser } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);
  const [filters, setFilters] = useState<TicketFilters>({});
  const { data: tickets = [], isLoading } = useTickets(filters);
  const moveTicket = useMoveTicket();
  const canCreate = isSuperAdminRole(authUser?.roleName);
  const roleName = authUser?.roleName;

  const visibleTickets = useMemo(() => tickets, [tickets]);
  const focusedCategories = isItRole(roleName)
    ? ['infrastructure', 'security', 'server_incident', 'api_issue', 'cache', 'deployment']
    : isMediaRole(roleName)
      ? ['content_review', 'blog_publishing', 'event_media', 'banner_update', 'social_campaign']
      : [];

  function dropTicket(event: DragEvent, status: TicketStatus) {
    event.preventDefault();
    const id = event.dataTransfer.getData('ticket/id');
    const ticket = tickets.find((row) => row.id === id);
    if (id && ticket?.status !== status) {
      moveTicket.mutate({ id, status });
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tickets"
        description="Jira-style workflow board for IT, media, incidents, and delivery tasks."
        action={
          canCreate ? (
            <Button icon="ri-add-line" onClick={() => setCreateOpen(true)}>Create ticket</Button>
          ) : null
        }
      />

      <AnalyticsPanel />

      {focusedCategories.length > 0 && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            {isItRole(roleName) ? 'IT team queue' : 'Media team queue'}
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {focusedCategories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setFilters((current) => ({ ...current, search: category }))}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                {categoryLabels[category as TicketCategory]}
              </button>
            ))}
          </div>
        </Card>
      )}

      <div className="sticky top-[4.25rem] z-[8] rounded-lg border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur lg:top-4 dark:border-slate-800 dark:bg-slate-950/95">
        <div className="grid gap-3 lg:grid-cols-[1fr_160px_160px_160px_auto]">
          <Input
            placeholder="Search tickets, labels, assignee"
            value={filters.search ?? ''}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <Select
            value={filters.priority ?? ''}
            onChange={(e) => setFilters({ ...filters, priority: (e.target.value || undefined) as TicketPriority | undefined })}
            options={[{ value: '', label: 'All priorities' }, ...priorities.map((priority) => ({ value: priority, label: priority.toUpperCase() }))]}
          />
          <Select
            value={filters.role ?? ''}
            onChange={(e) => setFilters({ ...filters, role: (e.target.value || undefined) as TicketRole | undefined })}
            options={[{ value: '', label: 'All roles' }, ...roles.map((role) => ({ value: role, label: role }))]}
          />
          <Select
            value={filters.status ?? ''}
            onChange={(e) => setFilters({ ...filters, status: (e.target.value || undefined) as TicketStatus | undefined })}
            options={[{ value: '', label: 'All statuses' }, ...statuses.map((status) => ({ value: status, label: statusLabels[status] }))]}
          />
          <Button variant="ghost" onClick={() => setFilters({})}>Reset</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statuses.map((status) => {
          const columnTickets = visibleTickets.filter((ticket) => ticket.status === status);
          return (
            <section
              key={status}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => dropTicket(event, status)}
              className="flex h-[min(70dvh,760px)] min-h-[360px] flex-col rounded-lg border border-slate-200 bg-slate-100/70 p-3 dark:border-slate-800 dark:bg-slate-900/50"
            >
              <div className="mb-3 flex shrink-0 items-center justify-between">
                <h2 className="text-sm font-bold tracking-wide text-slate-700 dark:text-slate-200">{statusLabels[status]}</h2>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {columnTickets.length}
                </span>
              </div>
              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1 [scrollbar-gutter:stable]">
                {isLoading ? (
                  <p className="text-sm text-slate-500">Loading tickets...</p>
                ) : columnTickets.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500 dark:border-slate-700">
                    Drop tickets here
                  </p>
                ) : (
                  columnTickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)
                )}
              </div>
            </section>
          );
        })}
      </div>

      <TicketCreateModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
