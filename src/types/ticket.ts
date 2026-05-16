export type TicketRole = 'SUPER_ADMIN' | 'IT_TEAM' | 'MEDIA';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketStatus = 'todo' | 'in_progress' | 'qa_verify' | 'done';
export type TicketCategory =
  | 'infrastructure'
  | 'security'
  | 'server_incident'
  | 'api_issue'
  | 'cache'
  | 'deployment'
  | 'content_review'
  | 'blog_publishing'
  | 'event_media'
  | 'banner_update'
  | 'social_campaign'
  | 'general';

export interface TicketAttachment {
  id: string;
  name: string;
  url: string;
  type?: string;
  size?: number;
  uploadedBy: string;
  uploadedAt: number;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  message: string;
  mentions?: string[];
  createdAt: number;
}

export interface TicketActivity {
  id: string;
  at: number;
  action: string;
  message: string;
  actorUid?: string;
  actorEmail?: string;
}

export interface Ticket {
  id: string;
  ticketId: string;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo?: string;
  assignedToName?: string;
  assignedToEmail?: string;
  assignedRole: TicketRole;
  createdBy: string;
  createdByEmail?: string;
  labels: string[];
  attachments: TicketAttachment[];
  comments: TicketComment[];
  activity: TicketActivity[];
  category: TicketCategory;
  dueDate?: number;
  source?: 'manual' | 'incident' | 'monitoring';
  sourceIncidentId?: string;
  createdAt: number;
  updatedAt: number;
  resolvedAt?: number;
}

export interface TicketUserOption {
  id: string;
  fullName: string;
  email: string;
  role: TicketRole;
  avatar?: string;
}

export interface TicketSummary {
  open: number;
  closed: number;
  overdue: number;
  resolutionRate: number;
  avgResolutionMs: number | null;
  byRole: Record<TicketRole, number>;
  byStatus: Record<TicketStatus, number>;
  byPriority: Record<TicketPriority, number>;
  completionTrend: Array<{ date: string; done: number; created: number }>;
  teamPerformance: Array<{ role: TicketRole; assigned: number; done: number; overdue: number }>;
}

export interface TicketFilters {
  status?: TicketStatus;
  priority?: TicketPriority;
  role?: TicketRole;
  assignedTo?: string;
  search?: string;
  from?: number;
  to?: number;
}

export interface CreateTicketPayload {
  title: string;
  description: string;
  priority: TicketPriority;
  assignedTo?: string;
  assignedRole: TicketRole;
  dueDate?: number;
  attachments: Array<{ name: string; url: string; type?: string; size?: number }>;
  labels: string[];
  category: TicketCategory;
}
