import { lazy, Suspense, useMemo } from 'react';
import CountUpCard from './src/component/CountUpCard.jsx';
import Loader from './src/ui/Loader.jsx';
import { useDashboardSummary } from './src/hooks/useDashboardSummary.js';

const OverviewChart = lazy(() => import('./src/analytics/OverviewChart.jsx'));

const chartData = [
  { date: '2025-07-01', visitors: 120, blogs: 5, testimonials: 2, likes: 30 },
  { date: '2025-07-02', visitors: 150, blogs: 4, testimonials: 3, likes: 40 },
  { date: '2025-07-03', visitors: 170, blogs: 6, testimonials: 1, likes: 35 },
  { date: '2025-07-04', visitors: 130, blogs: 3, testimonials: 2, likes: 45 },
  { date: '2025-07-05', visitors: 200, blogs: 7, testimonials: 4, likes: 50 },
  { date: '2025-07-06', visitors: 180, blogs: 5, testimonials: 3, likes: 60 },
  { date: '2025-07-07', visitors: 220, blogs: 6, testimonials: 5, likes: 55 },
];

export default function AdminDashboard() {
  const { summary, loading, error } = useDashboardSummary();

  const statsData = useMemo(
    () => [
      {
        title: 'Total Visitors',
        value: summary?.visitorCount ?? 0,
        change: 19.5,
        icon: 'ri-user-line',
        color: 'bg-blue-600',
      },
      {
        title: 'Total Blogs',
        value: summary?.blogCount ?? 0,
        change: 8.2,
        icon: 'ri-article-line',
        color: 'bg-green-600',
      },
      {
        title: 'Published Blogs',
        value: summary?.publishedBlogCount ?? 0,
        change: 5.8,
        icon: 'ri-book-open-line',
        color: 'bg-emerald-600',
      },
      {
        title: 'Total Testimonials',
        value: summary?.testimonialCount ?? 0,
        change: -2.3,
        icon: 'ri-chat-quote-line',
        color: 'bg-yellow-600',
      },
      {
        title: 'Published Models',
        value: summary?.modelImageCount ?? 0,
        change: 10.1,
        icon: 'ri-shapes-line',
        color: 'bg-purple-600',
      },
      {
        title: 'Subscribers',
        value: summary?.subscriberCount ?? 0,
        change: 12.5,
        icon: 'ri-mail-send-line',
        color: 'bg-indigo-600',
      },
    ],
    [summary]
  );

  if (loading) {
    return <Loader message="Opening dashboard…" />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6 py-12">
        <div className="max-w-xl rounded-3xl border border-red-100 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-900 mb-3">Unable to load dashboard</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Check your backend or network connection and refresh the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 min-w-0">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Welcome back! Here's what's happening with your site.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {statsData.map((stat, index) => (
          <CountUpCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Activity chart</h2>
            <p className="text-sm text-gray-500">Recent traffic and post performance overview.</p>
          </div>
          <div className="text-xs uppercase tracking-[0.25em] text-slate-500">Live summary</div>
        </div>

        <Suspense fallback={<div className="h-[320px] flex items-center justify-center text-gray-500">Loading chart…</div>}>
          <OverviewChart data={chartData} />
        </Suspense>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Recent blog activity</h2>
          {summary?.recentBlogs?.length ? (
            <ul className="space-y-3">
              {summary.recentBlogs.map((item) => (
                <li key={item.id} className="rounded-2xl border border-gray-100 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-500">{item.date || 'No date'}</p>
                    </div>
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">Blog</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
              No recent blog activity available yet.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
