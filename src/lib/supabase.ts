import { createBrowserClient, createServerClient as createSsrServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import type { CookieOptions } from '@supabase/ssr';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createBrowserClient(url, anonKey);

export type CookieStore = {
  getAll: () => { name: string; value: string }[];
  setAll?: (
    cookies: { name: string; value: string; options?: CookieOptions }[],
  ) => void;
};

export function createServerClient(cookies: CookieStore) {
  return createSsrServerClient(url!, anonKey!, { cookies });
}

export function createAdminClient() {
  if (typeof window !== 'undefined') {
    throw new Error('createAdminClient must never be called in the browser');
  }
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY required for admin client. Add it in .env.local (Supabase Dashboard → Settings → API → service_role).',
    );
  }
  return createClient(url!, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
