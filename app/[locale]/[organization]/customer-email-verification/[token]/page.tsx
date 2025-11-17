/**
 * Customer Email Verification Page
 *
 * Route: /[locale]/[organization]/customer-email-verification/[token]
 * Query params: data (base64 encoded JSON with customerId, name, email)
 *
 * This page:
 * 1. Parses the URL to extract organization, token, and data parameter
 * 2. Decodes and validates the data parameter
 * 3. Renders CustomerEmailVerificationForm with pre-populated data
 * 4. Handles errors (invalid token, expired link, malformed data)
 */

import React from 'react';
import { notFound } from 'next/navigation';
import CustomerEmailVerificationForm from '@/components/forms/CustomerEmailVerificationForm';
import { decodeDataParam } from '@/lib/url-parser';
import { customerEmailVerificationSchema } from '@/lib/validation';
import { getDictionary } from '@/i18n';
import type { Locale } from '@/i18n';

interface CustomerEmailVerificationPageProps {
  params: Promise<{
    locale: Locale;
    organization: string;
    token: string;
  }>;
  searchParams: Promise<{
    data?: string;
  }>;
}

export default async function CustomerEmailVerificationPage({
  params,
  searchParams,
}: CustomerEmailVerificationPageProps) {
  // Await params and searchParams (Next.js 16 requirement)
  const { locale, organization, token } = await params;
  const { data: dataParam } = await searchParams;

  // Get dictionary for i18n
  const dictionary = await getDictionary(locale);

  // Validate data parameter exists
  if (!dataParam) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-2xl" aria-hidden="true">
                ✕
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Invalid Link</h2>
              <p className="text-gray-600">{dictionary.errors.tokenInvalid}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  try {
    // Decode the data parameter
    const parseResult = decodeDataParam(dataParam);
    if (!parseResult.success) {
      console.error('Failed to decode data parameter:', parseResult.error);
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-2xl" aria-hidden="true">
                  ✕
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Invalid Data Format</h2>
                <p className="text-gray-600">{dictionary.errors.validationError}</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const decodedData = parseResult.data;

    // Validate the decoded data against schema
    const validationResult = customerEmailVerificationSchema.safeParse(decodedData);

    if (!validationResult.success) {
      console.error('Customer email verification data validation failed:', validationResult.error);
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-2xl" aria-hidden="true">
                  ✕
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Invalid Data</h2>
                <p className="text-gray-600">{dictionary.errors.validationError}</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const { customerId, name, email } = validationResult.data;

    // Validate token format (should be UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(token)) {
      console.error('Invalid token format:', token);
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-2xl" aria-hidden="true">
                  ✕
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Invalid Token</h2>
                <p className="text-gray-600">{dictionary.errors.tokenInvalid}</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Render the form with validated data
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <CustomerEmailVerificationForm
          organization={organization}
          token={token}
          customerId={customerId}
          name={name}
          email={email}
          locale={locale}
          dictionary={dictionary}
        />
      </div>
    );
  } catch (error) {
    console.error('Failed to parse customer email verification URL:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-2xl" aria-hidden="true">
                ✕
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Error Processing Link</h2>
              <p className="text-gray-600">{dictionary.errors.unknownError}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

// Metadata for the page
export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.forms.customerVerification.title,
    description: dictionary.forms.customerVerification.description,
  };
}
