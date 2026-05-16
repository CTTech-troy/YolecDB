import { auth } from '@/config/firebase';
import { apiClient, resolveApiUrl } from '@/lib/apiClient';
import { PaginatedResponse } from '@/types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export type EmailTemplateId =
  | 'newsletter'
  | 'event_registration'
  | 'contact'
  | 'campaign'
  | 'custom';

export type EmailSubscriberSource =
  | 'newsletter'
  | 'event'
  | 'contact'
  | 'blog'
  | 'comment'
  | 'all';

export interface EmailSubscriber {
  id: string;
  email: string;
  name?: string;
  source: EmailSubscriberSource;
  sources?: EmailSubscriberSource[];
  status: 'active' | 'unsubscribed';
  createdAt: number;
  updatedAt: number;
}

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  templateId: EmailTemplateId;
  status: string;
  audienceSource?: string;
  scheduledAt?: number;
  sentAt?: number;
  recipientCount?: number;
  successCount?: number;
  failCount?: number;
  createdAt: number;
}

export interface EmailSendRecord {
  id: string;
  type: string;
  to: string;
  subject: string;
  templateId: string;
  status: string;
  error?: string;
  sentAt?: number;
  createdAt: number;
}

export interface EmailStats {
  totalSubscribers: number;
  activeSubscribers: number;
  totalSends: number;
  sentCount: number;
  failedCount: number;
  campaignCount: number;
}

export const emailApi = {
  getStats(): Promise<EmailStats> {
    return apiClient.get('/api/mgmt/email/stats');
  },

  listSubscribers(
    page = 1,
    limit = 50,
    source?: EmailSubscriberSource,
    search?: string
  ): Promise<PaginatedResponse<EmailSubscriber>> {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (source && source !== 'all') params.set('source', source);
    if (search) params.set('search', search);
    return apiClient.get(`/api/mgmt/email/subscribers?${params}`);
  },

  syncSubscribers(): Promise<{ imported: number }> {
    return apiClient.post('/api/mgmt/email/subscribers/sync', {});
  },

  async exportCsv(source?: EmailSubscriberSource): Promise<Blob> {
    const params = source && source !== 'all' ? `?source=${source}` : '';
    const token = await auth.currentUser?.getIdToken();
    const res = await fetch(
      resolveApiUrl(API_BASE, `/api/mgmt/email/subscribers/export${params}`),
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    );
    if (!res.ok) throw new Error('Export failed');
    return res.blob();
  },

  preview(templateId: EmailTemplateId, templateParams: Record<string, unknown>) {
    return apiClient.post<{ html: string }>('/api/mgmt/email/preview', {
      templateId,
      templateParams,
    });
  },

  sendSingle(body: {
    to: string;
    toName?: string;
    subject: string;
    templateId: EmailTemplateId;
    templateParams?: Record<string, unknown>;
    html?: string;
  }) {
    return apiClient.post('/api/mgmt/email/send', body);
  },

  sendTest(body: {
    subject: string;
    templateId: EmailTemplateId;
    templateParams?: Record<string, unknown>;
    html?: string;
  }) {
    return apiClient.post('/api/mgmt/email/send/test', body);
  },

  sendBulk(body: {
    subject: string;
    templateId: EmailTemplateId;
    templateParams?: Record<string, unknown>;
    source?: EmailSubscriberSource;
    emails?: string[];
    html?: string;
  }): Promise<{ success: number; failed: number }> {
    return apiClient.post<{ success: number; failed: number }>(
      '/api/mgmt/email/send/bulk',
      body
    );
  },

  listHistory(limit = 100): Promise<EmailSendRecord[]> {
    return apiClient.get(`/api/mgmt/email/history?limit=${limit}`);
  },

  listCampaigns(): Promise<EmailCampaign[]> {
    return apiClient.get('/api/mgmt/email/campaigns');
  },

  createCampaign(body: {
    name: string;
    subject: string;
    templateId: EmailTemplateId;
    templateParams?: Record<string, unknown>;
    audienceSource?: EmailSubscriberSource;
    scheduledAt?: number;
  }) {
    return apiClient.post<{ id: string }>('/api/mgmt/email/campaigns', body);
  },

  sendCampaign(campaignId: string): Promise<{ success: number; failed: number }> {
    return apiClient.post<{ success: number; failed: number }>(
      `/api/mgmt/email/campaigns/${campaignId}/send`,
      {}
    );
  },
};
