'use client';

/**
 * User Invite Confirm Form Component
 *
 * Simple confirmation flow for existing users who received an invitation.
 * This flow does NOT require password or name entry - just a confirmation button.
 *
 * Flow:
 * 1. Display pre-populated username and email (read-only)
 * 2. User clicks "Confirm Invitation" button
 * 3. Submit to API: POST /api/verify/user-invite (regType: user-invite-confirm)
 *    - Password, Name, LastName are sent as empty strings
 * 4. Show success message or error
 *
 * Note: This is different from user-signup-confirm which requires password and names.
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { confirmUserInvite } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { ReadOnlyField } from '@/components/ui/ReadOnlyField';
import { type Dictionary } from '@/i18n';

export interface UserInviteConfirmFormProps {
  organization: string;
  token: string;
  username: string;
  email: string;
  orgUserId: string;
  invitedBy: string;
  locale: string;
  dictionary: Dictionary;
}

export default function UserInviteConfirmForm({
  organization,
  token,
  username,
  email,
  orgUserId,
  invitedBy,
  locale,
  dictionary,
}: UserInviteConfirmFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const normalizedInvitedBy = invitedBy?.trim() ?? '';
  const isInvitedByMissing = normalizedInvitedBy.length === 0;
  const missingInvitedByMessage =
    dictionary.forms?.userInvite?.invitedByMissing ||
    dictionary.errors.validationError ||
    'We could not determine who invited you. Please request a fresh invitation.';

  const onSubmit = async () => {
    // Clear previous errors
    setApiError(null);

    if (isInvitedByMissing) {
      setApiError(missingInvitedByMessage);
      return;
    }

    setIsSubmitting(true);

    try {
      // Call API to confirm user invite
      // For user-invite-confirm, password/firstName/lastName are sent as empty strings
      const result = await confirmUserInvite({
        org: organization,
        token,
        username,
        email,
        password: '', // Not required for user-invite-confirm
        firstName: '', // Not required for user-invite-confirm
        lastName: '', // Not required for user-invite-confirm
        orgUserId,
        invitedBy: normalizedInvitedBy,
      });

      if (result.success) {
        // Show success state
        setIsSuccess(true);

        // Redirect after 2 seconds
        setTimeout(() => {
          // Redirect to login page or home page
          router.push(`/?lang=${locale}`);
        }, 2000);
      } else {
        // Show API error
        setApiError(
          result.error?.message || dictionary.errors.apiError || 'Failed to confirm invitation'
        );
      }
    } catch (error) {
      console.error('Unexpected error during user invite confirmation:', error);
      setApiError(dictionary.errors.unknownError || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state
  if (isSuccess) {
    return (
      <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {dictionary.forms.userInvite.success}
          </h3>
          <p className="text-sm text-gray-500">{dictionary.common.loading}</p>
        </div>
      </div>
    );
  }

  // Form state
  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {dictionary.forms.userInvite.title}
        </h2>
        <p className="text-sm text-gray-600">{dictionary.forms.userInvite.description}</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="space-y-6"
      >
        {/* Username (Read-only) */}
        <ReadOnlyField label={dictionary.forms.userInvite.username} value={username} />

        {/* Email (Read-only) */}
        <ReadOnlyField label={dictionary.forms.userInvite.email} value={email} />

        {/* Invited By (Read-only, if present) */}
        {!isInvitedByMissing ? (
          <ReadOnlyField
            label={dictionary.forms.userInvite.invitedBy || 'Invited By'}
            value={normalizedInvitedBy}
          />
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4" role="alert">
            <p className="text-sm text-yellow-800">{missingInvitedByMessage}</p>
          </div>
        )}

        {/* Information Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            {locale === 'th'
              ? 'คลิกปุ่มด้านล่างเพื่อยืนยันคำเชิญของคุณ'
              : 'Click the button below to confirm your invitation.'}
          </p>
        </div>

        {/* API Error Message */}
        {apiError && (
          <div
            className="bg-red-50 border border-red-200 rounded-lg p-4"
            role="alert"
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              <svg
                className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <p className="text-sm text-red-700">{apiError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={isSubmitting || isInvitedByMissing}
          aria-label={dictionary.forms.userInvite.submitButton}
        >
          {isSubmitting ? dictionary.common.loading : dictionary.forms.userInvite.submitButton}
        </Button>
      </form>
    </div>
  );
}
