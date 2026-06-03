import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
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
  useEvents,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
} from '@/hooks/useEvents';
import { useRegistrationCounts } from '@/hooks/useRegistrations';
import { eventsApi } from '@/api/events';
import { ImageUpload } from '@/components/forms/ImageUpload';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  Button,
  Card,
  ConfirmModal,
  Input,
  Modal,
  Select,
  Table,
  Pagination,
} from '@/components/ui';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { fileToDataUrlForStorage } from '@/utils/fileToDataUrl';
import { PERMISSIONS, Event, Registration, RegistrationFilters } from '@/types';
import { tableText, statusBadge } from '@/lib/tableStyles';
import { SITE_LOGO_SRC, SITE_NAME } from '@/constants/brand';

const EVENT_CATEGORIES = ['Conferences', 'Workshops', 'Summits', 'Virtual', 'Community'];
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

type EventForm = {
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
  qrExpiresAt: string;
  active: boolean;
};

type RegistrationFiltersForm = {
  q: string;
  attendeeType: string;
  dateFrom: string;
  dateTo: string;
};

const emptyForm = (): EventForm => ({
  title: '',
  description: '',
  date: '',
  location: '',
  category: 'Conferences',
  qrExpiresAt: '',
  active: true,
});

function msToDateInput(ms?: number | null) {
  if (!ms) return '';
  return new Date(ms).toISOString().slice(0, 10);
}

function dateInputToMs(value: string) {
  if (!value) return null;
  const time = new Date(`${value}T23:59:59`).getTime();
  return Number.isFinite(time) ? time : null;
}

function formatDate(value?: string | number | null) {
  if (!value) return 'Not set';
  const date = typeof value === 'number' ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString();
}

function formatDateTime(ms?: number | null) {
  if (!ms) return 'Not set';
  return new Date(ms).toLocaleString();
}

function isExpired(event: Event) {
  return Boolean(event.qrExpiresAt && Date.now() > event.qrExpiresAt);
}

function qrState(event: Event) {
  if (isExpired(event)) return 'expired';
  if (event.qrStatus === 'inactive' || event.registrationEnabled === false) return 'inactive';
  return 'active';
}

function qrBadge(event: Event) {
  const state = qrState(event);
  if (state === 'active') return statusBadge.success;
  if (state === 'expired') return statusBadge.warning;
  return statusBadge.neutral;
}

function normalizeEventForForm(event: Event): EventForm {
  return {
    title: event.title || '',
    description: event.description || '',
    date: event.date || '',
    location: event.location || '',
    category: event.category || 'Conferences',
    qrExpiresAt: msToDateInput(event.qrExpiresAt),
    active: qrState(event) !== 'inactive',
  };
}

function registrationFiltersFromForm(form: RegistrationFiltersForm): RegistrationFilters {
  return {
    q: form.q || undefined,
    attendeeType: form.attendeeType || undefined,
    dateFrom: form.dateFrom ? new Date(`${form.dateFrom}T00:00:00`).getTime() : undefined,
    dateTo: form.dateTo ? new Date(`${form.dateTo}T23:59:59`).getTime() : undefined,
  };
}

