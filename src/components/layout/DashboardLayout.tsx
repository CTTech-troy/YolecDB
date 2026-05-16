import { ReactNode } from 'react';
import { AppTopBar } from '@/components/layout/AppTopBar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="dashboard-main">
      <AppTopBar />
      <main className="dashboard-content">{children}</main>
    </div>
  );
}
