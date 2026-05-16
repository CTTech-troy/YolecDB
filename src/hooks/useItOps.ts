import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { itOpsApi } from '@/api/itOps';
import toast from 'react-hot-toast';

export function useItOverview() {
  return useQuery({
    queryKey: ['it', 'overview'],
    queryFn: () => itOpsApi.getOverview(),
    refetchInterval: 60_000,
  });
}

export function useItApiFlow() {
  return useQuery({
    queryKey: ['it', 'api-flow'],
    queryFn: () => itOpsApi.getApiFlow(),
    refetchInterval: 30_000,
  });
}

export function useItDatabaseMetrics(poll = true) {
  return useQuery({
    queryKey: ['it', 'db-metrics'],
    queryFn: () => itOpsApi.getDatabaseMetrics(),
    refetchInterval: poll ? 60_000 : false,
  });
}

export function useItDatabaseHistory() {
  return useQuery({
    queryKey: ['it', 'db-history'],
    queryFn: () => itOpsApi.getDatabaseHistory(40),
    refetchInterval: 30_000,
  });
}

export function useIncidentSummary() {
  return useQuery({
    queryKey: ['it', 'incidents', 'summary'],
    queryFn: () => itOpsApi.getIncidentSummary(),
    refetchInterval: 30_000,
  });
}

export function useItIncidents() {
  return useQuery({
    queryKey: ['it', 'incidents'],
    queryFn: () => itOpsApi.listIncidents(),
    refetchInterval: 20_000,
  });
}

export function useItIncident(id: string | undefined) {
  return useQuery({
    queryKey: ['it', 'incidents', id],
    queryFn: () => itOpsApi.getIncident(id!),
    enabled: Boolean(id),
  });
}

export function useRunMonitoring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => itOpsApi.runMonitoring(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['it'] });
      toast.success('Health check completed');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAddIncidentNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => itOpsApi.addIncidentNote(id, note),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['it', 'incidents', id] });
      toast.success('Note added');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useCreateIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: itOpsApi.createIncident,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['it', 'incidents'] });
      qc.invalidateQueries({ queryKey: ['it', 'overview'] });
      toast.success('Incident created');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & Parameters<typeof itOpsApi.updateIncident>[1]) =>
      itOpsApi.updateIncident(id, body),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['it', 'incidents'] });
      qc.invalidateQueries({ queryKey: ['it', 'incidents', id] });
      qc.invalidateQueries({ queryKey: ['it', 'overview'] });
      toast.success('Incident updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useItBackups() {
  return useQuery({
    queryKey: ['it', 'backups'],
    queryFn: () => itOpsApi.listBackups(),
    refetchInterval: 10_000,
  });
}

export function useRunBackup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (label?: string) => itOpsApi.runBackup(label),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['it', 'backups'] });
      qc.invalidateQueries({ queryKey: ['it', 'overview'] });
      toast.success('Backup completed and stored in Firebase');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
