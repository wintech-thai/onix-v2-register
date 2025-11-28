/**
 * Internationalization Configuration
 * Native Next.js App Router i18n pattern (no external libraries)
 * Uses searchParams (?lang=en or ?lang=th) instead of path segments
 */

import enDict from './dictionaries/en.json';
import thDict from './dictionaries/th.json';

export const locales = ['en', 'th'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeLabels: Record<Locale, string> = {
  en: 'English',
  th: 'ภาษาไทย',
};

// Dictionary type for type-safe translations
export type Dictionary = typeof enDict;

// Pre-loaded dictionaries
const dictionaries: Record<Locale, Dictionary> = {
  en: enDict,
  th: thDict as Dictionary,
};

/**
 * Load dictionary for a given locale
 */
export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale];
}

/**
 * Check if a given locale is valid
 */
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

/**
 * Get locale from searchParams (server-side)
 * @param searchParams - Next.js searchParams object
 * @returns Valid locale or default locale
 */
export function getLocaleFromSearchParams(
  searchParams: { [key: string]: string | string[] | undefined } | undefined
): Locale {
  if (!searchParams) return defaultLocale;

  const lang = searchParams.lang;
  const localeString = Array.isArray(lang) ? lang[0] : lang;

  if (localeString && isValidLocale(localeString)) {
    return localeString;
  }

  return defaultLocale;
}

/**
 * Create a URL with preserved searchParams and updated locale
 * @param pathname - Current pathname
 * @param searchParams - Current searchParams
 * @param newLocale - New locale to set
 * @returns Updated URL string
 */
export function createLocaleUrl(
  pathname: string,
  searchParams: URLSearchParams | Record<string, string>,
  newLocale: Locale
): string {
  const params = new URLSearchParams(
    searchParams instanceof URLSearchParams ? searchParams : Object.entries(searchParams)
  );

  params.set('lang', newLocale);

  const queryString = params.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
}

/**
 * Get locale from URLSearchParams (client-side)
 * @param searchParams - URLSearchParams instance
 * @returns Valid locale or default locale
 */
export function getLocaleFromURLSearchParams(searchParams: URLSearchParams): Locale {
  const lang = searchParams.get('lang');

  if (lang && isValidLocale(lang)) {
    return lang;
  }

  return defaultLocale;
}
