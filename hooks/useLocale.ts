'use client';

/**
 * useLocale Hook
 *
 * Custom hook for client components to access current locale from searchParams.
 * Provides locale state and helper functions for locale-aware navigation.
 */

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { getLocaleFromURLSearchParams, createLocaleUrl, type Locale, defaultLocale } from '@/i18n';
import { useCallback, useMemo } from 'react';

export function useLocale() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Get current locale from searchParams
  const locale = useMemo(() => {
    return getLocaleFromURLSearchParams(searchParams);
  }, [searchParams]);

  /**
   * Switch to a new locale while preserving all other searchParams
   */
  const switchLocale = useCallback(
    (newLocale: Locale) => {
      const newUrl = createLocaleUrl(pathname, searchParams, newLocale);
      router.push(newUrl);

      // Set cookie for persistence (optional - for server-side detection)
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}`;
    },
    [pathname, searchParams, router]
  );

  /**
   * Create a URL with the current locale and additional searchParams
   */
  const createLocalizedUrl = useCallback(
    (path: string, additionalParams?: Record<string, string>) => {
      const params = new URLSearchParams(searchParams);

      // Add current locale
      params.set('lang', locale);

      // Add any additional params
      if (additionalParams) {
        Object.entries(additionalParams).forEach(([key, value]) => {
          params.set(key, value);
        });
      }

      const queryString = params.toString();
      return queryString ? `${path}?${queryString}` : path;
    },
    [searchParams, locale]
  );

  /**
   * Get all current searchParams as an object
   */
  const allSearchParams = useMemo(() => {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }, [searchParams]);

  return {
    locale,
    switchLocale,
    createLocalizedUrl,
    searchParams: allSearchParams,
  };
}
