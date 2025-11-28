/**
 * Demo Page - Test All Registration Flows
 *
 * This page provides test links for all 4 registration flows:
 * 1. User Invite Confirm
 * 2. User Signup Confirm
 * 3. Customer Email Verification
 * 4. Forgot Password
 *
 * Each link includes properly encoded test data for UI testing.
 * Uses searchParams for locale (?lang=en or ?lang=th)
 */

import { getDictionary, getLocaleFromSearchParams } from '@/i18n';
import Link from 'next/link';

type Props = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

// Helper function to encode data to base64
function encodeData(data: any): string {
  const jsonString = JSON.stringify(data);
  const base64 = Buffer.from(jsonString).toString('base64');
  return encodeURIComponent(base64);
}

export default async function DemoPage({ searchParams }: Props) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const locale = getLocaleFromSearchParams(resolvedSearchParams);
  const dict = await getDictionary(locale);

  // Test data for each flow
  const testData = {
    userInvite: {
      username: 'john_doe',
      email: 'john.doe@example.com',
    },
    userSignup: {
      username: 'jane_smith',
      email: 'jane.smith@example.com',
    },
    customerVerification: {
      Email: 'customer@example.com',
      Name: 'John Customer',
      Code: 'cust-001',
      Id: '550e8400-e29b-41d4-a716-446655440000',
    },
    forgotPassword: {
      username: 'forgot_user',
      email: 'forgot.user@example.com',
    },
  };

  // Generate test URLs with lang param preserved
  const organization = 'demo-org';
  const testToken = '12345678-1234-4000-8000-123456789abc';

  const testUrls = {
    userInvite: `/${organization}/user-invite-confirm/${testToken}?lang=${locale}&data=${encodeData(testData.userInvite)}`,
    userSignup: `/${organization}/user-signup-confirm/${testToken}?lang=${locale}&data=${encodeData(testData.userSignup)}`,
    customerVerification: `/${organization}/customer-email-verification/${testToken}?lang=${locale}&data=${encodeData(testData.customerVerification)}`,
    forgotPassword: `/${organization}/forgot-password/${testToken}?lang=${locale}&data=${encodeData(testData.forgotPassword)}`,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🧪 Registration Flows Demo</h1>
          <p className="text-lg text-gray-600">
            Test all registration and verification flows with mock data
          </p>
          <div className="mt-4 inline-flex items-center px-4 py-2 bg-yellow-100 border border-yellow-300 rounded-lg">
            <svg className="w-5 h-5 text-yellow-700 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium text-yellow-800">
              Demo Mode - Using test data only
            </span>
          </div>
        </div>

        {/* Test Flows Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* 1. User Invite Confirm */}
          <Link href={testUrls.userInvite}>
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 border-2 border-transparent hover:border-blue-500 cursor-pointer h-full">
              <div className="flex items-start mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    1. User Invite Confirm
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Confirm invitation and accept user account
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <p className="text-xs font-mono text-gray-700 mb-1">
                  <span className="font-semibold">Username:</span> {testData.userInvite.username}
                </p>
                <p className="text-xs font-mono text-gray-700">
                  <span className="font-semibold">Email:</span> {testData.userInvite.email}
                </p>
              </div>
              <div className="flex items-center text-blue-600 text-sm font-medium">
                <span>View Form</span>
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </Link>

          {/* 2. User Signup Confirm */}
          <Link href={testUrls.userSignup}>
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 border-2 border-transparent hover:border-green-500 cursor-pointer h-full">
              <div className="flex items-start mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    2. User Signup Confirm
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Complete registration with password setup
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <p className="text-xs font-mono text-gray-700 mb-1">
                  <span className="font-semibold">Username:</span> {testData.userSignup.username}
                </p>
                <p className="text-xs font-mono text-gray-700">
                  <span className="font-semibold">Email:</span> {testData.userSignup.email}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  (You'll enter name and password in the form)
                </p>
              </div>
              <div className="flex items-center text-green-600 text-sm font-medium">
                <span>View Form</span>
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </Link>

          {/* 3. Customer Email Verification */}
          <Link href={testUrls.customerVerification}>
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 border-2 border-transparent hover:border-purple-500 cursor-pointer h-full">
              <div className="flex items-start mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    3. Customer Email Verification
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">Verify customer email address</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <p className="text-xs font-mono text-gray-700 mb-1">
                  <span className="font-semibold">Name:</span> {testData.customerVerification.Name}
                </p>
                <p className="text-xs font-mono text-gray-700">
                  <span className="font-semibold">Email:</span>{' '}
                  {testData.customerVerification.Email}
                </p>
              </div>
              <div className="flex items-center text-purple-600 text-sm font-medium">
                <span>View Form</span>
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </Link>

          {/* 4. Forgot Password */}
          <Link href={testUrls.forgotPassword}>
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 border-2 border-transparent hover:border-orange-500 cursor-pointer h-full">
              <div className="flex items-start mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                  <svg
                    className="w-6 h-6 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">4. Forgot Password</h3>
                  <p className="text-sm text-gray-600 mb-3">Reset password with new credentials</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <p className="text-xs font-mono text-gray-700 mb-1">
                  <span className="font-semibold">Username:</span>{' '}
                  {testData.forgotPassword.username}
                </p>
                <p className="text-xs font-mono text-gray-700">
                  <span className="font-semibold">Email:</span> {testData.forgotPassword.email}
                </p>
              </div>
              <div className="flex items-center text-orange-600 text-sm font-medium">
                <span>View Form</span>
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">📋 Testing Instructions</h2>
          <div className="space-y-3 text-gray-700">
            <div className="flex items-start">
              <span className="font-semibold text-blue-600 mr-3">1.</span>
              <p>Click any card above to view the registration form</p>
            </div>
            <div className="flex items-start">
              <span className="font-semibold text-blue-600 mr-3">2.</span>
              <p>Test data is pre-filled and ready to use</p>
            </div>
            <div className="flex items-start">
              <span className="font-semibold text-blue-600 mr-3">3.</span>
              <p>Fill in required fields (passwords, etc.) where needed</p>
            </div>
            <div className="flex items-start">
              <span className="font-semibold text-blue-600 mr-3">4.</span>
              <p>Click the submit button to see the API response</p>
            </div>
            <div className="flex items-start">
              <span className="font-semibold text-blue-600 mr-3">5.</span>
              <p>Test tokens will return "INVALID_TOKEN_OR_EXPIRED" (expected behavior)</p>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="bg-gray-900 rounded-xl shadow-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
            Technical Details
          </h2>
          <div className="space-y-2 text-sm font-mono text-gray-300">
            <p>
              <span className="text-blue-400">Organization:</span> {organization}
            </p>
            <p>
              <span className="text-blue-400">Test Token:</span> {testToken}
            </p>
            <p>
              <span className="text-blue-400">Locale:</span> {locale} (from ?lang= param)
            </p>
            <p className="pt-2 text-gray-400 text-xs">
              All test URLs include properly base64-encoded data parameters and preserve language
              selection
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link
            href={`/?lang=${locale}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
