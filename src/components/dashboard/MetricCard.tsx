import { useEffect, useState } from 'react';

export interface MetricCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: string;
  accent: 'blue' | 'violet' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'indigo' | 'pink';
}

const accentStyles = {
  blue: {
    icon: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
    ring: 'group-hover:ring-blue-500/20',
  },
  violet: {
    icon: 'bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400',
    ring: 'group-hover:ring-violet-500/20',
  },
  emerald: {
    icon: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
    ring: 'group-hover:ring-emerald-500/20',
  },
  amber: {
    icon: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
    ring: 'group-hover:ring-amber-500/20',
  },
  rose: {
    icon: 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400',
    ring: 'group-hover:ring-rose-500/20',
  },
  cyan: {
    icon: 'bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400',
    ring: 'group-hover:ring-cyan-500/20',
  },
  indigo: {
    icon: 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400',
    ring: 'group-hover:ring-indigo-500/20',
  },
  pink: {
    icon: 'bg-pink-500/10 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400',
    ring: 'group-hover:ring-pink-500/20',
  },
};

export function MetricCard({ title, value, subtitle, icon, accent }: MetricCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const styles = accentStyles[accent];

  useEffect(() => {
    if (value === 0) {
      setDisplayValue(0);
      return;
    }

    const duration = 1200;
    const steps = 40;
    const increment = value / steps;
    let current = 0;
    let frame = 0;

    const timer = setInterval(() => {
      frame += 1;
      current += increment;
      if (frame >= steps) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm ring-1 ring-transparent transition-all duration-300 hover:shadow-md hover:ring-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:hover:ring-slate-700 ${styles.ring}`}
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-slate-100 to-transparent opacity-60 dark:from-slate-800" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 tabular-nums dark:text-white">
            {displayValue.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}
        >
          <i className={`${icon} text-xl`} />
        </div>
      </div>
    </div>
  );
}
