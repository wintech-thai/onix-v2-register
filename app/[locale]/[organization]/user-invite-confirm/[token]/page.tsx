/**
 * User Invite Confirm Page
 *
 * This page handles the user invitation confirmation flow.
 * Users arrive here via email link with a token and pre-populated data.
 * They simply review the information and confirm their invitation.
 *
 * URL Pattern: /{locale}/{organization}/user-invite-confirm/{token}?data={base64_encoded_json}
 */

import { notFound } from 'next/navigation';
import { getDictionary, type Locale } from '@/i18n';
import { parseRegistrationUrl, type UserInviteData } from '@/lib/url-parser';
import { UserInviteConfirmForm } from '@/components/forms/UserInviteConfirmForm';

type Props = {
  params: Promise<{
    locale: Locale;
    organization: string;
    token: string;
  }>;
  searchParams: Promise<{
    data?: string;
  }>;
};

export default async function UserInviteConfirmPage({ params, searchParams }: Props) {
  const { locale, organization, token } = await params;
  const { data: dataParam } = await searchParams;
  const dict = await getDictionary(locale);

  // Validate that data parameter exists
  if (!dataParam) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{dict.errors.tokenInvalid}</h3>
            <p className="text-sm text-gray-500">{dict.home.invalidLink}</p>
          </div>
        </div>
      </div>
    );
  }

  // Reconstruct full URL for parsing
  const fullUrl = `https://register.please-scan.com/${organization}/user-invite-confirm/${token}?data=${dataParam}`;

  // Parse and validate the URL
  const parseResult = parseRegistrationUrl(fullUrl);

  if (!parseResult.success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{parseResult.error.message}</h3>
            <p className="text-sm text-gray-500">{dict.home.invalidLink}</p>
          </div>
        </div>
      </div>
    );
  }

  // Extract user data
  const userData = parseResult.data.data as UserInviteData;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <UserInviteConfirmForm
          organization={organization}
          token={token}
          username={userData.username}
          email={userData.email}
          dict={dict}
        />
      </div>
    </div>
  );
}
