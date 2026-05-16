import { RouteConfig } from './routes';
import { PERMISSIONS } from '@/types';

export const mediaRoutes: RouteConfig[] = [
  {
    path: '/media',
    label: 'Overview',
    icon: 'ri-dashboard-3-line',
    permission: PERMISSIONS.VIEW_MEDIA_DASHBOARD,
  },
  {
    path: '/tickets',
    label: 'Tickets',
    icon: 'ri-kanban-view-2',
    permission: PERMISSIONS.VIEW_MEDIA_DASHBOARD,
  },
  {
    path: '/blog',
    label: 'Blog Posts',
    icon: 'ri-article-line',
    permission: PERMISSIONS.MANAGE_BLOG,
  },
  {
    path: '/events',
    label: 'Events & Live',
    icon: 'ri-live-line',
    permission: PERMISSIONS.MANAGE_EVENTS,
  },
  {
    path: '/gallery',
    label: 'Gallery & Uploads',
    icon: 'ri-image-line',
    permission: PERMISSIONS.MANAGE_MEDIA,
  },
  {
    path: '/testimonials',
    label: 'Announcements',
    icon: 'ri-megaphone-line',
    permission: PERMISSIONS.MANAGE_ANNOUNCEMENTS,
  },
];
