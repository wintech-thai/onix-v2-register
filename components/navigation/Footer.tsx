'use client';

/**
 * Footer Component
 *
 * Footer for the ONIX v2 Registration Microservice.
 * Features:
 * - Copyright notice
 * - Privacy policy link
 * - Matches verify theme visual style (navy blue #183153 background)
 */

import Link from 'next/link';

interface FooterProps {
  className?: string;
}

export function Footer({ className = '' }: FooterProps) {
  return (
    <footer
      style={{
        borderTop: '1px solid #25406b',
        background: '#183153',
      }}
      className={className}
    >
      <div
        style={{
          maxWidth: '960px',
          margin: '0 auto',
          padding: '14px 1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#b6c6e3',
          fontSize: '14px',
        }}
      >
        <div>© {new Date().getFullYear()} Please Scan</div>
        <div>
          <Link
            href="https://please-scan.com/privacy"
            style={{
              color: '#b6c6e3',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#f3f7fa';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#b6c6e3';
            }}
          >
            นโยบายความเป็นส่วนตัว
          </Link>
        </div>
      </div>
    </footer>
  );
}
