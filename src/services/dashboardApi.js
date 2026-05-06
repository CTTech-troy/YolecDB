import { apiRequest } from './apiClient.js';

let dashboardSummaryCache = null;

export function clearDashboardSummaryCache() {
  dashboardSummaryCache = null;
}

export async function fetchDashboardSummary() {
  if (dashboardSummaryCache) return dashboardSummaryCache;
  const data = await apiRequest('/dashboard-summary');
  dashboardSummaryCache = data;
  return data;
}
