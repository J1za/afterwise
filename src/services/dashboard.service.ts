import { supabase } from '@/lib';
import { dashboardStatsSchema } from '@/validations';

export const Dashboard = {
  async getStats() {
    const { data, error } = await supabase.rpc('dashboard_stats');
    if (error) throw error;
    return dashboardStatsSchema.parse(data);
  },
};
