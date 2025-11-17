'use client';

/**
 * Forgot Password Form Component
 *
 * Allows users to reset their password by providing a new password.
 * Displays username and email as read-only fields.
 *
 * Flow:
 * 1. Display pre-populated username and email (read-only)
 * 2. User enters new password and confirms it
 * 3. Client-side validation (password policy)
 * 4. Submit to API: POST /org/{org}/action/ConfirmForgotPasswordReset/{token}/{username}
 * 5. Show success message or error
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { confirmPasswordReset } from '@/lib/api-client';
import { passwordSchema } from '@/lib/validation';
import { Button } from '@/components/ui/Button';
import { ReadOnlyField } from '@/components/ui/ReadOnlyField';
import PasswordInput from '@/components/ui/PasswordInput';

// Form schema for password reset
const forgotPasswordFormSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ForgotPasswordFormData = z.infer<typeof forgotPasswordFormSchema>;

export interface ForgotPasswordFormProps {
  organization: string;
  token: string;
  username: string;
  email: string;
  locale: string;
  dictionary: {
    forms: {
      forgotPassword: {
        title: string;
        description: string;
        username: string;
        email: string;
        newPassword: string;
        confirmPassword: string;
        submitButton: string;
        success: string;
      };
    };
    validation: {
      password: {
        required: string;
        minLength: string;
        uppercase: string;
        lowercase: string;
        number: string;
        special: string;
      };
      confirmPassword: {
        required: string;
        mismatch: string;
      };
    };
    errors: {
      apiError: string;
      networkError: string;
      unknownError: string;
      validationError: string;
    };
    common: {
      loading: string;
    };
  };
}

export default function ForgotPasswordForm({
  organization,
  token,
  username,
  email,
  locale,
  dictionary,
}: ForgotPasswordFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Initialize React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordFormSchema),
    mode: 'onBlur',
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPassword = watch('newPassword');
  const confirmPassword = watch('confirmPassword');

  const onSubmit = async (data: ForgotPasswordFormData) => {
    // Clear previous errors
    setApiError(null);
    setIsSubmitting(true);

    try {
      // Call API to reset password
      await confirmPasswordReset({
        org: organization,
        token,
        username,
        newPassword: data.newPassword,
      });

      // Show success state
      setIsSuccess(true);

      // Optional: Redirect to login after 5 seconds
      setTimeout(() => {
        // router.push(`/${locale}/login`);
      }, 5000);
    } catch (err: any) {
      console.error('Password reset failed:', err);

      // Handle different error types
      if (err.message?.includes('Network Error')) {
        setApiError(dictionary.errors.networkError);
      } else if (err.message?.includes('timeout')) {
        setApiError(dictionary.errors.apiError);
      } else if (err.response?.data?.message) {
        setApiError(err.response.data.message);
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        setApiError('Invalid or expired reset link. Please request a new password reset.');
      } else {
        setApiError(dictionary.errors.unknownError);
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
              {dictionary.forms.forgotPassword.success}
            </h2>
            <p className="text-gray-600">You can now log in with your new password.</p>
          </div>

          {/* Next Steps */}
          <div className="pt-4">
            <p className="text-sm text-gray-500">Redirecting to login page in a few seconds...</p>
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
          {dictionary.forms.forgotPassword.title}
        </h1>
        <p className="text-gray-600">{dictionary.forms.forgotPassword.description}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {/* Username Field (Read-Only) */}
        <ReadOnlyField label={dictionary.forms.forgotPassword.username} value={username} />

        {/* Email Field (Read-Only) */}
        <ReadOnlyField label={dictionary.forms.forgotPassword.email} value={email} />

        {/* New Password Field */}
        <PasswordInput
          id="new-password"
          name="newPassword"
          label={dictionary.forms.forgotPassword.newPassword}
          value={newPassword}
          onChange={(value) => setValue('newPassword', value, { shouldValidate: true })}
          error={errors.newPassword?.message}
          required
          autoComplete="new-password"
          showStrengthIndicator
          disabled={isSubmitting}
        />

        {/* Confirm Password Field */}
        <PasswordInput
          id="confirm-password"
          name="confirmPassword"
          label={dictionary.forms.forgotPassword.confirmPassword}
          value={confirmPassword}
          onChange={(value) => setValue('confirmPassword', value, { shouldValidate: true })}
          error={errors.confirmPassword?.message}
          required
          autoComplete="new-password"
          disabled={isSubmitting}
        />

        {/* Password Requirements Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Password Requirements:</h3>
          <ul className="text-xs text-blue-800 space-y-1">
            <li className="flex items-start gap-2">
              <span className="mt-0.5">•</span>
              <span>{dictionary.validation.password.minLength}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5">•</span>
              <span>{dictionary.validation.password.uppercase}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5">•</span>
              <span>{dictionary.validation.password.lowercase}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5">•</span>
              <span>{dictionary.validation.password.number}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5">•</span>
              <span>{dictionary.validation.password.special}</span>
            </li>
          </ul>
        </div>

        {/* API Error Message */}
        {apiError && (
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
                <h3 className="text-sm font-semibold text-red-800 mb-1">Password Reset Failed</h3>
                <p className="text-sm text-red-700">{apiError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button type="submit" variant="primary" disabled={isSubmitting} className="w-full">
          {isSubmitting ? dictionary.common.loading : dictionary.forms.forgotPassword.submitButton}
        </Button>

        {/* Loading Indicator */}
        {isSubmitting && (
          <p className="text-sm text-gray-500 text-center" role="status">
            {dictionary.common.loading}
          </p>
        )}
      </form>

      {/* Security Note */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          For your security, this link will expire after 24 hours and can only be used once.
        </p>
      </div>
    </div>
  );
}
