import { useEffect, useRef, useState, type RefObject } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { MetricCard } from '@/components/it/MetricCard';
import { Button, Input } from '@/components/ui';
import { useLogStream, useSystemLogMetrics } from '@/hooks/useSystemLogs';
import {
  systemLogsApi,
  type LogCategory,
  type LogLevel,
  type SystemLogEntry,
  type SystemLogMetrics,
} from '@/api/systemLogs';

const LEVELS: (LogLevel | '')[] = ['', 'INFO', 'WARN', 'ERROR', 'CRITICAL', 'DEBUG'];
const CATEGORIES: (LogCategory | '')[] = [
  '',
  'API',
  'AUTH',
  'REDIS',
  'DATABASE',
  'SECURITY',
  'AUDIT',
  'TICKETS',
  'EMAIL',
  'SYSTEM',
  'MONITORING',
];

const LEVEL_COLORS: Record<LogLevel, string> = {
  INFO: 'text-sky-400',
  WARN: 'text-amber-400',
  ERROR: 'text-red-400',
  CRITICAL: 'text-red-700 dark:text-red-500',
  DEBUG: 'text-slate-500',
};

const LEVEL_BADGE: Record<LogLevel, string> = {
  INFO: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  WARN: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  ERROR: 'bg-red-500/15 text-red-400 border-red-500/30',
  CRITICAL: 'bg-red-900/40 text-red-300 border-red-700/50',
  DEBUG: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
};

function formatLogTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-GB', { hour12: false });
}

function LogMetricsBar({
  metrics,
  loading,
}: {
  metrics?: SystemLogMetrics;
  loading?: boolean;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <MetricCard
        label="Errors today"
        value={loading ? '...' : String(metrics?.errorsToday ?? 0)}
        status={(metrics?.errorsToday ?? 0) > 0 ? 'error' : 'ok'}
      />
      <MetricCard
        label="Warnings today"
        value={loading ? '...' : String(metrics?.warningsToday ?? 0)}
        status={(metrics?.warningsToday ?? 0) > 0 ? 'warn' : 'ok'}
      />
      <MetricCard
        label="Active incidents"
        value={loading ? '...' : String(metrics?.activeIncidents ?? 0)}
        status={(metrics?.activeIncidents ?? 0) > 0 ? 'warn' : 'ok'}
      />
      <MetricCard
        label="API latency (p95)"
        value={
          loading
            ? '...'
            : metrics?.apiLatencyP95Ms != null
              ? `${metrics.apiLatencyP95Ms} ms`
              : '-'
        }
      />
      <MetricCard
        label="Redis health"
        value={loading ? '...' : metrics?.redisHealth ?? 'unknown'}
        status={
          metrics?.redisHealth === 'ok'
            ? 'ok'
            : metrics?.redisHealth === 'degraded'
              ? 'warn'
              : metrics?.redisHealth === 'down'
                ? 'error'
                : undefined
        }
      />
    </div>
  );
}

function LogToolbar({
  search,
  onSearchChange,
  level,
  onLevelChange,
  category,
  onCategoryChange,
  paused,
  onTogglePause,
  wrap,
  onToggleWrap,
  onClear,
  onExport,
  onFullscreen,
  connected,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  level: LogLevel | '';
  onLevelChange: (v: LogLevel | '') => void;
  category: LogCategory | '';
  onCategoryChange: (v: LogCategory | '') => void;
  paused: boolean;
  onTogglePause: () => void;
  wrap: boolean;
  onToggleWrap: () => void;
  onClear: () => void;
  onExport: () => void;
  onFullscreen: () => void;
  connected: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-700 bg-[#161b22] p-3 sm:flex-row sm:flex-wrap sm:items-center">
      <Input
        placeholder="Search logs..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="h-9 min-w-[200px] flex-1 bg-[#0d1117] border-slate-700 text-slate-200 placeholder:text-slate-500"
      />
      <select
        value={level}
        onChange={(e) => onLevelChange(e.target.value as LogLevel | '')}
        className="h-9 rounded-lg border border-slate-700 bg-[#0d1117] px-2 text-sm text-slate-200"
      >
        {LEVELS.map((item) => (
          <option key={item || 'all'} value={item}>
            {item || 'All levels'}
          </option>
        ))}
      </select>
      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value as LogCategory | '')}
        className="h-9 rounded-lg border border-slate-700 bg-[#0d1117] px-2 text-sm text-slate-200"
      >
        {CATEGORIES.map((item) => (
          <option key={item || 'all'} value={item}>
            {item || 'All categories'}
          </option>
        ))}
      </select>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="ghost" type="button" onClick={onTogglePause}>
          {paused ? 'Resume' : 'Pause'}
        </Button>
        <Button size="sm" variant="ghost" type="button" onClick={onClear}>
          Clear
        </Button>
        <Button size="sm" variant="ghost" type="button" onClick={onToggleWrap}>
          {wrap ? 'No wrap' : 'Wrap'}
        </Button>
        <Button size="sm" variant="ghost" type="button" onClick={onExport}>
          Download
        </Button>
        <Button size="sm" variant="ghost" type="button" onClick={onFullscreen}>
          Fullscreen
        </Button>
      </div>
      <span className={`text-xs font-medium ${connected ? 'text-emerald-400' : 'text-amber-400'}`}>
        {connected ? 'Live' : 'Reconnecting...'}
      </span>
    </div>
  );
}

