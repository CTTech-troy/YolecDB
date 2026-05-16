/**
 * API response types matching backend
 */

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiError {
  error: string;
  code?: string;
  details?: unknown;
}

/**
 * Blog types
 */
export interface Blog {
  id: string;
  title: string;
  content: string;
  image?: string;
  category?: string;
  excerpt?: string;
  slug?: string;
  author?: string;
  date?: string;
  publish: boolean;
  registrationEnabled?: boolean;
  whatsappLink?: string;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateBlogDto {
  title: string;
  content: string;
  image?: string;
  category?: string;
  excerpt?: string;
  author?: string;
  date?: string;
  publish?: boolean;
  registrationEnabled?: boolean;
  whatsappLink?: string;
  tags?: string[];
}

/**
 * Event types
 */
export interface Event {
  id: string;
  title: string;
  url: string;
  date: string;
  description?: string;
  category?: string;
  location?: string;
  eventLifecycle?: 'upcoming' | 'ongoing' | 'past';
  publish: boolean;
  isLive?: boolean;
  registrationEnabled?: boolean;
  whatsappLink?: string;
  agenda?: EventAgendaItem[];
  speakers?: EventSpeaker[];
  venue?: EventVenue;
  createdAt: number;
  updatedAt: number;
  createdBy?: string;
  updatedBy?: string;
}

export interface EventAgendaItem {
  time: string;
  title: string;
  description?: string;
  speaker?: string;
}

export interface EventSpeaker {
  name: string;
  title?: string;
  bio?: string;
  photo?: string;
}

export interface EventVenue {
  name: string;
  address?: string;
  mapUrl?: string;
}

/**
 * Contact types
 */
export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  category?: string;
  eventTitle?: string;
  eventId?: string;
  registeredAt?: string;
  source?: string;
  timestamp: number;
  categoryDetails?: ContactCategoryDetails;
  _source?: 'contacts' | 'contactsin';
}

export interface ContactCategoryDetails {
  schoolName?: string;
  schoolLevel?: string;
  numberOfPeople?: string;
  department?: string;
  organizationName?: string;
  position?: string;
  message?: string;
  inquiryType?: string;
  preferredContactMethod?: string;
  countryCode?: string;
}

/**
 * Subscriber types
 */
export interface Subscriber {
  id: string;
  email: string;
  name?: string;
  subscriptionDate: string;
  status: 'active' | 'unsubscribed';
  source?: string;
}

/**
 * Testimonial types
 */
export interface Testimonial {
  id: string;
  name: string;
  email?: string;
  role?: string;
  organization?: string;
  company?: string;
  content: string;
  testimonial?: string;
  rating?: number;
  image?: string;
  photo?: string;
  featured?: boolean;
  approved?: boolean;
  published?: boolean;
  status?: 'pending' | 'approved' | 'rejected' | 'published' | 'draft';
  likes?: number;
  createdAt: number;
  updatedAt: number;
}

/**
 * Registration types
 */
export interface Registration {
  id: string;
  blogId?: string;
  eventId?: string;
  fullName?: string;
  name?: string;
  email: string;
  phoneNumber?: string;
  number?: string;
  gender?: string;
  profileImageUrl?: string;
  attendeeType?: string;
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  location?: string;
  school?: string;
  level?: string;
  studentDetails?: Record<string, unknown>;
  governmentDetails?: Record<string, unknown>;
  companyDetails?: Record<string, unknown>;
  entrepreneurDetails?: Record<string, unknown>;
  mediaDetails?: Record<string, unknown>;
  ngoDetails?: Record<string, unknown>;
  religiousDetails?: Record<string, unknown>;
  otherDetails?: Record<string, unknown>;
  createdAt: number;
}

export interface RegistrationFilters {
  attendeeType?: string;
  state?: string;
  city?: string;
  eventId?: string;
  blogId?: string;
  q?: string;
}

export interface RegistrationAnalytics {
  total: number;
  byAttendeeType: Record<string, number>;
  topStates: Array<{ name: string; count: number }>;
  topUniversities: Array<{ name: string; count: number }>;
  topAgencies: Array<{ name: string; count: number }>;
}

export interface BlogRegistrationWithTitle extends Registration {
  blogTitle: string;
}

export interface BlogRegistrationGroup {
  blogId: string;
  blogTitle: string;
  count: number;
  registrations: BlogRegistrationWithTitle[];
}

export interface BlogRegistrationsResponse {
  registrations: BlogRegistrationWithTitle[];
  groups: BlogRegistrationGroup[];
}

