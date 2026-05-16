/**
 * Permission checking hooks
 */

import { useAuth } from '@/context/AuthContext';
import { Permission } from '@/types';

/**
 * Hook for permission-based UI rendering
 */
export function usePermissions() {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isSuperAdmin } = useAuth();

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isSuperAdmin,
  };
}

/**
 * Hook to check a single permission
 */
export function useHasPermission(permission: Permission): boolean {
  const { hasPermission } = useAuth();
  return hasPermission(permission);
}

/**
 * Hook to check if user has any of the permissions
 */
export function useHasAnyPermission(...permissions: Permission[]): boolean {
  const { hasAnyPermission } = useAuth();
  return hasAnyPermission(...permissions);
}

/**
 * Hook to check if user has all of the permissions
 */
export function useHasAllPermissions(...permissions: Permission[]): boolean {
  const { hasAllPermissions } = useAuth();
  return hasAllPermissions(...permissions);
}
