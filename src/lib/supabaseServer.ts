import 'server-only';
import { cookies } from 'next/headers';
import { createServerClient } from './supabase';

export async function getServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient({
    getAll() {
      return cookieStore.getAll();
    },
    setAll(toSet) {
      try {
        toSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options),
        );
      } catch {}
    },
  });
}
