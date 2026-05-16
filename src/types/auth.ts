export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  roleId: string;
  roleName: string;
  permissions: string[];
  status: 'pending' | 'active' | 'deactivated';
}

export interface Role {
  id: string;
  name: string;
  displayName: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface UserMeta {
  uid: string;
  email: string;
  displayName: string;
  roleId: string;
  status: 'pending' | 'active' | 'deactivated';
  createdAt: number;
  updatedAt: number;
  lastLoginAt?: number;
  createdBy?: string;
}

export const PERMISSIONS = {
  CREATE_POST: 'create_post',
  EDIT_POST: 'edit_post',
  DELETE_POST: 'delete_post',
  PUBLISH_POST: 'publish_post',
  MANAGE_BLOG: 'manage_blog',
  UPLOAD_MEDIA: 'upload_media',
  DELETE_MEDIA: 'delete_media',
  MANAGE_MEDIA: 'manage_media',
  CREATE_EVENT: 'create_event',
  EDIT_EVENT: 'edit_event',
  DELETE_EVENT: 'delete_event',
  MANAGE_EVENTS: 'manage_events',
  CREATE_AD: 'create_ad',
  EDIT_AD: 'edit_ad',
  DELETE_AD: 'delete_ad',
  MANAGE_ADS: 'manage_ads',
  VIEW_USERS: 'view_users',
  CREATE_USER: 'create_user',
  EDIT_USER: 'edit_user',
  DEACTIVATE_USER: 'deactivate_user',
  MANAGE_USERS: 'manage_users',
  MANAGE_ROLES: 'manage_roles',
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_ANALYTICS: 'manage_analytics',
  VIEW_CONTACTS: 'view_contacts',
  VIEW_SUBSCRIBERS: 'view_subscribers',
  MANAGE_CONTACTS: 'manage_contacts',
  VIEW_EMAIL_AUDIENCE: 'view_email_audience',
  SEND_EMAIL: 'send_email',
  MANAGE_EMAILS: 'manage_emails',
  VIEW_REGISTRATIONS: 'view_registrations',
  DELETE_REGISTRATIONS: 'delete_registrations',
  MANAGE_TESTIMONIALS: 'manage_testimonials',
  VIEW_AUDIT_LOGS: 'view_audit_logs',
  SEND_NOTIFICATION: 'send_notification',
  MANAGE_NOTIFICATIONS: 'manage_notifications',
  VIEW_TICKETS: 'view_tickets',
  CREATE_TICKET: 'create_ticket',
  UPDATE_TICKET: 'update_ticket',
  ASSIGN_TICKET: 'assign_ticket',
  DELETE_TICKET: 'delete_ticket',
  MANAGE_TICKET_WORKFLOWS: 'manage_ticket_workflows',
  VIEW_DASHBOARD: 'view_dashboard',
  VIEW_MEDIA_DASHBOARD: 'view_media_dashboard',
  VIEW_IT_DASHBOARD: 'view_it_dashboard',
  MODERATE_COMMENTS: 'moderate_comments',
  MANAGE_ANNOUNCEMENTS: 'manage_announcements',
  MANAGE_HOMEPAGE: 'manage_homepage',
  VIEW_SYSTEM_HEALTH: 'view_system_health',
  VIEW_SECURITY_LOGS: 'view_security_logs',
  VIEW_SYSTEM_LOGS: 'view_system_logs',
  MANAGE_INFRASTRUCTURE: 'manage_infrastructure',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
