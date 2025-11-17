'use client';

/**
 * Button Component - Matches VerifyView.tsx template exactly
 *
 * Uses inline gradient styles and hover effects to match the original template.
 * No differences in styling from the reference implementation.
 */

import { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  fullWidth?: boolean;
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      fullWidth = false,
      isLoading = false,
      className = '',
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    // Base gradient backgrounds and shadows for each variant
    const gradients = {
      primary: {
        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
        hover: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
        shadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
      },
      secondary: {
        background: '#3b82f6', // Solid blue-500
        hover: '#2563eb', // Solid blue-600
        shadow: 'none',
      },
      success: {
        background: 'linear-gradient(135deg, #62D204 0%, #58CD04 100%)',
        hover: 'linear-gradient(135deg, #58CD04 0%, #4BB803 100%)',
        shadow: '0 2px 8px rgba(98, 210, 4, 0.3)',
      },
      warning: {
        background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
        hover: 'linear-gradient(135deg, #f57c00 0%, #ef6c00 100%)',
        shadow: '0 2px 8px rgba(255, 152, 0, 0.3)',
      },
      danger: {
        background: '#dc2626', // Solid red-600
        hover: '#b91c1c', // Solid red-700
        shadow: 'none',
      },
    };

    const currentGradient = gradients[variant];

    // Base classes matching template exactly
    const baseClasses = `w-${fullWidth ? 'full' : 'auto'} py-3 px-4 text-white font-semibold rounded-lg transition-colors border-0 disabled:opacity-70 disabled:cursor-not-allowed`;

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled && !isLoading) {
        e.currentTarget.style.background = currentGradient.hover;
      }
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.style.background = currentGradient.background;
    };

    return (
      <button
        ref={ref}
        type={type}
        className={`${baseClasses} ${className}`}
        style={{
          background: currentGradient.background,
          boxShadow: currentGradient.shadow,
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="inline-flex items-center justify-center gap-2">
            <svg
              className="w-5 h-5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {children}
          </span>
        ) : (
          <span className="inline-flex items-center justify-center gap-2">{children}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
