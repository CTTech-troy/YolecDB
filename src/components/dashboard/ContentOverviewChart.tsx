import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTheme } from '@/context/ThemeContext';
import { DashboardSummary } from '@/types';

interface ContentOverviewChartProps {
  summary: DashboardSummary;
}

export function ContentOverviewChart({ summary }: ContentOverviewChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const data = [
    { name: 'Blogs', value: summary.blogCount },
    { name: 'Published', value: summary.publishedBlogCount },
    { name: 'Testimonials', value: summary.testimonialCount },
    { name: 'Gallery', value: summary.modelImageCount },
    { name: 'Contacts', value: summary.contactCount },
    { name: 'Subscribers', value: summary.subscriberCount },
    { name: 'Blog regs', value: summary.blogRegistrationCount },
    { name: 'Event regs', value: summary.eventRegistrationCount },
  ];

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Content overview</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Distribution of content and engagement across your site
        </p>
      </div>
      <div className="h-[280px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-slate-200 dark:stroke-slate-700"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: 'currentColor' }}
              className="text-slate-500 dark:text-slate-400"
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'currentColor' }}
              className="text-slate-500 dark:text-slate-400"
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                background: isDark ? '#0f172a' : '#ffffff',
                color: isDark ? '#e2e8f0' : '#0f172a',
              }}
              cursor={{ fill: isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.08)' }}
            />
            <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={48} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
