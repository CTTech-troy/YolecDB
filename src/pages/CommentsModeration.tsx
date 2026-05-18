import { useState } from 'react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, Card } from '@/components/ui';
import { commentsApi, BlogComment } from '@/api/comments';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const STATUSES = ['pending', 'approved', 'rejected', 'spam'] as const;

export function CommentsModerationPage() {
  const qc = useQueryClient();
  const [status, setStatus] = useState<string>('pending');

  const { data, isLoading } = useQuery({
    queryKey: ['comments', status],
    queryFn: () => commentsApi.list(1, 50, status),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, next }: { id: string; next: string }) =>
      commentsApi.updateStatus(id, next),
    onSuccess: () => {
      toast.success('Comment updated');
      qc.invalidateQueries({ queryKey: ['comments'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => commentsApi.delete(id),
    onSuccess: () => {
      toast.success('Comment deleted');
      qc.invalidateQueries({ queryKey: ['comments'] });
    },
  });

  const comments = (data?.data ?? []) as BlogComment[];

  return (
    <div className="p-4 md:p-8">
      <PageHeader title="Comment moderation" description="Approve or reject reader comments" />

      <div className="flex gap-2 mt-4 flex-wrap">
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${
              status === s ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="mt-6 text-slate-500">Loading...</p>
      ) : (
        <div className="mt-6 space-y-4">
          {comments.length === 0 ? (
            <p className="text-slate-500">No comments in this queue.</p>
          ) : (
            comments.map((c) => (
              <Card key={c.id} className="p-4">
                <div className="flex justify-between gap-4">
                  <div>
                    <p className="font-semibold text-sm">{c.author_name}</p>
                    <p className="text-sm mt-1">{c.body}</p>
                    <p className="text-xs text-slate-400 mt-2">
                      {new Date(c.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    {status !== 'approved' && (
                      <Button size="sm" onClick={() => updateMutation.mutate({ id: c.id, next: 'approved' })}>
                        Approve
                      </Button>
                    )}
                    {status !== 'spam' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => updateMutation.mutate({ id: c.id, next: 'spam' })}
                      >
                        Spam
                      </Button>
                    )}
                    <Button size="sm" variant="secondary" onClick={() => deleteMutation.mutate(c.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}

