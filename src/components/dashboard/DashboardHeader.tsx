import { useAuth } from '@/context/AuthContext';

function formatGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function DashboardHeader() {
  const { authUser } = useAuth();
  const name = authUser?.displayName?.split(' ')[0] || 'there';

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{formatDate()}</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          {formatGreeting()}, {name}
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Here&apos;s what&apos;s happening across your platform today.
        </p>
      </div>
      {authUser?.roleName && (
        <span className="inline-flex w-fit items-center rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-violet-700 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-300">
          {authUser.roleName.replace(/_/g, ' ')}
        </span>
      )}
    </div>
  );
}
