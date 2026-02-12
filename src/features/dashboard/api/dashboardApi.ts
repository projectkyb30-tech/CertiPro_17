import { supabase } from '../../../services/supabase';

export const dashboardApi = {
  async getDashboardStats() {
    const { data, error } = await supabase.rpc('get_dashboard_stats');
    if (error) {
      if (error.code === 'PGRST202') {
        return null;
      }
      throw error;
    }
    return data;
  }
};
