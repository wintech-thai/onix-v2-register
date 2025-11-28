/**
 * Root Layout Component
 *
 * Main layout for the ONIX v2 Registration Microservice.
 * Uses searchParams-based i18n (?lang=en or ?lang=th) instead of path segments.
 * This is the only layout that defines <html> and <body> tags to avoid hydration mismatches.
 */

import type { Metadata } from 'next';
import { Inter, Noto_Sans_Thai } from 'next/font/google';
import { TopNavigation } from '@/components/navigation/TopNavigation';
import { Footer } from '@/components/navigation/Footer';
import { getLocaleFromSearchParams, type Locale } from '@/i18n';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const notoSansThai = Noto_Sans_Thai({
  subsets: ['thai', 'latin'],
  weight: ['400', '600', '700'],
  variable: '--font-noto-sans-thai',
  display: 'swap',
});

type Props = {
  children: React.ReactNode;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const metadata: Metadata = {
  title: 'Please Scan Register - Registration System',
  description: 'Secure user registration and email verification system for Please Scan',
  keywords: ['registration', 'verification', 'email', 'security', 'validation'],
  authors: [{ name: 'Please Scan Development Team' }],
  robots: 'noindex, nofollow', // Prevent indexing of registration pages
};

export default async function RootLayout({ children, searchParams }: Props) {
  // Get locale from searchParams (defaults to 'en' if not provided)
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const locale = getLocaleFromSearchParams(resolvedSearchParams);

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`${inter.variable} ${notoSansThai.variable}`}
        style={{
          fontFamily:
            '"Inter", "Noto Sans Thai", system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", sans-serif',
        }}
      >
        <div className="min-h-screen flex flex-col" style={{ background: '#f7f8fb' }}>
          <TopNavigation />
          <main role="main" className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
