/**
 * Home Page Component
 *
 * Landing page for the ONIX v2 Registration Microservice.
 * Displays welcome message and handles invalid registration links.
 * Uses searchParams for locale detection (?lang=en or ?lang=th)
 */

import { getDictionary, getLocaleFromSearchParams } from '@/i18n';

type Props = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function HomePage({ searchParams }: Props) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const locale = getLocaleFromSearchParams(resolvedSearchParams);
  const dict = await getDictionary(locale);

  return (
    <div className="flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full text-center">
        {/* Logo/Badge */}
        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 bg-blue-900 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{dict.home.title}</h1>

        {/* Description */}
        <p className="text-lg text-gray-600 mb-8">{dict.home.description}</p>

        {/* Info Box */}
        <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
          <svg
            className="w-16 h-16 text-blue-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <p className="text-gray-700 text-base leading-relaxed">{dict.home.invalidLink}</p>
        </div>

        {/* Quick Links */}
        <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
          <a
            href="/api-logs"
            className="inline-flex items-center px-4 py-2 border border-green-600 text-sm font-medium rounded-md text-green-600 bg-white hover:bg-green-50 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
            API Logs
          </a>
          <a
            href="/demo"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            View Demo
          </a>
        </div>

        {/* Footer Note */}
        <p className="mt-8 text-sm text-gray-500">Please Scan Registration System v1.0</p>
      </div>
    </div>
  );
}
