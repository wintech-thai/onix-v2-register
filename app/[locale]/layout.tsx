/**
 * Locale Layout Component
 *
 * Layout wrapper for localized pages in the ONIX v2 Registration Microservice.
 * Uses native Next.js App Router i18n pattern (no external libraries).
 */

import { notFound } from 'next/navigation';
import { locales, type Locale, getDictionary } from '@/i18n';
import type { Metadata } from 'next';
import { Inter, Noto_Sans_Thai } from 'next/font/google';
import { TopNavigation } from '@/components/navigation/TopNavigation';
import { Footer } from '@/components/navigation/Footer';
import '../globals.css';

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
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: 'Please Scan Register - Registration System',
    description: 'Secure user registration and email verification system for Please Scan',
    keywords: ['registration', 'verification', 'email', 'security', 'validation'],
    authors: [{ name: 'Please Scan Development Team' }],
    robots: 'noindex, nofollow', // Prevent indexing of registration pages
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Validate that the incoming locale parameter is valid
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // Preload dictionary (will be cached by React)
  await getDictionary(locale as Locale);

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
