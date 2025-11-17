'use client';

/**
 * TopNavigation Component
 *
 * Main navigation bar for the ONIX v2 Registration Microservice.
 * Features:
 * - PS badge icon (blue box)
 * - "Please Scan Register" branding
 * - Hamburger menu for language selection
 * - Responsive design
 * - Matches verify theme visual style (navy blue #183153 background)
 */

import Link from 'next/link';
import { HamburgerMenu } from './HamburgerMenu';

interface TopNavigationProps {
  className?: string;
}

export function TopNavigation({ className = '' }: TopNavigationProps) {
  return (
    <header className={className}>
      <nav
        style={{
          background: '#183153',
          borderBottom: '1px solid #25406b',
          boxShadow: '0 4px 14px rgba(24,49,83,0.08)',
          padding: '1rem 0',
        }}
        aria-label="Top navigation"
      >
        <div
          style={{
            maxWidth: '960px',
            margin: '0 auto',
            padding: '0 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Left: Logo + Title */}
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontWeight: 700,
              letterSpacing: '0.2px',
              color: '#f3f7fa',
              textDecoration: 'none',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: '#2563eb',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 700,
                boxShadow: '0 2px 8px rgba(37,99,235,0.10)',
              }}
            >
              PS
            </span>
            <span>Please Scan Register</span>
          </Link>

          {/* Right: Hamburger Menu */}
          <HamburgerMenu />
        </div>
      </nav>
    </header>
  );
}
