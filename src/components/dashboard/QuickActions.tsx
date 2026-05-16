import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { PERMISSIONS } from '@/types';

interface QuickAction {
  label: string;
  description: string;
  to: string;
  icon: string;
  permission?: (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
}

const actions: QuickAction[] = [
  {
    label: 'Manage blogs',
    description: 'Create and publish posts',
    to: '/blog',
    icon: 'ri-article-line',
    permission: PERMISSIONS.MANAGE_BLOG,
  },
  {
    label: 'View contacts',
    description: 'Review form submissions',
    to: '/contactme',
    icon: 'ri-contacts-line',
    permission: PERMISSIONS.VIEW_CONTACTS,
  },
  {
    label: 'Registrations',
    description: 'Blog and event signups',
    to: '/blog-registrations',
    icon: 'ri-file-list-line',
    permission: PERMISSIONS.VIEW_REGISTRATIONS,
  },
  {
    label: 'Analytics',
    description: 'Traffic and performance',
    to: '/analytics',
    icon: 'ri-line-chart-line',
    permission: PERMISSIONS.VIEW_ANALYTICS,
  },
];

export function QuickActions() {
  const { hasPermission, isSuperAdmin } = useAuth();

  const visible = actions.filter(
    (action) => isSuperAdmin || !action.permission || hasPermission(action.permission)
  );

  if (visible.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {visible.map((action) => (
        <Link
          key={action.to}
          to={action.to}
          className="group inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300"
        >
          <i className={`${action.icon} text-lg text-indigo-500 dark:text-indigo-400`} />
          <span>{action.label}</span>
          <i className="ri-arrow-right-line text-slate-400 transition-transform group-hover:translate-x-0.5" />
        </Link>
      ))}
    </div>
  );
}
