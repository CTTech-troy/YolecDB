import { useCallback, useEffect, useState } from 'react';
import * as blogRegistrationsApi from '../../services/blogRegistrationsApi.js';

function formatDate(ms) {
  if (!ms) return '—';
  try {
    return new Date(ms).toLocaleString();
  } catch {
    return '—';
  }
}

export default function BlogRegistrationsPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await blogRegistrationsApi.fetchBlogRegistrations();
      setGroups(Array.isArray(data?.groups) ? data.groups : []);
    } catch (e) {
      setError(e?.message || 'Failed to load registrations');
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <p className="text-center text-slate-500 dark:text-slate-400 py-12">Loading registrations…</p>;
  }

  if (error) {
    return <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>;
  }

  if (groups.length === 0) {
    return (
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Blog registrations</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm sm:text-base">No registrations yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 sm:space-y-10 min-w-0">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Blog registrations</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm sm:text-base">Entries grouped by blog</p>
      </div>

      {groups.map((g) => (
        <section key={g.blogId} className="dashboard-table-section">
          <div className="dashboard-table-section-header">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{g.blogTitle}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              <span className="font-medium text-slate-900 dark:text-white">{g.count}</span> registration
              {g.count === 1 ? '' : 's'}
            </p>
          </div>
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Number</th>
                  <th>School</th>
                  <th>Level</th>
                  <th>Location</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {(g.registrations || []).map((r) => (
                  <tr key={r.id}>
                    <td className="font-medium text-slate-900 dark:text-slate-100">{r.name || '—'}</td>
                    <td>{r.email || '—'}</td>
                    <td>{r.number || '—'}</td>
                    <td>{r.school || '—'}</td>
                    <td>{r.level || '—'}</td>
                    <td>{r.location || '—'}</td>
                    <td className="whitespace-nowrap text-slate-500 dark:text-slate-400">
                      {formatDate(r.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
