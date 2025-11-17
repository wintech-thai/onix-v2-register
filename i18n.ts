/**
 * Internationalization Configuration
 * Native Next.js App Router i18n pattern (no external libraries)
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
export type Dictionary = typeof import('./dictionaries/en.json');

// Pre-loaded dictionaries
const dictionaries = {
  en: enDict,
  th: thDict,
};

/**
 * Load dictionary for a given locale
 */
export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale] as Dictionary;
}

/**
 * Check if a given locale is valid
 */
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}