export interface RegistrationCounts {
  blogCounts: Record<string, number>;
  eventCounts: Record<string, number>;
}

/**
 * Dashboard summary
 */
export interface DashboardSummary {
  blogCount: number;
  publishedBlogCount: number;
  testimonialCount: number;
  modelImageCount: number;
  contactCount: number;
  subscriberCount: number;
  blogRegistrationCount: number;
  eventRegistrationCount: number;
  recentBlogs: Array<{
    id: string;
    title: string;
    date: string;
  }>;
}

/**
 * Ads
 */
export type AdStatus = 'draft' | 'active' | 'paused' | 'expired';
export type LegacyAdPlacement = 'homepage' | 'blog' | 'events' | 'all';
/** @deprecated */
export type AdPlacement = LegacyAdPlacement;

export type AdPage =
  | 'home'
  | 'events'
  | 'blog'
  | 'livestream'
  | 'gallery'
  | 'about'
  | 'contact';

export type AdPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'sidebar-left'
  | 'sidebar-right'
  | 'inline'
  | 'sticky-bottom'
  | 'floating';

export type AdPlacementType =
  | 'hero-banner'
  | 'popup-modal'
  | 'inline-banner'
  | 'sidebar-banner'
  | 'sticky-bottom'
  | 'floating-card'
  | 'between-sections'
  | 'livestream-overlay';

export type AdImageSize =
  | '1920x500'
  | '1200x400'
  | '390x220'
  | '1200x300'
  | '1080x1080'
  | '728x90'
  | '300x250'
  | '160x600'
  | '320x100'
  | '970x250';

export type AdDevice = 'desktop' | 'tablet' | 'mobile';

export interface AdModalConfig {
  showOnVisit: boolean;
  delay: number;
  showOncePerSession: boolean;
  closeable: boolean;
  autoClose: boolean;
  autoCloseMs?: number;
}

export interface AdRenderSize {
  width: number;
  height: number;
  maxWidth: number;
  aspectRatio: string;
}

export interface AdCampaign {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'paused';
  createdAt: number;
  updatedAt: number;
}

export interface Ad {
  id: string;
  campaignId: string;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  redirectUrl?: string;
  placement?: LegacyAdPlacement;
  page?: AdPage;
  section?: string;
  position?: AdPosition;
  placementType?: AdPlacementType;
  imageSize?: AdImageSize;
  modalConfig?: AdModalConfig;
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
  isActive?: boolean;
  status: AdStatus;
  startDate?: number;
  endDate?: number;
  clickCount?: number;
  impressionCount?: number;
  impressionsByDevice?: { desktop: number; tablet: number; mobile: number };
  clicksByDevice?: { desktop: number; tablet: number; mobile: number };
  createdAt: number;
  updatedAt: number;
}

export interface PlacementCatalog {
  pages: Record<AdPage, { maxTotal: number; maxSticky: number; maxInline: number; maxPerSection: number }>;
  slots: Array<{
    id: string;
    page: AdPage;
    section: string;
    label: string;
    description: string;
    placementType: AdPlacementType;
    allowedPositions: AdPosition[];
    recommendedSize: AdImageSize;
    allowedSizes: AdImageSize[];
    devices: AdDevice[];
    responsive: Record<AdDevice, AdRenderSize>;
    zIndex: number;
    category: string;
  }>;
}

export interface AdAnalyticsSummary {
  totalAds: number;
  activeAds: number;
  totalImpressions: number;
  totalClicks: number;
  averageCtr: number;
  byPage: Record<string, { impressions: number; clicks: number; ctr: number }>;
  byDevice: { desktop: number; tablet: number; mobile: number };
  topAds: Array<{
    id: string;
    title: string;
    page?: AdPage;
    section?: string;
    impressions: number;
    clicks: number;
    ctr: number;
  }>;
}

export interface CreateAdCampaignDto {
  name: string;
  description?: string;
  status?: 'active' | 'paused';
}

export interface CreateAdDto {
  campaignId: string;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  redirectUrl?: string;
  placement?: LegacyAdPlacement;
  page?: AdPage;
  section?: string;
  position?: AdPosition;
  placementType?: AdPlacementType;
  imageSize?: AdImageSize;
  modalConfig?: Partial<AdModalConfig>;
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
  isActive?: boolean;
  status?: AdStatus;
  startDate?: number;
  endDate?: number;
}

/**
 * Audit log
 */
export interface AuditLog {
  id: string;
  action: string;
  actorUid: string;
  actorEmail: string;
  resourceType: string;
  resourceId: string;
  changes?: Record<string, { before?: unknown; after?: unknown }>;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: number;
}
