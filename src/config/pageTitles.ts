import { routes } from './routes';
import { itRoutes } from './itRoutes';
import { mediaRoutes } from './mediaRoutes';
import type { RouteConfig } from './routes';

const allNavRoutes: RouteConfig[] = [...itRoutes, ...mediaRoutes, ...routes];

function matchRoute(pathname: string, list: RouteConfig[]): RouteConfig | undefined {
  const exact = list.find((r) => r.path === pathname);
  if (exact) return exact;

  return list
    .filter((r) => r.path !== '/' && pathname.startsWith(`${r.path}/`))
    .sort((a, b) => b.path.length - a.path.length)[0];
}

export function resolvePageTitle(pathname: string): { section?: string; title: string } {
  if (pathname.match(/^\/gallery\/[^/]+$/)) {
    return { section: 'Media', title: 'Gallery details' };
  }
  if (pathname.match(/^\/events\/[^/]+\/live$/)) {
    return { section: 'Media', title: 'Live studio' };
  }

  if (pathname.startsWith('/it')) {
    const match = matchRoute(pathname, itRoutes);
    return { section: 'IT Operations', title: match?.label ?? 'Overview' };
  }

  if (pathname.startsWith('/media')) {
    const match = matchRoute(pathname, mediaRoutes);
    return { section: 'Media', title: match?.label ?? 'Overview' };
  }

  const match = matchRoute(pathname, allNavRoutes);
  return { title: match?.label ?? 'Dashboard' };
}
