import { Link } from 'react-router-dom';
import { DashboardSummary } from '@/types';

interface RecentActivityProps {
  recentBlogs: DashboardSummary['recentBlogs'];
}

export function RecentActivity({ recentBlogs }: RecentActivityProps) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent blogs</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Latest published activity</p>
        </div>
        <Link
          to="/blog"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          View all
        </Link>
      </div>

      {recentBlogs.length > 0 ? (
        <ul className="flex-1 space-y-3">
          {recentBlogs.map((blog) => (
            <li
              key={blog.id}
              className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 transition-colors hover:border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50 dark:hover:border-slate-700"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900 dark:text-white">{blog.title}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {blog.date || 'No date'}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                  Blog
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-10 text-center dark:border-slate-700 dark:bg-slate-800/30">
          <i className="ri-article-line mb-3 text-3xl text-slate-400" />
          <p className="text-sm text-slate-500 dark:text-slate-400">No recent blog activity yet.</p>
          <Link
            to="/blog"
            className="mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            Create your first post
          </Link>
        </div>
      )}
    </div>
  );
}
