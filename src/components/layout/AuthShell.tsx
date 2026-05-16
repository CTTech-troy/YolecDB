import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const PUBLIC_PATHS = new Set(['/', '/setup-password']);

export function AuthShell() {
  const { pathname } = useLocation();
  const isPublic = PUBLIC_PATHS.has(pathname);

  if (isPublic) {
    return <Outlet />;
  }

  return (
    <div className="flex min-h-dvh w-full min-w-0 overflow-x-hidden">
      <Sidebar />
      <DashboardLayout>
        <div className="dashboard-page">
          <Outlet />
        </div>
      </DashboardLayout>
    </div>
  );
}
