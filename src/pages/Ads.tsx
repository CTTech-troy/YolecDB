import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { ImageUpload } from '@/components/forms/ImageUpload';
import { PageHeader } from '@/components/layout/PageHeader';
import { AdsAnalyticsPanel } from '@/components/ads/AdsAnalyticsPanel';
import { PlacementPreview } from '@/components/ads/PlacementPreview';
import {
  Button,
  Card,
  ConfirmModal,
  Input,
  Modal,
  Select,
} from '@/components/ui';
import { PermissionGate } from '@/components/shared/PermissionGate';
import {
  AD_DEVICES,
  AD_IMAGE_SIZES,
  AD_PAGES,
  AD_PLACEMENT_TYPES,
  PAGE_AD_RULES,
  PAGE_LABELS,
  positionLabel,
  type AdDevice,
  type AdPage,
  type AdPlacementType,
  type AdPosition,
  type AdImageSize,
} from '@/config/adPlacements';
import { fileToDataUrlForStorage } from '@/utils/fileToDataUrl';
import {
  useAdCampaigns,
  useAds,
  useCreateAd,
  useCreateAdCampaign,
  useDeleteAd,
  useDeleteAdCampaign,
  usePlacementCatalog,
  useUpdateAd,
} from '@/hooks/useAds';
import { adsApi } from '@/api/ads';
import { PERMISSIONS, type Ad, type AdCampaign } from '@/types';
import { statusBadge } from '@/lib/tableStyles';

const AD_STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'expired', label: 'Expired' },
];

