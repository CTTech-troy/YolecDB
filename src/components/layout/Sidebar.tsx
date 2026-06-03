import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  filterSidebarNavigationByPermissions,
  getSidebarNavigation,
} from '@/config/routes';
import type { RouteConfig, SidebarSectionConfig } from '@/config/routes';
import { roleBadgeClass } from '@/lib/roleLabels';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { SITE_NAME } from '@/constants/brand';

function splitNavPath(path: string) {
  const [pathWithHash, queryWithHash = ''] = path.split('?');
  const pathname = pathWithHash.split('#')[0] || '/';
  const search = queryWithHash ? `?${queryWithHash.split('#')[0]}` : '';
  return { pathname, searchParams: new URLSearchParams(search) };
}

function routeMatchScore(route: RouteConfig, location: ReturnType<typeof useLocation>) {
  const { pathname, searchParams } = splitNavPath(route.path);
  const routeHasSearch = Array.from(searchParams.keys()).length > 0;

  if (routeHasSearch) {
    if (location.pathname !== pathname) return -1;
    const currentParams = new URLSearchParams(location.search);
    const matches = Array.from(searchParams.entries()).every(
      ([key, value]) => currentParams.get(key) === value
    );
    return matches ? 10000 + pathname.length + Array.from(searchParams.keys()).length : -1;
  }

  if (location.pathname === pathname && location.search === '') return 5000 + pathname.length;
  if (location.pathname.startsWith(`${pathname}/`)) return 1000 + pathname.length;
  return -1;
}

function flattenNavigationRoutes(
  items: RouteConfig[],
  sections: SidebarSectionConfig[]
): RouteConfig[] {
  return [...items, ...sections.flatMap((section) => section.items)];
}

function findActiveRoutePath(
  routes: RouteConfig[],
  location: ReturnType<typeof useLocation>
): string | null {
  let bestRoute: RouteConfig | null = null;
  let bestScore = -1;

  for (const route of routes) {
    const score = routeMatchScore(route, location);
    if (score > bestScore) {
      bestRoute = route;
      bestScore = score;
    }
  }

  return bestRoute?.path ?? null;
}

function NavItem({
  route,
  active,
  onNavigate,
}: {
  route: RouteConfig;
  active: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      to={route.path}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={`
        group relative flex min-h-9 items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium
        transition-all duration-150
        ${
          active
            ? 'bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-950'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white'
        }
      `}
    >
      <span
        className={`
          flex h-5 w-5 shrink-0 items-center justify-center text-[18px] leading-none
          ${active ? 'text-white dark:text-slate-950' : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'}
        `}
      >
        <i className={route.icon} />
      </span>
      <span className="min-w-0 flex-1 truncate text-left">{route.label}</span>
      {active && (
        <span className="absolute right-2 h-1.5 w-1.5 rounded-full bg-emerald-400 dark:bg-emerald-500" />
      )}
    </Link>
  );
}

export function Sidebar() {
  const location = useLocation();
  const { authUser, loading, hasPermission, hasAnyPermission, isSuperAdmin, signOut } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const visibleNavigation = useMemo(() => {
    if (loading) return { items: [], sections: [] };
    return filterSidebarNavigationByPermissions(
      getSidebarNavigation(authUser?.roleName),
      hasPermission,
      hasAnyPermission,
      isSuperAdmin,
      authUser?.roleName
    );
  }, [
    authUser?.roleName,
    hasAnyPermission,
    hasPermission,
    isSuperAdmin,
    loading,
  ]);
  const activeRoutePath = useMemo(
    () =>
      findActiveRoutePath(
        flattenNavigationRoutes(visibleNavigation.items, visibleNavigation.sections),
        location
      ),
    [location, visibleNavigation]
  );

  useEffect(() => {
    if (!isMobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMobileOpen]);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const closeMobileNav = () => setIsMobileOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed left-3 top-[max(0.75rem,env(safe-area-inset-top))] z-[60] flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-700 shadow-md transition hover:bg-slate-50 lg:hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        aria-label="Toggle menu"
        aria-expanded={isMobileOpen}
      >
        <i className={`text-xl ${isMobileOpen ? 'ri-close-line' : 'ri-menu-line'}`} />
      </button>

      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-dvh w-[min(16rem,calc(100vw-3rem))] max-w-[calc(100vw-3rem)] flex-col
          border-r border-slate-200/80 bg-white pt-[env(safe-area-inset-top)] shadow-2xl shadow-slate-900/10
          transition-transform duration-300 ease-in-out
          dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/30
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:w-64 lg:max-w-none lg:translate-x-0 lg:shadow-none
        `}
      >
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-200/80 px-4 dark:border-slate-800">
          <BrandLogo size="md" />
          <div className="min-w-0">
            <span className="font-semibold text-slate-900 dark:text-white">{SITE_NAME}</span>
            <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
              Admin
            </p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto overscroll-contain px-3 py-4 pb-[env(safe-area-inset-bottom)]">
          <div className="space-y-1">
            {visibleNavigation.items.map((route) => (
              <NavItem
                key={route.path}
                route={route}
                active={route.path === activeRoutePath}
                onNavigate={closeMobileNav}
              />
            ))}
          </div>

          <div className="mt-4 space-y-2">
            {visibleNavigation.sections.map((section) => {
              const active = section.items.some((item) => item.path === activeRoutePath);
              const expanded = active || !collapsedSections[section.id];

              return (
                <section key={section.id} className="space-y-1">
                  <button
                    type="button"
                    onClick={() =>
                      setCollapsedSections((current) => ({
                        ...current,
                        [section.id]: !current[section.id],
                      }))
                    }
                    className={`
                      flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[11px] font-semibold
                      uppercase tracking-wider transition-colors
                      ${
                        active
                          ? 'text-slate-900 dark:text-white'
                          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-500 dark:hover:bg-slate-900 dark:hover:text-slate-200'
                      }
                    `}
                    aria-expanded={expanded}
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center text-[16px] leading-none">
                      <i className={section.icon} />
                    </span>
                    <span className="min-w-0 flex-1 truncate">{section.label}</span>
                    <i
                      className={`ri-arrow-down-s-line text-base transition-transform duration-200 ${
                        expanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <div
                    className={`
                      grid transition-[grid-template-rows,opacity] duration-200 ease-out
                      ${expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}
                    `}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <div className="space-y-1 border-l border-slate-200 pl-2 dark:border-slate-800">
                        {section.items.map((route) => (
                          <NavItem
                            key={route.path}
                            route={route}
                            active={route.path === activeRoutePath}
                            onNavigate={closeMobileNav}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        </nav>

        <div className="shrink-0 space-y-3 border-t border-slate-200/80 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] dark:border-slate-800">
          {authUser && (
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-900/80">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">
                {authUser.displayName?.charAt(0).toUpperCase() ||
                  authUser.email?.charAt(0).toUpperCase() ||
                  'A'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                  {authUser.displayName || authUser.email || 'Admin user'}
                </p>
                <span className={`mt-1 inline-flex ${roleBadgeClass(authUser.roleName)}`}>
                  {authUser.roleName.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/30 dark:hover:text-red-400"
          >
            <span className="flex h-5 w-5 items-center justify-center text-[18px]">
              <i className="ri-logout-box-line" />
            </span>
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
        />
      )}
    </>
  );
}
