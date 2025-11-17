/**
 * Root Layout Component
 *
 * Minimal root layout that wraps the entire application.
 * The actual layout with metadata and providers is in app/[locale]/layout.tsx
 *
 * Note: This layout should NOT define <html> or <body> tags to avoid hydration mismatches.
 * Those are defined in the locale layout.
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Please Scan Register - Registration System',
  description: 'Secure user registration and email verification system for Please Scan',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
