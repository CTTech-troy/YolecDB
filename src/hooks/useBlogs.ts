/**
 * React Query hooks for blogs
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blogsApi } from '@/api';
import { CreateBlogDto } from '@/types';
import { toast } from 'react-hot-toast';

export function useBlogs(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['blogs', page, limit],
    queryFn: () => blogsApi.list(page, limit),
  });
}

export function useBlog(id: string) {
  return useQuery({
    queryKey: ['blogs', id],
    queryFn: () => blogsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBlogDto) => blogsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      toast.success('Blog created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create blog');
    },
  });
}

export function useUpdateBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateBlogDto> }) =>
      blogsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      toast.success('Blog updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update blog');
    },
  });
}

export function useToggleBlogPublish() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, publish }: { id: string; publish: boolean }) =>
      blogsApi.togglePublish(id, publish),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      toast.success('Blog publish status updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update publish status');
    },
  });
}

export function useDeleteBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => blogsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      toast.success('Blog deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete blog');
    },
  });
}
