'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { locales, localeCookieName, type Locale } from '@/i18n';

export async function setLocaleAction(locale: Locale) {
  if (!(locales as readonly string[]).includes(locale)) return;
  const cookieStore = await cookies();
  cookieStore.set(localeCookieName, locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });
  revalidatePath('/', 'layout');
}
