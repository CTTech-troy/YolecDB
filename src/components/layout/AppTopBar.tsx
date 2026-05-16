import { useLocation } from 'react-router-dom';
import { resolvePageTitle } from '@/config/pageTitles';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

export function AppTopBar() {
  const location = useLocation();
  const { section, title } = resolvePageTitle(location.pathname);

  return (
    <header className="dashboard-topbar">
      <div className="min-w-0 flex-1">
        {section && (
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {section}
          </p>
        )}
        <h1 className="truncate text-lg font-semibold text-slate-900 sm:text-xl dark:text-white">
          {title}
        </h1>
      </div>
      <div className="shrink-0">
        <ThemeToggle />
      </div>
    </header>
  );
}
