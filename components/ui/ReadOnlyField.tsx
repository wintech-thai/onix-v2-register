'use client';

/**
 * ReadOnlyField Component
 *
 * Displays read-only form field data (username, email, etc.)
 * Used in forms where data is pre-populated and cannot be edited.
 */

import { forwardRef } from 'react';

export interface ReadOnlyFieldProps {
  label: string;
  value: string;
  className?: string;
  icon?: React.ReactNode;
}

export const ReadOnlyField = forwardRef<HTMLDivElement, ReadOnlyFieldProps>(
  ({ label, value, className = '', icon }, ref) => {
    return (
      <div ref={ref} className={`w-full ${className}`}>
        {/* Label */}
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>

        {/* Read-only field container */}
        <div className="relative">
          {/* Icon */}
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">{icon}</span>
            </div>
          )}

          {/* Value display */}
          <div
            className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-700 ${
              icon ? 'pl-10' : ''
            }`}
            aria-readonly="true"
          >
            {value}
          </div>
        </div>
      </div>
    );
  }
);

ReadOnlyField.displayName = 'ReadOnlyField';
