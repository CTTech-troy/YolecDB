import { useState } from 'react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, Card, Input, Modal } from '@/components/ui';
import { authorsApi, Author } from '@/api/authors';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ImageUpload } from '@/components/forms/ImageUpload';
import { fileToDataUrlForStorage } from '@/utils/fileToDataUrl';

export function AuthorsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', role: 'Contributor', bio: '', avatar_url: '' });

  const { data: authors = [], isLoading } = useQuery({
    queryKey: ['authors'],
    queryFn: () => authorsApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: () => authorsApi.create(form),
    onSuccess: () => {
      toast.success('Author created');
      qc.invalidateQueries({ queryKey: ['authors'] });
      setOpen(false);
      setForm({ name: '', role: 'Contributor', bio: '', avatar_url: '' });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to create author';
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => authorsApi.delete(id),
    onSuccess: () => {
      toast.success('Author deleted');
      qc.invalidateQueries({ queryKey: ['authors'] });
    },
  });

  return (
    <div className="p-4 md:p-8">
      <PageHeader
        title="Authors"
        description="Manage article authors"
        action={<Button onClick={() => setOpen(true)}>Add author</Button>}
      />

      {isLoading ? (
        <p className="text-slate-500 mt-6">Loading...</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {(authors as Author[]).map((author) => (
            <Card key={author.id} className="p-4 flex gap-4">
              {author.avatar_url ? (
                <img src={author.avatar_url} alt="" className="w-14 h-14 rounded-full object-cover" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                  {author.name.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold">{author.name}</h3>
                <p className="text-sm text-slate-500">{author.role}</p>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{author.bio}</p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-2"
                  onClick={() => deleteMutation.mutate(author.id)}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={open} onClose={() => setOpen(false)} title="New author">
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
          <Input label="Bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          <ImageUpload
            preview={form.avatar_url}
            onImageSelect={async (file: File) => {
              const url = await fileToDataUrlForStorage(file);
              setForm({ ...form, avatar_url: url });
            }}
          />
          <Button onClick={() => createMutation.mutate()} disabled={!form.name.trim()}>
            Create
          </Button>
        </div>
      </Modal>
    </div>
  );
}
