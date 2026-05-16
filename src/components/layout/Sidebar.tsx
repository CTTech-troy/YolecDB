/**
 * RBAC-aware Sidebar - Filters navigation based on user permissions
 */

import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { filterRoutesByPermissions, getNavRoutes } from '@/config/routes';
import { roleBadgeClass } from '@/lib/roleLabels';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { SITE_NAME } from '@/constants/brand';

export function Sidebar() {
  const location = useLocation();
  const { authUser, loading, hasPermission, hasAnyPermission, isSuperAdmin, signOut } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const visibleRoutes = loading
    ? []
    : filterRoutesByPermissions(
        getNavRoutes(authUser?.roleName, hasPermission, isSuperAdmin),
        hasPermission,
        hasAnyPermission,
        isSuperAdmin,
        authUser?.roleName
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

  return (
    <>
      <button
        type="button"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed left-3 top-[max(0.75rem,env(safe-area-inset-top))] z-[60] flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-700 shadow-md lg:hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        aria-label="Toggle menu"
        aria-expanded={isMobileOpen}
      >
        <i className={`text-xl ${isMobileOpen ? 'ri-close-line' : 'ri-menu-line'}`} />
      </button>

      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-dvh w-[min(16rem,calc(100vw-3rem))] max-w-[calc(100vw-3rem)] flex-col
          border-r border-slate-200/80 bg-white pt-[env(safe-area-inset-top)]
          transition-transform duration-300 ease-in-out
          dark:border-slate-800 dark:bg-slate-950
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:w-64 lg:max-w-none lg:translate-x-0
        `}
      >
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-200/80 px-5 dark:border-slate-800">
          <BrandLogo size="md" />
          <div className="min-w-0">
            <span className="font-semibold text-slate-900 dark:text-white">{SITE_NAME}</span>
            <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
              Admin
            </p>
          </div>
        </div>

        {authUser && (
          <div className="shrink-0 border-b border-slate-200/80 px-4 py-4 dark:border-slate-800">
            <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Your session
            </p>
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-900/80">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-semibold text-white">
                {authUser.displayName?.charAt(0).toUpperCase() ||
                  authUser.email?.charAt(0).toUpperCase() ||
                  'A'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                  {authUser.displayName || authUser.email || 'Admin user'}
                </p>
                {authUser.email && authUser.displayName && (
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {authUser.email}
                  </p>
                )}
                <span className={`mt-1.5 inline-flex ${roleBadgeClass(authUser.roleName)}`}>
                  {authUser.roleName.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 space-y-1 overflow-y-auto overscroll-contain p-3 pb-[env(safe-area-inset-bottom)]">
          {visibleRoutes.map((route) => {
            const isActive =
              route.path === '/it'
                ? location.pathname === '/it'
                : location.pathname === route.path ||
                  location.pathname.startsWith(`${route.path}/`);

            return (
              <Link
                key={route.path}
                to={route.path}
                onClick={() => setIsMobileOpen(false)}
                className={`
                  flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all
                  ${
                    isActive
                      ? 'bg-indigo-50 font-medium text-indigo-700 shadow-sm ring-1 ring-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-300 dark:ring-indigo-900/50'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white'
                  }
                `}
              >
                <i className={`${route.icon} shrink-0 text-lg`} />
                <span className="truncate">{route.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-slate-200/80 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] dark:border-slate-800">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/30 dark:hover:text-red-400"
          >
            <i className="ri-logout-box-line text-lg" />
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
