import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';

const quickLinks = [
  { to: '/blog', label: 'Blog Posts', icon: 'ri-article-line', desc: 'Create and publish articles' },
  { to: '/events', label: 'Events & Live', icon: 'ri-live-line', desc: 'Event pages and livestreams' },
  { to: '/gallery', label: 'Gallery', icon: 'ri-image-line', desc: 'Upload and manage media' },
  { to: '/testimonials', label: 'Announcements', icon: 'ri-megaphone-line', desc: 'Site announcements' },
];

export function MediaOverviewPage() {
  const { authUser } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Media workspace"
        description={`Content tools for ${authUser?.displayName || authUser?.email || 'your team'}`}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {quickLinks.map((item) => (
          <Link key={item.to + item.label} to={item.to}>
            <Card className="h-full p-5 transition hover:border-indigo-300 hover:shadow-md dark:hover:border-indigo-500/40">
              <i className={`${item.icon} text-2xl text-indigo-600 dark:text-indigo-400`} />
              <h3 className="mt-3 font-semibold text-slate-900 dark:text-white">{item.label}</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
