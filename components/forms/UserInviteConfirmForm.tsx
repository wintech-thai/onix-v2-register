'use client';

/**
 * User Invite Confirm Form Component
 *
 * Simple confirmation form for existing user invitations.
 * Displays read-only username and email, with a single Confirm button.
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, User, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ReadOnlyField } from '@/components/ui/ReadOnlyField';
import { confirmUserInvite } from '@/lib/api-client';
import { type Dictionary } from '@/i18n';

interface UserInviteConfirmFormProps {
  organization: string;
  token: string;
  username: string;
  email: string;
  dict: Dictionary;
}

export function UserInviteConfirmForm({
  organization,
  token,
  username,
  email,
  dict,
}: UserInviteConfirmFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await confirmUserInvite({
        org: organization,
        token,
        username,
      });

      if (result.success) {
        setSuccess(true);
        // Redirect after 2 seconds
        setTimeout(() => {
          // In a real app, redirect to login or dashboard
          window.location.href = '/';
        }, 2000);
      } else {
        setError(result.error?.message || dict.errors.apiError);
      }
    } catch (err) {
      setError(dict.errors.unknownError);
    } finally {
      setIsLoading(false);
    }
  };

  // Success state
  if (success) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {dict.forms.userInvite.success}
          </h3>
          <p className="text-sm text-gray-500">{dict.common.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
          <User className="h-6 w-6 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{dict.forms.userInvite.title}</h2>
        <p className="text-sm text-gray-600">{dict.forms.userInvite.description}</p>
      </div>

      {/* Form Fields */}
      <div className="space-y-4 mb-6">
        <ReadOnlyField
          label={dict.forms.userInvite.username}
          value={username}
          icon={<User className="h-5 w-5" />}
        />

        <ReadOnlyField
          label={dict.forms.userInvite.email}
          value={email}
          icon={<Mail className="h-5 w-5" />}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">{dict.common.error}</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Button */}
      <Button
        variant="primary"
        fullWidth
        isLoading={isLoading}
        onClick={handleConfirm}
        disabled={isLoading}
      >
        {dict.forms.userInvite.confirmButton}
      </Button>

      {/* Footer Note */}
      <p className="mt-6 text-center text-xs text-gray-500">{dict.errors.tokenExpired}</p>
    </div>
  );
}
