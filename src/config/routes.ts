/**
 * Route configuration with RBAC permissions
 */

import { Permission, PERMISSIONS } from '@/types';

export interface RouteConfig {
  path: string;
  label: string;
  icon: string;
  permission?: Permission;
  anyPermissions?: Permission[];
  requireSuperAdmin?: boolean;
  children?: RouteConfig[];
}

/**
 * Dashboard navigation routes
 * Routes are filtered based on user permissions
 */
export const routes: RouteConfig[] = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: 'ri-dashboard-line',
    permission: PERMISSIONS.VIEW_DASHBOARD,
  },
  {
    path: '/analytics',
    label: 'Analytics',
    icon: 'ri-line-chart-line',
    permission: PERMISSIONS.VIEW_ANALYTICS,
  },
  {
    path: '/blog',
    label: 'Blog',
    icon: 'ri-article-line',
    permission: PERMISSIONS.MANAGE_BLOG,
  },
  {
    path: '/blog/authors',
    label: 'Authors',
    icon: 'ri-user-star-line',
    permission: PERMISSIONS.MANAGE_BLOG,
  },
  {
    path: '/blog/comments',
    label: 'Comments',
    icon: 'ri-chat-check-line',
    permission: PERMISSIONS.MODERATE_COMMENTS,
  },
  {
    path: '/events',
    label: 'Events',
    icon: 'ri-calendar-event-line',
    permission: PERMISSIONS.MANAGE_EVENTS,
  },
  {
    path: '/gallery',
    label: 'Gallery',
    icon: 'ri-image-line',
    permission: PERMISSIONS.MANAGE_MEDIA,
  },
  {
    path: '/ads',
    label: 'Ads',
    icon: 'ri-advertisement-line',
    anyPermissions: [PERMISSIONS.MANAGE_ADS, PERMISSIONS.CREATE_AD],
  },
  {
    path: '/tickets',
    label: 'Tickets',
    icon: 'ri-kanban-view-2',
    anyPermissions: [
      PERMISSIONS.VIEW_TICKETS,
      PERMISSIONS.VIEW_DASHBOARD,
      PERMISSIONS.VIEW_IT_DASHBOARD,
      PERMISSIONS.VIEW_MEDIA_DASHBOARD,
    ],
  },
  {
    path: '/testimonials',
    label: 'Testimonials',
    icon: 'ri-chat-quote-line',
    permission: PERMISSIONS.MANAGE_TESTIMONIALS,
  },
  {
    path: '/blog-registrations',
    label: 'Registrations',
    icon: 'ri-file-list-line',
    permission: PERMISSIONS.VIEW_REGISTRATIONS,
  },
  {
    path: '/contactme',
    label: 'Contacts',
    icon: 'ri-contacts-line',
    permission: PERMISSIONS.VIEW_CONTACTS,
  },
  {
    path: '/email',
    label: 'Email',
    icon: 'ri-mail-send-line',
    anyPermissions: [
      PERMISSIONS.VIEW_EMAIL_AUDIENCE,
      PERMISSIONS.SEND_EMAIL,
      PERMISSIONS.MANAGE_EMAILS,
      PERMISSIONS.VIEW_SUBSCRIBERS,
    ],
  },
  {
    path: '/users',
    label: 'Users',
    icon: 'ri-user-line',
    permission: PERMISSIONS.VIEW_USERS,
  },
  {
    path: '/roles',
    label: 'Roles',
    icon: 'ri-shield-user-line',
    permission: PERMISSIONS.MANAGE_ROLES,
  },
  {
    path: '/audit-logs',
    label: 'Audit Logs',
    icon: 'ri-file-list-2-line',
    permission: PERMISSIONS.VIEW_AUDIT_LOGS,
  },
];

import { isSuperAdminRole, isMediaRole, isItRole } from '@/lib/roles';
import { mediaRoutes } from './mediaRoutes';
import { itRoutes } from './itRoutes';

const itNavRoutes = itRoutes.filter((r) => r.path.startsWith('/it'));

function mergeNavRoutes(...groups: RouteConfig[][]): RouteConfig[] {
  const merged: RouteConfig[] = [];
  const seen = new Set<string>();
  for (const group of groups) {
    for (const route of group) {
      if (seen.has(route.path)) continue;
      seen.add(route.path);
      merged.push(route);
    }
  }
  return merged;
}

export function getNavRoutesForRole(roleName: string | undefined): RouteConfig[] {
  if (isSuperAdminRole(roleName)) {
    return mergeNavRoutes(itNavRoutes, routes);
  }
  if (isMediaRole(roleName)) return mediaRoutes;
  if (isItRole(roleName)) return itRoutes;
  return routes;
}

export function getNavRoutes(
  roleName: string | undefined,
  hasPermission: (permission: Permission) => boolean,
  isSuperAdmin: boolean
): RouteConfig[] {
  const base = getNavRoutesForRole(roleName);
  if (isSuperAdmin || isItRole(roleName) || isMediaRole(roleName)) {
    return base;
  }
  if (hasPermission(PERMISSIONS.VIEW_IT_DASHBOARD)) {
    return mergeNavRoutes(itNavRoutes, base);
  }
  return base;
}

/**
 * Filter routes based on user permissions
 */
export function filterRoutesByPermissions(
  routes: RouteConfig[],
  hasPermission: (permission: Permission) => boolean,
  hasAnyPermission: (...permissions: Permission[]) => boolean,
  isSuperAdmin: boolean,
  roleName?: string
): RouteConfig[] {
  return routes.filter((route) => {
    if (isSuperAdmin) return true;

    if (roleName && isItRole(roleName) && route.path.startsWith('/it')) {
      return true;
    }

    if (route.requireSuperAdmin) return false;

    // Check single permission
    if (route.permission && !hasPermission(route.permission)) {
      return false;
    }

    // Check any permissions
    if (route.anyPermissions && !hasAnyPermission(...route.anyPermissions)) {
      return false;
    }

    return true;
  });
}
