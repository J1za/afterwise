import 'server-only';
import { cache } from 'react';
import { Auth } from '@/services';
import { getServerSupabase } from '@/lib/supabaseServer';

export const getServerAuthStatus = cache(async () => {
  const supabase = await getServerSupabase();
  return Auth.getServerStatus(supabase);
});
