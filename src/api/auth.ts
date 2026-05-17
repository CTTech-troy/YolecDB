import { getApiBaseUrl } from '@/config/domains';
import { resolveApiUrl } from '@/lib/apiClient';

const API_BASE_URL = getApiBaseUrl();

export interface InviteValidation {
  email: string;
  fullName: string;
  roleName: string;
  roleDisplayName: string;
  expiresAt: number;
}

export const authApi = {
  async validateInvite(token: string): Promise<InviteValidation> {
    const url = resolveApiUrl(
      API_BASE_URL,
      `/api/public/auth/invite/validate?token=${encodeURIComponent(token)}`
    );
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || 'Invalid invitation');
    }
    return data;
  },

  async setupPassword(body: {
    token: string;
    password: string;
    confirmPassword: string;
  }): Promise<{ success: boolean; email: string }> {
    const url = resolveApiUrl(API_BASE_URL, '/api/public/auth/setup-password');
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || 'Could not set password');
    }
    return data;
  },

  async resetPassword(body: {
    email: string;
    resetKey: string;
    password: string;
    confirmPassword: string;
  }): Promise<{ success: boolean; email: string }> {
    const url = resolveApiUrl(API_BASE_URL, '/api/public/auth/reset-password');
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || 'Could not reset password');
    }
    return data;
  },
};
