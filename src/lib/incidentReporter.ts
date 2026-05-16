import { apiClient } from '@/lib/apiClient';

const reported = new Set<string>();

function fingerprint(message: string, source?: string) {
  return `${source ?? ''}|${message}`.slice(0, 200);
}

export async function reportClientIncident(payload: {
  title: string;
  description?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  errorMessage?: string;
  stackTrace?: string;
  source?: string;
  affectedService?: string;
}) {
  const fp = fingerprint(payload.errorMessage ?? payload.title, payload.source);
  if (reported.has(fp)) return;
  reported.add(fp);

  const base = import.meta.env.VITE_API_BASE_URL?.replace(/\/mgmt$/, '').replace(/\/$/, '') ?? '';
  const url = `${base}/api/public/incidents/report`;

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'frontend',
        severity: payload.severity ?? 'high',
        title: payload.title,
        description: payload.description,
        errorMessage: payload.errorMessage,
        stackTrace: payload.stackTrace?.slice(0, 8000),
        source: payload.source,
        affectedService: payload.affectedService ?? 'dashboard',
        url: window.location.href,
        userAgent: navigator.userAgent,
      }),
    });
  } catch {
    try {
      await apiClient.post('/api/public/incidents/report', {
        type: 'frontend',
        severity: payload.severity ?? 'high',
        ...payload,
        url: window.location.href,
      });
    } catch {
      /* silent */
    }
  }
}

export function installGlobalErrorHandlers(appLabel = 'dashboard') {
  window.onerror = (message, source, _lineno, _colno, error) => {
    void reportClientIncident({
      title: 'Frontend crash',
      severity: 'high',
      errorMessage: String(message),
      stackTrace: error?.stack,
      source: source ?? undefined,
      affectedService: appLabel,
    });
  };

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    void reportClientIncident({
      title: 'Unhandled promise rejection',
      severity: 'high',
      errorMessage: reason instanceof Error ? reason.message : String(reason),
      stackTrace: reason instanceof Error ? reason.stack : undefined,
      affectedService: appLabel,
    });
  });
}
