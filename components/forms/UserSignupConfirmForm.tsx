'use client';

/**
 * User Signup Confirm Form Component
 *
 * Allows new users to complete their registration by providing:
 * - Password (with confirmation)
 * - First name
 * - Last name
 *
 * Username and email are pre-populated and displayed as read-only.
 *
 * Flow:
 * 1. Display pre-populated username and email (read-only)
 * 2. User enters password, confirm password, first name, last name
 * 3. Client-side validation (password policy, name validation)
 * 4. Submit to API: POST /org/{org}/action/ConfirmNewUserInvitation/{token}/{username}
 * 5. Show success message or error
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { confirmUserSignup } from '@/lib/api-client';
import { passwordSchema, nameSchema } from '@/lib/validation';
import { Button } from '@/components/ui/Button';
import { ReadOnlyField } from '@/components/ui/ReadOnlyField';
import PasswordInput from '@/components/ui/PasswordInput';
import { Input } from '@/components/ui/Input';

// Form schema for user signup confirmation
const userSignupFormSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    firstName: nameSchema,
    lastName: nameSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type UserSignupFormData = z.infer<typeof userSignupFormSchema>;

export interface UserSignupConfirmFormProps {
  organization: string;
  token: string;
  username: string;
  email: string;
  orgUserId: string;
  locale: string;
  dictionary: {
    forms: {
      userSignup: {
        title: string;
        description: string;
        username: string;
        email: string;
        password: string;
        confirmPassword: string;
        firstName: string;
        lastName: string;
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
        special: string;
      };
      confirmPassword: {
        required: string;
        mismatch: string;
      };
      name: {
        required: string;
        minLength: string;
        maxLength: string;
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

export default function UserSignupConfirmForm({
  organization,
  token,
  username,
  email,
  orgUserId,
  locale,
  dictionary,
}: UserSignupConfirmFormProps) {
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
  } = useForm<UserSignupFormData>({
    resolver: zodResolver(userSignupFormSchema),
    mode: 'onBlur',
    defaultValues: {
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
    },
  });

  const password = watch('password');
  const confirmPassword = watch('confirmPassword');

  const onSubmit = async (data: UserSignupFormData) => {
    // Clear previous errors
    setApiError(null);
    setIsSubmitting(true);

    try {
      // Call API to complete user signup
      const result = await confirmUserSignup({
        org: organization,
        token,
        username,
        email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        orgUserId,
      });

      // Check if API call was successful
      if (result.success) {
        // Show success state
        setIsSuccess(true);

        // Optional: Redirect to login after 5 seconds
        setTimeout(() => {
          // router.push(`/${locale}/login`);
        }, 5000);
      } else {
        // API returned error
        const errorMessage = result.error?.message || dictionary.errors.apiError;
        setApiError(errorMessage);
      }
    } catch (err: any) {
      console.error('User signup failed:', err);

      // Handle different error types
      if (err.message?.includes('Network Error')) {
        setApiError(dictionary.errors.networkError);
      } else if (err.message?.includes('timeout')) {
        setApiError(dictionary.errors.apiError);
      } else if (err.response?.data?.message) {
        setApiError(err.response.data.message);
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        setApiError('Invalid or expired invitation link. Please request a new invitation.');
      } else if (err.response?.status === 409) {
        setApiError(
          'This invitation has already been used. Please contact support if you need assistance.'
        );
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
              {dictionary.forms.userSignup.success}
            </h2>
            <p className="text-gray-600">
              Your account has been created successfully. You can now log in with your credentials.
            </p>
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
          {dictionary.forms.userSignup.title}
        </h1>
        <p className="text-gray-600">{dictionary.forms.userSignup.description}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {/* Username Field (Read-Only) */}
        <ReadOnlyField label={dictionary.forms.userSignup.username} value={username} />

        {/* Email Field (Read-Only) */}
        <ReadOnlyField label={dictionary.forms.userSignup.email} value={email} />

        {/* Divider */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Complete Your Profile</h3>
        </div>

        {/* First Name Field */}
        <Input
          id="first-name"
          type="text"
          label={dictionary.forms.userSignup.firstName}
          placeholder="John"
          required
          autoComplete="given-name"
          disabled={isSubmitting}
          error={errors.firstName?.message}
          {...register('firstName')}
        />

        {/* Last Name Field */}
        <Input
          id="last-name"
          type="text"
          label={dictionary.forms.userSignup.lastName}
          placeholder="Doe"
          required
          autoComplete="family-name"
          disabled={isSubmitting}
          error={errors.lastName?.message}
          {...register('lastName')}
        />

        {/* Password Field */}
        <PasswordInput
          id="signup-password"
          name="password"
          label={dictionary.forms.userSignup.password}
          value={password}
          onChange={(value) => setValue('password', value, { shouldValidate: true })}
          error={errors.password?.message}
          required
          autoComplete="new-password"
          showStrengthIndicator
          disabled={isSubmitting}
        />

        {/* Confirm Password Field */}
        <PasswordInput
          id="signup-confirm-password"
          name="confirmPassword"
          label={dictionary.forms.userSignup.confirmPassword}
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
                <h3 className="text-sm font-semibold text-red-800 mb-1">Registration Failed</h3>
                <p className="text-sm text-red-700">{apiError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button type="submit" variant="primary" disabled={isSubmitting} className="w-full">
          {isSubmitting ? dictionary.common.loading : dictionary.forms.userSignup.submitButton}
        </Button>

        {/* Loading Indicator */}
        {isSubmitting && (
          <p className="text-sm text-gray-500 text-center" role="status">
            {dictionary.common.loading}
          </p>
        )}
      </form>

      {/* Privacy Note */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          By completing registration, you agree to our Terms of Service and Privacy Policy. This
          invitation link will expire after 24 hours.
        </p>
      </div>
    </div>
  );
}