async function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function flyerDataUrl(event: Event) {
  const url = event.registrationUrl || '';
  if (!url) throw new Error('Generate a QR code first');
  const qr = await QRCode.toDataURL(url, {
    width: 620,
    margin: 1,
    color: { dark: '#0f2a1e', light: '#ffffff' },
  });
  const [qrImg, logo] = await Promise.all([loadImage(qr), loadImage(SITE_LOGO_SRC)]);

  const canvas = document.createElement('canvas');
  canvas.width = 1600;
  canvas.height = 2200;
  const ctx = canvas.getContext('2d');
  if (!ctx || !qrImg) throw new Error('Could not render flyer');

  ctx.fillStyle = '#f4f4f0';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#0f2a1e';
  ctx.fillRect(0, 0, canvas.width, 360);

  if (logo) {
    ctx.drawImage(logo, 120, 92, 110, 110);
  }
  ctx.fillStyle = '#a8e6c8';
  ctx.font = '700 54px Georgia';
  ctx.fillText(SITE_NAME, 260, 165);
  ctx.fillStyle = '#3ecf8e';
  ctx.font = '700 28px Courier New';
  ctx.fillText('EVENT REGISTRATION', 260, 218);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(120, 280, 1360, 1800);
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 3;
  ctx.strokeRect(120, 280, 1360, 1800);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#0f2a1e';
  ctx.font = '700 72px Georgia';
  wrapText(ctx, event.title || 'YolecHub Event', 800, 450, 1180, 86, 3);

  ctx.fillStyle = '#444444';
  ctx.font = '34px Georgia';
  wrapText(
    ctx,
    event.description ||
      'Join young leaders, entrepreneurs, innovators, government officials and professionals for networking, learning and collaboration.',
    800,
    705,
    1180,
    50,
    4
  );

  ctx.fillStyle = '#f0faf5';
  ctx.fillRect(350, 940, 900, 900);
  ctx.strokeStyle = '#d7efe2';
  ctx.lineWidth = 4;
  ctx.strokeRect(350, 940, 900, 900);
  ctx.drawImage(qrImg, 430, 1020, 740, 740);

  ctx.fillStyle = '#0f2a1e';
  ctx.font = '700 54px Courier New';
  ctx.fillText('SCAN TO REGISTER', 800, 1995);
  ctx.fillStyle = '#555555';
  ctx.font = '28px Courier New';
  ctx.fillText('yolechub.com.ng', 800, 2070);
  ctx.textAlign = 'left';

  return canvas.toDataURL('image/png');
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number
) {
  const words = text.split(/\s+/);
  let line = '';
  let lines = 0;
  for (const word of words) {
    const testLine = `${line}${line ? ' ' : ''}${word}`;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      y += lineHeight;
      lines += 1;
      line = word;
      if (lines >= maxLines) return;
    } else {
      line = testLine;
    }
  }
  if (line && lines < maxLines) ctx.fillText(line, x, y);
}

