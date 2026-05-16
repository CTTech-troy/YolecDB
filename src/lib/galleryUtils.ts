import { Event } from '@/types';

export function isGalleryItem(row: Partial<Event> | null | undefined): boolean {
  if (!row || typeof row !== 'object') return false;
  const r = row as Record<string, unknown>;
  if (r.type === 'gallery' || r.kind === 'gallery' || r.contentType === 'gallery') {
    return true;
  }
  const hasDate = r.date != null && String(r.date).trim() !== '';
  const hasCategory = r.category != null && String(r.category).trim() !== '';
  const hasLifecycle =
    r.eventLifecycle != null && String(r.eventLifecycle).trim() !== '';
  if (hasDate || hasCategory || hasLifecycle) return false;
  if (r.kind === 'event' || r.contentType === 'event') return true;
  return true;
}

export function isEventListing(row: Partial<Event> | null | undefined): boolean {
  if (!row || typeof row !== 'object') return false;
  if (isGalleryItem(row)) return false;
  const r = row as Record<string, unknown>;
  if (r.kind === 'event' || r.contentType === 'event') return true;
  if (r.date != null && String(r.date).trim()) return true;
  if (r.category != null && String(r.category).trim()) return true;
  return false;
}

