/**
 * ProtectedRoute - Requires authentication and optionally specific permissions
 */

import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Permission } from '@/types';
import { BrandLogo } from '@/components/layout/BrandLogo';

interface ProtectedRouteProps {
  children: ReactNode;
  permission?: Permission;
  anyPermissions?: Permission[];
  allPermissions?: Permission[];
  requireSuperAdmin?: boolean;
}

/**
 * Protects a route by requiring authentication and optional permissions
 *
 * Usage:
 * <Route path="/blog" element={
 *   <ProtectedRoute permission={PERMISSIONS.MANAGE_BLOG}>
 *     <BlogPage />
 *   </ProtectedRoute>
 * } />
 */
export function ProtectedRoute({
  children,
  permission,
  anyPermissions,
  allPermissions,
  requireSuperAdmin = false,
}: ProtectedRouteProps) {
  const { user, authUser, loading, hasPermission, hasAnyPermission, hasAllPermissions, isSuperAdmin } = useAuth();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <BrandLogo size="lg" />
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!authUser) {
    return (
      <div className="flex items-center justify-center min-h-screen px-6">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Account not activated
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            You are signed in but this account does not have dashboard access yet. Ask an
            administrator to run{' '}
            <code className="text-sm bg-gray-200 dark:bg-gray-700 px-1 rounded">
              npm run set-admin -- your-email
            </code>{' '}
            in the backend project.
          </p>
        </div>
      </div>
    );
  }

  // Check super admin requirement
  if (requireSuperAdmin && !isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400">This page requires super admin privileges.</p>
        </div>
      </div>
    );
  }

  // Check single permission
  if (permission && !hasPermission(permission)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400">You don&apos;t have permission to access this page.</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">Required: {permission}</p>
        </div>
      </div>
    );
  }

  // Check any permissions
  if (anyPermissions && !hasAnyPermission(...anyPermissions)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400">You don&apos;t have the required permissions.</p>
        </div>
      </div>
    );
  }

  // Check all permissions
  if (allPermissions && !hasAllPermissions(...allPermissions)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400">You don&apos;t have all the required permissions.</p>
        </div>
      </div>
    );
  }

  // User has required permissions
  return <>{children}</>;
}
