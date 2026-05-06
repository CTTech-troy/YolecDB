import { auth } from '../../firebase.js';

const rawBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const base = (() => {
  if (!rawBase) return '';
  const noMgmt = rawBase.replace(/\/mgmt$/, '');
  if (noMgmt.endsWith('/api')) return `${noMgmt}/mgmt`;
  return `${noMgmt}/api/mgmt`;
})();

export async function apiRequest(path, { method = 'GET', body } = {}) {
  if (!base) {
    throw new Error('VITE_API_BASE_URL is not set');
  }
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Not authenticated');
  }
  const token = await user.getIdToken();
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const j = await res.json();
      if (j?.error) msg = j.error;
    } catch {
      try {
        msg = await res.text();
      } catch {
        /* ignore */
      }
    }
    throw new Error(msg || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null;
  const ct = res.headers.get('content-type');
  if (ct?.includes('application/json')) return res.json();
  return res.text();
}
