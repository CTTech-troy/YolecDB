import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  useGalleryItems,
  useCreateGalleryItem,
  useUpdateGalleryItem,
  useToggleGalleryPublish,
  useDeleteGalleryItem,
} from '@/hooks/useGallery';
import { ImageUpload } from '@/components/forms/ImageUpload';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  Button,
  Card,
  ConfirmModal,
  Input,
  Modal,
} from '@/components/ui';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { fileToDataUrlForStorage } from '@/utils/fileToDataUrl';
import { PERMISSIONS, Event } from '@/types';
import { statusBadge } from '@/lib/tableStyles';
import { PUBLIC_SITE_URL } from '@/config/domains';

const siteBase = PUBLIC_SITE_URL;

export function GalleryPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [form, setForm] = useState({ title: '', description: '' });

  const { items, isLoading } = useGalleryItems();
  const createMutation = useCreateGalleryItem();
  const updateMutation = useUpdateGalleryItem();
  const togglePublishMutation = useToggleGalleryPublish();
  const deleteMutation = useDeleteGalleryItem();

  const publicGalleryUrl = siteBase ? `${siteBase}/gallery` : '/gallery';
  const publishingGalleryItemId = togglePublishMutation.isPending
    ? togglePublishMutation.variables?.id
    : undefined;

  const resetForm = () => {
    setForm({ title: '', description: '' });
    setImagePreview('');
    setEditing(null);
  };

  const openCreate = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (item: Event) => {
    setEditing(item);
    setImagePreview(item.url || '');
    setForm({
      title: item.title || '',
      description: item.description || '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    resetForm();
  };

  const handleImageSelect = async (file: File) => {
    try {
      setImagePreview(await fileToDataUrlForStorage(file));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not read image');
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!imagePreview) {
      toast.error('Please add an image');
      return;
    }
    try {
      if (editing) {
        await updateMutation.mutateAsync({
          id: editing.id,
          data: {
            title: form.title.trim(),
            description: form.description.trim() || undefined,
            url: imagePreview,
          },
        });
      } else {
        await createMutation.mutateAsync({
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          url: imagePreview,
          publish: false,
        });
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gallery"
        description="Manage images shown on the public gallery page"
        action={
          <PermissionGate
            anyPermissions={[PERMISSIONS.MANAGE_MEDIA, PERMISSIONS.CREATE_EVENT]}
          >
            <Button icon="ri-image-add-line" onClick={openCreate}>
              Add image
            </Button>
          </PermissionGate>
        }
      />

      <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
        Published images appear at{' '}
        <a
          href={publicGalleryUrl}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          {publicGalleryUrl}
        </a>
        . Use &quot;Gallery image only&quot; entries — not conference/event posts.
      </p>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card className="py-16 text-center">
          <p className="text-slate-500 dark:text-slate-400">No gallery images yet.</p>
          <Button className="mt-4" onClick={openCreate}>
            Add your first image
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <Card key={item.id} padding="none" className="overflow-hidden">
              {item.url ? (
                <Link
                  to={`/gallery/${item.id}`}
                  className="group block"
                  aria-label={`View details for ${item.title}`}
                >
                  <img
                    src={item.url}
                    alt={item.title}
                    className="aspect-square w-full object-cover transition duration-300 group-hover:scale-[1.02] group-hover:brightness-105"
                  />
                </Link>
              ) : (
                <div className="flex aspect-square items-center justify-center bg-slate-100 text-slate-400 dark:bg-slate-800">
                  No image
                </div>
              )}
              <div className="space-y-3 p-4">
                <div>
                  <Link
                    to={`/gallery/${item.id}`}
                    className="line-clamp-1 font-semibold text-slate-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400"
                  >
                    {item.title}
                  </Link>
                  {item.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                      {item.description}
                    </p>
                  )}
                </div>
                <span
                  className={
                    item.publish ? statusBadge.success : statusBadge.neutral
                  }
                >
                  {item.publish ? 'Published' : 'Draft'}
                </span>
                <div className="flex flex-wrap gap-2">
                  <PermissionGate
                    anyPermissions={[PERMISSIONS.MANAGE_MEDIA, PERMISSIONS.EDIT_EVENT]}
                  >
                    <Button size="sm" variant="secondary" onClick={() => openEdit(item)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      loading={publishingGalleryItemId === item.id}
                      loadingText={item.publish ? 'Unpublishing...' : 'Publishing...'}
                      disabled={
                        togglePublishMutation.isPending &&
                        publishingGalleryItemId !== item.id
                      }
                      onClick={() =>
                        togglePublishMutation.mutate({
                          id: item.id,
                          publish: !item.publish,
                        })
                      }
                    >
                      {item.publish ? 'Unpublish' : 'Publish'}
                    </Button>
                  </PermissionGate>
                  <PermissionGate
                    anyPermissions={[PERMISSIONS.MANAGE_MEDIA, PERMISSIONS.DELETE_EVENT]}
                  >
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setDeleteId(item.id)}
                    >
                      Delete
                    </Button>
                  </PermissionGate>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editing ? 'Edit gallery image' : 'Add gallery image'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {editing ? 'Save changes' : 'Add image'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Caption / description (optional)
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              placeholder="Short description for this image"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Image
            </label>
            <ImageUpload onImageSelect={handleImageSelect} preview={imagePreview} />
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete gallery image"
        message="Remove this image from the gallery? This cannot be undone."
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
