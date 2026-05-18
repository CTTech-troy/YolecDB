import { FormEvent, useMemo, useState } from 'react';
import {
  useCreateTestimonial,
  useDeleteTestimonial,
  useTestimonials,
  useUpdateTestimonial,
} from '@/hooks/useTestimonials';
import {
  Button,
  Card,
  ConfirmModal,
  Input,
  Modal,
  Pagination,
  Select,
  Table,
} from '@/components/ui';
import { PageHeader } from '@/components/layout/PageHeader';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { PERMISSIONS, Testimonial } from '@/types';
import { tableText, statusBadge } from '@/lib/tableStyles';

type StatusFilter = 'all' | 'live' | 'pending' | 'featured';

interface TestimonialFormState {
  name: string;
  role: string;
  organization: string;
  content: string;
  rating: number;
  image: string;
  likes: number;
  approved: boolean;
  featured: boolean;
}

const emptyForm: TestimonialFormState = {
  name: '',
  role: '',
  organization: '',
  content: '',
  rating: 5,
  image: '',
  likes: 0,
  approved: true,
  featured: false,
};

function testimonialContent(testimonial: Testimonial) {
  return testimonial.content || testimonial.testimonial || '';
}

function testimonialRole(testimonial: Testimonial) {
  return testimonial.role || testimonial.company || '';
}

function testimonialOrg(testimonial: Testimonial) {
  return testimonial.organization || '';
}

function testimonialImage(testimonial: Testimonial) {
  return testimonial.image || testimonial.photo || '';
}

function testimonialLikes(testimonial: Testimonial) {
  return Math.max(0, Number(testimonial.likes) || 0);
}

function isLive(testimonial: Testimonial) {
  return (
    testimonial.approved === true ||
    testimonial.published === true ||
    testimonial.status === 'approved' ||
    testimonial.status === 'published'
  );
}

function formFromTestimonial(testimonial: Testimonial): TestimonialFormState {
  return {
    name: testimonial.name || '',
    role: testimonialRole(testimonial),
    organization: testimonialOrg(testimonial),
    content: testimonialContent(testimonial),
    rating: Math.min(5, Math.max(1, Number(testimonial.rating) || 5)),
    image: testimonialImage(testimonial),
    likes: testimonialLikes(testimonial),
    approved: isLive(testimonial),
    featured: Boolean(testimonial.featured),
  };
}

function payloadFromForm(form: TestimonialFormState) {
  const approved = Boolean(form.approved);
  return {
    name: form.name.trim(),
    role: form.role.trim() || undefined,
    organization: form.organization.trim() || undefined,
    content: form.content.trim(),
    rating: Number(form.rating) || 5,
    image: form.image.trim() || undefined,
    likes: Math.max(0, Number(form.likes) || 0),
    approved,
    published: approved,
    status: approved ? ('approved' as const) : ('pending' as const),
    featured: approved ? Boolean(form.featured) : false,
  };
}

function Stars({ rating = 0 }: { rating?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, index) => (
        <i
          key={index}
          className={`ri-star-${index < rating ? 'fill' : 'line'} text-sm text-yellow-400`}
        />
      ))}
    </div>
  );
}

