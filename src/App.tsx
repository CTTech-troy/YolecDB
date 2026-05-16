/**
 * Main App component with TypeScript and RBAC
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { queryClient } from '@/lib/queryClient';
import { AuthShell } from '@/components/layout/AuthShell';
import { AppToaster } from '@/components/layout/AppToaster';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { PERMISSIONS } from '@/types';

import { LoginPage } from '@/pages/Login';
import { DashboardPage } from '@/pages/Dashboard';
import { BlogsPage } from '@/pages/Blogs';
import { EventsPage } from '@/pages/Events';
import { ContactsPage } from '@/pages/Contacts';
import { TestimonialsPage } from '@/pages/Testimonials';
import { RegistrationsPage } from '@/pages/Registrations';
import { EmailPage } from '@/pages/Email';
import { AnalyticsPage } from '@/pages/Analytics';
import { UsersPage } from '@/pages/Users';
import { RolesPage } from '@/pages/Roles';
import { AuditLogsPage } from '@/pages/AuditLogs';
import { GalleryPage } from '@/pages/Gallery';
import { GalleryDetailPage } from '@/pages/GalleryDetail';
import { EventLivePage } from '@/pages/EventLive';
import { AdsPage } from '@/pages/Ads';
import { TicketsPage } from '@/pages/Tickets';
import { TicketDetailPage } from '@/pages/TicketDetail';
import { SetupPasswordPage } from '@/pages/SetupPassword';
import { MediaOverviewPage } from '@/pages/media/MediaOverview';
import { ITOverviewPage } from '@/pages/it/ITOverview';
import { ITApiLatencyPage } from '@/pages/it/ITApiLatency';
import { ITDatabasePage } from '@/pages/it/ITDatabase';
import { ITAuditPage } from '@/pages/it/ITAudit';
import { ITIncidentsPage } from '@/pages/it/ITIncidents';
import { ITIncidentDetailPage } from '@/pages/it/ITIncidentDetail';
import { ITBackupsPage } from '@/pages/it/ITBackups';
import { ITSecurityPage } from '@/pages/it/ITSecurity';
import { ITLogsViewerPage } from '@/pages/it/ITLogsViewer';

import './global.css';

function AppContent() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <div className="min-h-dvh bg-slate-50 dark:bg-slate-950">
            <Routes>
              <Route element={<AuthShell />}>
                <Route path="/" element={<LoginPage />} />
                <Route path="/setup-password" element={<SetupPasswordPage />} />

                <Route
                  path="/media"
                  element={
                    <ProtectedRoute permission={PERMISSIONS.VIEW_MEDIA_DASHBOARD}>
                      <MediaOverviewPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/it"
                  element={
                    <ProtectedRoute permission={PERMISSIONS.VIEW_IT_DASHBOARD}>
                      <ITOverviewPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/it/api"
                  element={
                    <ProtectedRoute permission={PERMISSIONS.VIEW_SYSTEM_HEALTH}>
                      <ITApiLatencyPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/it/database"
                  element={
                    <ProtectedRoute permission={PERMISSIONS.VIEW_SYSTEM_HEALTH}>
                      <ITDatabasePage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/it/audit"
                  element={
                    <ProtectedRoute permission={PERMISSIONS.VIEW_AUDIT_LOGS}>
                      <ITAuditPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/it/incidents"
                  element={
                    <ProtectedRoute permission={PERMISSIONS.VIEW_SECURITY_LOGS}>
                      <ITIncidentsPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/it/incidents/:id"
                  element={
                    <ProtectedRoute permission={PERMISSIONS.VIEW_SECURITY_LOGS}>
                      <ITIncidentDetailPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/it/backups"
                  element={
                    <ProtectedRoute permission={PERMISSIONS.MANAGE_INFRASTRUCTURE}>
                      <ITBackupsPage />
                    </ProtectedRoute>
                  }
                />

                <Route path="/it/health" element={<Navigate to="/it/api" replace />} />
                <Route
                  path="/it/security"
                  element={
                    <ProtectedRoute permission={PERMISSIONS.VIEW_IT_DASHBOARD}>
                      <ITSecurityPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/it/logs"
                  element={
                    <ProtectedRoute permission={PERMISSIONS.VIEW_SYSTEM_LOGS}>
                      <ITLogsViewerPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/it/infrastructure" element={<Navigate to="/it/backups" replace />} />

                <Route
                  path="/tickets"
                  element={
                    <ProtectedRoute
                      anyPermissions={[
                        PERMISSIONS.VIEW_TICKETS,
                        PERMISSIONS.VIEW_DASHBOARD,
                        PERMISSIONS.VIEW_IT_DASHBOARD,
                        PERMISSIONS.VIEW_MEDIA_DASHBOARD,
                      ]}
                    >
                      <TicketsPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/tickets/:id"
                  element={
                    <ProtectedRoute
                      anyPermissions={[
                        PERMISSIONS.VIEW_TICKETS,
                        PERMISSIONS.VIEW_DASHBOARD,
                        PERMISSIONS.VIEW_IT_DASHBOARD,
                        PERMISSIONS.VIEW_MEDIA_DASHBOARD,
                      ]}
                    >
                      <TicketDetailPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute permission={PERMISSIONS.VIEW_DASHBOARD}>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/dashbaor" element={<Navigate to="/dashboard" replace />} />

                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute permission={PERMISSIONS.VIEW_ANALYTICS}>
                      <AnalyticsPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/blog"
                  element={
                    <ProtectedRoute permission={PERMISSIONS.MANAGE_BLOG}>
                      <BlogsPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/blog-registrations"
                  element={
                    <ProtectedRoute permission={PERMISSIONS.VIEW_REGISTRATIONS}>
                      <RegistrationsPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/gallery"
                  element={
                    <ProtectedRoute
                      anyPermissions={[
                        PERMISSIONS.MANAGE_MEDIA,
                        PERMISSIONS.MANAGE_EVENTS,
                      ]}
                    >
                      <GalleryPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/gallery/:id"
                  element={
                    <ProtectedRoute
                      anyPermissions={[
                        PERMISSIONS.MANAGE_MEDIA,
                        PERMISSIONS.MANAGE_EVENTS,
                      ]}
                    >
                      <GalleryDetailPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/ads"
                  element={
                    <ProtectedRoute
                      anyPermissions={[
                        PERMISSIONS.MANAGE_ADS,
                        PERMISSIONS.CREATE_AD,
                      ]}
                    >
                      <AdsPage />
                    </ProtectedRoute>
                  }
                />

                <Route path="/newsletter" element={<Navigate to="/email" replace />} />

                <Route
                  path="/email"
                  element={
                    <ProtectedRoute
                      anyPermissions={[
                        PERMISSIONS.VIEW_EMAIL_AUDIENCE,
                        PERMISSIONS.SEND_EMAIL,
                        PERMISSIONS.MANAGE_EMAILS,
                        PERMISSIONS.VIEW_SUBSCRIBERS,
                      ]}
                    >
                      <EmailPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/testimonials"
                  element={
                    <ProtectedRoute permission={PERMISSIONS.MANAGE_TESTIMONIALS}>
                      <TestimonialsPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/events"
                  element={
                    <ProtectedRoute permission={PERMISSIONS.MANAGE_EVENTS}>
                      <EventsPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/events/:eventId/live"
                  element={
                    <ProtectedRoute permission={PERMISSIONS.MANAGE_EVENTS}>
                      <EventLivePage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/contactme"
                  element={
                    <ProtectedRoute permission={PERMISSIONS.VIEW_CONTACTS}>
                      <ContactsPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/users"
                  element={
                    <ProtectedRoute permission={PERMISSIONS.VIEW_USERS}>
                      <UsersPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/roles"
                  element={
                    <ProtectedRoute permission={PERMISSIONS.MANAGE_ROLES}>
                      <RolesPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/audit-logs"
                  element={
                    <ProtectedRoute permission={PERMISSIONS.VIEW_AUDIT_LOGS}>
                      <AuditLogsPage />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Routes>

            <AppToaster />
          </div>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default AppContent;
