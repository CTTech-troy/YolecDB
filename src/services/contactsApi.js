import { apiRequest } from './apiClient.js';

export function listContacts() {
  return apiRequest('/contacts');
}
