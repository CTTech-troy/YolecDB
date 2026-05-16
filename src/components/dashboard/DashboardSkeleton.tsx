export function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="space-y-3">
        <div className="h-4 w-48 rounded-lg bg-slate-200 dark:bg-slate-800" />
        <div className="h-9 w-72 max-w-full rounded-lg bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-96 max-w-full rounded-lg bg-slate-200 dark:bg-slate-800" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-[132px] rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900"
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="h-[360px] rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900" />
        <div className="h-[360px] rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900" />
      </div>
    </div>
  );
}
