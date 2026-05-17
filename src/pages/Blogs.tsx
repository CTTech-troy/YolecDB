import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  useBlogs,
  useCreateBlog,
  useDeleteBlog,
  useToggleBlogPublish,
  useUpdateBlog,
} from '@/hooks/useBlogs';
import { useRegistrationCounts } from '@/hooks/useRegistrations';
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
import { PERMISSIONS, Blog } from '@/types';
import { PUBLIC_SITE_URL } from '@/config/domains';

const siteBase = PUBLIC_SITE_URL;

function registrationUrl(blogId: string) {
  return siteBase ? `${siteBase}/register/${blogId}` : `/register/${blogId}`;
}

async function copyRegistrationLink(blogId: string) {
  const url = registrationUrl(blogId);
  try {
    await navigator.clipboard.writeText(url);
    toast.success('Registration link copied');
  } catch {
    window.prompt('Copy this link:', url);
  }
}

export function BlogsPage() {
  const [page] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [settingsBlog, setSettingsBlog] = useState<Blog | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    registrationEnabled: false,
    whatsappLink: '',
  });
  const [settingsForm, setSettingsForm] = useState({
    registrationEnabled: false,
    whatsappLink: '',
  });

  const { data, isLoading } = useBlogs(page, 100);
  const { data: regCounts } = useRegistrationCounts();
  const createMutation = useCreateBlog();
  const updateMutation = useUpdateBlog();
  const deleteMutation = useDeleteBlog();
  const togglePublishMutation = useToggleBlogPublish();

  const blogs = data?.data ?? [];
  const blogCounts = regCounts?.blogCounts ?? {};
  const publishingBlogId = togglePublishMutation.isPending
    ? togglePublishMutation.variables?.id
    : undefined;

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      registrationEnabled: false,
      whatsappLink: '',
    });
    setImagePreview('');
  };

  const handleImageSelect = async (file: File) => {
    try {
      setImagePreview(await fileToDataUrlForStorage(file));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not read image');
    }
  };

  const handleCreate = async () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    await createMutation.mutateAsync({
      title: formData.title.trim(),
      content: formData.content,
      image: imagePreview || undefined,
      date: new Date().toISOString().split('T')[0],
      author: 'Admin',
      publish: false,
      registrationEnabled: formData.registrationEnabled,
      whatsappLink: formData.whatsappLink.trim() || undefined,
    });
    setCreateOpen(false);
    resetForm();
  };

  const openSettings = (blog: Blog) => {
    setSettingsBlog(blog);
    setSettingsForm({
      registrationEnabled: blog.registrationEnabled === true,
      whatsappLink: blog.whatsappLink ?? '',
    });
  };

  const saveSettings = async () => {
    if (!settingsBlog) return;
    await updateMutation.mutateAsync({
      id: settingsBlog.id,
      data: {
        registrationEnabled: settingsForm.registrationEnabled,
        whatsappLink: settingsForm.whatsappLink.trim() || undefined,
      },
    });
    setSettingsBlog(null);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Blog Manager"
        description="Create and manage blog posts"
        action={
          <PermissionGate permission={PERMISSIONS.CREATE_POST}>
            <Button icon="ri-add-line" onClick={() => setCreateOpen(true)}>
              Add New Blog
            </Button>
          </PermissionGate>
        }
      />

      {!siteBase && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          Set <code className="text-xs">VITE_PUBLIC_SITE_URL</code> in Dashboard .env for correct
          registration links.
        </p>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 py-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-72 animate-pulse rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
            />
          ))}
        </div>
      ) : blogs.length === 0 ? (
        <p className="py-10 text-center text-slate-500 dark:text-slate-400">No blogs found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <Card key={blog.id} padding="none" className="overflow-hidden">
              {blog.image ? (
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="h-48 w-full object-cover object-top"
                />
              ) : (
                <div className="flex h-48 w-full items-center justify-center bg-slate-100 text-sm text-slate-400 dark:bg-slate-800">
                  No Image
                </div>
              )}
              <div className="p-4">
                <h3 className="mb-2 line-clamp-2 font-semibold text-slate-900 dark:text-white">
                  {blog.title}
                </h3>
                <p className="mb-1 text-sm text-slate-600 dark:text-slate-400">{blog.date}</p>
                <p className="mb-1 text-xs text-slate-500">
                  {blog.publish ? 'Published' : 'Draft'} · Registrations:{' '}
                  {blogCounts[blog.id] ?? 0}
                </p>
                {blog.publish && blog.registrationEnabled && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="mb-3 w-full"
                    onClick={() => copyRegistrationLink(blog.id)}
                  >
                    Copy registration link
                  </Button>
                )}
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  <PermissionGate permission={PERMISSIONS.PUBLISH_POST}>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-full"
                      loading={publishingBlogId === blog.id}
                      loadingText={blog.publish ? 'Unpublishing...' : 'Publishing...'}
                      disabled={
                        togglePublishMutation.isPending && publishingBlogId !== blog.id
                      }
                      onClick={() =>
                        togglePublishMutation.mutate({
                          id: blog.id,
                          publish: !blog.publish,
                        })
                      }
                    >
                      {blog.publish ? 'Unpublish' : 'Publish'}
                    </Button>
                  </PermissionGate>
                  <PermissionGate permission={PERMISSIONS.EDIT_POST}>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-full"
                      onClick={() => openSettings(blog)}
                    >
                      Registration
                    </Button>
                  </PermissionGate>
                  <PermissionGate permission={PERMISSIONS.DELETE_POST}>
                    <Button
                      size="sm"
                      variant="danger"
                      className="w-full"
                      onClick={() => setDeleteId(blog.id)}
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
        isOpen={Boolean(settingsBlog)}
        onClose={() => setSettingsBlog(null)}
        title={settingsBlog ? `Registration — ${settingsBlog.title}` : 'Registration'}
        size="lg"
        footer={
          settingsBlog ? (
            <>
              <Button variant="secondary" onClick={() => copyRegistrationLink(settingsBlog.id)}>
                Copy link
              </Button>
              <Button onClick={saveSettings} loading={updateMutation.isPending}>
                Save
              </Button>
            </>
          ) : undefined
        }
      >
        {settingsBlog && (
          <div className="space-y-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={settingsForm.registrationEnabled}
                onChange={(e) =>
                  setSettingsForm((s) => ({ ...s, registrationEnabled: e.target.checked }))
                }
              />
              Enable public registration (when published)
            </label>
            <Input
              label="WhatsApp group link"
              type="url"
              value={settingsForm.whatsappLink}
              onChange={(e) =>
                setSettingsForm((s) => ({ ...s, whatsappLink: e.target.value }))
              }
              placeholder="https://chat.whatsapp.com/..."
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Public URL:{' '}
              <span className="break-all font-mono">{registrationUrl(settingsBlog.id)}</span>
            </p>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={createOpen}
        onClose={() => {
          setCreateOpen(false);
          resetForm();
        }}
        title="Add New Blog Post"
        size="xl"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setCreateOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} loading={createMutation.isPending}>
              Save Blog
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Blog Title"
            value={formData.title}
            onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))}
            placeholder="Enter blog title"
            required
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Content
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData((f) => ({ ...f, content: e.target.value }))}
              rows={6}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              placeholder="Article body (optional)"
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={formData.registrationEnabled}
              onChange={(e) =>
                setFormData((f) => ({ ...f, registrationEnabled: e.target.checked }))
              }
            />
            Enable registration (after publish)
          </label>
          <Input
            label="WhatsApp group link (optional)"
            type="url"
            value={formData.whatsappLink}
            onChange={(e) => setFormData((f) => ({ ...f, whatsappLink: e.target.value }))}
          />
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Featured Image
            </label>
            <ImageUpload onImageSelect={handleImageSelect} preview={imagePreview} />
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Blog Post"
        message="Are you sure you want to delete this blog post? This cannot be undone."
        confirmText="Delete"
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
