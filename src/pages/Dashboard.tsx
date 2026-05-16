/**
 * Dashboard overview — premium SaaS layout
 */

import { useMemo } from 'react';
import { useDashboardSummary } from '@/hooks/useDashboardSummary';
import { DashboardSummary } from '@/types';
import {
  DashboardHeader,
  DashboardSkeleton,
  MetricCard,
  ContentOverviewChart,
  RecentActivity,
  QuickActions,
} from '@/components/dashboard';
import { Button } from '@/components/ui';

function buildMetrics(summary: DashboardSummary) {
  const publishRate =
    summary.blogCount > 0
      ? Math.round((summary.publishedBlogCount / summary.blogCount) * 100)
      : 0;

  return [
    {
      title: 'Total blogs',
      value: summary.blogCount,
      subtitle: `${summary.publishedBlogCount} published`,
      icon: 'ri-article-line',
      accent: 'blue' as const,
    },
    {
      title: 'Published blogs',
      value: summary.publishedBlogCount,
      subtitle: `${publishRate}% publish rate`,
      icon: 'ri-book-open-line',
      accent: 'emerald' as const,
    },
    {
      title: 'Testimonials',
      value: summary.testimonialCount,
      subtitle: 'Social proof items',
      icon: 'ri-chat-quote-line',
      accent: 'amber' as const,
    },
    {
      title: 'Gallery images',
      value: summary.modelImageCount,
      subtitle: 'Media library assets',
      icon: 'ri-image-line',
      accent: 'violet' as const,
    },
    {
      title: 'Contacts',
      value: summary.contactCount,
      subtitle: 'Form submissions',
      icon: 'ri-contacts-line',
      accent: 'cyan' as const,
    },
    {
      title: 'Subscribers',
      value: summary.subscriberCount,
      subtitle: 'Newsletter list',
      icon: 'ri-mail-line',
      accent: 'indigo' as const,
    },
    {
      title: 'Blog registrations',
      value: summary.blogRegistrationCount,
      subtitle: 'Signups from blog posts',
      icon: 'ri-file-list-line',
      accent: 'rose' as const,
    },
    {
      title: 'Event registrations',
      value: summary.eventRegistrationCount,
      subtitle: 'Signups from events',
      icon: 'ri-calendar-event-line',
      accent: 'pink' as const,
    },
  ];
}

export function DashboardPage() {
  const { data: summary, isLoading, isError, error, refetch, isFetching } = useDashboardSummary();

  const metrics = useMemo(
    () => (summary ? buildMetrics(summary) : []),
    [summary]
  );

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError || !summary) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <div className="max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm dark:border-red-900/50 dark:bg-slate-900">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <i className="ri-error-warning-line text-2xl text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Unable to load dashboard
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {error instanceof Error ? error.message : 'Something went wrong. Check your connection.'}
          </p>
          <Button className="mt-6" onClick={() => refetch()} loading={isFetching}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <DashboardHeader />
        <QuickActions />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <ContentOverviewChart summary={summary} />
        <RecentActivity recentBlogs={summary.recentBlogs} />
      </div>
    </div>
  );
}
