/**
 * Main App component with TypeScript and RBAC
 */

import { lazy, Suspense } from 'react';
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
import { SetupPasswordPage } from '@/pages/SetupPassword';

import './global.css';

const DashboardPage = lazy(() => import('@/pages/Dashboard').then((m) => ({ default: m.DashboardPage })));
const BlogsPage = lazy(() => import('@/pages/Blogs').then((m) => ({ default: m.BlogsPage })));
const BlogEditorPage = lazy(() => import('@/pages/BlogEditor').then((m) => ({ default: m.BlogEditorPage })));
const AuthorsPage = lazy(() => import('@/pages/Authors').then((m) => ({ default: m.AuthorsPage })));
const CommentsModerationPage = lazy(() =>
  import('@/pages/CommentsModeration').then((m) => ({ default: m.CommentsModerationPage }))
);
const EventsPage = lazy(() => import('@/pages/Events').then((m) => ({ default: m.EventsPage })));
const ContactsPage = lazy(() => import('@/pages/Contacts').then((m) => ({ default: m.ContactsPage })));
const TestimonialsPage = lazy(() => import('@/pages/Testimonials').then((m) => ({ default: m.TestimonialsPage })));
const RegistrationsPage = lazy(() => import('@/pages/Registrations').then((m) => ({ default: m.RegistrationsPage })));
const EmailPage = lazy(() => import('@/pages/Email').then((m) => ({ default: m.EmailPage })));
const AnalyticsPage = lazy(() => import('@/pages/Analytics').then((m) => ({ default: m.AnalyticsPage })));
const UsersPage = lazy(() => import('@/pages/Users').then((m) => ({ default: m.UsersPage })));
const RolesPage = lazy(() => import('@/pages/Roles').then((m) => ({ default: m.RolesPage })));
const AuditLogsPage = lazy(() => import('@/pages/AuditLogs').then((m) => ({ default: m.AuditLogsPage })));
const GalleryPage = lazy(() => import('@/pages/Gallery').then((m) => ({ default: m.GalleryPage })));
const GalleryDetailPage = lazy(() => import('@/pages/GalleryDetail').then((m) => ({ default: m.GalleryDetailPage })));
const EventLivePage = lazy(() => import('@/pages/EventLive').then((m) => ({ default: m.EventLivePage })));
const AdsPage = lazy(() => import('@/pages/Ads').then((m) => ({ default: m.AdsPage })));
const TicketsPage = lazy(() => import('@/pages/Tickets').then((m) => ({ default: m.TicketsPage })));
const TicketDetailPage = lazy(() => import('@/pages/TicketDetail').then((m) => ({ default: m.TicketDetailPage })));
const MediaOverviewPage = lazy(() => import('@/pages/media/MediaOverview').then((m) => ({ default: m.MediaOverviewPage })));
const ITOverviewPage = lazy(() => import('@/pages/it/ITOverview').then((m) => ({ default: m.ITOverviewPage })));
const ITApiLatencyPage = lazy(() => import('@/pages/it/ITApiLatency').then((m) => ({ default: m.ITApiLatencyPage })));
const ITDatabasePage = lazy(() => import('@/pages/it/ITDatabase').then((m) => ({ default: m.ITDatabasePage })));
const ITAuditPage = lazy(() => import('@/pages/it/ITAudit').then((m) => ({ default: m.ITAuditPage })));
const ITIncidentsPage = lazy(() => import('@/pages/it/ITIncidents').then((m) => ({ default: m.ITIncidentsPage })));
const ITIncidentDetailPage = lazy(() => import('@/pages/it/ITIncidentDetail').then((m) => ({ default: m.ITIncidentDetailPage })));
const ITBackupsPage = lazy(() => import('@/pages/it/ITBackups').then((m) => ({ default: m.ITBackupsPage })));
const ITSecurityPage = lazy(() => import('@/pages/it/ITSecurity').then((m) => ({ default: m.ITSecurityPage })));
const ITLogsViewerPage = lazy(() => import('@/pages/it/ITLogsViewer').then((m) => ({ default: m.ITLogsViewerPage })));

function RouteFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
    </div>
  );
}

function AppContent() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <div className="min-h-dvh bg-slate-50 dark:bg-slate-950">
            <Suspense fallback={<RouteFallback />}>
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
                  path="/blog/new"
                  element={
                    <ProtectedRoute permission={PERMISSIONS.CREATE_POST}>
                      <BlogEditorPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/blog/:id/edit"
                  element={
                    <ProtectedRoute permission={PERMISSIONS.EDIT_POST}>
                      <BlogEditorPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/blog/authors"
                  element={
                    <ProtectedRoute permission={PERMISSIONS.MANAGE_BLOG}>
                      <AuthorsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/blog/comments"
                  element={
                    <ProtectedRoute permission={PERMISSIONS.MODERATE_COMMENTS}>
                      <CommentsModerationPage />
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
            </Suspense>

            <AppToaster />
          </div>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default AppContent;
