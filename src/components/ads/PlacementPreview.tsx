import type { CSSProperties } from 'react';
import type { AdImageSize, AdPage, AdPosition } from '@/types';
import {
  PAGE_LABELS,
  positionLabel,
  renderSizeFor,
  type AdDevice,
  type PlacementSlotDefinition,
} from '@/config/adPlacements';

interface PlacementPreviewProps {
  page: AdPage;
  section: string;
  position: AdPosition;
  imageSize: AdImageSize;
  imageUrl?: string;
  title?: string;
  previewDevice: AdDevice;
  slot?: Pick<
    PlacementSlotDefinition,
    'category' | 'label' | 'placementType' | 'responsive' | 'zIndex'
  >;
}

const DEVICE_FRAMES: Record<
  AdDevice,
  { label: string; pageWidth: number; pageHeight: number; previewWidth: number; navHeight: number }
> = {
  desktop: { label: 'Desktop', pageWidth: 1920, pageHeight: 900, previewWidth: 720, navHeight: 72 },
  tablet: { label: 'Tablet', pageWidth: 1200, pageHeight: 820, previewWidth: 620, navHeight: 64 },
  mobile: { label: 'Mobile', pageWidth: 390, pageHeight: 760, previewWidth: 360, navHeight: 56 },
};

function previewVariant(
  slot: PlacementPreviewProps['slot'],
  imageSize: AdImageSize
): 'hero' | 'feed' | 'leaderboard' | 'rectangle' | 'sidebar' | 'sticky' | 'floating' | 'overlay' | 'modal' {
  if (slot?.placementType === 'popup-modal') return 'modal';
  if (slot?.placementType === 'sticky-bottom') return 'sticky';
  if (slot?.placementType === 'floating-card') return 'floating';
  if (slot?.placementType === 'livestream-overlay') return 'overlay';
  if (slot?.placementType === 'hero-banner' || slot?.category === 'hero') return 'hero';
  if (slot?.placementType === 'sidebar-banner' || slot?.category === 'sidebar') return 'sidebar';
  if (imageSize === '728x90') return 'leaderboard';
  if (imageSize === '300x250') return 'rectangle';
  return 'feed';
}

function previewDesign(
  variant: ReturnType<typeof previewVariant>,
  imageSize: AdImageSize,
  device: AdDevice
) {
  const bySize: Partial<Record<AdImageSize, { maxWidth: number; maxHeight: number }>> = {
    '1920x500': { maxWidth: 1280, maxHeight: 220 },
    '1200x400': { maxWidth: 1080, maxHeight: 180 },
    '1200x300': { maxWidth: 1040, maxHeight: 190 },
    '970x250': { maxWidth: 970, maxHeight: 180 },
    '728x90': { maxWidth: 820, maxHeight: 90 },
    '300x250': { maxWidth: 340, maxHeight: 300 },
    '320x100': { maxWidth: 460, maxHeight: 120 },
    '160x600': { maxWidth: 220, maxHeight: 640 },
    '390x220': { maxWidth: 520, maxHeight: 160 },
    '1080x1080': { maxWidth: 640, maxHeight: 640 },
  };
  const defaults: Record<ReturnType<typeof previewVariant>, { maxWidth: number; maxHeight: number }> = {
    hero: { maxWidth: 1280, maxHeight: 220 },
    feed: { maxWidth: 970, maxHeight: 180 },
    leaderboard: { maxWidth: 820, maxHeight: 90 },
    rectangle: { maxWidth: 340, maxHeight: 300 },
    sidebar: { maxWidth: 320, maxHeight: 620 },
    sticky: { maxWidth: 620, maxHeight: 92 },
    floating: { maxWidth: 340, maxHeight: 300 },
    overlay: { maxWidth: 300, maxHeight: 250 },
    modal: { maxWidth: 720, maxHeight: 680 },
  };
  const design = { ...defaults[variant], ...(bySize[imageSize] ?? {}) };
  if (device === 'tablet') {
    return { ...design, maxHeight: Math.min(design.maxHeight, variant === 'hero' ? 180 : 150) };
  }
  if (device === 'mobile') {
    return { ...design, maxWidth: Math.min(design.maxWidth, 390), maxHeight: Math.min(design.maxHeight, 120) };
  }
  return design;
}

