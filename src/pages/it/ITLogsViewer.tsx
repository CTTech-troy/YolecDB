import { useRef, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { LogMetricsBar } from '@/components/logs/LogMetricsBar';
import { LogTerminal } from '@/components/logs/LogTerminal';
import { useLogStream, useSystemLogMetrics } from '@/hooks/useSystemLogs';
import type { LogCategory, LogLevel } from '@/api/systemLogs';
import { systemLogsApi } from '@/api/systemLogs';

export function ITLogsViewerPage() {
  const [paused, setPaused] = useState(false);
  const [wrap, setWrap] = useState(true);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState<LogLevel | ''>('');
  const [category, setCategory] = useState<LogCategory | ''>('');
  const [selected, setSelected] = useState<import('@/api/systemLogs').SystemLogEntry | null>(null);
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
          Live stream: {streamError}. Showing loaded history; retrying connection…
        </p>
      )}

      <LogTerminal
        terminalRef={terminalRef}
        lines={lines}
        connected={connected}
        paused={paused}
        onTogglePause={() => setPaused((p) => !p)}
        wrap={wrap}
        onToggleWrap={() => setWrap((w) => !w)}
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
