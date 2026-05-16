import { FormEvent, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, Card, Input, Select } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { isSuperAdminRole } from '@/lib/roles';
import {
  useAddTicketAttachment,
  useAddTicketComment,
  useDeleteTicket,
  useTicket,
  useTicketUsers,
  useUpdateTicket,
} from '@/hooks/useTickets';
import type { TicketCategory, TicketPriority, TicketStatus } from '@/types';

const statusOptions: TicketStatus[] = ['todo', 'in_progress', 'qa_verify', 'done'];
const priorityOptions: TicketPriority[] = ['low', 'medium', 'high', 'critical'];

const statusLabels: Record<TicketStatus, string> = {
  todo: 'TODO',
  in_progress: 'IN PROGRESS',
  qa_verify: 'QA VERIFY',
  done: 'DONE',
};

const categoryLabels: Record<TicketCategory, string> = {
  infrastructure: 'Infrastructure',
  security: 'Security',
  server_incident: 'Server incident',
  api_issue: 'API issue',
  cache: 'Redis/cache',
  deployment: 'Deployment',
  content_review: 'Content review',
  blog_publishing: 'Blog publishing',
  event_media: 'Event media',
  banner_update: 'Banner update',
  social_campaign: 'Social campaign',
  general: 'General',
};

const priorityClasses: Record<TicketPriority, string> = {
  low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  medium: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  critical: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
};

function toDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function formatDate(value?: number) {
  if (!value) return 'Not set';
  return new Date(value).toLocaleString();
}

function parseMentions(message: string) {
  return Array.from(new Set(message.match(/@[\w.-]+/g)?.map((item) => item.slice(1)) ?? []));
}

export function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuth();
  const { data: ticket, isLoading } = useTicket(id);
  const updateTicket = useUpdateTicket();
  const addComment = useAddTicketComment();
  const addAttachment = useAddTicketAttachment();
  const deleteTicket = useDeleteTicket();
  const { data: users = [] } = useTicketUsers(isSuperAdminRole(authUser?.roleName));
  const [comment, setComment] = useState('');
  const canAdmin = isSuperAdminRole(authUser?.roleName);

  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading ticket...</p>;
  }

  if (!ticket || !id) {
    return (
      <Card className="p-6">
        <p className="text-sm text-slate-500">Ticket not found.</p>
      </Card>
    );
  }

  function submitComment(event: FormEvent) {
    event.preventDefault();
    if (!comment.trim() || !id) return;
    addComment.mutate(
      { id, message: comment, mentions: parseMentions(comment) },
      { onSuccess: () => setComment('') }
    );
  }

  async function uploadAttachment(file: File | undefined) {
    if (!file || !id) return;
    addAttachment.mutate({
      id,
      file: {
        name: file.name,
        type: file.type,
        size: file.size,
        url: await toDataUrl(file),
      },
    });
  }

  function updateStatus(status: TicketStatus) {
    if (!id) return;
    updateTicket.mutate({ id, status });
  }

  function removeTicket() {
    if (!id) return;
    deleteTicket.mutate(id, {
      onSuccess: () => navigate('/tickets'),
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${ticket.ticketId} ${ticket.title}`}
        description={`${ticket.assignedRole} • ${categoryLabels[ticket.category]} • Updated ${formatDate(ticket.updatedAt)}`}
        action={
          <div className="flex flex-wrap gap-2">
            <Link to="/tickets">
              <Button variant="ghost" icon="ri-arrow-left-line">Board</Button>
            </Link>
            {canAdmin && (
              <Button variant="danger" icon="ri-delete-bin-line" onClick={removeTicket} loading={deleteTicket.isPending}>
                Delete
              </Button>
            )}
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card className="p-5">
            <div className="mb-4 flex flex-wrap gap-2">
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${priorityClasses[ticket.priority]}`}>
                {ticket.priority}
              </span>
              {ticket.labels.map((label) => (
                <span key={label} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {label}
                </span>
              ))}
            </div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Description</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-300">
              {ticket.description}
            </p>
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Comments</h2>
            <form onSubmit={submitComment} className="mt-4 space-y-3">
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Add a comment. Mention users with @email or @name."
                rows={4}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
              <Button type="submit" loading={addComment.isPending}>Add comment</Button>
            </form>
            <div className="mt-5 space-y-3">
              {(ticket.comments ?? []).length === 0 ? (
                <p className="text-sm text-slate-500">No comments yet.</p>
              ) : (
                ticket.comments
                  .slice()
                  .reverse()
                  .map((row) => (
                    <div key={row.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                      <div className="flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span>{row.userName ?? row.userEmail ?? row.userId}</span>
                        <span>{formatDate(row.createdAt)}</span>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">{row.message}</p>
                    </div>
                  ))
              )}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Activity timeline</h2>
            <div className="mt-4 space-y-3">
              {(ticket.activity ?? []).slice().reverse().map((row) => (
                <div key={row.id} className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{row.message}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {row.action} • {formatDate(row.at)} {row.actorEmail ? `• ${row.actorEmail}` : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Workflow</h2>
            <div className="mt-4 space-y-4">
              <Select
                label="Status"
                value={ticket.status}
                onChange={(event) => updateStatus(event.target.value as TicketStatus)}
                options={statusOptions.map((status) => ({ value: status, label: statusLabels[status] }))}
              />
              {canAdmin && (
                <>
                  <Select
                    label="Priority"
                    value={ticket.priority}
                    onChange={(event) => updateTicket.mutate({ id, priority: event.target.value as TicketPriority })}
                    options={priorityOptions.map((priority) => ({ value: priority, label: priority.toUpperCase() }))}
                  />
                  <Select
                    label="Assignee"
                    value={ticket.assignedTo ?? ''}
                    onChange={(event) => updateTicket.mutate({ id, assignedTo: event.target.value })}
                    options={[
                      { value: '', label: 'Unassigned' },
                      ...users
                        .filter((user) => user.role === ticket.assignedRole)
                        .map((user) => ({ value: user.id, label: `${user.fullName} - ${user.role}` })),
                    ]}
                  />
                </>
              )}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Details</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500 dark:text-slate-400">Assigned to</dt>
                <dd className="text-right text-slate-900 dark:text-white">{ticket.assignedToName ?? 'Unassigned'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500 dark:text-slate-400">Due date</dt>
                <dd className="text-right text-slate-900 dark:text-white">{formatDate(ticket.dueDate)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500 dark:text-slate-400">Created</dt>
                <dd className="text-right text-slate-900 dark:text-white">{formatDate(ticket.createdAt)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500 dark:text-slate-400">Source</dt>
                <dd className="text-right text-slate-900 dark:text-white">{ticket.source ?? 'manual'}</dd>
              </div>
            </dl>
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Attachments</h2>
            <div className="mt-4 space-y-2">
              {(ticket.attachments ?? []).length === 0 ? (
                <p className="text-sm text-slate-500">No attachments.</p>
              ) : (
                ticket.attachments.map((file) => (
                  <a
                    key={file.id}
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:border-indigo-300 dark:border-slate-800 dark:text-slate-300"
                  >
                    <span className="truncate">{file.name}</span>
                    <i className="ri-external-link-line" />
                  </a>
                ))
              )}
            </div>
            <div className="mt-4">
              <Input type="file" onChange={(event) => void uploadAttachment(event.target.files?.[0])} />
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
