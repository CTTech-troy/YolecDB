import { Permission, PERMISSIONS } from '@/types';
import { isSuperAdminRole, isMediaRole, isItRole, isEventRole } from '@/lib/roles';
import { mediaRoutes } from './mediaRoutes';
import { itRoutes } from './itRoutes';

export interface RouteConfig {
  path: string;
  label: string;
  icon: string;
  permission?: Permission;
  anyPermissions?: Permission[];
  requireSuperAdmin?: boolean;
  children?: RouteConfig[];
}

export interface SidebarSectionConfig {
  id: string;
  label: string;
  icon: string;
  items: RouteConfig[];
}

export interface SidebarNavigationConfig {
  items: RouteConfig[];
  sections: SidebarSectionConfig[];
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
    label: 'Blog Posts',
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
    label: 'All Events',
    icon: 'ri-calendar-event-line',
    permission: PERMISSIONS.MANAGE_EVENTS,
  },
  {
    path: '/gallery',
    label: 'Media Gallery',
    icon: 'ri-image-line',
    permission: PERMISSIONS.MANAGE_MEDIA,
  },
  {
    path: '/ads',
    label: 'Ad Campaigns',
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
    label: 'Contact Inbox',
    icon: 'ri-contacts-line',
    permission: PERMISSIONS.VIEW_CONTACTS,
  },
  {
    path: '/email',
    label: 'Email Campaigns',
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
    label: 'All Users',
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

const itNavRoutes = itRoutes.filter((r) => r.path.startsWith('/it'));

const dashboardItem: RouteConfig = {
  path: '/dashboard',
  label: 'Dashboard',
  icon: 'ri-dashboard-line',
  permission: PERMISSIONS.VIEW_DASHBOARD,
};

const ticketsRoute: RouteConfig = {
  path: '/tickets',
  label: 'Help Center',
  icon: 'ri-customer-service-2-line',
  anyPermissions: [
    PERMISSIONS.VIEW_TICKETS,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_IT_DASHBOARD,
    PERMISSIONS.VIEW_MEDIA_DASHBOARD,
  ],
};

const emailRoute: RouteConfig = {
  path: '/email',
  label: 'Email Campaigns',
  icon: 'ri-mail-send-line',
  anyPermissions: [
    PERMISSIONS.VIEW_EMAIL_AUDIENCE,
    PERMISSIONS.SEND_EMAIL,
    PERMISSIONS.MANAGE_EMAILS,
    PERMISSIONS.VIEW_SUBSCRIBERS,
  ],
};

const allEventsRoute: RouteConfig = {
  path: '/events',
  label: 'All Events',
  icon: 'ri-calendar-event-line',
  permission: PERMISSIONS.MANAGE_EVENTS,
};

const mediaGalleryRoute: RouteConfig = {
  path: '/gallery',
  label: 'Media Gallery',
  icon: 'ri-image-line',
  anyPermissions: [PERMISSIONS.MANAGE_MEDIA, PERMISSIONS.MANAGE_EVENTS],
};

const eventMomentsRoute: RouteConfig = {
  path: '/event-gallery',
  label: 'Event Moments',
  icon: 'ri-camera-lens-line',
  anyPermissions: [
    PERMISSIONS.MANAGE_MEDIA,
    PERMISSIONS.UPLOAD_MEDIA,
    PERMISSIONS.MODERATE_COMMENTS,
  ],
};

const supportRoute: RouteConfig = {
  path: '/contactme',
  label: 'Contact Support',
  icon: 'ri-contacts-line',
  permission: PERMISSIONS.VIEW_CONTACTS,
};

const registrationReportsRoute: RouteConfig = {
  path: '/blog-registrations?tab=blog',
  label: 'Blog Registrations',
  icon: 'ri-file-chart-line',
  permission: PERMISSIONS.VIEW_REGISTRATIONS,
};

export const adminSidebarNavigation: SidebarNavigationConfig = {
  items: [dashboardItem],
  sections: [
    {
      id: 'events',
      label: 'Events',
      icon: 'ri-calendar-event-line',
      items: [
        allEventsRoute,
        {
          path: '/events?action=create',
          label: 'Create Event',
          icon: 'ri-add-circle-line',
          permission: PERMISSIONS.CREATE_EVENT,
        },
        {
          path: '/blog-registrations?tab=event',
          label: 'Event Registrations',
          icon: 'ri-team-line',
          permission: PERMISSIONS.VIEW_REGISTRATIONS,
        },
        {
          path: '/events?view=analytics',
          label: 'Event Analytics',
          icon: 'ri-bar-chart-grouped-line',
          permission: PERMISSIONS.MANAGE_EVENTS,
        },
      ],
    },
    {
      id: 'users',
      label: 'Users',
      icon: 'ri-group-line',
      items: [
        {
          path: '/users',
          label: 'All Users',
          icon: 'ri-user-line',
          permission: PERMISSIONS.VIEW_USERS,
        },
        {
          path: '/roles',
          label: 'Roles',
          icon: 'ri-shield-user-line',
          permission: PERMISSIONS.MANAGE_ROLES,
        },
      ],
    },
    {
      id: 'content',
      label: 'Content Management',
      icon: 'ri-layout-4-line',
      items: [
        {
          path: '/blog',
          label: 'Blog Posts',
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
          path: '/media',
          label: 'Media Overview',
          icon: 'ri-dashboard-3-line',
          permission: PERMISSIONS.VIEW_MEDIA_DASHBOARD,
        },
        mediaGalleryRoute,
        eventMomentsRoute,
        {
          path: '/testimonials',
          label: 'Testimonials',
          icon: 'ri-chat-quote-line',
          permission: PERMISSIONS.MANAGE_TESTIMONIALS,
        },
        {
          path: '/ads',
          label: 'Ad Campaigns',
          icon: 'ri-advertisement-line',
          anyPermissions: [PERMISSIONS.MANAGE_ADS, PERMISSIONS.CREATE_AD],
        },
      ],
    },
    {
      id: 'communications',
      label: 'Communications',
      icon: 'ri-send-plane-line',
      items: [emailRoute],
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: 'ri-line-chart-line',
      items: [
        {
          path: '/analytics',
          label: 'Analytics',
          icon: 'ri-line-chart-line',
          permission: PERMISSIONS.VIEW_ANALYTICS,
        },
        registrationReportsRoute,
        {
          path: '/audit-logs',
          label: 'Activity Logs',
          icon: 'ri-file-list-2-line',
          permission: PERMISSIONS.VIEW_AUDIT_LOGS,
        },
      ],
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'ri-settings-3-line',
      items: [
        {
          path: '/it',
          label: 'System Settings',
          icon: 'ri-settings-3-line',
          permission: PERMISSIONS.VIEW_IT_DASHBOARD,
        },
        {
          path: '/it/api',
          label: 'API Health',
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
          path: '/it/logs',
          label: 'System Logs',
          icon: 'ri-terminal-box-line',
          permission: PERMISSIONS.VIEW_SYSTEM_LOGS,
        },
        {
          path: '/it/backups',
          label: 'Backups',
          icon: 'ri-cloud-line',
          permission: PERMISSIONS.MANAGE_INFRASTRUCTURE,
        },
        {
          path: '/it/audit',
          label: 'IT Audit Trail',
          icon: 'ri-file-search-line',
          permission: PERMISSIONS.VIEW_AUDIT_LOGS,
        },
      ],
    },
    {
      id: 'support',
      label: 'Support',
      icon: 'ri-lifebuoy-line',
      items: [ticketsRoute, supportRoute],
    },
  ],
};

export const mediaSidebarNavigation: SidebarNavigationConfig = {
  items: [
    dashboardItem,
    {
      path: '/media',
      label: 'Media Overview',
      icon: 'ri-dashboard-3-line',
      permission: PERMISSIONS.VIEW_MEDIA_DASHBOARD,
    },
  ],
  sections: [
    {
      id: 'content',
      label: 'Content Management',
      icon: 'ri-layout-4-line',
      items: [
        {
          path: '/blog',
          label: 'Blog Posts',
          icon: 'ri-article-line',
          permission: PERMISSIONS.MANAGE_BLOG,
        },
        allEventsRoute,
        mediaGalleryRoute,
        eventMomentsRoute,
        {
          path: '/testimonials',
          label: 'Testimonials',
          icon: 'ri-chat-quote-line',
          permission: PERMISSIONS.MANAGE_TESTIMONIALS,
        },
      ],
    },
    {
      id: 'support',
      label: 'Support',
      icon: 'ri-lifebuoy-line',
      items: [ticketsRoute],
    },
  ],
};

export const itSidebarNavigation: SidebarNavigationConfig = {
  items: [
    dashboardItem,
    {
      path: '/it',
      label: 'IT Overview',
      icon: 'ri-dashboard-3-line',
      permission: PERMISSIONS.VIEW_IT_DASHBOARD,
    },
  ],
  sections: [
    {
      id: 'support',
      label: 'Support',
      icon: 'ri-lifebuoy-line',
      items: [ticketsRoute],
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: 'ri-line-chart-line',
      items: [
        {
          path: '/analytics',
          label: 'Analytics',
          icon: 'ri-line-chart-line',
          permission: PERMISSIONS.VIEW_ANALYTICS,
        },
        {
          path: '/users',
          label: 'All Users',
          icon: 'ri-user-line',
          permission: PERMISSIONS.VIEW_USERS,
        },
      ],
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'ri-settings-3-line',
      items: [
        {
          path: '/it/api',
          label: 'API Health',
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
          path: '/it/logs',
          label: 'System Logs',
          icon: 'ri-terminal-box-line',
          permission: PERMISSIONS.VIEW_SYSTEM_LOGS,
        },
        {
          path: '/it/backups',
          label: 'Backups',
          icon: 'ri-cloud-line',
          permission: PERMISSIONS.MANAGE_INFRASTRUCTURE,
        },
        {
          path: '/it/audit',
          label: 'IT Audit Trail',
          icon: 'ri-file-search-line',
          permission: PERMISSIONS.VIEW_AUDIT_LOGS,
        },
      ],
    },
  ],
};

export const eventSidebarNavigation: SidebarNavigationConfig = {
  items: [dashboardItem],
  sections: [
    {
      id: 'events',
      label: 'Events',
      icon: 'ri-calendar-event-line',
      items: [
        allEventsRoute,
        {
          path: '/events?action=create',
          label: 'Create Event',
          icon: 'ri-add-circle-line',
          permission: PERMISSIONS.CREATE_EVENT,
        },
        {
          path: '/blog-registrations?tab=event',
          label: 'Event Registrations',
          icon: 'ri-team-line',
          permission: PERMISSIONS.VIEW_REGISTRATIONS,
        },
        {
          path: '/events?view=analytics',
          label: 'Event Analytics',
          icon: 'ri-bar-chart-grouped-line',
          permission: PERMISSIONS.MANAGE_EVENTS,
        },
      ],
    },
  ],
};

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
  if (isEventRole(roleName)) {
    return [
      dashboardItem,
      allEventsRoute,
      {
        path: '/events?action=create',
        label: 'Create Event',
        icon: 'ri-add-circle-line',
        permission: PERMISSIONS.CREATE_EVENT,
      },
      {
        path: '/blog-registrations?tab=event',
        label: 'Event Registrations',
        icon: 'ri-team-line',
        permission: PERMISSIONS.VIEW_REGISTRATIONS,
      },
    ];
  }
  return routes;
}

