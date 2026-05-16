import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adsApi } from '@/api/ads';
import type { Ad, CreateAdCampaignDto, CreateAdDto } from '@/types';
import { toast } from 'react-hot-toast';

export function useAdCampaigns() {
  return useQuery({
    queryKey: ['ads', 'campaigns'],
    queryFn: () => adsApi.listCampaigns(),
  });
}

export function useAds(campaignId?: string, page = 1, limit = 50) {
  return useQuery({
    queryKey: ['ads', 'list', campaignId, page, limit],
    queryFn: () => adsApi.listAds(page, limit, campaignId),
    enabled: Boolean(campaignId),
  });
}

export function useCreateAdCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAdCampaignDto) => adsApi.createCampaign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads', 'campaigns'] });
      toast.success('Campaign created');
    },
    onError: (e: Error) => toast.error(e.message || 'Failed to create campaign'),
  });
}

export function useDeleteAdCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adsApi.deleteCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads'] });
      toast.success('Campaign deleted');
    },
    onError: (e: Error) => toast.error(e.message || 'Failed to delete campaign'),
  });
}

export function useCreateAd() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAdDto) => adsApi.createAd(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads', 'list'] });
      toast.success('Ad created');
    },
    onError: (e: Error) => toast.error(e.message || 'Failed to create ad'),
  });
}

export function useUpdateAd() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateAdDto> }) =>
      adsApi.updateAd(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads', 'list'] });
      toast.success('Ad updated');
    },
    onError: (e: Error) => toast.error(e.message || 'Failed to update ad'),
  });
}

export function useDeleteAd() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adsApi.deleteAd(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads', 'list'] });
      toast.success('Ad deleted');
    },
    onError: (e: Error) => toast.error(e.message || 'Failed to delete ad'),
  });
}

export function usePlacementCatalog() {
  return useQuery({
    queryKey: ['ads', 'catalog'],
    queryFn: () => adsApi.getPlacementCatalog(),
    staleTime: 300_000,
  });
}

export function useAdAnalytics() {
  return useQuery({
    queryKey: ['ads', 'analytics'],
    queryFn: () => adsApi.getAnalytics(),
    refetchInterval: 60_000,
  });
}

export type { Ad };
