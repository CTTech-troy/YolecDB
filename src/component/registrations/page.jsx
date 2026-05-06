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
    return <p className="text-center text-gray-500 py-12">Loading registrations…</p>;
  }

  if (error) {
    return <p className="text-red-600 text-sm">{error}</p>;
  }

  if (groups.length === 0) {
    return (
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Blog registrations</h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">No registrations yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 sm:space-y-10 min-w-0">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Blog registrations</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">Entries grouped by blog</p>
      </div>

      {groups.map((g) => (
        <section key={g.blogId} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50 px-4 py-3 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-semibold text-gray-900">{g.blogTitle}</h2>
            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-900">{g.count}</span> registration
              {g.count === 1 ? '' : 's'}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 border-b border-gray-100">
                  <th className="px-4 py-2 font-medium">Name</th>
                  <th className="px-4 py-2 font-medium">Email</th>
                  <th className="px-4 py-2 font-medium">Number</th>
                  <th className="px-4 py-2 font-medium">School</th>
                  <th className="px-4 py-2 font-medium">Level</th>
                  <th className="px-4 py-2 font-medium">Location</th>
                  <th className="px-4 py-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {(g.registrations || []).map((r) => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/80">
                    <td className="px-4 py-2 text-gray-900">{r.name || '—'}</td>
                    <td className="px-4 py-2 text-gray-700">{r.email || '—'}</td>
                    <td className="px-4 py-2 text-gray-700">{r.number || '—'}</td>
                    <td className="px-4 py-2 text-gray-700">{r.school || '—'}</td>
                    <td className="px-4 py-2 text-gray-700">{r.level || '—'}</td>
                    <td className="px-4 py-2 text-gray-700">{r.location || '—'}</td>
                    <td className="px-4 py-2 text-gray-600 whitespace-nowrap">
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