function TestimonialModal({
  open,
  editing,
  form,
  setForm,
  saving,
  onClose,
  onSubmit,
}: {
  open: boolean;
  editing: Testimonial | null;
  form: TestimonialFormState;
  setForm: (form: TestimonialFormState) => void;
  saving: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
}) {
  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={editing ? 'Edit testimonial' : 'Add testimonial'}
      size="xl"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="testimonial-form" loading={saving}>
            {editing ? 'Save changes' : 'Create testimonial'}
          </Button>
        </>
      }
    >
      <form id="testimonial-form" onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
        <Input
          label="Name"
          required
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
        />
        <Input
          label="Role"
          placeholder="Founder, speaker, attendee"
          value={form.role}
          onChange={(event) => setForm({ ...form, role: event.target.value })}
        />
        <Input
          label="Organization"
          value={form.organization}
          onChange={(event) => setForm({ ...form, organization: event.target.value })}
        />
        <Input
          label="Image URL"
          value={form.image}
          onChange={(event) => setForm({ ...form, image: event.target.value })}
          placeholder="https://..."
        />
        <Select
          label="Rating"
          value={String(form.rating)}
          onChange={(event) => setForm({ ...form, rating: Number(event.target.value) || 5 })}
          options={[1, 2, 3, 4, 5].map((rating) => ({
            value: String(rating),
            label: `${rating} star${rating === 1 ? '' : 's'}`,
          }))}
        />
        <Input
          label="Likes"
          type="number"
          min="0"
          value={form.likes}
          onChange={(event) => setForm({ ...form, likes: Number(event.target.value) || 0 })}
        />
        <div className="md:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Testimonial
            <span className="ml-1 text-red-500">*</span>
          </label>
          <textarea
            required
            rows={5}
            value={form.content}
            onChange={(event) => setForm({ ...form, content: event.target.value })}
            className="w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
        <div className="flex flex-wrap gap-4 md:col-span-2">
          <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={form.approved}
              onChange={(event) => setForm({ ...form, approved: event.target.checked })}
              className="rounded border-slate-300"
            />
            Live on website
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(event) => setForm({ ...form, featured: event.target.checked })}
              className="rounded border-slate-300"
              disabled={!form.approved}
            />
            Featured
          </label>
        </div>
      </form>
    </Modal>
  );
}

