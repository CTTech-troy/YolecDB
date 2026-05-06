import { apiRequest } from './apiClient.js';

export function listTestimonials() {
  return apiRequest('/testimonials');
}

export function updateTestimonial(id, payload) {
  return apiRequest(`/testimonials/${encodeURIComponent(id)}`, { method: 'PATCH', body: payload });
}

export function deleteTestimonial(id) {
  return apiRequest(`/testimonials/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
