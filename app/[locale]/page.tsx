/**
 * Home Page Component
 *
 * Landing page for the ONIX v2 Registration Microservice.
 * Displays welcome message and handles invalid registration links.
 */

import { getDictionary, type Locale } from '@/i18n';

type Props = {
  params: Promise<{ locale: Locale }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
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

        {/* Footer Note */}
        <p className="mt-8 text-sm text-gray-500">Please Scan Registration System v1.0</p>
      </div>
    </div>
  );
}
