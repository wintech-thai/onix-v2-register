'use client';

/**
 * PasswordInput Component
 *
 * A reusable password input field with:
 * - Show/hide password toggle
 * - Real-time validation feedback
 * - Password strength indicator
 * - Accessibility features (ARIA labels, keyboard navigation)
 * - Error message display
 */

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { validatePasswordStrength, getPasswordStrengthLabel } from '@/lib/validation';

export interface PasswordInputProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  showStrengthIndicator?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function PasswordInput({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  placeholder = '••••••••',
  required = false,
  autoComplete = 'new-password',
  showStrengthIndicator = false,
  disabled = false,
  className = '',
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Calculate password strength
  const strength =
    showStrengthIndicator && value.length > 0 ? validatePasswordStrength(value) : null;

  const strengthInfo = strength ? getPasswordStrengthLabel(strength.score) : null;

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (onBlur) {
      onBlur();
    }
  };

  const inputClasses = `
    w-full px-4 py-3 pr-12
    text-base text-gray-900
    border-2 rounded-lg
    transition-all duration-200
    ${
      error
        ? 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-200'
        : isFocused
          ? 'border-blue-500 ring-2 ring-blue-200'
          : 'border-gray-300 hover:border-gray-400 focus:border-blue-500'
    }
    ${disabled ? 'bg-gray-50 cursor-not-allowed opacity-60' : 'bg-white'}
    focus:outline-none
    placeholder:text-gray-400
  `
    .trim()
    .replace(/\s+/g, ' ');

  const strengthColors: Record<string, string> = {
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    yellow: 'bg-yellow-500',
    green: 'bg-green-500',
  };

  const strengthTextColors: Record<string, string> = {
    red: 'text-red-600',
    orange: 'text-orange-600',
    yellow: 'text-yellow-600',
    green: 'text-green-600',
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {/* Label */}
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        )}
      </label>

      {/* Input Container */}
      <div className="relative">
        <input
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          disabled={disabled}
          className={inputClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? `${id}-error` : showStrengthIndicator ? `${id}-strength` : undefined
          }
        />

        {/* Show/Hide Password Toggle Button */}
        <button
          type="button"
          onClick={handleTogglePassword}
          disabled={disabled}
          className="
            absolute right-3 top-1/2 -translate-y-1/2
            p-2 rounded-md
            text-gray-500 hover:text-gray-700
            focus:outline-none focus:ring-2 focus:ring-blue-500
            transition-colors duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
          "
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          tabIndex={0}
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" aria-hidden="true" />
          ) : (
            <Eye className="w-5 h-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Password Strength Indicator */}
      {showStrengthIndicator && value.length > 0 && strength && strengthInfo && (
        <div id={`${id}-strength`} className="space-y-2 pt-2" role="status" aria-live="polite">
          {/* Strength Bar */}
          <div className="flex gap-1">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className={`
                  h-1 flex-1 rounded-full transition-all duration-300
                  ${index < strength.score ? strengthColors[strengthInfo.color] : 'bg-gray-200'}
                `}
              />
            ))}
          </div>

          {/* Strength Label */}
          <p className={`text-sm font-medium ${strengthTextColors[strengthInfo.color]}`}>
            Password Strength: {strengthInfo.label}
          </p>

          {/* Validation Feedback */}
          {!strength.isValid && strength.feedback.length > 0 && (
            <ul className="text-xs text-gray-600 space-y-1">
              {strength.feedback.map((message, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>{message}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-600 flex items-start gap-1" role="alert">
          <span className="mt-0.5">⚠</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
