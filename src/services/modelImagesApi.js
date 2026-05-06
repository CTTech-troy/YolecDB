import { apiRequest } from './apiClient.js';

export function listModelImages() {
  return apiRequest('/model-images');
}

export function createModelImage(payload) {
  return apiRequest('/model-images', { method: 'POST', body: payload });
}

export function updateModelImage(id, payload) {
  return apiRequest(`/model-images/${encodeURIComponent(id)}`, { method: 'PATCH', body: payload });
}

export function deleteModelImage(id) {
  return apiRequest(`/model-images/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
