import { apiRequest } from './apiClient.js';

export function listNewsletterSubscribers() {
  return apiRequest('/newsletter-subscribers');
}