export function TestimonialsPage() {
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState<TestimonialFormState>(emptyForm);

  const { data, isLoading } = useTestimonials(page, 50);
  const createMutation = useCreateTestimonial();
  const updateMutation = useUpdateTestimonial();
  const deleteMutation = useDeleteTestimonial();
  const testimonials = data?.data ?? [];

  const filteredTestimonials = useMemo(() => {
    const q = search.trim().toLowerCase();
    return testimonials.filter((testimonial) => {
      const live = isLive(testimonial);
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'live' && live) ||
        (statusFilter === 'pending' && !live) ||
        (statusFilter === 'featured' && testimonial.featured === true);
      if (!matchesStatus) return false;
      if (!q) return true;
      return [
        testimonial.name,
        testimonialRole(testimonial),
        testimonialOrg(testimonial),
        testimonialContent(testimonial),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [search, statusFilter, testimonials]);

  const summary = useMemo(() => {
    const live = testimonials.filter(isLive).length;
    const featured = testimonials.filter((testimonial) => testimonial.featured).length;
    const likes = testimonials.reduce((sum, testimonial) => sum + testimonialLikes(testimonial), 0);
    return {
      total: data?.total ?? testimonials.length,
      live,
      pending: testimonials.length - live,
      featured,
      likes,
    };
  }, [data?.total, testimonials]);

  const saving = createMutation.isPending || updateMutation.isPending;

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (testimonial: Testimonial) => {
    setEditing(testimonial);
    setForm(formFromTestimonial(testimonial));
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const saveTestimonial = (event: FormEvent) => {
    event.preventDefault();
    const payload = payloadFromForm(form);
    if (!payload.name || !payload.content) return;
    if (editing) {
      updateMutation.mutate(
        { id: editing.id, data: payload },
        { onSuccess: closeModal }
      );
      return;
    }
    createMutation.mutate(payload, { onSuccess: closeModal });
  };

  const updateVisibility = (testimonial: Testimonial, live: boolean) => {
    updateMutation.mutate({
      id: testimonial.id,
      data: {
        approved: live,
        published: live,
        featured: live ? testimonial.featured : false,
        status: live ? 'approved' : 'pending',
      },
    });
  };

  const toggleFeatured = (testimonial: Testimonial) => {
    const nextFeatured = !testimonial.featured;
    updateMutation.mutate({
      id: testimonial.id,
      data: {
        featured: nextFeatured,
        approved: nextFeatured ? true : testimonial.approved,
        published: nextFeatured ? true : testimonial.published,
        status: nextFeatured ? 'approved' : testimonial.status,
      },
    });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
    } catch {
      // Error toast is handled by the mutation hook.
    }
  };

  const columns = [
    {
      key: 'person',
      header: 'Person',
      render: (testimonial: Testimonial) => (
        <div className="flex min-w-[14rem] items-center gap-3">
          {testimonialImage(testimonial) ? (
            <img
              src={testimonialImage(testimonial)}
              alt=""
              className="h-10 w-10 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              {(testimonial.name || 'T').slice(0, 1).toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <p className={tableText.primary}>{testimonial.name || 'Anonymous'}</p>
            <p className={tableText.secondary}>
              {[testimonialRole(testimonial), testimonialOrg(testimonial)].filter(Boolean).join(' at ') || 'No role'}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'content',
      header: 'Testimonial',
      render: (testimonial: Testimonial) => (
        <p className={`${tableText.muted} line-clamp-3 max-w-md`}>
          {testimonialContent(testimonial) || 'No testimonial text'}
        </p>
      ),
    },
    {
      key: 'rating',
      header: 'Rating',
      render: (testimonial: Testimonial) => (
        <div className="space-y-1">
          <Stars rating={Number(testimonial.rating) || 0} />
          <p className="text-xs text-slate-500">{testimonialLikes(testimonial)} likes</p>
        </div>
      ),
      width: '130px',
    },
    {
      key: 'status',
      header: 'Status',
      render: (testimonial: Testimonial) => {
        const live = isLive(testimonial);
        return (
          <div className="flex min-w-[7rem] flex-col gap-1">
            <span className={live ? statusBadge.success : statusBadge.warning}>
              {live ? 'Live' : 'Pending'}
            </span>
            {testimonial.featured && <span className={statusBadge.info}>Featured</span>}
          </div>
        );
      },
      width: '130px',
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (testimonial: Testimonial) => {
        const live = isLive(testimonial);
        return (
          <PermissionGate permission={PERMISSIONS.MANAGE_TESTIMONIALS}>
            <div className="flex min-w-[18rem] flex-wrap gap-2">
              <Button size="sm" variant="secondary" icon="ri-edit-line" onClick={() => openEdit(testimonial)}>
                Edit
              </Button>
              <Button
                size="sm"
                variant={live ? 'ghost' : 'primary'}
                icon={live ? 'ri-eye-off-line' : 'ri-check-line'}
                onClick={() => updateVisibility(testimonial, !live)}
                disabled={updateMutation.isPending}
              >
                {live ? 'Hide' : 'Approve'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                icon={testimonial.featured ? 'ri-star-fill' : 'ri-star-line'}
                onClick={() => toggleFeatured(testimonial)}
                disabled={updateMutation.isPending}
              >
                {testimonial.featured ? 'Unfeature' : 'Feature'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                icon="ri-delete-bin-line"
                onClick={() => setDeleteId(testimonial.id)}
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                Delete
              </Button>
            </div>
          </PermissionGate>
        );
      },
      width: '340px',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Testimonials"
        description="Approve, feature, edit, and track public testimonial engagement."
        action={
          <PermissionGate permission={PERMISSIONS.MANAGE_TESTIMONIALS}>
            <Button icon="ri-add-line" onClick={openCreate}>
              Add testimonial
            </Button>
          </PermissionGate>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ['Total', summary.total],
          ['Live', summary.live],
          ['Pending', summary.pending],
          ['Featured', summary.featured],
          ['Likes', summary.likes],
        ].map(([label, value]) => (
          <Card key={label} className="p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {label}
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px]">
          <Input
            placeholder="Search name, role, organization, or testimonial"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            options={[
              { value: 'all', label: 'All testimonials' },
              { value: 'live', label: 'Live' },
              { value: 'pending', label: 'Pending' },
              { value: 'featured', label: 'Featured' },
            ]}
          />
        </div>
      </Card>

      <Card padding="none" className="overflow-hidden">
        <div className="border-b border-slate-200/80 px-4 py-4 sm:px-6 dark:border-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-white">All testimonials</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            “Approve” publishes to the website. “Feature” also keeps it live.
          </p>
        </div>

        <Table
          data={filteredTestimonials}
          columns={columns}
          loading={isLoading}
          emptyMessage="No testimonials match your filters"
        />

        {data && data.totalPages > 1 && (
          <div className="px-4 pb-6 sm:px-6">
            <Pagination
              currentPage={page}
              totalPages={data.totalPages}
              onPageChange={setPage}
              loading={isLoading}
            />
          </div>
        )}
      </Card>

      <TestimonialModal
        open={modalOpen}
        editing={editing}
        form={form}
        setForm={setForm}
        saving={saving}
        onClose={closeModal}
        onSubmit={saveTestimonial}
      />

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete testimonial"
        message="Are you sure you want to delete this testimonial? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
