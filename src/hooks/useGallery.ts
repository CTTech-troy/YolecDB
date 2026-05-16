import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi } from '@/api';
import { isGalleryItem } from '@/lib/galleryUtils';
import { Event } from '@/types';
import { toast } from 'react-hot-toast';

export function useGalleryItems() {
  const query = useQuery({
    queryKey: ['gallery'],
    queryFn: () => eventsApi.list(1, 200),
  });

  const items = useMemo(
    () => (query.data?.data ?? []).filter(isGalleryItem) as Event[],
    [query.data]
  );

  return { ...query, items };
}

export function useCreateGalleryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      title: string;
      url: string;
      description?: string;
      publish?: boolean;
    }) =>
      eventsApi.create({
        title: data.title,
        url: data.url,
        description: data.description,
        publish: data.publish ?? false,
        type: 'gallery',
        kind: 'gallery',
        contentType: 'gallery',
        uploadDate: new Date().toISOString().split('T')[0],
      } as unknown as Omit<Event, 'id' | 'createdAt' | 'updatedAt'>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Gallery image added');
    },
    onError: (e: Error) => toast.error(e.message || 'Failed to add image'),
  });
}

export function useUpdateGalleryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Event> }) =>
      eventsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Gallery image updated');
    },
    onError: (e: Error) => toast.error(e.message || 'Failed to update image'),
  });
}

export function useToggleGalleryPublish() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, publish }: { id: string; publish: boolean }) =>
      eventsApi.togglePublish(id, publish),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Publish status updated');
    },
    onError: (e: Error) => toast.error(e.message || 'Failed to update publish status'),
  });
}

export function useDeleteGalleryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eventsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Gallery image deleted');
    },
    onError: (e: Error) => toast.error(e.message || 'Failed to delete image'),
  });
}
