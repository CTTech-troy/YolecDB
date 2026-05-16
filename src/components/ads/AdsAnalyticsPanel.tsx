import { Card } from '@/components/ui';
import { useAdAnalytics } from '@/hooks/useAds';
import { PAGE_LABELS, type AdPage } from '@/config/adPlacements';

export function AdsAnalyticsPanel() {
  const { data, isLoading } = useAdAnalytics();

  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading analytics…</p>;
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs font-medium uppercase text-slate-500">Total ads</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{data.totalAds}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium uppercase text-slate-500">Active</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{data.activeAds}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium uppercase text-slate-500">Impressions</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            {data.totalImpressions.toLocaleString()}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium uppercase text-slate-500">CTR</p>
          <p className="mt-1 text-2xl font-bold text-cyan-600">{data.averageCtr}%</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">By page</h3>
          <ul className="space-y-2 text-sm">
            {Object.entries(data.byPage).map(([page, row]) => (
              <li
                key={page}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-900/50"
              >
                <span>{PAGE_LABELS[page as AdPage] ?? page}</span>
                <span className="tabular-nums text-slate-600 dark:text-slate-400">
                  {row.impressions} imp · {row.clicks} clk · {row.ctr}%
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">By device</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-900/50">
              <span>Desktop impressions</span>
              <span className="font-medium tabular-nums">{data.byDevice.desktop}</span>
            </li>
            <li className="flex justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-900/50">
              <span>Tablet impressions</span>
              <span className="font-medium tabular-nums">{data.byDevice.tablet}</span>
            </li>
            <li className="flex justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-900/50">
              <span>Mobile impressions</span>
              <span className="font-medium tabular-nums">{data.byDevice.mobile}</span>
            </li>
          </ul>
        </Card>
      </div>

      <Card padding="none" className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
              <th className="px-4 py-3 text-left">Ad</th>
              <th className="px-4 py-3 text-left">Placement</th>
              <th className="px-4 py-3 text-right">Impressions</th>
              <th className="px-4 py-3 text-right">Clicks</th>
              <th className="px-4 py-3 text-right">CTR</th>
            </tr>
          </thead>
          <tbody>
            {data.topAds.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No tracking data yet
                </td>
              </tr>
            ) : (
              data.topAds.map((ad) => (
                <tr key={ad.id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-3 font-medium">{ad.title}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {ad.page ? `${ad.page}${ad.section ? ` / ${ad.section}` : ''}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{ad.impressions}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{ad.clicks}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{ad.ctr}%</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
