import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, Card, Input, Select, Table, Pagination } from '@/components/ui';
import {
  emailApi,
  EmailSubscriber,
  EmailSubscriberSource,
  EmailTemplateId,
} from '@/api/email';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { tableText, statusBadge } from '@/lib/tableStyles';
import { PERMISSIONS } from '@/types';

const TABS = ['audience', 'compose', 'campaigns', 'history'] as const;
type Tab = (typeof TABS)[number];

const TEMPLATE_OPTIONS = [
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'campaign', label: 'Campaign / Broadcast' },
  { value: 'event_registration', label: 'Event registration' },
  { value: 'contact', label: 'Contact thank-you' },
  { value: 'custom', label: 'Custom HTML' },
];

const SOURCE_OPTIONS = [
  { value: 'all', label: 'All sources' },
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'event', label: 'Event registration' },
  { value: 'contact', label: 'Contact form' },
  { value: 'blog', label: 'Blog registration' },
];

const MAX_CUSTOM_HTML_BYTES = 500_000;

type BulkSendStatus = 'idle' | 'sending' | 'success' | 'error';

function sourceLabel(source: EmailSubscriberSource) {
  return SOURCE_OPTIONS.find((option) => option.value === source)?.label || 'Selected audience';
}

function defaultParams(templateId: EmailTemplateId): Record<string, unknown> {
  switch (templateId) {
    case 'event_registration':
      return {
        name: 'Guest',
        eventName: 'YolecHub Event',
        eventDate: 'Saturday, 1 June 2026',
        location: 'Lagos, Nigeria',
      };
    case 'contact':
      return { name: 'Friend' };
    case 'newsletter':
      return {
        title: 'Weekly update',
        content: '<p>Share your latest news here.</p>',
        buttonText: 'Read more',
        buttonLink: 'https://yolechub.com.ng',
      };
    case 'campaign':
      return {
        title: 'Hello from YolecHub',
        content:
          "We're thrilled to invite you to our annual gathering of innovators, builders, and visionaries. Join us for a full day of talks, workshops, and networking.",
        badgeText: 'Conference Reminder',
        eventName: 'YolecHub Summit 2026',
        eventDateTime: 'Saturday, July 12, 2026 - 9:00 AM WAT',
        location: 'Lagos, Nigeria',
        buttonText: 'Register now',
        buttonLink: 'https://yolechub.com.ng',
      };
    default:
      return {
        title: 'Hello from YolecHub',
        content: '<p>Your message content goes here.</p>',
        buttonText: 'Visit site',
        buttonLink: 'https://yolechub.com.ng',
      };
  }
}

