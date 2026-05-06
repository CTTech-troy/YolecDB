import { apiRequest } from './apiClient.js';

export function listEvents() {
  return apiRequest('/events');
}

export function createEvent(payload) {
  return apiRequest('/events', { method: 'POST', body: payload });
}

export function updateEvent(id, payload) {
  return apiRequest(`/events/${encodeURIComponent(id)}`, { method: 'PATCH', body: payload });
}

export function deleteEvent(id) {
  return apiRequest(`/events/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export function getRegistrationStats() {
  return apiRequest('/registration-stats');
}
