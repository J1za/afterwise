export const locales = ['uk', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'uk';
export const localeCookieName = 'NEXT_LOCALE';
