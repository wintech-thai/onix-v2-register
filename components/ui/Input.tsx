'use client';

/**
 * Input Component - Matches VerifyView.tsx template exactly
 *
 * Uses exact styling from the original template.
 * No differences in border, focus ring, padding, or colors.
 */

import { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = true,
      className = '',
      disabled,
      required,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    // Container styles
    const containerStyles = fullWidth ? 'w-full' : '';

    // Input styles matching template exactly
    // From VerifyView.tsx: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
    const baseInputStyles = error
      ? 'w-full px-3 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 disabled:opacity-70 disabled:cursor-not-allowed'
      : 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:opacity-70 disabled:cursor-not-allowed';

    const inputStyles = `${baseInputStyles} ${className}`;

    return (
      <div className={containerStyles}>
        {/* Label - matches template exactly */}
        {label && (
          <label htmlFor={inputId} className="block text-sm font-semibold mb-2 text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Input Field */}
        <input
          ref={ref}
          id={inputId}
          className={inputStyles}
          disabled={disabled}
          required={required}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
          }
          {...props}
        />

        {/* Error Message */}
        {error && (
          <p id={`${inputId}-error`} className="mt-2 text-sm text-red-600 font-medium" role="alert">
            {error}
          </p>
        )}

        {/* Helper Text */}
        {!error && helperText && (
          <p id={`${inputId}-helper`} className="mt-2 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
