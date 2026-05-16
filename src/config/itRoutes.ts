import { RouteConfig } from './routes';
import { PERMISSIONS } from '@/types';

export const itRoutes: RouteConfig[] = [
  {
    path: '/it',
    label: 'Overview',
    icon: 'ri-dashboard-3-line',
    permission: PERMISSIONS.VIEW_IT_DASHBOARD,
  },
  {
    path: '/tickets',
    label: 'Tickets',
    icon: 'ri-kanban-view-2',
    permission: PERMISSIONS.VIEW_IT_DASHBOARD,
  },
  {
    path: '/it/api',
    label: 'API latency',
    icon: 'ri-pulse-line',
    permission: PERMISSIONS.VIEW_SYSTEM_HEALTH,
  },
  {
    path: '/it/database',
    label: 'Database',
    icon: 'ri-database-2-line',
    permission: PERMISSIONS.VIEW_SYSTEM_HEALTH,
  },
  {
    path: '/it/logs',
    label: 'Logs Viewer',
    icon: 'ri-terminal-box-line',
    permission: PERMISSIONS.VIEW_SYSTEM_LOGS,
  },
  {
    path: '/it/audit',
    label: 'Audit trail',
    icon: 'ri-file-list-2-line',
    permission: PERMISSIONS.VIEW_AUDIT_LOGS,
  },
  {
    path: '/it/security',
    label: 'Security',
    icon: 'ri-shield-keyhole-line',
    permission: PERMISSIONS.VIEW_IT_DASHBOARD,
  },
  {
    path: '/it/incidents',
    label: 'Incidents',
    icon: 'ri-alarm-warning-line',
    permission: PERMISSIONS.VIEW_SECURITY_LOGS,
  },
  {
    path: '/it/backups',
    label: 'Backups',
    icon: 'ri-cloud-line',
    permission: PERMISSIONS.MANAGE_INFRASTRUCTURE,
  },
  {
    path: '/analytics',
    label: 'Analytics',
    icon: 'ri-line-chart-line',
    permission: PERMISSIONS.VIEW_ANALYTICS,
  },
  {
    path: '/users',
    label: 'Users',
    icon: 'ri-user-line',
    permission: PERMISSIONS.VIEW_USERS,
  },
];
