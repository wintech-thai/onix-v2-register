'use client';

/**
 * HamburgerMenu Component
 *
 * Mobile-responsive hamburger menu for language selection.
 * Slide-in panel from the right with language options.
 * Matches template design exactly.
 */

import React, { useState, useEffect } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { Menu, X, Globe } from 'lucide-react';
import { locales, localeLabels, type Locale } from '@/i18n';

interface HamburgerMenuProps {
  className?: string;
}

export function HamburgerMenu({ className = '' }: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const currentLocale = (params?.locale as Locale) || 'en';

  // Close menu
  const closeMenu = () => setIsOpen(false);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle language switch
  const switchLocale = (newLocale: Locale) => {
    const pathWithoutLocale = pathname.replace(`/${currentLocale}`, '');
    router.push(`/${newLocale}${pathWithoutLocale || ''}`);
    closeMenu();

    // Set cookie for persistence
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}`;
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 hover:bg-white/10 rounded-lg transition-colors ${className}`}
        aria-label="Menu"
        aria-expanded={isOpen}
        style={{
          color: '#f3f7fa',
        }}
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* Slide-in Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {currentLocale === 'th' ? 'เมนู' : 'Menu'}
          </h2>
          <button
            onClick={closeMenu}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {/* Panel Content */}
        <nav className="p-4 space-y-4">
          {/* Language Selection */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <Globe className="w-4 h-4" />
              <span>{currentLocale === 'th' ? 'ภาษา' : 'Language'}</span>
            </div>

            <div className="space-y-2">
              {/* English Option */}
              <button
                onClick={() => switchLocale('en')}
                className={`block w-full px-4 py-3 rounded-lg text-left transition-colors ${
                  currentLocale === 'en'
                    ? 'bg-blue-50 text-blue-700 font-medium border border-blue-200'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇬🇧</span>
                  <div>
                    <div className="font-medium">English</div>
                    <div className="text-xs text-gray-500">English</div>
                  </div>
                  {currentLocale === 'en' && (
                    <span className="ml-auto text-blue-600 text-lg">✓</span>
                  )}
                </div>
              </button>

              {/* Thai Option */}
              <button
                onClick={() => switchLocale('th')}
                className={`block w-full px-4 py-3 rounded-lg text-left transition-colors ${
                  currentLocale === 'th'
                    ? 'bg-blue-50 text-blue-700 font-medium border border-blue-200'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇹🇭</span>
                  <div>
                    <div className="font-medium">ไทย</div>
                    <div className="text-xs text-gray-500">Thai</div>
                  </div>
                  {currentLocale === 'th' && (
                    <span className="ml-auto text-blue-600 text-lg">✓</span>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-4" />

          {/* Privacy Policy Link */}
          <div className="space-y-2">
            <a
              href="https://please-scan.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full px-4 py-3 rounded-lg text-left text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={closeMenu}
            >
              <div className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span>
                  {currentLocale === 'th' ? 'นโยบายความเป็นส่วนตัว' : 'Privacy Policy'}
                </span>
              </div>
            </a>
          </div>
        </nav>
      </div>
    </>
  );
}
