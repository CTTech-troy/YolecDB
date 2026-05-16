import { useDashboardSummary } from '@/hooks/useDashboardSummary';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle } from '@/components/ui';
import { MetricCard } from '@/components/dashboard/MetricCard';

export function AnalyticsPage() {
  const { data, isLoading, isError, refetch } = useDashboardSummary();

  if (isLoading) {
    return <p className="text-slate-500 dark:text-slate-400">Loading analytics…</p>;
  }

  if (isError || !data) {
    return (
      <div className="space-y-4">
        <PageHeader title="Analytics" description="Site metrics overview" />
        <p className="text-red-600 dark:text-red-400">Failed to load analytics.</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="text-sm text-indigo-600 hover:underline dark:text-indigo-400"
        >
          Retry
        </button>
      </div>
    );
  }

  const accents = ['blue', 'violet', 'emerald', 'amber', 'rose', 'cyan', 'indigo', 'pink'] as const;
  const metrics = [
    { title: 'Blog posts', value: data.blogCount, subtitle: 'Total', icon: 'ri-article-line' },
    {
      title: 'Published blogs',
      value: data.publishedBlogCount,
      subtitle: 'Live',
      icon: 'ri-book-open-line',
    },
    {
      title: 'Events / media',
      value: data.modelImageCount,
      subtitle: 'Items',
      icon: 'ri-calendar-event-line',
    },
    { title: 'Contacts', value: data.contactCount, subtitle: 'Inbox', icon: 'ri-contacts-line' },
    { title: 'Subscribers', value: data.subscriberCount, subtitle: 'Active', icon: 'ri-mail-line' },
    {
      title: 'Testimonials',
      value: data.testimonialCount,
      subtitle: 'Total',
      icon: 'ri-chat-quote-line',
    },
    {
      title: 'Blog registrations',
      value: data.blogRegistrationCount,
      subtitle: 'Sign-ups',
      icon: 'ri-file-list-line',
    },
    {
      title: 'Event registrations',
      value: data.eventRegistrationCount,
      subtitle: 'Sign-ups',
      icon: 'ri-group-line',
    },
  ].map((m, i) => ({ ...m, accent: accents[i % accents.length] }));

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Overview from live dashboard data" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <MetricCard key={m.title} {...m} />
        ))}
      </div>

      {data.recentBlogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent blog posts</CardTitle>
          </CardHeader>
          <ul className="divide-y divide-slate-200 dark:divide-slate-700">
            {data.recentBlogs.map((b) => (
              <li
                key={b.id}
                className="flex justify-between py-3 text-sm text-slate-700 dark:text-slate-300"
              >
                <span>{b.title}</span>
                <span className="text-slate-500">{b.date}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