function LogLine({
  log,
  wrap,
  selected,
  onSelect,
}: {
  log: SystemLogEntry;
  wrap: boolean;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left px-3 py-1 font-mono text-xs leading-relaxed hover:bg-white/5 border-l-2 transition-colors ${
        selected ? 'border-l-cyan-400 bg-white/5' : 'border-l-transparent'
      }`}
    >
      <span className="text-slate-500">[{formatLogTime(log.createdAt)}]</span>{' '}
      <span
        className={`inline-flex items-center rounded border px-1 py-0 text-[10px] font-semibold uppercase tracking-wide mr-2 ${LEVEL_BADGE[log.level]}`}
      >
        {log.level}
      </span>
      <span className="text-violet-400/90 mr-2">[{log.category}]</span>
      <span className={`${LEVEL_COLORS[log.level]} ${wrap ? 'whitespace-pre-wrap break-all' : 'truncate'}`}>
        {log.message}
      </span>
    </button>
  );
}

function LogMetadataPanel({
  log,
  onClose,
}: {
  log: SystemLogEntry | null;
  onClose: () => void;
}) {
  if (!log) return null;

  const json = JSON.stringify(
    {
      id: log.id,
      level: log.level,
      category: log.category,
      message: log.message,
      createdAt: log.createdAt,
      metadata: log.metadata ?? {},
    },
    null,
    2
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(json);
    } catch {
      /* Clipboard can be unavailable in restricted browser contexts. */
    }
  };

  return (
    <div className="border-t border-slate-700 bg-[#161b22] p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-200">Log payload</p>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" type="button" onClick={copy}>
            Copy JSON
          </Button>
          <Button size="sm" variant="ghost" type="button" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
      <pre className="max-h-48 overflow-auto rounded-lg bg-black/40 p-3 text-xs text-slate-300 font-mono">
        {json}
      </pre>
    </div>
  );
}

function LogTerminal({
  lines,
  connected,
  paused,
  onTogglePause,
  wrap,
  onToggleWrap,
  onClear,
  onExport,
  search,
  onSearchChange,
  level,
  onLevelChange,
  category,
  onCategoryChange,
  selected,
  onSelect,
  terminalRef,
}: {
  lines: SystemLogEntry[];
  connected: boolean;
  paused: boolean;
  onTogglePause: () => void;
  wrap: boolean;
  onToggleWrap: () => void;
  onClear: () => void;
  onExport: () => void;
  search: string;
  onSearchChange: (v: string) => void;
  level: LogLevel | '';
  onLevelChange: (v: LogLevel | '') => void;
  category: LogCategory | '';
  onCategoryChange: (v: LogCategory | '') => void;
  selected: SystemLogEntry | null;
  onSelect: (log: SystemLogEntry | null) => void;
  terminalRef: RefObject<HTMLDivElement | null>;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef(true);

  useEffect(() => {
    if (!autoScrollRef.current || paused) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, paused]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    autoScrollRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
  };

  const onFullscreen = () => {
    const el = terminalRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void el.requestFullscreen();
    }
  };

  return (
    <div
      ref={terminalRef}
      className="flex max-h-[min(75vh,680px)] flex-col overflow-hidden rounded-xl border border-slate-700 bg-[#0d1117] shadow-2xl"
    >
      <LogToolbar
        search={search}
        onSearchChange={onSearchChange}
        level={level}
        onLevelChange={onLevelChange}
        category={category}
        onCategoryChange={onCategoryChange}
        paused={paused}
        onTogglePause={onTogglePause}
        wrap={wrap}
        onToggleWrap={onToggleWrap}
        onClear={onClear}
        onExport={onExport}
        onFullscreen={onFullscreen}
        connected={connected}
      />
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-1"
      >
        {lines.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-slate-500 font-mono">
            Waiting for log stream...
          </p>
        ) : (
          lines.map((log) => (
            <LogLine
              key={`${log.id}-${log.createdAt}`}
              log={log}
              wrap={wrap}
              selected={selected?.id === log.id}
              onSelect={() => onSelect(selected?.id === log.id ? null : log)}
            />
          ))
        )}
      </div>
      <LogMetadataPanel log={selected} onClose={() => onSelect(null)} />
    </div>
  );
}

export function ITLogsViewerPage() {
  const [paused, setPaused] = useState(false);
  const [wrap, setWrap] = useState(true);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState<LogLevel | ''>('');
  const [category, setCategory] = useState<LogCategory | ''>('');
  const [selected, setSelected] = useState<SystemLogEntry | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  const { data: metrics, isLoading: metricsLoading } = useSystemLogMetrics();
  const { lines, connected, streamError, clear } = useLogStream({
    paused,
    level,
    category,
    search,
  });

  const handleExport = async () => {
    const url = systemLogsApi.exportUrl({
      level: level || undefined,
      category: category || undefined,
      q: search || undefined,
      format: 'csv',
    });
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) return;
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'system-logs.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Logs Viewer"
        description="Real-time infrastructure, API, security, and application logs"
      />

      <LogMetricsBar metrics={metrics} loading={metricsLoading} />

      {streamError && (
        <p className="text-sm text-amber-600 dark:text-amber-400">
          Live stream is temporarily unavailable. Showing loaded history and retrying connection.
        </p>
      )}

      <LogTerminal
        terminalRef={terminalRef}
        lines={lines}
        connected={connected}
        paused={paused}
        onTogglePause={() => setPaused((value) => !value)}
        wrap={wrap}
        onToggleWrap={() => setWrap((value) => !value)}
        onClear={clear}
        onExport={handleExport}
        search={search}
        onSearchChange={setSearch}
        level={level}
        onLevelChange={setLevel}
        category={category}
        onCategoryChange={setCategory}
        selected={selected}
        onSelect={setSelected}
      />
    </div>
  );
}
