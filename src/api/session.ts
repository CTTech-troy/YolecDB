import { API_BASE_URL, resolveApiUrl, setCsrfToken } from '@/lib/apiClient';
import { AuthUser } from '@/types';

async function parseSessionResponse(res: Response): Promise<{ user: AuthUser; csrfToken: string }> {
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const j = await res.json();
      if (j?.error) msg = j.error;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  const body = await res.json();
  if (body?.csrfToken) setCsrfToken(body.csrfToken);
  return body;
}

export async function createSession(idToken: string): Promise<{ user: AuthUser; csrfToken: string }> {
  const url = resolveApiUrl(API_BASE_URL, '/api/mgmt/auth/session');
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  return parseSessionResponse(res);
}

export async function refreshSession(): Promise<{ user: AuthUser; csrfToken: string }> {
  const url = resolveApiUrl(API_BASE_URL, '/api/mgmt/auth/session/refresh');
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'include',
  });
  return parseSessionResponse(res);
}

export async function logoutSession(): Promise<void> {
  const url = resolveApiUrl(API_BASE_URL, '/api/mgmt/auth/session/logout');
  await fetch(url, { method: 'POST', credentials: 'include' });
}