export function EmailPage() {
  const queryClient = useQueryClient();
  const htmlFileInputRef = useRef<HTMLInputElement | null>(null);
  const [tab, setTab] = useState<Tab>('audience');
  const [page, setPage] = useState(1);
  const [sourceFilter, setSourceFilter] = useState<EmailSubscriberSource>('all');
  const [search, setSearch] = useState('');

  const [templateId, setTemplateId] = useState<EmailTemplateId>('campaign');
  const [templateParamsJson, setTemplateParamsJson] = useState(
    () => JSON.stringify(defaultParams('campaign'), null, 2)
  );
  const [subject, setSubject] = useState('');
  const [singleTo, setSingleTo] = useState('');
  const [singleName, setSingleName] = useState('');
  const [customHtml, setCustomHtml] = useState('');
  const [bulkSource, setBulkSource] = useState<EmailSubscriberSource>('all');
  const [previewHtml, setPreviewHtml] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [htmlFileName, setHtmlFileName] = useState('');
  const [bulkProgress, setBulkProgress] = useState(0);
  const [bulkStatus, setBulkStatus] = useState<BulkSendStatus>('idle');
  const [bulkStartedAt, setBulkStartedAt] = useState<number | null>(null);
  const [bulkResult, setBulkResult] = useState<{ success: number; failed: number } | null>(null);
  const [bulkError, setBulkError] = useState('');

  const [campaignName, setCampaignName] = useState('');
  const [campaignSubject, setCampaignSubject] = useState('');
  const [campaignAudience, setCampaignAudience] = useState<EmailSubscriberSource>('all');
  const [scheduleAt, setScheduleAt] = useState('');

  const { data: stats } = useQuery({
    queryKey: ['email', 'stats'],
    queryFn: () => emailApi.getStats(),
  });

  const { data: subscribers, isLoading: loadingSubs } = useQuery({
    queryKey: ['email', 'subscribers', page, sourceFilter, search],
    queryFn: () => emailApi.listSubscribers(page, 50, sourceFilter, search || undefined),
  });

  const { data: history } = useQuery({
    queryKey: ['email', 'history'],
    queryFn: () => emailApi.listHistory(80),
    enabled: tab === 'history',
  });

  const { data: campaigns } = useQuery({
    queryKey: ['email', 'campaigns'],
    queryFn: () => emailApi.listCampaigns(),
    enabled: tab === 'campaigns',
  });

  const { data: bulkAudience } = useQuery({
    queryKey: ['email', 'bulk-audience-count', bulkSource],
    queryFn: () => emailApi.listSubscribers(1, 1, bulkSource),
    enabled: tab === 'compose',
  });

  const bulkAudienceCount =
    bulkAudience?.total ?? (bulkSource === 'all' ? stats?.activeSubscribers : undefined);

  const syncMutation = useMutation({
    mutationFn: () => emailApi.syncSubscribers(),
    onSuccess: (r) => {
      toast.success(`Synced ${r.imported} contacts into audience`);
      queryClient.invalidateQueries({ queryKey: ['email'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const parseParams = useCallback((): Record<string, unknown> => {
    try {
      return JSON.parse(templateParamsJson) as Record<string, unknown>;
    } catch {
      throw new Error('Template parameters must be valid JSON');
    }
  }, [templateParamsJson]);

  const customHtmlForSend = () => {
    if (templateId !== 'custom') return undefined;
    const html = customHtml.trim();
    if (!html) throw new Error('Add or upload custom HTML before sending');
    return html;
  };

  const requireSubject = () => {
    const cleanSubject = subject.trim();
    if (!cleanSubject) throw new Error('Subject is required');
    return cleanSubject;
  };

  const previewMutation = useMutation({
    mutationFn: () => emailApi.preview(templateId, parseParams(), customHtmlForSend()),
    onSuccess: (r) => {
      setPreviewHtml(r.html);
      setShowPreview(true);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const sendSingleMutation = useMutation({
    mutationFn: () =>
      emailApi.sendSingle({
        to: singleTo,
        toName: singleName || undefined,
        subject: requireSubject(),
        templateId,
        templateParams: parseParams(),
        html: customHtmlForSend(),
      }),
    onSuccess: () => toast.success('Email sent'),
    onError: (e: Error) => toast.error(e.message),
  });

  const sendTestMutation = useMutation({
    mutationFn: () =>
      emailApi.sendTest({
        subject: requireSubject(),
        templateId,
        templateParams: parseParams(),
        html: customHtmlForSend(),
      }),
    onSuccess: () => toast.success('Test email sent to your account'),
    onError: (e: Error) => toast.error(e.message),
  });

  const sendBulkMutation = useMutation({
    mutationFn: () =>
      emailApi.sendBulk({
        subject: requireSubject(),
        templateId,
        templateParams: parseParams(),
        source: bulkSource,
        html: customHtmlForSend(),
      }),
    onMutate: () => {
      setBulkProgress(8);
      setBulkStatus('sending');
      setBulkStartedAt(Date.now());
      setBulkResult(null);
      setBulkError('');
    },
    onSuccess: (r: { success: number; failed: number }) => {
      setBulkProgress(100);
      setBulkStatus('success');
      setBulkResult(r);
      toast.success(`Sent ${r.success}, failed ${r.failed}`);
      queryClient.invalidateQueries({ queryKey: ['email'] });
    },
    onError: (e: Error) => {
      setBulkProgress(100);
      setBulkStatus('error');
      setBulkError(e.message || 'Bulk send failed');
      toast.error(e.message);
    },
  });

  const createCampaignMutation = useMutation({
    mutationFn: () =>
      emailApi.createCampaign({
        name: campaignName,
        subject: campaignSubject,
        templateId,
        templateParams: parseParams(),
        html: customHtmlForSend(),
        audienceSource: campaignAudience,
        scheduledAt: scheduleAt ? new Date(scheduleAt).getTime() : undefined,
      }),
    onSuccess: () => {
      toast.success('Campaign saved');
      setCampaignName('');
      queryClient.invalidateQueries({ queryKey: ['email', 'campaigns'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const sendCampaignMutation = useMutation({
    mutationFn: (id: string) => emailApi.sendCampaign(id),
    onSuccess: (r: { success: number; failed: number }) => {
      toast.success(`Campaign sent: ${r.success} ok, ${r.failed} failed`);
      queryClient.invalidateQueries({ queryKey: ['email'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  useEffect(() => {
    setTemplateParamsJson(JSON.stringify(defaultParams(templateId), null, 2));
  }, [templateId]);

  useEffect(() => {
    if (!sendBulkMutation.isPending) return undefined;

    const timer = window.setInterval(() => {
      setBulkProgress((current) => {
        if (current >= 94) return current;
        const nextStep = bulkAudienceCount && bulkAudienceCount > 100 ? 1 : 2;
        return Math.min(94, current + nextStep);
      });
    }, 900);

    return () => window.clearInterval(timer);
  }, [bulkAudienceCount, sendBulkMutation.isPending]);

  const handleBulkSend = () => {
    try {
      requireSubject();
      parseParams();
      customHtmlForSend();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Bulk send is not ready');
      return;
    }
    sendBulkMutation.mutate();
  };

  const handleHtmlFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.html') && file.type !== 'text/html') {
      toast.error('Please choose an .html file');
      return;
    }
    if (file.size > MAX_CUSTOM_HTML_BYTES) {
      toast.error('HTML file must be 500KB or smaller');
      return;
    }
    try {
      const text = await file.text();
      setCustomHtml(text);
      setHtmlFileName(file.name);
      setPreviewHtml('');
      setShowPreview(false);
      toast.success('HTML file loaded');
    } catch {
      toast.error('Could not read HTML file');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await emailApi.exportCsv(sourceFilter);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'yolechub-subscribers.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Export failed');
    }
  };

  const showBulkProgress = bulkStatus !== 'idle';
  const bulkElapsedSeconds = bulkStartedAt
    ? Math.max(0, Math.floor((Date.now() - bulkStartedAt) / 1000))
    : 0;
  const bulkAudienceText =
    typeof bulkAudienceCount === 'number'
      ? `${bulkAudienceCount} recipient${bulkAudienceCount === 1 ? '' : 's'}`
      : 'selected recipients';
  const bulkProgressTitle =
    bulkStatus === 'sending'
      ? `Sending to ${bulkAudienceText}`
      : bulkStatus === 'success'
        ? 'Bulk send complete'
        : 'Bulk send stopped';
  const bulkProgressDetail =
    bulkStatus === 'sending'
      ? `Processing ${sourceLabel(bulkSource).toLowerCase()} for ${bulkElapsedSeconds}s`
      : bulkStatus === 'success' && bulkResult
        ? `Sent ${bulkResult.success}, failed ${bulkResult.failed}`
        : bulkError;

  const subscriberColumns = [
    {
      key: 'email',
      header: 'Email',
      render: (s: EmailSubscriber) => (
        <span className={tableText.primary}>{s.email}</span>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      render: (s: EmailSubscriber) => (
        <span className={tableText.muted}>{s.name || '—'}</span>
      ),
    },
    {
      key: 'source',
      header: 'Source',
      render: (s: EmailSubscriber) => (
        <span className={statusBadge.info}>
          {(s.sources || [s.source]).join(', ')}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (s: EmailSubscriber) => (
        <span
          className={
            s.status === 'active' ? statusBadge.success : statusBadge.neutral
          }
        >
          {s.status}
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Added',
      render: (s: EmailSubscriber) => (
        <span className={tableText.muted}>
          {new Date(s.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Email"
        description="Audience, campaigns, and transactional email via Resend"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Audience', value: stats?.activeSubscribers ?? '—' },
          { label: 'Total contacts', value: stats?.totalSubscribers ?? '—' },
          { label: 'Emails sent', value: stats?.sentCount ?? '—' },
          { label: 'Campaigns', value: stats?.campaignCount ?? '—' },
        ].map((m) => (
          <Card key={m.label} className="p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {m.label}
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
              {m.value}
            </p>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2 dark:border-slate-800">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition ${
              tab === t
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'audience' && (
        <Card padding="none" className="overflow-hidden">
          <div className="dashboard-toolbar border-b border-slate-200 p-4 dark:border-slate-800">
            <div className="dashboard-toolbar-field">
              <Input
                label="Search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Email or name"
              />
            </div>
            <div className="dashboard-toolbar-field">
              <Select
                label="Source"
                value={sourceFilter}
                onChange={(e) => {
                  setSourceFilter(e.target.value as EmailSubscriberSource);
                  setPage(1);
                }}
                options={SOURCE_OPTIONS}
              />
            </div>
            <div className="dashboard-toolbar-actions">
              <PermissionGate permission={PERMISSIONS.MANAGE_EMAILS}>
                <Button variant="secondary" onClick={() => syncMutation.mutate()} loading={syncMutation.isPending}>
                  Sync legacy data
                </Button>
              </PermissionGate>
              <Button variant="secondary" onClick={handleExport} icon="ri-download-line">
                Export CSV
              </Button>
            </div>
          </div>
          <Table
            data={subscribers?.data || []}
            columns={subscriberColumns}
            loading={loadingSubs}
            emptyMessage="No subscribers. Sync legacy data or wait for new signups."
          />
          {subscribers && subscribers.totalPages > 1 && (
            <div className="px-4 pb-4">
              <Pagination
                currentPage={page}
                totalPages={subscribers.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </Card>
      )}

      {tab === 'compose' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="space-y-4 p-6">
            <h2 className="text-lg font-semibold">Compose</h2>
            <Select
              label="Template"
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value as EmailTemplateId)}
              options={TEMPLATE_OPTIONS}
            />
            <Input
              label="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Template parameters (JSON)
              </label>
              <textarea
                value={templateParamsJson}
                onChange={(e) => setTemplateParamsJson(e.target.value)}
                rows={8}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs dark:border-slate-600 dark:bg-slate-900"
              />
            </div>
            {templateId === 'custom' && (
              <div className="space-y-3">
                <input
                  ref={htmlFileInputRef}
                  type="file"
                  accept=".html,text/html"
                  className="hidden"
                  onChange={handleHtmlFileSelect}
                />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="block text-sm font-medium">Custom HTML</label>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    icon="ri-file-upload-line"
                    onClick={() => htmlFileInputRef.current?.click()}
                  >
                    Upload HTML
                  </Button>
                </div>
                {htmlFileName && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Loaded: {htmlFileName}
                  </p>
                )}
                <textarea
                  value={customHtml}
                  onChange={(e) => {
                    setCustomHtml(e.target.value);
                    setHtmlFileName('');
                    setPreviewHtml('');
                    setShowPreview(false);
                  }}
                  rows={14}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs dark:border-slate-600 dark:bg-slate-900"
                  placeholder="Paste a full HTML email here, or upload an .html file."
                />
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => previewMutation.mutate()} loading={previewMutation.isPending}>
                Preview
              </Button>
              <PermissionGate anyPermissions={[PERMISSIONS.SEND_EMAIL, PERMISSIONS.MANAGE_EMAILS]}>
                <Button variant="secondary" onClick={() => sendTestMutation.mutate()} loading={sendTestMutation.isPending}>
                  Send test
                </Button>
              </PermissionGate>
            </div>
            <hr className="border-slate-200 dark:border-slate-700" />
            <h3 className="font-medium">Send to one</h3>
            <Input label="Email" value={singleTo} onChange={(e) => setSingleTo(e.target.value)} />
            <Input label="Name" value={singleName} onChange={(e) => setSingleName(e.target.value)} />
            <PermissionGate anyPermissions={[PERMISSIONS.SEND_EMAIL, PERMISSIONS.MANAGE_EMAILS]}>
              <Button onClick={() => sendSingleMutation.mutate()} loading={sendSingleMutation.isPending} icon="ri-send-plane-line">
                Send email
              </Button>
            </PermissionGate>
            <hr className="border-slate-200 dark:border-slate-700" />
            <h3 className="font-medium">Bulk send</h3>
            <Select
              label="Audience"
              value={bulkSource}
              onChange={(e) => setBulkSource(e.target.value as EmailSubscriberSource)}
              options={SOURCE_OPTIONS}
            />
            <Button
              onClick={handleBulkSend}
              loading={sendBulkMutation.isPending}
              loadingText="Sending..."
              icon="ri-mail-send-line"
            >
              {bulkSource === 'all' ? 'Send to all emails' : 'Send bulk'}
            </Button>
            {showBulkProgress && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {bulkProgressTitle}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {bulkProgressDetail}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {bulkProgress}%
                  </span>
                </div>
                <div
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={bulkProgress}
                  className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
                >
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      bulkStatus === 'error'
                        ? 'bg-red-500'
                        : bulkStatus === 'success'
                          ? 'bg-emerald-500'
                          : 'bg-indigo-600'
                    }`}
                    style={{ width: `${bulkProgress}%` }}
                  />
                </div>
              </div>
            )}
          </Card>
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold">Preview</h2>
            {showPreview && previewHtml ? (
              <iframe
                title="Email preview"
                srcDoc={previewHtml}
                className="h-[min(70vh,600px)] w-full rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
              />
            ) : (
              <p className="text-sm text-slate-500">Click Preview to see the rendered template.</p>
            )}
          </Card>
        </div>
      )}

      {tab === 'campaigns' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="space-y-4 p-6">
            <h2 className="text-lg font-semibold">New campaign</h2>
            <Input label="Campaign name" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} />
            <Input label="Subject" value={campaignSubject} onChange={(e) => setCampaignSubject(e.target.value)} />
            <Select
              label="Audience"
              value={campaignAudience}
              onChange={(e) => setCampaignAudience(e.target.value as EmailSubscriberSource)}
              options={SOURCE_OPTIONS}
            />
            <Input
              label="Schedule (optional)"
              type="datetime-local"
              value={scheduleAt}
              onChange={(e) => setScheduleAt(e.target.value)}
            />
            <p className="text-xs text-slate-500">
              Uses template &amp; JSON from Compose tab. Save as draft, then send from the list.
            </p>
            <PermissionGate anyPermissions={[PERMISSIONS.MANAGE_EMAILS, PERMISSIONS.SEND_EMAIL]}>
              <Button onClick={() => createCampaignMutation.mutate()} loading={createCampaignMutation.isPending}>
                Save campaign
              </Button>
            </PermissionGate>
          </Card>
          <Card padding="none">
            <div className="border-b border-slate-200 p-4 dark:border-slate-800">
              <h2 className="font-semibold">Campaigns</h2>
            </div>
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {(campaigns || []).length === 0 && (
                <li className="p-6 text-sm text-slate-500">No campaigns yet.</li>
              )}
              {(campaigns || []).map((c) => (
                <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-sm text-slate-500">{c.subject}</p>
                    <span className={statusBadge.info}>{c.status}</span>
                  </div>
                  {c.status !== 'sent' && (
                    <PermissionGate anyPermissions={[PERMISSIONS.SEND_EMAIL, PERMISSIONS.MANAGE_EMAILS]}>
                      <Button
                        size="sm"
                        onClick={() => sendCampaignMutation.mutate(c.id)}
                        loading={sendCampaignMutation.isPending}
                      >
                        Send now
                      </Button>
                    </PermissionGate>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {tab === 'history' && (
        <Card padding="none">
          <Table
            data={history || []}
            loading={false}
            emptyMessage="No sends yet"
            columns={[
              {
                key: 'to',
                header: 'To',
                render: (r) => <span className={tableText.primary}>{r.to}</span>,
              },
              {
                key: 'subject',
                header: 'Subject',
                render: (r) => <span className={tableText.muted}>{r.subject}</span>,
              },
              {
                key: 'status',
                header: 'Status',
                render: (r) => (
                  <span
                    className={
                      r.status === 'sent' ? statusBadge.success : statusBadge.warning
                    }
                  >
                    {r.status}
                  </span>
                ),
              },
              {
                key: 'when',
                header: 'When',
                render: (r) => (
                  <span className={tableText.muted}>
                    {new Date(r.sentAt || r.createdAt).toLocaleString()}
                  </span>
                ),
              },
            ]}
          />
        </Card>
      )}
    </div>
  );
}
