import { useState } from 'react';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, Card, Input } from '@/components/ui';
import { eventMomentsApi, EventMoment } from '@/api/eventMoments';
import { PUBLIC_SITE_URL } from '@/config/domains';

const STATUSES = ['pending', 'approved', 'rejected', 'all'] as const;

export function EventGalleryManagementPage() {
  const qc = useQueryClient();
  const [status, setStatus] = useState<string>('pending');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [preview, setPreview] = useState<EventMoment | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['event-moments', status, search],
    queryFn: () =>
      eventMomentsApi.list({
        page: 1,
        limit: 48,
        status: status === 'all' ? 'all' : status,
        search: search || undefined,
      }),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['event-moments'] });

  const approveMutation = useMutation({
    mutationFn: (id: string) => eventMomentsApi.approve(id),
    onSuccess: () => {
      toast.success('Approved');
      invalidate();
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => eventMomentsApi.reject(id),
    onSuccess: () => {
      toast.success('Rejected');
      invalidate();
    },
  });

  const featureMutation = useMutation({
    mutationFn: (id: string) => eventMomentsApi.feature(id),
    onSuccess: () => {
      toast.success('Featured toggled');
      invalidate();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => eventMomentsApi.delete(id),
    onSuccess: () => {
      toast.success('Deleted');
      invalidate();
    },
  });

  const bulkMutation = useMutation({
    mutationFn: ({ ids, action }: { ids: string[]; action: 'approve' | 'reject' | 'delete' }) =>
      eventMomentsApi.bulk(ids, action),
    onSuccess: () => {
      toast.success('Bulk action completed');
      setSelected(new Set());
      invalidate();
    },
  });

  const items = (data?.data ?? []) as EventMoment[];

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="p-4 md:p-8">
      <PageHeader
        title="Event Gallery Management"
        description="Review and moderate community photo uploads (Yolec Event Moments)"
      />

      <div className="flex flex-wrap gap-2 mt-4 items-center">
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${
              status === s ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {s}
          </button>
        ))}
        <Input
          className="max-w-xs ml-auto"
          placeholder="Search caption or handle…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {selected.size > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" onClick={() => bulkMutation.mutate({ ids: [...selected], action: 'approve' })}>
            Approve selected ({selected.size})
          </Button>
          <Button size="sm" variant="secondary" onClick={() => bulkMutation.mutate({ ids: [...selected], action: 'reject' })}>
            Reject selected
          </Button>
          <Button size="sm" variant="danger" onClick={() => bulkMutation.mutate({ ids: [...selected], action: 'delete' })}>
            Delete selected
          </Button>
        </div>
      )}

      {isLoading ? (
        <p className="mt-6 text-slate-500">Loading…</p>
      ) : items.length === 0 ? (
        <p className="mt-6 text-slate-500">No uploads in this queue.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <Card key={item.id} className="relative overflow-hidden p-0">
              <label className="absolute z-10 m-2 flex items-center">
                <input
                  type="checkbox"
                  checked={selected.has(item.id)}
                  onChange={() => toggleSelect(item.id)}
                  className="rounded"
                />
              </label>
              <button type="button" onClick={() => setPreview(item)} className="block w-full text-left">
                <img
                  src={item.thumbnailUrl}
                  alt=""
                  className="w-full aspect-square object-cover"
                />
              </button>
              <div className="p-3 space-y-2">
                <p className="text-xs font-semibold capitalize text-slate-500">{item.approvalStatus}</p>
                {item.uploadedBy && <p className="text-sm truncate">{item.uploadedBy}</p>}
                <p className="text-xs text-slate-400">{new Date(item.uploadDate).toLocaleString()}</p>
                <div className="flex flex-wrap gap-1">
                  {item.approvalStatus !== 'approved' && (
                    <Button size="sm" onClick={() => approveMutation.mutate(item.id)}>
                      Approve
                    </Button>
                  )}
                  {item.approvalStatus !== 'rejected' && (
                    <Button size="sm" variant="secondary" onClick={() => rejectMutation.mutate(item.id)}>
                      Reject
                    </Button>
                  )}
                  {item.approvalStatus === 'approved' && (
                    <Button size="sm" variant="secondary" onClick={() => featureMutation.mutate(item.id)}>
                      {item.isFeatured ? 'Unfeature' : 'Feature'}
                    </Button>
                  )}
                  <Button size="sm" variant="danger" onClick={() => deleteMutation.mutate(item.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setPreview(null)}
        >
          <img
            src={preview.imageUrl}
            alt=""
            className="max-h-[90vh] max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          {preview.approvalStatus === 'approved' && (
            <a
              href={`${PUBLIC_SITE_URL}/event-moments`}
              target="_blank"
              rel="noreferrer"
              className="absolute bottom-6 text-white text-sm underline"
            >
              View public gallery
            </a>
          )}
        </div>
      )}
    </div>
  );
}
