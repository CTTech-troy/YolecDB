import { apiRequest } from './apiClient.js';

export function fetchBlogRegistrations() {
  return apiRequest('/blog-registrations');
}
