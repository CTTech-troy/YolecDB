export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export type IncidentStatus =
  | 'open'
  | 'investigating'
  | 'in_progress'
  | 'resolved'
  | 'closed';

export type IncidentType =
  | 'api'
  | 'frontend'
  | 'security'
  | 'infrastructure'
  | 'database'
  | 'email'
  | 'livestream'
  | 'cron'
  | 'manual';

export interface IncidentTimelineEntry {
  at: number;
  action: string;
  message: string;
  actorUid?: string;
  actorEmail?: string;
}

export interface ITIncident {
  id: string;
  title: string;
  description: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  source?: string;
  errorMessage?: string;
  stackTrace?: string;
  affectedService?: string;
  assignee?: string;
  assignedTo?: string;
  fingerprint?: string;
  autoDetected?: boolean;
  requestMethod?: string;
  requestPayload?: string;
  metadata?: Record<string, string | number | boolean>;
  createdAt: number;
  updatedAt: number;
  resolvedAt?: number;
  closedAt?: number;
  createdBy: string;
  createdByEmail?: string;
  resolutionNotes?: string;
  logs?: IncidentTimelineEntry[];
  occurrenceCount?: number;
  lastOccurredAt?: number;
  alertSentAt?: number;
}

export interface IncidentReportSummary {
  open: number;
  investigating: number;
  inProgress: number;
  resolved: number;
  closed: number;
  critical: number;
  high: number;
  byType: Record<string, number>;
  mttrMs: number | null;
  last24h: number;
}

export interface ITBackupRecord {
  id: string;
  label: string;
  status: 'running' | 'completed' | 'failed';
  paths: string[];
  createdAt: number;
  completedAt?: number;
  createdBy: string;
  createdByEmail?: string;
  sizeBytes?: number;
  error?: string;
  storagePath: string;
}

export interface LatencyProbe {
  name: string;
  category: 'api' | 'database' | 'cache' | 'external';
  latencyMs: number;
  status: 'ok' | 'warn' | 'error';
  detail?: string;
}

export interface ApiFlowSnapshot {
  timestamp: number;
  probes: LatencyProbe[];
  summary: {
    avgLatencyMs: number;
    errorCount: number;
    okCount: number;
  };
}

export interface DatabaseMetrics {
  timestamp: number;
  rtdbReadMs: number;
  rtdbWriteMs: number;
  redisMs: number;
  redisOk: boolean;
  rtdbOk: boolean;
  redis?: RedisMetricsSnapshot;
}

export interface RedisCommandSample {
  at: number;
  command: string;
  key?: string;
  durationMs: number;
  ok: boolean;
  error?: string;
  timedOut?: boolean;
  payloadBytes?: number;
}

export interface RedisMetricsSnapshot {
  timestamp: number;
  status: 'ok' | 'degraded' | 'down';
  provider: 'upstash-rest';
  pingMs: number;
  dbSize?: number;
  commandCount: number;
  errorCount: number;
  timeoutCount: number;
  slowCommandCount: number;
  cacheHits: number;
  cacheMisses: number;
  cacheHitRatio: number;
  cacheFallbacks: number;
  lockContentions: number;
  invalidatedKeys: number;
  largePayloadSkips: number;
  totalPayloadBytes: number;
  avgLatencyMs: number;
  maxLatencyMs: number;
  opsPerMinute: number;
  recentSlowCommands: RedisCommandSample[];
  recentErrors: RedisCommandSample[];
  slowThresholdMs: number;
  timeoutMs: number;
  cacheOperationTimeoutMs: number;
}

export interface ITOverview {
  timestamp: number;
  services: {
    api: 'ok' | 'degraded' | 'down';
    database: 'ok' | 'degraded' | 'down';
    cache: 'ok' | 'degraded' | 'down';
    email: boolean;
    livekit: boolean;
  };
  openIncidents: number;
  lastBackupAt: number | null;
  recentAuditCount: number;
}
