import { supabase } from '../../../services/supabase';
import { fetchWithRetry } from '../../../utils/fetchUtils';

const getAuthToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
};

const apiBase = import.meta.env.VITE_API_URL || '/api';

export const billingApi = {
  async createCheckoutSession(params: { courseId: string; userId: string; email: string }) {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No auth token');
    }

    const response = await fetchWithRetry(`${apiBase}/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to init checkout');
    }

    return data as { url?: string };
  },
  async verifyPayment(sessionId: string) {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetchWithRetry(`${apiBase}/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ sessionId }),
    });

    const data = await response.json();
    return { ok: response.ok, data };
  },
  async syncPurchase(params: { courseId: string; userId: string }) {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No auth token');
    }

    const response = await fetchWithRetry(`${apiBase}/sync-purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();
    return { ok: response.ok, data };
  }
};