const AD_RECURRENCE_OPTIONS = [
  { value: 'none', label: 'No recurrence' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

type TabId = 'placements' | 'ads' | 'analytics';

function toDateInput(ms?: number) {
  if (!ms) return '';
  return new Date(ms).toISOString().slice(0, 16);
}

function fromDateInput(value: string) {
  if (!value) return undefined;
  return new Date(value).getTime();
}

export function AdsPage() {
  const [tab, setTab] = useState<TabId>('placements');
  const { data: catalog } = usePlacementCatalog();
  const { data: campaigns = [], isLoading: campaignsLoading } = useAdCampaigns();
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const { data: adsData, isLoading: adsLoading } = useAds(selectedCampaignId || undefined);
  const ads = adsData?.data ?? [];

  const createCampaignMutation = useCreateAdCampaign();
  const deleteCampaignMutation = useDeleteAdCampaign();
  const createAdMutation = useCreateAd();
  const updateAdMutation = useUpdateAd();
  const deleteAdMutation = useDeleteAd();

  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [deleteCampaignId, setDeleteCampaignId] = useState<string | null>(null);
  const [deleteAdId, setDeleteAdId] = useState<string | null>(null);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [previewDevice, setPreviewDevice] = useState<AdDevice>('desktop');
  const [placementWarning, setPlacementWarning] = useState<string | null>(null);

  const [campaignName, setCampaignName] = useState('');
  const [campaignDescription, setCampaignDescription] = useState('');

  const [adTitle, setAdTitle] = useState('');
  const [adRedirect, setAdRedirect] = useState('');
  const [adPage, setAdPage] = useState<AdPage>('home');
  const [adSection, setAdSection] = useState('hero');
  const [adPosition, setAdPosition] = useState<AdPosition>('top-center');
  const [adPlacementType, setAdPlacementType] = useState<AdPlacementType>('hero-banner');
  const [adImageSize, setAdImageSize] = useState<AdImageSize>('1920x500');
  const [adStatus, setAdStatus] = useState('draft');
  const [adIsActive, setAdIsActive] = useState(true);
  const [adStart, setAdStart] = useState('');
  const [adEnd, setAdEnd] = useState('');
  const [adImagePreview, setAdImagePreview] = useState('');
  const [adRecurrence, setAdRecurrence] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');
  const [modalDelay, setModalDelay] = useState(3000);
  const [modalShowOnce, setModalShowOnce] = useState(true);
  const [modalCloseable, setModalCloseable] = useState(true);
  const [modalAutoClose, setModalAutoClose] = useState(false);
  const [modalAutoCloseMs, setModalAutoCloseMs] = useState(8000);

  const slotsForPage = useMemo(
    () => catalog?.slots.filter((s) => s.page === adPage) ?? [],
    [catalog, adPage]
  );

  const currentSlot = useMemo(
    () => slotsForPage.find((s) => s.section === adSection),
    [slotsForPage, adSection]
  );

  const positionOptions = useMemo(
    () =>
      (currentSlot?.allowedPositions ?? []).map((p) => ({
        value: p,
        label: positionLabel(p),
      })),
    [currentSlot]
  );

  const sizeOptions = useMemo(
    () =>
      (currentSlot?.allowedSizes ?? AD_IMAGE_SIZES).map((s) => ({
        value: s,
        label: s,
      })),
    [currentSlot]
  );

  useEffect(() => {
    if (!selectedCampaignId && campaigns.length > 0) {
      setSelectedCampaignId(campaigns[0].id);
    }
  }, [campaigns, selectedCampaignId]);

  useEffect(() => {
    if (!currentSlot) return;
    setAdPlacementType(currentSlot.placementType);
    if (!currentSlot.allowedPositions.includes(adPosition)) {
      setAdPosition(currentSlot.allowedPositions[0]);
    }
    if (!currentSlot.allowedSizes.includes(adImageSize)) {
      setAdImageSize(currentSlot.recommendedSize);
    }
  }, [currentSlot, adPosition, adImageSize]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const result = await adsApi.validatePlacement({
          page: adPage,
          section: adSection,
          position: adPosition,
          excludeAdId: editingAd?.id,
        });
        if (!cancelled) setPlacementWarning(result.valid ? null : result.message ?? null);
      } catch {
        if (!cancelled) setPlacementWarning(null);
      }
    };
    if (adModalOpen) run();
    return () => {
      cancelled = true;
    };
  }, [adModalOpen, adPage, adSection, adPosition, editingAd?.id]);

  const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId);

  const resetCampaignForm = () => {
    setCampaignName('');
    setCampaignDescription('');
  };

  const resetAdForm = () => {
    setAdTitle('');
    setAdRedirect('');
    setAdPage('home');
    setAdSection('hero');
    setAdPosition('top-center');
    setAdPlacementType('hero-banner');
    setAdImageSize('1920x500');
    setAdStatus('draft');
    setAdIsActive(true);
    setAdStart('');
    setAdEnd('');
    setAdImagePreview('');
    setAdRecurrence('none');
    setModalDelay(3000);
    setModalShowOnce(true);
    setModalCloseable(true);
    setModalAutoClose(false);
    setModalAutoCloseMs(8000);
    setEditingAd(null);
    setPlacementWarning(null);
  };

  const openCreateAd = (preset?: { page: AdPage; section: string }) => {
    resetAdForm();
    if (preset) {
      setAdPage(preset.page);
      setAdSection(preset.section);
    }
    setAdModalOpen(true);
  };

  const openEditAd = (ad: Ad) => {
    setEditingAd(ad);
    setAdTitle(ad.title);
    setAdRedirect(ad.redirectUrl || ad.linkUrl || '');
    setAdPage(ad.page ?? 'home');
    setAdSection(ad.section ?? 'hero');
    setAdPosition(ad.position ?? 'inline');
    setAdPlacementType(ad.placementType ?? 'inline-banner');
    setAdImageSize(ad.imageSize ?? '1200x300');
    setAdStatus(ad.status);
    setAdIsActive(ad.isActive ?? ad.status === 'active');
    setAdStart(toDateInput(ad.startDate));
    setAdEnd(toDateInput(ad.endDate));
    setAdImagePreview(ad.imageUrl);
    setAdRecurrence(ad.recurrence ?? 'none');
    setModalDelay(ad.modalConfig?.delay ?? 3000);
    setModalShowOnce(ad.modalConfig?.showOncePerSession ?? true);
    setModalCloseable(ad.modalConfig?.closeable ?? true);
    setModalAutoClose(ad.modalConfig?.autoClose ?? false);
    setModalAutoCloseMs(ad.modalConfig?.autoCloseMs ?? 8000);
    setAdModalOpen(true);
  };

  const handleImageSelect = async (file: File) => {
    try {
      setAdImagePreview(await fileToDataUrlForStorage(file));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not read image');
    }
  };

  const handleCreateCampaign = async () => {
    if (!campaignName.trim()) return;
    try {
      await createCampaignMutation.mutateAsync({
        name: campaignName.trim(),
        description: campaignDescription.trim() || undefined,
      });
      setCampaignModalOpen(false);
      resetCampaignForm();
    } catch {
      // Error toast is handled by the mutation hook.
    }
  };

  const handleSaveAd = async () => {
    if (!selectedCampaignId || !adTitle.trim() || !adImagePreview) return;
    if (placementWarning) {
      toast.error(placementWarning);
      return;
    }

    const payload = {
      title: adTitle.trim(),
      imageUrl: adImagePreview,
      redirectUrl: adRedirect.trim() || undefined,
      page: adPage,
      section: adSection,
      position: adPosition,
      placementType: adPlacementType,
      imageSize: adImageSize,
      recurrence: adRecurrence,
      modalConfig:
        adPlacementType === 'popup-modal'
          ? {
              showOnVisit: true,
              delay: Math.max(0, modalDelay),
              showOncePerSession: modalShowOnce,
              closeable: modalCloseable,
              autoClose: modalAutoClose,
              autoCloseMs: modalAutoClose ? Math.max(1000, modalAutoCloseMs) : undefined,
            }
          : undefined,
      isActive: adIsActive,
      status: adStatus as Ad['status'],
      startDate: fromDateInput(adStart),
      endDate: fromDateInput(adEnd),
    };

    try {
      if (editingAd) {
        await updateAdMutation.mutateAsync({ id: editingAd.id, data: payload });
      } else {
        await createAdMutation.mutateAsync({
          campaignId: selectedCampaignId,
          ...payload,
        });
      }
      setAdModalOpen(false);
      resetAdForm();
    } catch {
      // Error toast is handled by the mutation hook.
    }
  };

  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'placements', label: 'Placements', icon: 'ri-layout-grid-line' },
    { id: 'ads', label: 'Campaigns & ads', icon: 'ri-advertisement-line' },
    { id: 'analytics', label: 'Analytics', icon: 'ri-bar-chart-box-line' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ad placements"
        description="Manage sponsorship positions across the public site with live preview and density rules"
        action={
          <PermissionGate anyPermissions={[PERMISSIONS.MANAGE_ADS, PERMISSIONS.CREATE_AD]}>
            <div className="grid w-full gap-2 sm:flex sm:w-auto sm:flex-wrap">
              <Button
                variant="secondary"
                icon="ri-folder-add-line"
                onClick={() => {
                  resetCampaignForm();
                  setCampaignModalOpen(true);
                }}
              >
                New campaign
              </Button>
              <Button icon="ri-add-line" onClick={() => openCreateAd()} disabled={!selectedCampaignId}>
                Create ad
              </Button>
            </div>
          </PermissionGate>
        }
      />

      <div className="-mx-1 overflow-x-auto border-b border-slate-200 px-1 dark:border-slate-800">
        <div className="flex min-w-max gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id
                ? 'border-indigo-600 text-indigo-700 dark:border-indigo-400 dark:text-indigo-300'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <i className={t.icon} />
            {t.label}
          </button>
        ))}
        </div>
      </div>

      {tab === 'placements' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Strategic slots scanned across the public site. Home page allows max{' '}
            {PAGE_AD_RULES.home.maxTotal} active ads.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {(catalog?.slots ?? []).map((slot) => (
              <Card key={slot.id} className="flex flex-col p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase text-cyan-600 dark:text-cyan-400">
                      {PAGE_LABELS[slot.page]}
                    </p>
                    <h3 className="line-clamp-2 font-semibold text-slate-900 dark:text-white">
                      {slot.label}
                    </h3>
                  </div>
                  <span className={`${statusBadge.info} shrink-0`}>{slot.recommendedSize}</span>
                </div>
                <p className="mb-3 flex-1 text-sm text-slate-500">{slot.description}</p>
                <div className="mb-3 space-y-1 text-xs text-slate-400">
                  <p>
                    {slot.placementType} / Max {PAGE_AD_RULES[slot.page].maxTotal} ads/page /{' '}
                    {slot.devices.join(' + ')}
                  </p>
                  <p>
                    D {slot.responsive.desktop.width}x{slot.responsive.desktop.height} / T{' '}
                    {slot.responsive.tablet.width}x{slot.responsive.tablet.height} / M{' '}
                    {slot.responsive.mobile.width}x{slot.responsive.mobile.height}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setTab('ads');
                    openCreateAd({ page: slot.page, section: slot.section });
                  }}
                >
                  Assign ad
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {tab === 'analytics' && <AdsAnalyticsPanel />}

      {tab === 'ads' && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
          <Card className="p-4 xl:sticky xl:top-4 xl:self-start">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Campaigns
            </h2>
            {campaignsLoading ? (
              <p className="text-sm text-slate-500">Loading…</p>
            ) : campaigns.length === 0 ? (
              <p className="text-sm text-slate-500">No campaigns yet.</p>
            ) : (
              <ul className="max-h-[320px] space-y-1 overflow-y-auto pr-1 xl:max-h-[calc(100dvh-18rem)]">
                {campaigns.map((campaign: AdCampaign) => (
                  <li key={campaign.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedCampaignId(campaign.id)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        selectedCampaignId === campaign.id
                          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300'
                          : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="min-w-0 truncate font-medium">{campaign.name}</span>
                      <span
                        className={
                          campaign.status === 'active' ? statusBadge.success : statusBadge.neutral
                        }
                      >
                        {campaign.status}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {selectedCampaign && (
              <PermissionGate anyPermissions={[PERMISSIONS.MANAGE_ADS, PERMISSIONS.DELETE_AD]}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-4 w-full text-red-600"
                  onClick={() => setDeleteCampaignId(selectedCampaign.id)}
                >
                  Delete campaign
                </Button>
              </PermissionGate>
            )}
          </Card>

          <Card className="min-w-0 p-4 md:p-6">
            {!selectedCampaignId ? (
              <p className="text-slate-500">Select or create a campaign.</p>
            ) : adsLoading ? (
              <p className="text-slate-500">Loading ads…</p>
            ) : ads.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center dark:border-slate-700">
                <p className="mb-3 text-slate-500">No ads in this campaign.</p>
                <Button icon="ri-add-line" onClick={() => openCreateAd()}>
                  Create ad
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {ads.map((ad) => (
                  <div
                    key={ad.id}
                    className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700"
                  >
                    <div className="aspect-[16/9] bg-slate-100 dark:bg-slate-800">
                      <img
                        src={ad.imageUrl}
                        alt={ad.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="space-y-2 p-3">
                      <p className="line-clamp-1 font-medium text-slate-900 dark:text-white">
                        {ad.title}
                      </p>
                      <div className="flex flex-wrap gap-1 text-xs">
                        <span className={statusBadge.info}>
                          {ad.page ?? ad.placement} / {ad.section}
                        </span>
                        <span className={statusBadge.neutral}>
                          {ad.placementType ?? ad.position}
                        </span>
                        <span
                          className={
                            ad.status === 'active' ? statusBadge.success : statusBadge.neutral
                          }
                        >
                          {ad.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 tabular-nums">
                        {ad.impressionCount ?? 0} views · {ad.clickCount ?? 0} clicks
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <Button size="sm" variant="secondary" onClick={() => openEditAd(ad)}>
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600"
                          onClick={() => setDeleteAdId(ad.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      <Modal
        isOpen={campaignModalOpen}
        onClose={() => setCampaignModalOpen(false)}
        title="New campaign"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCampaignModalOpen(false)}>
              Cancel
            </Button>
            <Button loading={createCampaignMutation.isPending} onClick={handleCreateCampaign}>
              Create
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Campaign name"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            required
          />
          <Input
            label="Description (optional)"
            value={campaignDescription}
            onChange={(e) => setCampaignDescription(e.target.value)}
          />
        </div>
      </Modal>

      <Modal
        isOpen={adModalOpen}
        onClose={() => {
          setAdModalOpen(false);
          resetAdForm();
        }}
        title={editingAd ? 'Edit ad placement' : 'Create ad placement'}
        size="fullscreen"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAdModalOpen(false)}>
              Cancel
            </Button>
            <Button
              loading={createAdMutation.isPending || updateAdMutation.isPending}
              onClick={handleSaveAd}
              disabled={!adTitle.trim() || !adImagePreview || Boolean(placementWarning)}
            >
              {editingAd ? 'Save' : 'Create'}
            </Button>
          </>
        }
      >
        <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="min-w-0 space-y-4">
            <Input
              label="Ad title"
              value={adTitle}
              onChange={(e) => setAdTitle(e.target.value)}
              required
            />
            <Input
              label="Redirect URL"
              value={adRedirect}
              onChange={(e) => setAdRedirect(e.target.value)}
              placeholder="https://sponsor.example.com"
            />
            <Select
              label="Page"
              value={adPage}
              onChange={(e) => {
                const page = e.target.value as AdPage;
                setAdPage(page);
                const first = catalog?.slots.find((s) => s.page === page);
                if (first) setAdSection(first.section);
              }}
              options={AD_PAGES.map((p) => ({ value: p, label: PAGE_LABELS[p] }))}
            />
            <Select
              label="Section"
              value={adSection}
              onChange={(e) => setAdSection(e.target.value)}
              options={slotsForPage.map((s) => ({
                value: s.section,
                label: s.label,
              }))}
            />
            <Select
              label="Position"
              value={adPosition}
              onChange={(e) => setAdPosition(e.target.value as AdPosition)}
              options={positionOptions}
            />
            <Select
              label="Placement type"
              value={adPlacementType}
              onChange={(e) => setAdPlacementType(e.target.value as AdPlacementType)}
              options={AD_PLACEMENT_TYPES.map((type) => ({
                value: type,
                label: type.replace(/-/g, ' '),
              }))}
            />
            <Select
              label="Image size"
              value={adImageSize}
              onChange={(e) => setAdImageSize(e.target.value as AdImageSize)}
              options={sizeOptions}
            />
            <Select
              label="Schedule recurrence"
              value={adRecurrence}
              onChange={(e) =>
                setAdRecurrence(e.target.value as 'none' | 'daily' | 'weekly' | 'monthly')
              }
              options={AD_RECURRENCE_OPTIONS}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Start date"
                type="datetime-local"
                value={adStart}
                onChange={(e) => setAdStart(e.target.value)}
              />
              <Input
                label="End date"
                type="datetime-local"
                value={adEnd}
                onChange={(e) => setAdEnd(e.target.value)}
              />
            </div>
            <Select
              label="Status"
              value={adStatus}
              onChange={(e) => setAdStatus(e.target.value)}
              options={AD_STATUS_OPTIONS}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={adIsActive}
                onChange={(e) => setAdIsActive(e.target.checked)}
                className="rounded border-slate-300"
              />
              Active on site
            </label>
            {adPlacementType === 'popup-modal' && (
              <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/50">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Incoming modal behavior
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    label="Delay (ms)"
                    type="number"
                    min="0"
                    value={modalDelay}
                    onChange={(e) => setModalDelay(Number(e.target.value) || 0)}
                  />
                  <Input
                    label="Auto-close after (ms)"
                    type="number"
                    min="1000"
                    value={modalAutoCloseMs}
                    onChange={(e) => setModalAutoCloseMs(Number(e.target.value) || 8000)}
                    disabled={!modalAutoClose}
                  />
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={modalShowOnce}
                      onChange={(e) => setModalShowOnce(e.target.checked)}
                      className="rounded border-slate-300"
                    />
                    Once/session
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={modalCloseable}
                      onChange={(e) => setModalCloseable(e.target.checked)}
                      className="rounded border-slate-300"
                    />
                    Closeable
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={modalAutoClose}
                      onChange={(e) => setModalAutoClose(e.target.checked)}
                      className="rounded border-slate-300"
                    />
                    Auto-close
                  </label>
                </div>
              </div>
            )}
            {placementWarning && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                {placementWarning}
              </p>
            )}
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Ad image</p>
              <ImageUpload onImageSelect={handleImageSelect} preview={adImagePreview} />
            </div>
          </div>

          <div className="min-w-0 space-y-4 xl:sticky xl:top-0 xl:self-start">
            <div className="flex flex-wrap gap-2">
              {AD_DEVICES.map((device) => (
                <button
                  key={device}
                  type="button"
                  onClick={() => setPreviewDevice(device)}
                  className={`rounded-lg px-3 py-1.5 text-sm capitalize ${
                    previewDevice === device
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800'
                  }`}
                >
                  {device}
                </button>
              ))}
            </div>
            <PlacementPreview
              page={adPage}
              section={adSection}
              position={adPosition}
              imageSize={adImageSize}
              imageUrl={adImagePreview}
              title={adTitle}
              previewDevice={previewDevice}
              slot={currentSlot}
            />
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={Boolean(deleteCampaignId)}
        onClose={() => setDeleteCampaignId(null)}
        onConfirm={async () => {
          if (deleteCampaignId) {
            try {
              await deleteCampaignMutation.mutateAsync(deleteCampaignId);
              setDeleteCampaignId(null);
              setSelectedCampaignId('');
            } catch {
              // Error toast is handled by the mutation hook.
            }
          }
        }}
        title="Delete campaign?"
        message="Only empty campaigns can be deleted."
        loading={deleteCampaignMutation.isPending}
      />

      <ConfirmModal
        isOpen={Boolean(deleteAdId)}
        onClose={() => setDeleteAdId(null)}
        onConfirm={async () => {
          if (deleteAdId) {
            try {
              await deleteAdMutation.mutateAsync(deleteAdId);
              setDeleteAdId(null);
            } catch {
              // Error toast is handled by the mutation hook.
            }
          }
        }}
        title="Delete ad?"
        message="This cannot be undone."
        loading={deleteAdMutation.isPending}
      />
    </div>
  );
}