export function getNavRoutes(
  roleName: string | undefined,
  hasPermission: (permission: Permission) => boolean,
  isSuperAdmin: boolean
): RouteConfig[] {
  const base = getNavRoutesForRole(roleName);
  if (isSuperAdmin || isItRole(roleName) || isMediaRole(roleName) || isEventRole(roleName)) {
    return base;
  }
  if (hasPermission(PERMISSIONS.VIEW_IT_DASHBOARD)) {
    return mergeNavRoutes(itNavRoutes, base);
  }
  return base;
}

export function getSidebarNavigation(
  roleName: string | undefined
): SidebarNavigationConfig {
  if (isSuperAdminRole(roleName)) return adminSidebarNavigation;
  if (isMediaRole(roleName)) return mediaSidebarNavigation;
  if (isItRole(roleName)) return itSidebarNavigation;
  if (isEventRole(roleName)) return eventSidebarNavigation;
  return adminSidebarNavigation;
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

export function filterSidebarNavigationByPermissions(
  navigation: SidebarNavigationConfig,
  hasPermission: (permission: Permission) => boolean,
  hasAnyPermission: (...permissions: Permission[]) => boolean,
  isSuperAdmin: boolean,
  roleName?: string
): SidebarNavigationConfig {
  const items = filterRoutesByPermissions(
    navigation.items,
    hasPermission,
    hasAnyPermission,
    isSuperAdmin,
    roleName
  );

  const sections = navigation.sections
    .map((section) => ({
      ...section,
      items: filterRoutesByPermissions(
        section.items,
        hasPermission,
        hasAnyPermission,
        isSuperAdmin,
        roleName
      ),
    }))
    .filter((section) => section.items.length > 0);

  return { items, sections };
}
