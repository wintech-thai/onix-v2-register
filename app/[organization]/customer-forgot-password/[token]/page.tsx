// File: app/[organization]/customer-forgot-password/[token]/page.tsx

import React from 'react';
import CustomerResetPasswordForm from '@/components/forms/CustomerResetPasswordForm';
import { decodeDataParam } from '@/lib/url-parser';
import { getDictionary, getLocaleFromSearchParams } from '@/i18n';
import { z } from 'zod';

const resetPasswordDataSchema = z.object({
  username: z.string().optional(),
  userName: z.string().optional(),
  UserName: z.string().optional(),
  name: z.string().optional(), 
  email: z.string().optional(),
  
  customerId: z.string().optional(),
  OrgUserId: z.string().optional(),
  id: z.string().optional(),
  code: z.string().optional(), 
}).passthrough();

interface PageProps {
  params: Promise<{
    organization: string;
    token: string;
  }>;
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

export default async function CustomerResetPasswordPage({ params, searchParams }: PageProps) {
  const { organization, token } = await params;
  const resolvedSearchParams = await searchParams;
  const locale = getLocaleFromSearchParams(resolvedSearchParams);
  const dictionary = await getDictionary(locale);

  // ดึงค่า Data
  const dataParam = Array.isArray(resolvedSearchParams.data)
    ? resolvedSearchParams.data[0]
    : resolvedSearchParams.data;

  if (!dataParam) {
    return <ErrorDisplay message="Missing required data in URL" />;
  }

  // แกะข้อมูล
  const parseResult = decodeDataParam(dataParam, 'customer-forgot-password');

  if (!parseResult.success) {
    return <ErrorDisplay message="Invalid data format" />;
  }

  // Validate ผ่าน Schema
  const validationResult = resetPasswordDataSchema.safeParse(parseResult.data);

  if (!validationResult.success) {
    return <ErrorDisplay message="Invalid data structure" />;
  }

  const validData = validationResult.data;
  
  // ลำดับการเลือกข้อมูล (Priority)
  const finalUsername = 
    validData.username || 
    validData.UserName || 
    validData.userName || 
    validData.name || 
    validData.email || 
    "";

  const finalCustomerId = validData.customerId || validData.OrgUserId || validData.id || "";

  const displayUsername = finalUsername || "-";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <CustomerResetPasswordForm
        organization={organization}
        token={token}
        username={displayUsername} 
        dictionary={dictionary}
        customerId={finalCustomerId}
      />
    </div>
  );
}

function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto text-center">
        <h2 className="text-xl font-semibold text-red-600">Error</h2>
        <p className="text-gray-600 mt-2">{message}</p>
      </div>
    </div>
  );
}