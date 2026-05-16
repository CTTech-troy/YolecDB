export const tableText = {
  primary: 'font-medium text-slate-900 dark:text-slate-100',
  secondary: 'text-sm text-slate-500 dark:text-slate-400',
  muted: 'text-sm text-slate-600 dark:text-slate-300',
};

const badgeBase = 'inline-flex px-2 py-1 text-xs font-medium rounded-full';

export const statusBadge = {
  success: `${badgeBase} bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300`,
  warning: `${badgeBase} bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300`,
  danger: `${badgeBase} bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300`,
  info: `${badgeBase} bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300`,
  neutral: `${badgeBase} bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300`,
  violet: `${badgeBase} bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-300`,
};

export const lifecycleBadge = {
  upcoming: statusBadge.info,
  ongoing: statusBadge.success,
  past: statusBadge.neutral,
};