export function PlacementPreview({
  page,
  section,
  position,
  imageSize,
  imageUrl,
  title,
  previewDevice,
  slot,
}: PlacementPreviewProps) {
  const frame = DEVICE_FRAMES[previewDevice];
  const renderSize = renderSizeFor(slot, previewDevice, imageSize);
  const scale = frame.previewWidth / frame.pageWidth;
  const frameW = Math.round(frame.pageWidth * scale);
  const frameH = Math.round(frame.pageHeight * scale);
  const safe = Math.round((previewDevice === 'mobile' ? 16 : 32) * scale);
  const navH = Math.round(frame.navHeight * scale);
  const topContent = navH + safe;
  const grid = Math.max(12, Math.round(80 * scale));
  const isHomeHeroInline = page === 'home' && section === 'hero';
  const isHero = !isHomeHeroInline && (slot?.placementType === 'hero-banner' || slot?.category === 'hero');
  const baseVariant = previewVariant(slot, imageSize);
  const variant: ReturnType<typeof previewVariant> = isHomeHeroInline ? 'feed' : baseVariant;
  const baseDesign = previewDesign(variant, imageSize, previewDevice);
  const design = isHomeHeroInline
    ? {
        ...baseDesign,
        maxWidth: Math.min(baseDesign.maxWidth, 1180),
        maxHeight: Math.min(baseDesign.maxHeight, previewDevice === 'desktop' ? 200 : previewDevice === 'tablet' ? 180 : 120),
      }
    : baseDesign;
  const unscaledBoxW = Math.min(renderSize.width, design.maxWidth, frame.pageWidth - safe / scale * 2);
  const ratio = renderSize.width / Math.max(renderSize.height, 1);
  const unscaledBoxH = Math.min(unscaledBoxW / ratio, design.maxHeight);
  const boxW = Math.round(unscaledBoxW * scale);
  const boxH = Math.round(unscaledBoxH * scale);
  const inlineTop = topContent + Math.round((isHomeHeroInline ? 320 : 260) * scale);
  const topPlacement = isHomeHeroInline ? inlineTop : isHero ? navH : topContent;

  const positionStyles: Record<AdPosition, CSSProperties> = {
    'top-left': { left: safe, top: topPlacement },
    'top-center': { left: '50%', top: topPlacement, transform: 'translateX(-50%)' },
    'top-right': { right: safe, top: topPlacement },
    center: { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' },
    'bottom-left': { left: safe, bottom: safe },
    'bottom-center': { left: '50%', bottom: safe, transform: 'translateX(-50%)' },
    'bottom-right': { right: safe, bottom: safe },
    'sidebar-left': { left: safe, top: topContent + Math.round(72 * scale) },
    'sidebar-right': { right: safe, top: topContent + Math.round(72 * scale) },
    inline: { left: '50%', top: inlineTop, transform: 'translateX(-50%)' },
    'sticky-bottom': { left: '50%', bottom: 0, transform: 'translateX(-50%)' },
    floating: { right: safe, bottom: safe + Math.round(96 * scale) },
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {PAGE_LABELS[page]} / {section} / {positionLabel(position)} / exact{' '}
        {renderSize.width}x{renderSize.height} ({frame.label.toLowerCase()})
      </p>
      <div className="-mx-1 overflow-x-auto px-1 pb-2">
        <div
          className="relative mx-auto overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-inner dark:border-slate-700 dark:bg-slate-950"
          style={{
            width: frameW,
            minWidth: frameW,
            height: frameH,
            backgroundImage:
              'linear-gradient(rgba(14, 165, 233, 0.11) 1px, transparent 1px), linear-gradient(90deg, rgba(14, 165, 233, 0.11) 1px, transparent 1px)',
            backgroundSize: `${grid}px ${grid}px`,
          }}
        >
        <div
          className="absolute inset-x-0 top-0 border-b border-slate-200/80 bg-white/90 dark:border-slate-700 dark:bg-slate-900/90"
          style={{ height: navH }}
        />
        <div className="absolute left-3 top-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          {PAGE_LABELS[page]} responsive simulation
        </div>
        <div className="absolute right-3 top-3 rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] font-medium text-white dark:bg-white/90 dark:text-slate-900">
          {frame.pageWidth}px page
        </div>

        {previewDevice !== 'mobile' && (
          <div
            className="absolute border-r border-slate-200/70 bg-white/45 dark:border-slate-800 dark:bg-slate-900/40"
            style={{ bottom: 0, left: 0, top: navH, width: Math.round(220 * scale) }}
          />
        )}

        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-xl bg-white/55 dark:bg-slate-900/45"
          style={{
            top: topContent + Math.round(20 * scale),
            width: Math.round(Math.min(1080, frame.pageWidth - 80) * scale),
            height: Math.round(150 * scale),
          }}
        />
        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-xl bg-white/45 dark:bg-slate-900/35"
          style={{
            top: topContent + Math.round(220 * scale),
            width: Math.round(Math.min(1280, frame.pageWidth - 64) * scale),
            height: Math.round(180 * scale),
          }}
        />

        <div
          className="absolute z-10"
          style={{ ...positionStyles[position], zIndex: slot?.zIndex ?? 10 }}
        >
          <div
            className="ad-container-wrap ad-preview-container"
            style={{ width: boxW, height: boxH }}
          >
            <button
              type="button"
              className={`ad-container ad-container--${variant} ad-preview-ad`}
              style={{
                width: '100%',
                height: '100%',
                aspectRatio: renderSize.aspectRatio,
              }}
              aria-label="Ad placement preview"
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={title || 'Ad preview'}
                  className="ad-media ad-media--loaded"
                />
              ) : (
                <span className="ad-skeleton" aria-hidden />
              )}
              <span className="ad-gradient" aria-hidden />
              <span className="ad-badge">Sponsored</span>
              <span className="ad-title">{title || slot?.label || 'Ad banner'}</span>
            </button>
          </div>
        </div>

          <div className="absolute bottom-2 left-2 rounded bg-white/80 px-2 py-1 text-[10px] text-slate-600 shadow-sm dark:bg-slate-900/80 dark:text-slate-300">
            Creative {imageSize} capped to {Math.round(unscaledBoxW)}x{Math.round(unscaledBoxH)}
          </div>
        </div>
      </div>
    </div>
  );
}
