/**
 * PermissionGate - Conditionally render children based on permissions
 */

import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Permission } from '@/types';

interface PermissionGateProps {
  children: ReactNode;
  permission?: Permission;
  anyPermissions?: Permission[];
  allPermissions?: Permission[];
  fallback?: ReactNode;
  requireSuperAdmin?: boolean;
}

/**
 * Renders children only if user has required permission(s)
 *
 * Usage:
 * <PermissionGate permission={PERMISSIONS.CREATE_POST}>
 *   <CreatePostButton />
 * </PermissionGate>
 *
 * <PermissionGate anyPermissions={[PERMISSIONS.EDIT_POST, PERMISSIONS.DELETE_POST]}>
 *   <EditControls />
 * </PermissionGate>
 */
export function PermissionGate({
  children,
  permission,
  anyPermissions,
  allPermissions,
  fallback = null,
  requireSuperAdmin = false,
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isSuperAdmin } = usePermissions();

  if (requireSuperAdmin && !isSuperAdmin) {
    return <>{fallback}</>;
  }

  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  if (anyPermissions && !hasAnyPermission(...anyPermissions)) {
    return <>{fallback}</>;
  }

  if (allPermissions && !hasAllPermissions(...allPermissions)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
