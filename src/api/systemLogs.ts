import { apiClient } from '@/lib/apiClient';
import type { PaginatedResponse } from '@/types';

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL' | 'DEBUG';
export type LogCategory =
  | 'API'
  | 'AUTH'
  | 'REDIS'
  | 'DATABASE'
  | 'SECURITY'
  | 'AUDIT'
  | 'TICKETS'
  | 'EMAIL'
  | 'SYSTEM'
  | 'MONITORING';

export interface SystemLogEntry {
  id: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  metadata?: Record<string, string | number | boolean | undefined>;
  createdAt: number;
}

export interface SystemLogMetrics {
  errorsToday: number;
  warningsToday: number;
  activeIncidents: number;
  apiLatencyP95Ms: number | null;
  redisHealth: 'ok' | 'degraded' | 'down' | 'unknown';
  redisAvgLatencyMs: number | null;
}

export interface SystemLogListParams {
  level?: LogLevel;
  category?: LogCategory;
  q?: string;
  from?: number;
  to?: number;
  page?: number;
  limit?: number;
}

export const systemLogsApi = {
  list(params: SystemLogListParams = {}) {
    const q = new URLSearchParams();
    if (params.level) q.set('level', params.level);
    if (params.category) q.set('category', params.category);
    if (params.q) q.set('q', params.q);
    if (params.from) q.set('from', String(params.from));
    if (params.to) q.set('to', String(params.to));
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    const qs = q.toString();
    return apiClient.get<PaginatedResponse<SystemLogEntry>>(
      `/api/mgmt/system-logs${qs ? `?${qs}` : ''}`
    );
  },

  metrics() {
    return apiClient.get<SystemLogMetrics>('/api/mgmt/system-logs/metrics');
  },

  clearBuffer() {
    return apiClient.delete<{ ok: boolean }>('/api/mgmt/system-logs');
  },

  exportUrl(params: SystemLogListParams & { format?: 'json' | 'csv' }) {
    const q = new URLSearchParams();
    if (params.level) q.set('level', params.level);
    if (params.category) q.set('category', params.category);
    if (params.q) q.set('q', params.q);
    if (params.from) q.set('from', String(params.from));
    if (params.to) q.set('to', String(params.to));
    q.set('format', params.format ?? 'csv');
    const base =
      import.meta.env.VITE_API_BASE_URL ||
      import.meta.env.VITE_API_URL ||
      'http://localhost:4000';
    const root = base.replace(/\/$/, '');
    return `${root}/api/mgmt/system-logs/export?${q.toString()}`;
  },
};
