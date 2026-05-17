import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import {
  defaultLocale,
  locales,
  localeCookieName,
  type Locale,
} from "./config";

function pickFromAcceptLanguage(value: string | null): Locale | null {
  if (!value) return null;
  const candidates = value
    .split(",")
    .map((p) => p.trim().split(";")[0]?.toLowerCase().slice(0, 2));
  for (const candidate of candidates) {
    if (candidate && (locales as readonly string[]).includes(candidate)) {
      return candidate as Locale;
    }
  }
  return null;
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const fromCookie = cookieStore.get(localeCookieName)?.value;
  const cookieLocale = (locales as readonly string[]).includes(fromCookie ?? "")
    ? (fromCookie as Locale)
    : null;

  const locale =
    cookieLocale ??
    pickFromAcceptLanguage(headerStore.get("accept-language")) ??
    defaultLocale;

  const messages = (await import(`../locales/${locale}.json`)).default;

  return { locale, messages };
});
