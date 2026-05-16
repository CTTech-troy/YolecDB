export const AD_PAGES = [
  'home',
  'events',
  'blog',
  'livestream',
  'gallery',
  'about',
  'contact',
] as const;

export type AdPage = (typeof AD_PAGES)[number];

export const AD_POSITIONS = [
  'top-left',
  'top-center',
  'top-right',
  'center',
  'bottom-left',
  'bottom-center',
  'bottom-right',
  'sidebar-left',
  'sidebar-right',
  'inline',
  'sticky-bottom',
  'floating',
] as const;

export type AdPosition = (typeof AD_POSITIONS)[number];

export const AD_PLACEMENT_TYPES = [
  'hero-banner',
  'popup-modal',
  'inline-banner',
  'sidebar-banner',
  'sticky-bottom',
  'floating-card',
  'between-sections',
  'livestream-overlay',
] as const;

export type AdPlacementType = (typeof AD_PLACEMENT_TYPES)[number];

export const AD_IMAGE_SIZES = [
  '1920x500',
  '1200x400',
  '390x220',
  '1200x300',
  '1080x1080',
  '728x90',
  '300x250',
  '160x600',
  '320x100',
  '970x250',
] as const;

export type AdImageSize = (typeof AD_IMAGE_SIZES)[number];

export const AD_DEVICES = ['desktop', 'tablet', 'mobile'] as const;

export type AdDevice = (typeof AD_DEVICES)[number];

export interface AdRenderSize {
  width: number;
  height: number;
  maxWidth: number;
  aspectRatio: string;
}

export interface PlacementSlotDefinition {
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
}

export interface PageAdRules {
  maxTotal: number;
  maxSticky: number;
  maxInline: number;
  maxPerSection: number;
}

export const PAGE_AD_RULES: Record<AdPage, PageAdRules> = {
  home: { maxTotal: 2, maxSticky: 1, maxInline: 1, maxPerSection: 1 },
  events: { maxTotal: 3, maxSticky: 1, maxInline: 2, maxPerSection: 1 },
  blog: { maxTotal: 3, maxSticky: 1, maxInline: 3, maxPerSection: 1 },
  livestream: { maxTotal: 2, maxSticky: 1, maxInline: 0, maxPerSection: 1 },
  gallery: { maxTotal: 2, maxSticky: 1, maxInline: 1, maxPerSection: 1 },
  about: { maxTotal: 2, maxSticky: 1, maxInline: 1, maxPerSection: 1 },
  contact: { maxTotal: 2, maxSticky: 1, maxInline: 1, maxPerSection: 1 },
};

export const PAGE_LABELS: Record<AdPage, string> = {
  home: 'Home',
  events: 'Events',
  blog: 'Blog',
  livestream: 'Livestream',
  gallery: 'Gallery',
  about: 'About',
  contact: 'Contact',
};

export function parseImageSize(size: AdImageSize): { width: number; height: number } {
  const [w, h] = size.split('x').map(Number);
  return { width: w || 300, height: h || 250 };
}

export function renderSizeFor(
  slot: Pick<PlacementSlotDefinition, 'responsive'> | undefined,
  device: AdDevice,
  fallbackSize: AdImageSize
): AdRenderSize {
  if (slot?.responsive?.[device]) return slot.responsive[device];
  const { width, height } = parseImageSize(fallbackSize);
  return { width, height, maxWidth: width, aspectRatio: `${width} / ${height}` };
}

export function positionLabel(position: AdPosition): string {
  return position.replace(/-/g, ' ');
}
