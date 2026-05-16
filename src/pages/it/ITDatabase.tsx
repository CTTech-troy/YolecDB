import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, Card } from '@/components/ui';
import { MetricCard } from '@/components/it/MetricCard';
import { useItDatabaseHistory, useItDatabaseMetrics } from '@/hooks/useItOps';

function formatBytes(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${Math.round((bytes / (1024 * 1024)) * 10) / 10} MB`;
}

function formatCount(value: number | undefined) {
  return (value ?? 0).toLocaleString();
}

export function ITDatabasePage() {
  const { data: live, isLoading, refetch, isFetching } = useItDatabaseMetrics(true);
  const { data: history } = useItDatabaseHistory();
  const redis = live?.redis;
  const redisStatus =
    !live?.redisOk || redis?.status === 'down'
      ? 'error'
      : redis?.status === 'degraded'
        ? 'warn'
        : 'ok';

  const chartData = [...(history ?? [])]
    .reverse()
    .map((h) => ({
      time: new Date(h.timestamp).toLocaleTimeString(),
      read: h.rtdbReadMs,
      write: h.rtdbWriteMs,
      redis: h.redisMs,
      redisAvg: h.redis?.avgLatencyMs ?? 0,
    }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Database latency (realtime)"
        description="Firebase RTDB read/write and Redis cache latency - refreshes every 60 seconds"
        action={
          <Button variant="ghost" onClick={() => refetch()} loading={isFetching}>
            Probe now
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="RTDB read"
          value={isLoading ? '...' : `${live?.rtdbReadMs ?? 0} ms`}
          status={live?.rtdbOk ? 'ok' : 'error'}
        />
        <MetricCard
          label="RTDB write"
          value={isLoading ? '...' : `${live?.rtdbWriteMs ?? 0} ms`}
          status={live?.rtdbOk ? 'ok' : 'error'}
        />
        <MetricCard
          label="Redis"
          value={isLoading ? '...' : `${live?.redisMs ?? 0} ms`}
          status={redisStatus}
          sub={`command timeout ${redis?.timeoutMs ?? 20000} ms`}
        />
        <MetricCard
          label="Last probe"
          value={live ? new Date(live.timestamp).toLocaleTimeString() : '-'}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Redis hit ratio"
          value={isLoading ? '...' : `${redis?.cacheHitRatio ?? 0}%`}
          status={(redis?.cacheHitRatio ?? 100) >= 70 ? 'ok' : 'warn'}
          sub={`${formatCount(redis?.cacheHits)} hits / ${formatCount(redis?.cacheMisses)} misses`}
        />
        <MetricCard
          label="Slow Redis commands"
          value={isLoading ? '...' : formatCount(redis?.slowCommandCount)}
          status={(redis?.recentSlowCommands.length ?? 0) > 0 ? 'warn' : 'ok'}
          sub={`threshold ${redis?.slowThresholdMs ?? 100} ms`}
        />
        <MetricCard
          label="Redis ops/min"
          value={isLoading ? '...' : formatCount(redis?.opsPerMinute)}
          status={redisStatus}
          sub={`${formatCount(redis?.commandCount)} total commands`}
        />
        <MetricCard
          label="Cache fallbacks"
          value={isLoading ? '...' : formatCount(redis?.cacheFallbacks)}
          status={(redis?.cacheFallbacks ?? 0) > 0 ? 'warn' : 'ok'}
          sub={`${formatCount(redis?.lockContentions)} waits / ${redis?.cacheOperationTimeoutMs ?? 350} ms budget`}
        />
      </div>

      <Card className="p-4">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Redis cache telemetry</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              App-level command timing, cache efficiency, and fallback behavior.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {redis?.provider ?? 'upstash-rest'}
          </span>
        </div>

        <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-xs text-slate-500 dark:text-slate-400">Key count</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
              {redis?.dbSize === undefined ? 'Unavailable' : formatCount(redis.dbSize)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500 dark:text-slate-400">Avg command latency</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
              {redis?.avgLatencyMs ?? 0} ms
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500 dark:text-slate-400">Max command latency</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
              {redis?.maxLatencyMs ?? 0} ms
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500 dark:text-slate-400">Timeouts</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
              {formatCount(redis?.timeoutCount)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500 dark:text-slate-400">Invalidated keys</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
              {formatCount(redis?.invalidatedKeys)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500 dark:text-slate-400">Payload written</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
              {formatBytes(redis?.totalPayloadBytes)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500 dark:text-slate-400">Large payload skips</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
              {formatCount(redis?.largePayloadSkips)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500 dark:text-slate-400">Command errors</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
              {formatCount(redis?.errorCount)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500 dark:text-slate-400">Probe status</dt>
            <dd className="mt-1 text-sm font-semibold capitalize text-slate-900 dark:text-white">
              {redis?.status ?? 'ok'}
            </dd>
          </div>
        </dl>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <tr>
                <th className="py-2 pr-4 font-semibold">Command</th>
                <th className="py-2 pr-4 font-semibold">Key</th>
                <th className="py-2 pr-4 font-semibold">Latency</th>
                <th className="py-2 pr-4 font-semibold">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {(redis?.recentSlowCommands ?? []).length === 0 ? (
                <tr>
                  <td className="py-3 text-slate-500 dark:text-slate-400" colSpan={4}>
                    No slow Redis commands recorded in the last minute.
                  </td>
                </tr>
              ) : (
                redis?.recentSlowCommands.map((sample) => (
                  <tr key={`${sample.at}-${sample.command}-${sample.key ?? 'redis'}`}>
                    <td className="py-2 pr-4 font-medium text-slate-900 dark:text-white">{sample.command}</td>
                    <td className="max-w-xs truncate py-2 pr-4 text-slate-600 dark:text-slate-300">
                      {sample.key ?? 'n/a'}
                    </td>
                    <td className="py-2 pr-4 tabular-nums text-amber-700 dark:text-amber-300">
                      {sample.durationMs} ms
                    </td>
                    <td className="py-2 pr-4 text-slate-500 dark:text-slate-400">
                      {new Date(sample.at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">Latency history</h3>
        {chartData.length < 2 ? (
          <p className="text-sm text-slate-500">Collecting samples... leave this page open for a minute.</p>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                <YAxis unit="ms" tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="read" name="RTDB read" stroke="#06b6d4" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="write" name="RTDB write" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="redis" name="Redis" stroke="#f59e0b" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="redisAvg" name="Redis avg cmd" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  );
}
