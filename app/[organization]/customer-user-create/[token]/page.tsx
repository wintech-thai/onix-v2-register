// File: app/[organization]/customer-user-create/[token]/page.tsx

import React from 'react';
import CustomerUserCreateForm from '@/components/forms/CustomerUserCreateForm';
import { decodeDataParam } from '@/lib/url-parser';
import { getDictionary, getLocaleFromSearchParams } from '@/i18n';
import { z } from 'zod';

const customerCreateDataSchema = z.object({
  email: z.string().email(),
  customerId: z.string().min(1, "Customer ID is required"), 
});

interface PageProps {
  params: Promise<{
    organization: string;
    token: string;
  }>;
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

export default async function CustomerUserCreatePage({ params, searchParams }: PageProps) {
  // 1. รับค่าจาก URL
  const { organization, token } = await params;
  const resolvedSearchParams = await searchParams;
  const locale = getLocaleFromSearchParams(resolvedSearchParams);
  const dictionary = await getDictionary(locale);

  // 2. ดึงค่า Data (ที่เป็น Base64)
  const dataParam = Array.isArray(resolvedSearchParams.data)
    ? resolvedSearchParams.data[0]
    : resolvedSearchParams.data;

  // ถ้าไม่มี Data มา ให้แสดง Error
  if (!dataParam) {
    return <ErrorDisplay message="Missing required data in URL" />;
  }

  // 3. แกะข้อมูล (Decode Base64)
  const parseResult = decodeDataParam(dataParam, 'customer-user-create');

  if (!parseResult.success) {
    return <ErrorDisplay message="Invalid data format" />;
  }

  // ตรวจสอบว่าข้อมูลถูกต้องตาม Schema ไหม
  const validationResult = customerCreateDataSchema.safeParse(parseResult.data);

  if (!validationResult.success) {
    return <ErrorDisplay message="Invalid data structure" />;
  }

  const { email, customerId } = validationResult.data;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <CustomerUserCreateForm
        organization={organization}
        token={token}
        email={email}
        locale={locale}
        dictionary={dictionary}
        customerId={customerId} 
      />
    </div>
  );
}

// Component แสดง Error แบบง่ายๆ
function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto text-center">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-red-600 text-2xl">✕</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Link Invalid</h2>
        <p className="text-gray-600 mt-2">{message}</p>
      </div>
    </div>
  );
}