import type { Role } from '@/types';

const ROLE_DESCRIPTIONS: Record<string, string> = {
  SUPER_ADMIN: 'Full access to all dashboard features',
  super_admin: 'Full access to all dashboard features',
  IT_TEAM: 'IT operations: health, security, logs, infrastructure',
  ict_team: 'IT operations: health, security, logs, infrastructure',
  MEDIA: 'Content only: blog, events, gallery, announcements',
  media_team: 'Content only: blog, events, gallery, announcements',
};

export function getRoleDescription(role?: Pick<Role, 'name' | 'displayName'> | null): string {
  if (!role) return '';
  return ROLE_DESCRIPTIONS[role.name] || role.displayName;
}

export function formatRoleLabel(role: Role): string {
  const code = role.name.toUpperCase().replace('MEDIA_TEAM', 'MEDIA').replace('ICT_TEAM', 'IT_TEAM');
  return `${role.displayName} (${code})`;
}

export function roleBadgeClass(roleName?: string): string {
  const base = 'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold';
  if (roleName === 'SUPER_ADMIN' || roleName === 'super_admin') {
    return `${base} bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300`;
  }
  if (roleName === 'IT_TEAM' || roleName === 'ict_team') {
    return `${base} bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300`;
  }
  if (roleName === 'MEDIA' || roleName === 'media_team') {
    return `${base} bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300`;
  }
  return `${base} bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300`;
}
