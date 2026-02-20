
import { fetchWithRetry } from '../utils/fetchUtils';
import { supabase } from './supabase';

const apiBase = import.meta.env.VITE_API_URL || '/api';

export interface AdminStats {
  totalUsers: number;
  activeCourses: number;
  totalRevenue: number;
  chartData: { name: string; users: number; revenue: number }[];
  recentActivity: { id: number; action: string; user: string; time: string }[];
}

export const adminService = {
  async getStats(): Promise<AdminStats> {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    
    if (!token) throw new Error('Not authenticated');

    const response = await fetchWithRetry(`${apiBase}/admin/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch admin stats');
    }

    return result.data;
  },

  async listUsers(page = 1, limit = 10) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    
    if (!token) throw new Error('Not authenticated');

    const response = await fetchWithRetry(`${apiBase}/admin/users?page=${page}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Failed to fetch users');

    return result.data;
  }
};
