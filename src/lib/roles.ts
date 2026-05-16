export function isSuperAdminRole(roleName: string | undefined): boolean {
  return roleName === 'SUPER_ADMIN' || roleName === 'super_admin';
}

export function isMediaRole(roleName: string | undefined): boolean {
  return roleName === 'MEDIA' || roleName === 'media_team';
}

export function isItRole(roleName: string | undefined): boolean {
  if (!roleName) return false;
  const n = roleName.toLowerCase().replace(/\s+/g, '_');
  return n === 'it_team' || n === 'ict_team';
}

export function getDefaultHomeRoute(roleName: string | undefined): string {
  if (isSuperAdminRole(roleName)) return '/dashboard';
  if (isMediaRole(roleName)) return '/media';
  if (isItRole(roleName)) return '/it';
  return '/dashboard';
}
