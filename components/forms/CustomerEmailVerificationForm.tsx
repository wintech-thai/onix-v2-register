'use client';

/**
 * Customer Email Verification Form Component
 *
 * Displays customer information (name and email) as read-only fields
 * and provides a confirm button to verify the email address.
 *
 * Flow:
 * 1. Display pre-populated customer name and email (read-only)
 * 2. User clicks "Verify Email" button
 * 3. Submit to API: POST /org/{org}/action/ConfirmCustomerEmailVerification/{token}/{customerId}
 * 4. Show success message or error
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { confirmEmailVerification } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { ReadOnlyField } from '@/components/ui/ReadOnlyField';

export interface CustomerEmailVerificationFormProps {
  organization: string;
  token: string;
  customerId: string;
  name: string;
  email: string;
  locale: string;
  dictionary: {
    forms: {
      customerVerification: {
        title: string;
        description: string;
        name: string;
        email: string;
        confirmButton: string;
        success: string;
      };
    };
    errors: {
      apiError: string;
      networkError: string;
      unknownError: string;
    };
    common: {
      loading: string;
    };
  };
}

export default function CustomerEmailVerificationForm({
  organization,
  token,
  customerId,
  name,
  email,
  locale,
  dictionary,
}: CustomerEmailVerificationFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setError(null);
    setIsSubmitting(true);

    try {
      // Call API to confirm email verification
      await confirmEmailVerification({ org: organization, token, customerId });

      // Show success state
      setIsSuccess(true);

      // Optional: Redirect after 3 seconds
      setTimeout(() => {
        // You can redirect to a success page or login page
        // router.push(`/${locale}/verification-success`);
      }, 3000);
    } catch (err: any) {
      console.error('Email verification failed:', err);

      // Handle different error types
      if (err.message?.includes('Network Error')) {
        setError(dictionary.errors.networkError);
      } else if (err.message?.includes('timeout')) {
        setError(dictionary.errors.apiError);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(dictionary.errors.unknownError);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success view
  if (isSuccess) {
    return (
      <div
        className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto"
        role="status"
        aria-live="polite"
      >
        <div className="text-center space-y-4">
          {/* Success Icon */}
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Success Message */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {dictionary.forms.customerVerification.success}
            </h2>
            <p className="text-gray-600">Your email address has been verified successfully.</p>
          </div>
        </div>
      </div>
    );
  }

  // Form view
  return (
    <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          {dictionary.forms.customerVerification.title}
        </h1>
        <p className="text-gray-600">{dictionary.forms.customerVerification.description}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field (Read-Only) */}
        <ReadOnlyField label={dictionary.forms.customerVerification.name} value={name} />

        {/* Email Field (Read-Only) */}
        <ReadOnlyField label={dictionary.forms.customerVerification.email} value={email} />

        {/* Error Message */}
        {error && (
          <div
            className="bg-red-50 border-2 border-red-200 rounded-lg p-4"
            role="alert"
            aria-live="assertive"
          >
            <div className="flex items-start gap-3">
              <span className="text-red-500 text-xl" aria-hidden="true">
                ⚠
              </span>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-800 mb-1">Verification Failed</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button type="submit" variant="primary" disabled={isSubmitting} className="w-full">
          {isSubmitting
            ? dictionary.common.loading
            : dictionary.forms.customerVerification.confirmButton}
        </Button>

        {/* Loading Indicator */}
        {isSubmitting && (
          <p className="text-sm text-gray-500 text-center" role="status">
            {dictionary.common.loading}
          </p>
        )}
      </form>

      {/* Additional Information */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          By verifying your email, you confirm that this email address belongs to you.
        </p>
      </div>
    </div>
  );
}
