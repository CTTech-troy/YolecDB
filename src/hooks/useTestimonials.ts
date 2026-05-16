/**
 * React Query hooks for testimonials
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { testimonialsApi } from '@/api';
import { Testimonial } from '@/types';
import { toast } from 'react-hot-toast';

export function useTestimonials(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['testimonials', page, limit],
    queryFn: () => testimonialsApi.list(page, limit),
  });
}

export function useTestimonial(id: string) {
  return useQuery({
    queryKey: ['testimonials', id],
    queryFn: () => testimonialsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Testimonial, 'id' | 'createdAt' | 'updatedAt'>) =>
      testimonialsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      toast.success('Testimonial created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create testimonial');
    },
  });
}

export function useUpdateTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Testimonial> }) =>
      testimonialsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      toast.success('Testimonial updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update testimonial');
    },
  });
}

export function useDeleteTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => testimonialsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      toast.success('Testimonial deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete testimonial');
    },
  });
}
