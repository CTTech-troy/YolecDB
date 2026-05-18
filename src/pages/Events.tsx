import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  useEvents,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
  useToggleEventPublish,
} from '@/hooks/useEvents';
import { useRegistrationCounts } from '@/hooks/useRegistrations';
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
import { PERMISSIONS, Event } from '@/types';
import { tableText, statusBadge, lifecycleBadge } from '@/lib/tableStyles';
import { PUBLIC_SITE_URL } from '@/config/domains';

const EVENT_CATEGORIES = ['Conferences', 'Workshops', 'Summits', 'Virtual'];
const siteBase = PUBLIC_SITE_URL;

function registerUrl(id: string) {
  return siteBase ? `${siteBase}/register/${id}` : `/register/${id}`;
}

const emptyForm = () => ({
  title: '',
  description: '',
  date: '',
  location: '',
  category: 'Conferences',
  eventLifecycle: 'upcoming' as 'upcoming' | 'ongoing' | 'past',
  registrationEnabled: false,
  whatsappLink: '',
  publish: false,
});

export function EventsPage() {
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useEvents(page, 20);
  const { data: regCounts } = useRegistrationCounts();
  const createMutation = useCreateEvent();
  const updateMutation = useUpdateEvent();
  const deleteMutation = useDeleteEvent();
  const togglePublishMutation = useToggleEventPublish();

  const eventCounts = regCounts?.eventCounts ?? {};
  const publishingEventId = togglePublishMutation.isPending
    ? togglePublishMutation.variables?.id
    : undefined;

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setImagePreview('');
    setModalOpen(true);
  };

  const openEdit = (event: Event) => {
    setEditing(event);
    setImagePreview(event.url || '');
    setForm({
      title: event.title,
      description: event.description || '',
      date: event.date || '',
      location: event.location || '',
      category: event.category || 'Conferences',
      eventLifecycle: event.eventLifecycle || 'upcoming',
      registrationEnabled: event.registrationEnabled === true,
      whatsappLink: event.whatsappLink || '',
      publish: event.publish,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(emptyForm());
    setImagePreview('');
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
    if (!imagePreview) {
      toast.error('Please add an event image');
      return;
    }
    const payload = {
      title: form.title.trim(),
      url: imagePreview,
      date: form.date,
      description: form.description || undefined,
      category: form.category,
      location: form.location || undefined,
      eventLifecycle: form.eventLifecycle,
      registrationEnabled: form.registrationEnabled,
      whatsappLink: form.whatsappLink.trim() || undefined,
      publish: form.publish,
    };
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      closeModal();
    } catch {
      // Error toast is handled by the mutation hook.
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await deleteMutation.mutateAsync(deleteId);
        setDeleteId(null);
      } catch {
        // Error toast is handled by the mutation hook.
      }
    }
  };

  const columns = [
    {
      key: 'title',
      header: 'Title',
      render: (event: Event) => (
        <div>
          <p className={tableText.primary}>{event.title}</p>
          <p className={tableText.secondary}>
            {event.category || 'Uncategorized'} · Reg: {eventCounts[event.id] ?? 0}
          </p>
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (event: Event) => (
        <span className={tableText.muted}>
          {event.date ? new Date(event.date).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      render: (event: Event) => (
        <span className={tableText.muted}>{event.location || 'TBD'}</span>
      ),
    },
    {
      key: 'lifecycle',
      header: 'Lifecycle',
      render: (event: Event) => {
        const lifecycle = (event.eventLifecycle || 'upcoming') as keyof typeof lifecycleBadge;
        return (
          <span className={lifecycleBadge[lifecycle] ?? lifecycleBadge.upcoming}>
            {lifecycle}
          </span>
        );
      },
    },
    {
      key: 'publish',
      header: 'Status',
      render: (event: Event) => (
        <div className="flex flex-col gap-1">
          <span className={event.publish ? statusBadge.success : statusBadge.neutral}>
            {event.publish ? 'Published' : 'Draft'}
          </span>
          {event.isLive && (
            <span className="inline-flex w-fit items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-red-600 dark:text-red-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
              Live
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (event: Event) => (
        <div className="flex flex-wrap items-center gap-2">
          <PermissionGate permission={PERMISSIONS.MANAGE_EVENTS}>
            <Link to={`/events/${event.id}/live`}>
              <Button size="sm" variant="secondary" icon="ri-live-line">
                {event.isLive ? 'Studio' : 'Go live'}
              </Button>
            </Link>
          </PermissionGate>
          <PermissionGate permission={PERMISSIONS.EDIT_EVENT}>
            <Button size="sm" variant="ghost" onClick={() => openEdit(event)} icon="ri-edit-line">
              Edit
            </Button>
          </PermissionGate>
          <PermissionGate permission={PERMISSIONS.EDIT_EVENT}>
            <Button
              size="sm"
              variant="ghost"
              loading={publishingEventId === event.id}
              loadingText={event.publish ? 'Unpublishing...' : 'Publishing...'}
              disabled={
                togglePublishMutation.isPending && publishingEventId !== event.id
              }
              onClick={() =>
                togglePublishMutation.mutate({ id: event.id, publish: !event.publish })
              }
              icon={event.publish ? 'ri-eye-off-line' : 'ri-eye-line'}
            >
              {event.publish ? 'Unpublish' : 'Publish'}
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
      width: '280px',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Events Management"
        description="Manage events and registrations"
        action={
          <PermissionGate permission={PERMISSIONS.CREATE_EVENT}>
            <Button icon="ri-add-line" onClick={openCreate}>
              Create Event
            </Button>
          </PermissionGate>
        }
      />

      <Card padding="none">
        <Table
          data={data?.data || []}
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
              {editing ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
          />
          <Input
            label="Date"
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            required
          />
          <Input
            label="Location"
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
          />
          <Select
            label="Category"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            options={EVENT_CATEGORIES.map((c) => ({ value: c, label: c }))}
          />
          <Select
            label="Lifecycle"
            value={form.eventLifecycle}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                eventLifecycle: e.target.value as 'upcoming' | 'ongoing' | 'past',
              }))
            }
            options={[
              { value: 'upcoming', label: 'Upcoming' },
              { value: 'ongoing', label: 'Ongoing' },
              { value: 'past', label: 'Past' },
            ]}
          />
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={4}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={form.registrationEnabled}
              onChange={(e) =>
                setForm((f) => ({ ...f, registrationEnabled: e.target.checked }))
              }
            />
            Enable registration
          </label>
          <Input
            label="WhatsApp link"
            className="sm:col-span-2"
            value={form.whatsappLink}
            onChange={(e) => setForm((f) => ({ ...f, whatsappLink: e.target.value }))}
          />
          {editing && (
            <p className="text-xs text-slate-500 sm:col-span-2">
              Registration URL:{' '}
              <span className="font-mono break-all">{registerUrl(editing.id)}</span>
            </p>
          )}
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Cover image
            </label>
            <ImageUpload onImageSelect={handleImageSelect} preview={imagePreview} />
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Event"
        message="Are you sure you want to delete this event?"
        confirmText="Delete"
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
