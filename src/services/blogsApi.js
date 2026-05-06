import { apiRequest } from './apiClient.js';

export function listBlogs() {
  return apiRequest('/blog');
}

export function createBlog(payload) {
  return apiRequest('/blog', { method: 'POST', body: payload });
}

export function updateBlog(id, payload) {
  return apiRequest(`/blog/${encodeURIComponent(id)}`, { method: 'PUT', body: payload });
}

export function deleteBlog(id) {
  return apiRequest(`/blog/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
