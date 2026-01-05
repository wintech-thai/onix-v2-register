// File: components/forms/CustomerUserCreateForm.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { confirmCreateCustomerUser } from '@/lib/api-client';
import { passwordSchema } from '@/lib/validation';
import { Button } from '@/components/ui/Button';
import { ReadOnlyField } from '@/components/ui/ReadOnlyField';
import PasswordInput from '@/components/ui/PasswordInput';

const customerCreateFormSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type CustomerCreateFormData = z.infer<typeof customerCreateFormSchema>;

export interface CustomerUserCreateFormProps {
  organization: string;
  token: string;
  email: string;
  locale: string;
  dictionary: Record<string, any>;
  customerId: string;
}

export default function CustomerUserCreateForm({
  organization,
  token,
  email,
  // locale, // Comment ไว้เพื่อป้องกัน Build Error (Unused variable)
  dictionary,
  customerId,
}: CustomerUserCreateFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const t = {
    title: (dictionary.forms?.customerUserCreate?.title as string) || "Activate Your Account",
    description: (dictionary.forms?.customerUserCreate?.description as string) || "Please set a password to activate your account.",
    orgLabel: (dictionary.forms?.common?.organization as string) || "Organization",
    emailLabel: (dictionary.forms?.common?.email as string) || "Email",
    passwordLabel: (dictionary.forms?.common?.password as string) || "Password",
    confirmPasswordLabel: (dictionary.forms?.common?.confirmPassword as string) || "Confirm Password",
    submitButton: (dictionary.forms?.customerUserCreate?.submitButton as string) || "Create Account",
    successTitle: (dictionary.forms?.customerUserCreate?.success as string) || "Account created successfully!",
    successDesc: "Your account has been successfully created. You can now log in.",
    loading: (dictionary.common?.loading as string) || "Loading...",
    reqTitle: (dictionary.forms?.customerUserCreate?.passwordReqTitle as string) || "Password Requirements:",
    req1: (dictionary.forms?.customerUserCreate?.passwordReq1 as string) || "Password must be between 7-15 characters",
    req2: (dictionary.forms?.customerUserCreate?.passwordReq2 as string) || "Password must contain at least one uppercase letter",
    req3: (dictionary.forms?.customerUserCreate?.passwordReq3 as string) || "Password must contain at least one lowercase letter",
    req4: (dictionary.forms?.customerUserCreate?.passwordReq4 as string) || "Password must contain at least one special character (!, @, or #)",
    securityNote: (dictionary.forms?.customerUserCreate?.securityNote as string) || "For your security, this link will expire after 24 hours and can only be used once."
  };

  const {
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CustomerCreateFormData>({
    resolver: zodResolver(customerCreateFormSchema),
    mode: 'onBlur',
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');
  const confirmPassword = watch('confirmPassword');

  const onSubmit = async (data: CustomerCreateFormData) => {
    setApiError(null);
    setIsSubmitting(true);

    try {
      const result = await confirmCreateCustomerUser({
        org: organization,
        token,
        email,
        password: data.password,
        customerId,
      });

      if (result.success) {
        setIsSuccess(true);
      } else {
        const errorMessage = result.error?.message || "Registration failed. Please try again.";
        setApiError(errorMessage);
      }
    } catch (err: any) {
      console.error('Customer create failed:', err);
      setApiError("An unexpected error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success View
  if (isSuccess) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto w-full">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">{t.successTitle}</h2>
            <p className="text-gray-600">{t.successDesc}</p>
          </div>
          
          {/* <Button 
            variant="secondary"
            className="mt-4 w-full"
            onClick={() => window.location.href = `/${locale}/login`}
          >
            Go to Login
          </Button> */}
        </div>
      </div>
    );
  }

  // Form View
  return (
    <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">{t.title}</h1>
        <p className="text-gray-600">{t.description}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        
        <ReadOnlyField label={t.orgLabel} value={organization} />

        <ReadOnlyField label={t.emailLabel} value={email} />

        <div className="space-y-4">
          <PasswordInput
            id="password"
            name="password"
            label={t.passwordLabel}
            value={password}
            onChange={(value) => setValue('password', value, { shouldValidate: true })}
            error={errors.password?.message}
            required
            autoComplete="new-password"
            showStrengthIndicator
            disabled={isSubmitting}
            maxLength={15}
          />

          <PasswordInput
            id="confirm-password"
            name="confirmPassword"
            label={t.confirmPasswordLabel}
            value={confirmPassword}
            onChange={(value) => setValue('confirmPassword', value, { shouldValidate: true })}
            error={errors.confirmPassword?.message}
            required
            autoComplete="new-password"
            disabled={isSubmitting}
            maxLength={15}
          />
        </div>

        {/* --- Password Requirements Info --- */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <h3 className="text-blue-900 font-medium mb-2 text-sm">{t.reqTitle}</h3>
          <ul className="list-disc list-inside text-sm text-blue-800 space-y-1 ml-1">
            <li>{t.req1}</li>
            <li>{t.req2}</li>
            <li>{t.req3}</li>
            <li>{t.req4}</li>
          </ul>
        </div>

        {apiError && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-red-500 text-xl">⚠</span>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-800 mb-1">Error</h3>
                <p className="text-sm text-red-700">{apiError}</p>
              </div>
            </div>
          </div>
        )}

        <Button type="submit" variant="primary" disabled={isSubmitting} className="w-full">
          {isSubmitting ? t.loading : t.submitButton}
        </Button>

        <div className="pt-6 border-t border-gray-100">
          <p className="text-center text-sm text-gray-500 leading-relaxed">
            {t.securityNote}
          </p>
        </div>

      </form>
    </div>
  );
}