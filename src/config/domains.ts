export const PUBLIC_SITE_URL =
  firstUrl(import.meta.env.VITE_PUBLIC_SITE_URL) || 'https://yolechub.com.ng';
export const ADMIN_SITE_URL =
  firstUrl(import.meta.env.VITE_ADMIN_SITE_URL) || 'https://support.yolechub.com.ng';
export const PRODUCTION_API_URL = 'https://yolecbackend.onrender.com';
export const LOCAL_API_URL = 'http://localhost:4000';

export const LOCAL_APP_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
];

function firstUrl(value?: string) {
  return String(value || '').split(',')[0]?.trim().replace(/\/$/, '') || '';
}

function isLocalAppOrigin(origin: string) {
  return LOCAL_APP_ORIGINS.includes(origin);
}

/** API host without trailing /api (for use with resolveApiUrl). */
export function normalizeApiBase(raw?: string) {
  const trimmed = firstUrl(raw);
  if (!trimmed) return '';
  const noMgmt = trimmed.replace(/\/mgmt$/, '');
  if (noMgmt.endsWith('/api')) return noMgmt.slice(0, -4);
  return noMgmt;
}

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined' && isLocalAppOrigin(window.location.origin)) {
    return LOCAL_API_URL;
  }

  const configured = normalizeApiBase(
    import.meta.env.VITE_API_BASE_URL ||
      import.meta.env.VITE_BACKEND_URL ||
      import.meta.env.VITE_API_URL
  );
  if (configured) return configured;

  return PRODUCTION_API_URL;
}

export function getSocketOrigin() {
  return getApiBaseUrl();
}
