/**
 * Typed API client with httpOnly session cookies + Firebase Bearer fallback
 */

import type { User } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { ApiError } from '@/types';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:4000';

let csrfToken: string | null = null;
let refreshInFlight: Promise<boolean> | null = null;

export function setCsrfToken(token: string | null) {
  csrfToken = token;
}

export function getCsrfToken() {
  return csrfToken;
}

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function resolveApiUrl(baseUrl: string, endpoint: string): string {
  const base = baseUrl.replace(/\/$/, '');
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  if (base.endsWith('/api') && path.startsWith('/api/')) {
    return `${base}${path.slice(4)}`;
  }

  return `${base}${path}`;
}

function parseErrorPayload(raw: unknown, status: number): string {
  if (raw && typeof raw === 'object') {
    const body = raw as Record<string, unknown>;
    if (typeof body.error === 'string' && body.error) return body.error;
    if (typeof body.message === 'string' && body.message) return body.message;
    if (Array.isArray(body.details) && body.details.length > 0) {
      const detail = (body.details as Array<{ message?: string }>)
        .map((d) => d.message)
        .filter(Boolean)
        .join('; ');
      if (detail) return `${body.error || 'Validation failed'}: ${detail}`;
    }
  }
  if (status === 401) return 'Session expired. Please sign in again.';
  if (status === 403) return 'You do not have permission for this action.';
  if (status === 429) return 'Too many requests. Please wait a moment and try again.';
  if (status >= 500) return 'Server error. Check that the backend is running on port 4000.';
  return `Request failed (${status})`;
}

function isAuthEndpoint(endpoint: string): boolean {
  return endpoint.includes('/auth/session');
}

async function tryRefreshSession(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      const url = resolveApiUrl(API_BASE_URL, '/api/mgmt/auth/session/refresh');
      const res = await fetch(url, { method: 'POST', credentials: 'include' });
      if (!res.ok) return false;
      const body = await res.json();
      if (body?.csrfToken) setCsrfToken(body.csrfToken);
      return true;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

type RequestOptions = RequestInit & { _retried?: boolean };

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  private async getAuthToken(explicitUser?: User): Promise<string | null> {
    const user = explicitUser ?? auth.currentUser;
    if (!user) return null;
    return user.getIdToken();
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = resolveApiUrl(this.baseUrl, endpoint);
    const method = (options.method || 'GET').toUpperCase();
    const mutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const bearer = await this.getAuthToken();
    if (bearer && !headers.Authorization) {
      headers.Authorization = `Bearer ${bearer}`;
    }

    const xsrf = csrfToken || readCookie('XSRF-TOKEN');
    if (mutating && xsrf) {
      headers['X-XSRF-TOKEN'] = xsrf;
    }

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers,
      });
    } catch (err) {
      const msg =
        err instanceof TypeError
          ? `Cannot reach API at ${this.baseUrl}. Start the backend with: npm run dev (in backend folder).`
          : err instanceof Error
            ? err.message
            : 'Network request failed';
      throw new NetworkError(msg);
    }

    if (
      response.status === 401 &&
      !options._retried &&
      !isAuthEndpoint(endpoint)
    ) {
      const refreshed = await tryRefreshSession();
      if (refreshed) {
        return this.request<T>(endpoint, { ...options, _retried: true });
      }
    }

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        error: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(parseErrorPayload(error, response.status));
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  async upload<T>(endpoint: string, file: File, additionalData?: Record<string, string>): Promise<T> {
    const url = resolveApiUrl(this.baseUrl, endpoint);
    const formData = new FormData();
    formData.append('file', file);
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const xsrf = csrfToken || readCookie('XSRF-TOKEN');
    const headers: Record<string, string> = {};
    if (xsrf) headers['X-XSRF-TOKEN'] = xsrf;
    const bearer = await this.getAuthToken();
    if (bearer) headers.Authorization = `Bearer ${bearer}`;

    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(parseErrorPayload(error, response.status));
    }

    return response.json();
  }
}

export const apiClient = new ApiClient();

export async function checkApiHealth(): Promise<boolean> {
  try {
    const url = resolveApiUrl(API_BASE_URL, '/api/health');
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data?.ok);
  } catch {
    return false;
  }
}
