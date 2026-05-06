import { apiRequest } from './apiClient.js';

export function listEventRegistrations() {
  return apiRequest('/event-registrations');
}

export function deleteAllEventRegistrations() {
  return apiRequest('/event-registrations', { method: 'DELETE' });
}
