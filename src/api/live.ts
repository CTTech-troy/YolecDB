import { apiClient } from '@/lib/apiClient';

export interface LiveSession {
  id: string;
  eventId: string;
  hostUid: string;
  title: string;
  thumbnail?: string;
  isLive: boolean;
  roomName: string;
  viewerCount: number;
  startedAt: number;
  endedAt?: number;
}

export const liveApi = {
  getStatus(eventId: string) {
    return apiClient.get<{ session: LiveSession | null; isLive: boolean }>(
      `/api/mgmt/live/${eventId}/status`
    );
  },

  start(eventId: string, title?: string, thumbnail?: string) {
    return apiClient.post<{
      session: LiveSession;
      token: string;
      serverUrl: string;
    }>(`/api/mgmt/live/${eventId}/start`, { title, thumbnail });
  },

  end(eventId: string) {
    return apiClient.post<{ success: boolean }>(`/api/mgmt/live/${eventId}/end`);
  },

  getHostToken(eventId: string) {
    return apiClient.get<{
      token: string;
      serverUrl: string;
      session: LiveSession;
    }>(`/api/mgmt/live/${eventId}/token`);
  },
};
