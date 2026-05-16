import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex min-w-0 flex-col gap-4 border-b border-slate-200/80 pb-6 sm:flex-row sm:items-start sm:justify-between dark:border-slate-800">
      <div className="min-w-0 flex-1">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
          {title}
        </h2>
        {description && (
          <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400 sm:text-base">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="w-full min-w-0 shrink-0 sm:w-auto sm:max-w-[50%] [&>button]:w-full [&>a]:w-full sm:[&>button]:w-auto sm:[&>a]:w-auto">
          {action}
        </div>
      )}
    </div>
  );
}