export function EventsPage() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [form, setForm] = useState<EventForm>(emptyForm);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [registrationsPage, setRegistrationsPage] = useState(1);
  const [filters, setFilters] = useState<RegistrationFiltersForm>({
    q: '',
    attendeeType: '',
    dateFrom: '',
    dateTo: '',
  });
  const [flyerEvent, setFlyerEvent] = useState<Event | null>(null);
  const [flyerPreview, setFlyerPreview] = useState('');

  const { data, isLoading } = useEvents(page, 100);
  const { data: registrationCounts } = useRegistrationCounts();
  const createMutation = useCreateEvent();
  const updateMutation = useUpdateEvent();
  const deleteMutation = useDeleteEvent();

  const events = data?.data || [];
  const eventCounts = registrationCounts?.eventCounts || {};
  const activeQrCodes = events.filter((event) => qrState(event) === 'active').length;
  const expiredQrCodes = events.filter((event) => qrState(event) === 'expired').length;
  const totalRegistrations = Object.values(eventCounts).reduce((total, count) => total + count, 0);
  const performanceChart = events
    .map((event) => ({
      name: event.title,
      count: eventCounts[event.id] || 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const activeRegistrationFilters = useMemo(() => registrationFiltersFromForm(filters), [filters]);

  const { data: selectedRegistrations, isLoading: registrationsLoading } = useQuery({
    queryKey: ['events', selectedEvent?.id, 'registrations', registrationsPage, activeRegistrationFilters],
    queryFn: () =>
      eventsApi.listRegistrations(
        selectedEvent!.id,
        activeRegistrationFilters,
        registrationsPage,
        25
      ),
    enabled: Boolean(selectedEvent?.id),
  });

  const { data: selectedAnalytics } = useQuery({
    queryKey: ['events', selectedEvent?.id, 'analytics'],
    queryFn: () => eventsApi.getAnalytics(selectedEvent!.id),
    enabled: Boolean(selectedEvent?.id),
  });

  const generateQrMutation = useMutation({
    mutationFn: (id: string) => eventsApi.generateQr(id),
    onSuccess: () => {
      toast.success('QR code ready');
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (e: Error) => toast.error(e.message || 'Could not generate QR'),
  });

  const regenerateQrMutation = useMutation({
    mutationFn: (id: string) => eventsApi.regenerateQr(id),
    onSuccess: () => {
      toast.success('QR code regenerated');
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (e: Error) => toast.error(e.message || 'Could not regenerate QR'),
  });

  const exportMutation = useMutation({
    mutationFn: ({ format }: { format: 'csv' | 'excel' }) => {
      if (!selectedEvent) throw new Error('Select an event first');
      if (format === 'csv') return eventsApi.downloadRegistrationsCsv(selectedEvent.id, activeRegistrationFilters);
      return eventsApi.downloadRegistrationsExcel(selectedEvent.id, activeRegistrationFilters);
    },
    onSuccess: () => toast.success('Export downloaded'),
    onError: (e: Error) => toast.error(e.message || 'Export failed'),
  });

  useEffect(() => {
    if (!flyerEvent) {
      setFlyerPreview('');
      return;
    }
    let cancelled = false;
    flyerDataUrl(flyerEvent)
      .then((url) => {
        if (!cancelled) setFlyerPreview(url);
      })
      .catch((e) => toast.error(e instanceof Error ? e.message : 'Could not render flyer'));
    return () => {
      cancelled = true;
    };
  }, [flyerEvent]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setImagePreview('');
    setModalOpen(true);
  };

  useEffect(() => {
    if (searchParams.get('action') !== 'create') return;
    if (modalOpen && !editing) return;
    setEditing(null);
    setForm(emptyForm());
    setImagePreview('');
    setModalOpen(true);
  }, [editing, modalOpen, searchParams]);

  const openEdit = (event: Event) => {
    setEditing(event);
    setForm(normalizeEventForForm(event));
    setImagePreview(event.url || '');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(emptyForm());
    setImagePreview('');
    if (searchParams.get('action') === 'create') {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('action');
      setSearchParams(nextParams, { replace: true });
    }
  };

  const handleImageSelect = async (file: File) => {
    try {
      setImagePreview(await fileToDataUrlForStorage(file));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not read image');
    }
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.date) {
      toast.error('Title and date are required');
      return;
    }

    const payload: Partial<Event> = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      date: form.date,
      location: form.location.trim() || undefined,
      category: form.category,
      eventLifecycle: 'upcoming',
      registrationEnabled: form.active,
      takingResponses: form.active,
      qrStatus: form.active ? 'active' : 'inactive',
      qrExpiresAt: dateInputToMs(form.qrExpiresAt),
      publish: true,
      url: imagePreview || undefined,
    };

    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, data: payload });
      } else {
        await createMutation.mutateAsync(payload as Omit<Event, 'id' | 'createdAt' | 'updatedAt'>);
      }
      closeModal();
    } catch {
      // Mutation hooks show the toast.
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
      if (selectedEvent?.id === deleteId) setSelectedEvent(null);
    } catch {
      // Mutation hooks show the toast.
    }
  };

  const downloadFlyerPng = async (event: Event) => {
    const image = await flyerDataUrl(event);
    const a = document.createElement('a');
    a.href = image;
    a.download = `${event.qrSlug || event.id}-qr-flyer.png`;
    a.click();
  };

  const downloadFlyerPdf = async (event: Event) => {
    const image = await flyerDataUrl(event);
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [1600, 2200] });
    pdf.addImage(image, 'PNG', 0, 0, 1600, 2200);
    pdf.save(`${event.qrSlug || event.id}-qr-flyer.pdf`);
  };

  const columns = [
    {
      key: 'title',
      header: 'Event',
      render: (event: Event) => (
        <div>
          <p className={tableText.primary}>{event.title}</p>
          <p className={tableText.secondary}>
            {event.category || 'Uncategorized'} - {event.location || 'Location not set'}
          </p>
        </div>
      ),
    },
    {
      key: 'qr',
      header: 'QR Status',
      render: (event: Event) => (
        <div className="space-y-1">
          <span className={qrBadge(event)}>{qrState(event)}</span>
          <p className="max-w-[220px] truncate font-mono text-xs text-slate-500">
            {event.registrationUrl || 'No QR yet'}
          </p>
        </div>
      ),
    },
    {
      key: 'expiry',
      header: 'Expiry',
      render: (event: Event) => <span className={tableText.muted}>{formatDate(event.qrExpiresAt)}</span>,
    },
    {
      key: 'created',
      header: 'Created',
      render: (event: Event) => <span className={tableText.muted}>{formatDate(event.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (event: Event) => (
        <div className="flex flex-wrap items-center gap-2">
          <PermissionGate permission={PERMISSIONS.VIEW_REGISTRATIONS}>
            <Button
              size="sm"
              variant="secondary"
              icon="ri-group-line"
              onClick={() => {
                setSelectedEvent(event);
                setRegistrationsPage(1);
              }}
            >
              View registrations
            </Button>
          </PermissionGate>
          <PermissionGate permission={PERMISSIONS.EDIT_EVENT}>
            <Button
              size="sm"
              variant="ghost"
              icon="ri-qr-code-line"
              loading={generateQrMutation.isPending && generateQrMutation.variables === event.id}
              onClick={() => generateQrMutation.mutate(event.id)}
            >
              Create QR
            </Button>
          </PermissionGate>
          <PermissionGate permission={PERMISSIONS.EDIT_EVENT}>
            <Button
              size="sm"
              variant="ghost"
              icon="ri-refresh-line"
              loading={regenerateQrMutation.isPending && regenerateQrMutation.variables === event.id}
              onClick={() => regenerateQrMutation.mutate(event.id)}
            >
              Regenerate
            </Button>
          </PermissionGate>
          <Button
            size="sm"
            variant="ghost"
            icon="ri-file-download-line"
            disabled={!event.registrationUrl}
            onClick={() => setFlyerEvent(event)}
          >
            Flyer
          </Button>
          <PermissionGate permission={PERMISSIONS.EDIT_EVENT}>
            <Button size="sm" variant="ghost" onClick={() => openEdit(event)} icon="ri-edit-line">
              Edit
            </Button>
          </PermissionGate>
          <PermissionGate permission={PERMISSIONS.DELETE_EVENT}>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDeleteId(event.id)}
              icon="ri-delete-bin-line"
              className="text-red-600 dark:text-red-400"
            >
              Delete
            </Button>
          </PermissionGate>
        </div>
      ),
      width: '520px',
    },
  ];

  const regColumns = [
    {
      key: 'name',
      header: 'Registrant',
      render: (row: Registration) => (
        <div>
          <p className={tableText.primary}>{row.fullName || row.name || 'Unknown'}</p>
          <p className={tableText.secondary}>{row.email}</p>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (row: Registration) => <span className={tableText.muted}>{row.phoneNumber || row.number}</span>,
    },
    {
      key: 'location',
      header: 'Location',
      render: (row: Registration) => (
        <span className={tableText.muted}>
          {[row.city, row.state].filter(Boolean).join(', ') || row.location || row.address || 'Not set'}
        </span>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (row: Registration) => <span className={statusBadge.neutral}>{row.attendeeType || 'Other'}</span>,
    },
    {
      key: 'date',
      header: 'Registration Date',
      render: (row: Registration) => <span className={tableText.muted}>{formatDateTime(row.createdAt)}</span>,
    },
  ];

  const categoryChart = selectedAnalytics
    ? Object.entries(selectedAnalytics.byAttendeeType).map(([name, count]) => ({ name, count }))
    : [];
  const dayChart = selectedAnalytics?.byDay || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Event Management"
        description="Create events, manage permanent QR registration links, and track attendees"
        action={
          <PermissionGate permission={PERMISSIONS.CREATE_EVENT}>
            <Button icon="ri-add-line" onClick={openCreate}>
              Create Event
            </Button>
          </PermissionGate>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Events" value={events.length} icon="ri-calendar-event-line" />
        <MetricCard label="Total Registrations" value={totalRegistrations} icon="ri-team-line" />
        <MetricCard label="Active QR Codes" value={activeQrCodes} icon="ri-qr-code-line" />
        <MetricCard label="Expired QR Codes" value={expiredQrCodes} icon="ri-time-line" />
      </div>

      <Card padding="none">
        <Table
          data={events}
          columns={columns}
          loading={isLoading}
          emptyMessage="No events found"
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

      {performanceChart.length > 0 && (
        <Card className="h-80 p-5">
          <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">
            Event Performance Comparison
          </h2>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={performanceChart}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {selectedEvent && (
        <Card className="space-y-5 p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Registrations</p>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                {selectedEvent.title}
              </h2>
              <p className="mt-1 max-w-3xl text-sm text-slate-500">
                {selectedEvent.registrationUrl || 'Generate a QR code to open public registration.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                icon="ri-download-line"
                loading={exportMutation.isPending}
                onClick={() => exportMutation.mutate({ format: 'csv' })}
              >
                Export CSV
              </Button>
              <Button
                variant="secondary"
                icon="ri-file-excel-line"
                loading={exportMutation.isPending}
                onClick={() => exportMutation.mutate({ format: 'excel' })}
              >
                Export Excel
              </Button>
              <Link to={`/events/${selectedEvent.id}/live`}>
                <Button variant="ghost" icon="ri-live-line">
                  Live studio
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <Input
              label="Search"
              value={filters.q}
              onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
              placeholder="Name, email, phone"
            />
            <Select
              label="Category"
              value={filters.attendeeType}
              onChange={(e) => setFilters((f) => ({ ...f, attendeeType: e.target.value }))}
              options={ATTENDEE_TYPES.map((type) => ({ value: type, label: type || 'All categories' }))}
            />
            <Input
              label="From"
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))}
            />
            <Input
              label="To"
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="h-72 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
              <h3 className="mb-3 text-sm font-semibold">Registrations per day</h3>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={dayChart}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0f2a1e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="h-72 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
              <h3 className="mb-3 text-sm font-semibold">Registrations per category</h3>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={categoryChart}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3ecf8e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <Table
            data={selectedRegistrations?.data || []}
            columns={regColumns}
            loading={registrationsLoading}
            emptyMessage="No registrations match these filters"
          />
          {selectedRegistrations && selectedRegistrations.totalPages > 1 && (
            <Pagination
              currentPage={registrationsPage}
              totalPages={selectedRegistrations.totalPages}
              onPageChange={setRegistrationsPage}
              loading={registrationsLoading}
            />
          )}
        </Card>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editing ? 'Edit Event' : 'Create Event'}
        size="xl"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {editing ? 'Update Event' : 'Create Event'}
            </Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Event Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
          />
          <Input
            label="Event Date"
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            required
          />
          <Input
            label="Event Location"
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
          />
          <Select
            label="Event Category"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            options={EVENT_CATEGORIES.map((category) => ({ value: category, label: category }))}
          />
          <Input
            label="QR Code Expiry Date"
            type="date"
            value={form.qrExpiresAt}
            onChange={(e) => setForm((f) => ({ ...f, qrExpiresAt: e.target.value }))}
          />
          <Select
            label="Status"
            value={form.active ? 'active' : 'inactive'}
            onChange={(e) => setForm((f) => ({ ...f, active: e.target.value === 'active' }))}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Event Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={4}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          {editing?.registrationUrl && (
            <div className="sm:col-span-2">
              <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Permanent Registration URL</p>
              <div className="flex flex-col gap-2 rounded-lg bg-slate-50 p-3 font-mono text-xs text-slate-600 dark:bg-slate-900 dark:text-slate-300 sm:flex-row sm:items-center sm:justify-between">
                <span className="break-all">{editing.registrationUrl}</span>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    navigator.clipboard?.writeText(editing.registrationUrl || '');
                    toast.success('Copied');
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>
          )}
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Cover image
            </label>
            <ImageUpload onImageSelect={handleImageSelect} preview={imagePreview} />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(flyerEvent)}
        onClose={() => setFlyerEvent(null)}
        title="QR Flyer Preview"
        size="lg"
        footer={
          flyerEvent ? (
            <>
              <Button variant="secondary" onClick={() => void downloadFlyerPng(flyerEvent)}>
                Download PNG
              </Button>
              <Button onClick={() => void downloadFlyerPdf(flyerEvent)}>
                Download PDF
              </Button>
            </>
          ) : null
        }
      >
        {flyerPreview ? (
          <img
            src={flyerPreview}
            alt="QR flyer preview"
            className="mx-auto max-h-[70vh] rounded-lg border border-slate-200 object-contain dark:border-slate-700"
          />
        ) : (
          <div className="flex h-96 items-center justify-center text-slate-500">Rendering flyer...</div>
        )}
      </Modal>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Event"
        message="This will remove the event and invalidate its QR registration link."
        confirmText="Delete"
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
          <i className={`${icon} text-xl`} />
        </div>
      </div>
    </Card>
  );
}
