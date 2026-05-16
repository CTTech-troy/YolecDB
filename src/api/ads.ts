import { apiClient } from '@/lib/apiClient';
import {
  Ad,
  AdAnalyticsSummary,
  AdCampaign,
  AdPage,
  AdPosition,
  CreateAdCampaignDto,
  CreateAdDto,
  PlacementCatalog,
  PaginatedResponse,
} from '@/types';

export const adsApi = {
  listCampaigns(): Promise<AdCampaign[]> {
    return apiClient.get('/api/mgmt/ads/campaigns');
  },

  createCampaign(data: CreateAdCampaignDto): Promise<{ id: string }> {
    return apiClient.post('/api/mgmt/ads/campaigns', data);
  },

  updateCampaign(
    id: string,
    data: Partial<CreateAdCampaignDto>
  ): Promise<{ success: boolean }> {
    return apiClient.patch(`/api/mgmt/ads/campaigns/${id}`, data);
  },

  deleteCampaign(id: string): Promise<void> {
    return apiClient.delete(`/api/mgmt/ads/campaigns/${id}`);
  },

  listAds(page = 1, limit = 50, campaignId?: string): Promise<PaginatedResponse<Ad>> {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (campaignId) params.set('campaignId', campaignId);
    return apiClient.get(`/api/mgmt/ads?${params.toString()}`);
  },

  createAd(data: CreateAdDto): Promise<{ id: string }> {
    return apiClient.post('/api/mgmt/ads', data);
  },

  updateAd(id: string, data: Partial<CreateAdDto>): Promise<{ success: boolean }> {
    return apiClient.patch(`/api/mgmt/ads/${id}`, data);
  },

  deleteAd(id: string): Promise<void> {
    return apiClient.delete(`/api/mgmt/ads/${id}`);
  },

  getPlacementCatalog(): Promise<PlacementCatalog> {
    return apiClient.get('/api/mgmt/ads/placements/catalog');
  },

  validatePlacement(params: {
    page: AdPage;
    section: string;
    position: AdPosition;
    excludeAdId?: string;
  }): Promise<{ valid: boolean; message?: string }> {
    const q = new URLSearchParams({
      page: params.page,
      section: params.section,
      position: params.position,
    });
    if (params.excludeAdId) q.set('excludeAdId', params.excludeAdId);
    return apiClient.get(`/api/mgmt/ads/placements/validate?${q.toString()}`);
  },

  getAnalytics(): Promise<AdAnalyticsSummary> {
    return apiClient.get('/api/mgmt/ads/analytics');
  },
};
