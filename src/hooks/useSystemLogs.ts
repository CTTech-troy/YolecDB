import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auth } from '@/config/firebase';
import { API_BASE_URL, resolveApiUrl } from '@/lib/apiClient';
import {
  systemLogsApi,
  type LogCategory,
  type LogLevel,
  type SystemLogEntry,
  type SystemLogListParams,
} from '@/api/systemLogs';

const MAX_LINES = 2000;

async function getBearerToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  try {
    return await user.getIdToken();
  } catch {
    return null;
  }
}

export function useSystemLogMetrics() {
  return useQuery({
    queryKey: ['system-logs', 'metrics'],
    queryFn: () => systemLogsApi.metrics(),
    refetchInterval: 30_000,
  });
}

export function useSystemLogList(params: SystemLogListParams, enabled = true) {
  return useQuery({
    queryKey: ['system-logs', 'list', params],
    queryFn: () => systemLogsApi.list(params),
    enabled,
  });
}

function parseSseChunk(buffer: string, onLog: (log: SystemLogEntry) => void): string {
  const parts = buffer.split('\n\n');
  const rest = parts.pop() ?? '';

  for (const part of parts) {
    if (!part.trim() || part.startsWith(':')) continue;
    const dataLine = part.split('\n').find((l) => l.startsWith('data: '));
    if (!dataLine) continue;
    try {
      const log = JSON.parse(dataLine.slice(6)) as SystemLogEntry;
      if (log?.id && log?.message) onLog(log);
    } catch {
      /* skip */
    }
  }

  return rest;
}

export function useLogStream(options: {
  paused: boolean;
  level?: LogLevel | '';
  category?: LogCategory | '';
  search?: string;
}) {
  const [lines, setLines] = useState<SystemLogEntry[]>([]);
  const [connected, setConnected] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const pausedRef = useRef(options.paused);
  const abortRef = useRef<AbortController | null>(null);
  pausedRef.current = options.paused;

  const matchesFilters = useCallback(
    (log: SystemLogEntry) => {
      if (options.level && log.level !== options.level) return false;
      if (options.category && log.category !== options.category) return false;
      if (options.search?.trim()) {
        const q = options.search.trim().toLowerCase();
        const hay = `${log.message} ${log.category} ${log.level} ${JSON.stringify(log.metadata ?? {})}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    },
    [options.level, options.category, options.search]
  );

  const appendLog = useCallback(
    (log: SystemLogEntry) => {
      if (pausedRef.current) return;
      if (!matchesFilters(log)) return;
      setLines((prev) => {
        if (prev.some((p) => p.id === log.id && p.createdAt === log.createdAt)) return prev;
        const next = [...prev, log];
        if (next.length > MAX_LINES) return next.slice(-MAX_LINES);
        return next;
      });
    },
    [matchesFilters]
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const history = await systemLogsApi.list({ page: 1, limit: 200 });
        if (cancelled) return;
        const ordered = [...history.data].reverse();
        setLines(ordered.filter(matchesFilters));
      } catch {
        /* history optional */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [matchesFilters]);

  useEffect(() => {
    let active = true;
    let retryMs = 2000;

    const connect = async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const url = resolveApiUrl(API_BASE_URL, '/api/mgmt/system-logs/stream');
        const headers: Record<string, string> = { Accept: 'text/event-stream' };
        const bearer = await getBearerToken();
        if (bearer) headers.Authorization = `Bearer ${bearer}`;

        const res = await fetch(url, {
          credentials: 'include',
          headers,
          signal: controller.signal,
        });

        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(text || `Stream failed (${res.status})`);
        }

        if (!active) return;
        setConnected(true);
        setStreamError(null);

        const reader = res.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let buffer = '';

        while (active) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          buffer = parseSseChunk(buffer, appendLog);
        }

        if (active) {
          setConnected(false);
          scheduleRetry();
        }
      } catch (err) {
        if (controller.signal.aborted || !active) return;
        setConnected(false);
        setStreamError(err instanceof Error ? err.message : 'Stream disconnected');
        scheduleRetry();
      }
    };

    const scheduleRetry = () => {
      if (!active) return;
      window.setTimeout(() => {
        retryMs = Math.min(retryMs * 1.5, 30_000);
        void connect();
      }, retryMs);
    };

    void connect();

    return () => {
      active = false;
      abortRef.current?.abort();
      setConnected(false);
    };
  }, [appendLog]);

  const clear = useCallback(() => setLines([]), []);

  return { lines, connected, streamError, clear, setLines };
}
