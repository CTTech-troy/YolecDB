import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, Card, Input } from '@/components/ui';
import { ImageUpload } from '@/components/forms/ImageUpload';
import { blogsApi } from '@/api/blogs';
import { authorsApi, Author } from '@/api/authors';
import { fileToDataUrlForStorage } from '@/utils/fileToDataUrl';
import { PUBLIC_SITE_URL } from '@/config/domains';

export function BlogEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'Latest',
    categoryId: '',
    authorId: '',
    date: new Date().toISOString().split('T')[0],
    publishTime: '12:00',
    readTimeMinutes: 5,
    seoTitle: '',
    seoDescription: '',
    publish: false,
    isFeatured: false,
    isPinned: false,
    commentsEnabled: true,
    registrationEnabled: false,
    whatsappLink: '',
    tags: '',
    status: 'draft' as 'draft' | 'scheduled' | 'published',
    scheduledAt: '',
  });

  useEffect(() => {
    authorsApi.list().then(setAuthors).catch(() => {});
  }, []);

  useEffect(() => {
    if (isNew) return;
    setLoading(true);
    blogsApi
      .getById(id!)
      .then((blog) => {
        const b = blog as unknown as Record<string, unknown>;
        setForm({
          title: String(b.title ?? ''),
          slug: String(b.slug ?? ''),
          excerpt: String(b.excerpt ?? ''),
          content: String(b.content ?? ''),
          category: String(b.category ?? 'Latest'),
          categoryId: String(b.categoryId ?? ''),
          authorId: String(b.authorId ?? ''),
          date: String(b.date ?? '').split('T')[0] || new Date().toISOString().split('T')[0],
          publishTime: String(b.publishTime ?? '12:00').slice(0, 5),
          readTimeMinutes: Number(b.readTimeMinutes ?? 5),
          seoTitle: String(b.seoTitle ?? b.title ?? ''),
          seoDescription: String(b.seoDescription ?? b.excerpt ?? ''),
          publish: b.publish === true || b.status === 'published',
          isFeatured: Boolean(b.isFeatured),
          isPinned: Boolean(b.isPinned),
          commentsEnabled: b.commentsEnabled !== false,
          registrationEnabled: b.registrationEnabled === true,
          whatsappLink: String(b.whatsappLink ?? ''),
          tags: Array.isArray(b.tags) ? (b.tags as string[]).join(', ') : '',
          status: (b.status as 'draft' | 'scheduled' | 'published') ?? (b.publish ? 'published' : 'draft'),
          scheduledAt: String(b.scheduledAt ?? ''),
        });
        setImagePreview(String(b.image ?? ''));
      })
      .catch(() => toast.error('Failed to load post'))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  const update = (key: string, value: unknown) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const wordCount = form.content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;

  useEffect(() => {
    if (wordCount > 0) {
      update('readTimeMinutes', Math.max(1, Math.ceil(wordCount / 200)));
    }
  }, [wordCount]);

  const buildPayload = () => ({
    title: form.title,
    slug: form.slug || undefined,
    excerpt: form.excerpt,
    content: form.content,
    image: imagePreview,
    category: form.category,
    categoryId: form.categoryId || undefined,
    authorId: form.authorId || undefined,
    date: form.date,
    publishTime: form.publishTime,
    readTimeMinutes: form.readTimeMinutes,
    seoTitle: form.seoTitle || form.title,
    seoDescription: form.seoDescription || form.excerpt,
    publish: form.status === 'published',
    status: form.status,
    scheduledAt: form.scheduledAt || undefined,
    isFeatured: form.isFeatured,
    isPinned: form.isPinned,
    commentsEnabled: form.commentsEnabled,
    registrationEnabled: form.registrationEnabled,
    whatsappLink: form.whatsappLink,
    tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
  });

  const handleSave = async (publish?: boolean) => {
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    setSaving(true);
    try {
      const payload = buildPayload();
      if (publish !== undefined) {
        (payload as { publish: boolean; status: string }).publish = publish;
        (payload as { status: string }).status = publish ? 'published' : 'draft';
      }
      if (isNew) {
        const { id: newId } = await blogsApi.create(payload);
        toast.success('Post created');
        navigate(`/blog/${newId}/edit`);
      } else {
        await blogsApi.update(id!, payload);
        toast.success('Post saved');
      }
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleImage = async (file: File) => {
    const dataUrl = await fileToDataUrlForStorage(file);
    setImagePreview(dataUrl);
  };

  if (loading) {
    return <div className="p-8 animate-pulse text-slate-500">Loading editor...</div>;
  }

  const previewUrl = form.slug
    ? `${PUBLIC_SITE_URL}/blog/${form.slug}`
    : '';

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <PageHeader
        title={isNew ? 'New Article' : 'Edit Article'}
        description="Create and publish news articles"
        action={
          <div className="flex gap-2 flex-wrap">
            <Button variant="secondary" onClick={() => navigate('/blog')}>
              Back
            </Button>
            {previewUrl && form.publish && (
              <a href={previewUrl} target="_blank" rel="noreferrer">
                <Button variant="secondary" type="button">
                  Preview
                </Button>
              </a>
            )}
            <Button variant="secondary" disabled={saving} onClick={() => handleSave()}>
              Save draft
            </Button>
            <Button disabled={saving} onClick={() => handleSave(true)}>
              Publish
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 mt-6">
        <Card className="p-6 space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => update('title', e.target.value)} />
          <Input label="Slug" value={form.slug} onChange={(e) => update('slug', e.target.value)} placeholder="auto-generated if empty" />
          <Input label="Excerpt" value={form.excerpt} onChange={(e) => update('excerpt', e.target.value)} />
          <div>
            <label className="block text-sm font-medium mb-1">Content (HTML)</label>
            <textarea
              value={form.content}
              onChange={(e) => update('content', e.target.value)}
              rows={16}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-sm font-mono"
              placeholder="<p>Article body...</p>"
            />
            <p className="text-xs text-slate-500 mt-1">{wordCount} words · ~{form.readTimeMinutes} min read</p>
          </div>
          <ImageUpload preview={imagePreview} onImageSelect={handleImage} />
        </Card>

        <Card className="p-6 grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Author</label>
            <select
              value={form.authorId}
              onChange={(e) => update('authorId', e.target.value)}
              className="w-full rounded-lg border p-2 text-sm"
            >
              <option value="">Default (Admin)</option>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <Input label="Category" value={form.category} onChange={(e) => update('category', e.target.value)} />
          <Input label="Publish date" type="date" value={form.date} onChange={(e) => update('date', e.target.value)} />
          <Input label="Publish time" type="time" value={form.publishTime} onChange={(e) => update('publishTime', e.target.value)} />
          <Input label="Read time (minutes)" type="number" value={String(form.readTimeMinutes)} onChange={(e) => update('readTimeMinutes', Number(e.target.value))} />
          <Input label="Tags (comma-separated)" value={form.tags} onChange={(e) => update('tags', e.target.value)} />
          <Input label="SEO title" value={form.seoTitle} onChange={(e) => update('seoTitle', e.target.value)} />
          <Input label="SEO description" value={form.seoDescription} onChange={(e) => update('seoDescription', e.target.value)} />
          <div className="md:col-span-2 flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isFeatured} onChange={(e) => update('isFeatured', e.target.checked)} />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isPinned} onChange={(e) => update('isPinned', e.target.checked)} />
              Pinned
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.commentsEnabled} onChange={(e) => update('commentsEnabled', e.target.checked)} />
              Comments enabled
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.registrationEnabled} onChange={(e) => update('registrationEnabled', e.target.checked)} />
              Registration CTA
            </label>
          </div>
          {form.registrationEnabled && (
            <Input label="WhatsApp link" value={form.whatsappLink} onChange={(e) => update('whatsappLink', e.target.value)} className="md:col-span-2" />
          )}
        </Card>
      </div>
    </div>
  );
}
