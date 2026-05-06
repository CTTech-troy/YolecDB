import { useState, useEffect, useCallback } from 'react';
import Button from '../../ui/Button.jsx';
import Card from '../../ui/Card.jsx';
import Modal from '../../ui/Modal.jsx';
import ImageUpload from '../../blog/ImageUpload.jsx';
import * as blogsApi from '../../services/blogsApi.js';
import * as eventsApi from '../../services/eventsApi.js';
import { fileToDataUrlForStorage } from '../../utils/fileToDataUrlForStorage.js';

const siteBase = (import.meta.env.VITE_PUBLIC_SITE_URL || '').replace(/\/$/, '');

function isBlogPublished(blog) {
  return blog.publish === true || (blog.publish !== false && blog.published === true);
}

function registrationUrl(blogId) {
  return siteBase ? `${siteBase}/register/${blogId}` : `/register/${blogId}`;
}

async function copyRegistrationLink(blogId) {
  const url = registrationUrl(blogId);
  try {
    await navigator.clipboard.writeText(url);
    alert('Registration link copied to clipboard.');
  } catch {
    window.prompt('Copy this link:', url);
  }
}

export default function BlogManager() {
  const [blogs, setBlogs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [settingsBlog, setSettingsBlog] = useState(null);
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [regStats, setRegStats] = useState({ blogCounts: {}, eventCounts: {} });

  const loadBlogs = useCallback(async () => {
    setError(null);
    try {
      const [rows, stats] = await Promise.all([
        blogsApi.listBlogs(),
        eventsApi.getRegistrationStats().catch(() => ({ blogCounts: {}, eventCounts: {} })),
      ]);
      setBlogs(Array.isArray(rows) ? rows : []);
      setRegStats(stats && typeof stats === 'object' ? stats : { blogCounts: {}, eventCounts: {} });
    } catch (e) {
      setError(e?.message || 'Failed to load blogs');
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBlogs();
  }, [loadBlogs]);

  const handleImageSelect = async (file) => {
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrlForStorage(file);
      setImagePreview(dataUrl);
    } catch (e) {
      alert(e?.message || 'Could not read image');
    }
  };

  const handleSave = async () => {
    if (!formData.title) {
      alert('Please enter the blog title');
      return;
    }
    const newBlog = {
      title: formData.title,
      content: formData.content || '',
      image: imagePreview || '',
      date: new Date().toISOString().split('T')[0],
      author: 'Admin',
      publish: false,
      registrationEnabled: formData.registrationEnabled === true,
      whatsappLink: (formData.whatsappLink || '').trim(),
    };
    try {
      await blogsApi.createBlog(newBlog);
      setIsModalOpen(false);
      resetForm();
      setLoading(true);
      await loadBlogs();
    } catch (err) {
      console.error('Error saving blog:', err);
      alert(err?.message || 'Failed to save blog. Please try again.');
    }
  };

  const handlePublish = async (id, currentStatus) => {
    try {
      await blogsApi.updateBlog(id, { publish: !currentStatus });
      await loadBlogs();
    } catch (err) {
      console.error('Error updating publish status:', err);
      alert(err?.message || 'Failed to update publish status.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await blogsApi.deleteBlog(id);
        await loadBlogs();
      } catch (err) {
        console.error('Error deleting blog:', err);
        alert(err?.message || 'Failed to delete blog.');
      }
    }
  };

  const openSettings = (blog) => {
    setSettingsBlog(blog);
    setSettingsForm({
      registrationEnabled: blog.registrationEnabled === true,
      whatsappLink: typeof blog.whatsappLink === 'string' ? blog.whatsappLink : '',
    });
  };

  const saveSettings = async () => {
    if (!settingsBlog) return;
    try {
      await blogsApi.updateBlog(settingsBlog.id, {
        registrationEnabled: settingsForm.registrationEnabled === true,
        whatsappLink: (settingsForm.whatsappLink || '').trim(),
      });
      setSettingsBlog(null);
      await loadBlogs();
    } catch (err) {
      alert(err?.message || 'Failed to save settings.');
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      registrationEnabled: false,
      whatsappLink: '',
    });
    setImagePreview('');
  };

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Blog Manager</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Create and manage your blog posts</p>
        </div>
        <Button className="w-full sm:w-auto shrink-0" onClick={() => setIsModalOpen(true)}>
          <i className="ri-add-line mr-2"></i>
          Add New Blog
        </Button>
      </div>

      {!siteBase && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Set <code className="text-xs">VITE_PUBLIC_SITE_URL</code> in Dashboard <code>.env</code>{' '}
          (e.g. <code className="text-xs">http://localhost:5173</code>) so copied registration links use the public site URL.
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-200 overflow-hidden animate-pulse bg-gray-100 h-72" />
          ))}
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          <p>No blogs found.</p>
          <Button onClick={() => setIsModalOpen(true)} className="mt-4">
            <i className="ri-add-line mr-2"></i>
            Add Blog
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <Card key={blog.id} padding={false} className="overflow-hidden">
              {blog.image ? (
                <img src={blog.image} alt={blog.title} className="w-full h-48 object-cover object-top" />
              ) : (
                <div className="w-full h-48 flex items-center justify-center bg-gray-100 text-gray-400 text-sm">No Image</div>
              )}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{blog.title}</h3>
                <p className="text-sm text-gray-600 mb-1">{blog.date}</p>
                <p className="text-xs mb-1">{isBlogPublished(blog) ? 'Published' : 'Unpublished'}</p>
                <p className="text-xs text-gray-500 mb-2">
                  Registrations: {regStats.blogCounts?.[blog.id] ?? 0}
                </p>
                {isBlogPublished(blog) && blog.registrationEnabled === true && (
                  <div className="mb-3 rounded-lg bg-gray-50 border border-gray-100 p-2 text-xs">
                    <p className="text-gray-500 mb-1">Registration link</p>
                    <p className="font-mono text-[11px] break-all text-gray-800">{registrationUrl(blog.id)}</p>
                    <Button size="sm" variant="secondary" className="mt-2 w-full" type="button" onClick={() => copyRegistrationLink(blog.id)}>
                      <i className="ri-file-copy-line mr-1"></i>
                      Copy link
                    </Button>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" className="flex-1 min-w-[100px]" onClick={() => handlePublish(blog.id, isBlogPublished(blog))}>
                    <i className="ri-upload-cloud-line mr-1"></i>
                    {isBlogPublished(blog) ? 'Unpublish' : 'Publish'}
                  </Button>
                  <Button size="sm" variant="secondary" className="flex-1 min-w-[100px]" type="button" onClick={() => openSettings(blog)}>
                    <i className="ri-settings-3-line mr-1"></i>
                    Registration
                  </Button>
                  <Button
                    size="sm"
                    color="bg-red-600 hover:bg-red-700 text-white flex-1 min-w-[100px]"
                    onClick={() => handleDelete(blog.id)}
                  >
                    <i className="ri-delete-bin-line mr-1"></i>
                    Delete
                  </Button>
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
        maxWidth="max-w-lg"
      >
        {settingsBlog && (
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-sm text-gray-800 cursor-pointer">
              <input
                type="checkbox"
                checked={settingsForm.registrationEnabled}
                onChange={(e) => setSettingsForm((s) => ({ ...s, registrationEnabled: e.target.checked }))}
              />
              Enable public registration (only effective when the blog is published)
            </label>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp group link</label>
              <input
                type="url"
                value={settingsForm.whatsappLink}
                onChange={(e) => setSettingsForm((s) => ({ ...s, whatsappLink: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="https://chat.whatsapp.com/..."
              />
            </div>
            <p className="text-xs text-gray-500">
              Public URL: <span className="font-mono break-all">{registrationUrl(settingsBlog.id)}</span>
            </p>
            <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
              <Button variant="secondary" className="w-full sm:flex-1" type="button" onClick={() => copyRegistrationLink(settingsBlog.id)}>
                Copy link
              </Button>
              <Button className="w-full sm:flex-1" type="button" onClick={saveSettings}>
                Save
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={isModalOpen} onClose={handleCancel} title="Add New Blog Post" maxWidth="max-w-2xl">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Blog Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Enter blog title..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Article body (optional)…"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-800 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.registrationEnabled}
              onChange={(e) => setFormData((f) => ({ ...f, registrationEnabled: e.target.checked }))}
            />
            Enable registration for this blog (after you publish)
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp group link (optional)</label>
            <input
              type="url"
              value={formData.whatsappLink}
              onChange={(e) => setFormData((f) => ({ ...f, whatsappLink: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="https://chat.whatsapp.com/..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image</label>
            <ImageUpload onImageSelect={handleImageSelect} preview={imagePreview} />
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-4">
            <Button variant="secondary" onClick={handleCancel} className="w-full sm:flex-1">
              <i className="ri-close-line mr-2"></i>
              Cancel
            </Button>
            <Button onClick={handleSave} className="w-full sm:flex-1">
              <i className="ri-save-line mr-2"></i>
              Save Blog
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
