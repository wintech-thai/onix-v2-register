/**
 * Customer User Create Confirmation API Route (Proxy)
 *
 * POST /api/verify/customer-user-create
 */

import { NextRequest, NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';
import { z } from 'zod';
import { addLog, generateLogId } from '@/lib/api-logger';
import { EXTERNAL_API_URL, REQUEST_TIMEOUT } from '@/lib/env';

// ============================================
// VALIDATION SCHEMA
// ============================================

const createUserRequestSchema = z.object({
  org: z
    .string()
    .min(2, 'Organization ID must be at least 2 characters')
    .max(50, 'Organization ID must not exceed 50 characters')
    .regex(/^[a-z0-9_-]+$/i, 'Organization ID contains invalid characters'),
  token: z.string().min(1, 'Token is required'),
  customerId: z.string().min(1, 'Customer ID is required'),
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(7, 'Password must be at least 7 characters')
    .max(15, 'Password must not exceed 15 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[!@#]/, 'Password must contain at least one special character (!, @, or #)'),
});

type CreateUserRequest = z.infer<typeof createUserRequestSchema>;

// ============================================
// HELPER FUNCTIONS
// ============================================

function maskPassword(password: string): string {
  return '*'.repeat(password.length);
}

function logRequest(data: CreateUserRequest, ip: string) {
  const logData = {
    timestamp: new Date().toISOString(),
    type: 'PROXY_REQUEST',
    endpoint: '/api/verify/customer-user-create',
    org: data.org,
    token: data.token,
    customerId: data.customerId, // Log customerId ด้วย
    email: data.email,
    ip,
  };
  console.log('[Proxy Request]', JSON.stringify(logData));
}

function logResponse(status: number, success: boolean, duration: number) {
  const logData = {
    timestamp: new Date().toISOString(),
    type: 'PROXY_RESPONSE',
    endpoint: '/api/verify/customer-user-create',
    status,
    success,
    durationMs: duration,
  };
  console.log('[Proxy Response]', JSON.stringify(logData));
}

function logError(error: unknown, data: Partial<CreateUserRequest>) {
  const logData = {
    timestamp: new Date().toISOString(),
    type: 'PROXY_ERROR',
    endpoint: '/api/verify/customer-user-create',
    org: data.org,
    email: data.email,
    error: error instanceof Error ? error.message : 'Unknown error',
  };
  console.error('[Proxy Error]', JSON.stringify(logData));
}

// ============================================
// API ROUTE HANDLER
// ============================================

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let requestData: Partial<CreateUserRequest> = {};
  const logId = generateLogId();
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  try {
    // Parse request body
    const body = await request.json();
    requestData = body;

    // Validate request data
    const validation = createUserRequestSchema.safeParse(body);

    if (!validation.success) {
      const errorMessages = validation.error.errors
        .map((err) => `${err.path.join('.')}: ${err.message}`)
        .join(', ');

      logError(new Error(`Validation failed: ${errorMessages}`), requestData);

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: validation.error.errors,
          },
        },
        { status: 400 }
      );
    }

    const validatedData = validation.data;

    // Log incoming request
    logRequest(validatedData, ip);

    const { org, token, email, password, customerId } = validatedData; 

    // ใช้ตัวแปร EXTERNAL_API_URL ที่ import มาเพื่อให้ code clean ขึ้น
    const baseUrl = (EXTERNAL_API_URL || '').replace(/\/$/, '');
    
    // Construct External URL with CustomerID
    const externalUrl = `${baseUrl}/api/Registration/org/${org}/action/ConfirmCreateCustomerUser/${token}/${customerId}`;

    // Prepare request body
    const requestBody = {
      Email: email,
      Password: password,
    };

    // Prepare headers
    const requestHeaders = {
      'Content-Type': 'application/json',
      'User-Agent': 'ONIX-v2-Registration/1.0',
    };

    // Log external API call (Securely)
    console.log('\n========================================');
    console.log('🚀 EXTERNAL API CALL - CUSTOMER USER CREATE');
    console.log('========================================');
    console.log(`METHOD: POST`);
    console.log(`URL: ${externalUrl}`);
    console.log(`\nHEADERS:`);
    console.log(JSON.stringify(requestHeaders, null, 2));
    console.log(`\nBODY:`);
    console.log(
      JSON.stringify(
        { ...requestBody, Password: maskPassword(requestBody.Password) },
        null,
        2
      )
    );
    console.log('========================================\n');

    // Call external API
    const response = await axios.post(externalUrl, requestBody, {
      timeout: REQUEST_TIMEOUT || 30000,
      headers: requestHeaders,
      validateStatus: (status) => status < 600, // Handle 4xx/5xx manually
    });

    const duration = Date.now() - startTime;
    logResponse(response.status, response.status >= 200 && response.status < 300, duration);

    // Log external response
    console.log('\n========================================');
    console.log('📥 EXTERNAL API RESPONSE - CUSTOMER USER CREATE');
    console.log('========================================');
    console.log(`STATUS: ${response.status} ${response.statusText}`);
    console.log(`DURATION: ${duration}ms`);
    console.log(`\nRESPONSE BODY:`);
    console.log(JSON.stringify(response.data, null, 2));
    console.log('========================================\n');

    // Add to API call logs
    const apiLog = {
      id: logId,
      timestamp: new Date().toISOString(),
      method: 'POST',
      url: externalUrl,
      path: '/api/verify/customer-user-create',
      headers: Object.fromEntries(request.headers.entries()),
      query: {},
      body: {
        ...validatedData,
        password: maskPassword(validatedData.password),
      },
      response: {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers ? Object.fromEntries(Object.entries(response.headers)) : {},
        body: response.data,
        duration,
      },
      ip,
      userAgent,
    };
    addLog(apiLog);

    // Check Success
    if (response.status >= 200 && response.status < 300) {
      // เช็ค status: "OK" หรือ "ok" (เผื่อ Backend ตอบกลับ case ไม่ตรง)
      const responseStatus = response.data?.status;

      if (responseStatus && responseStatus.toUpperCase() === 'OK') {
        return NextResponse.json(
          {
            success: true,
            data: response.data,
            message: 'Customer user created successfully',
          },
          { status: 200 }
        );
      } else {
        console.warn(`⚠️ External API returned HTTP ${response.status} but status is "${responseStatus}"`);
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_STATUS',
              message: response.data?.description || response.data?.message || 'External API returned invalid status',
              details: response.data,
            },
          },
          { status: 400 }
        );
      }
    } else {
      // Error from External API
      return NextResponse.json(
        {
          success: false,
          error: {
            code: `HTTP_${response.status}`,
            message: response.data?.description || response.data?.message || 'External API error',
            details: response.data,
          },
        },
        { status: response.status }
      );
    }

  } catch (error: unknown) {
    const duration = Date.now() - startTime;
    logError(error, requestData);

    // Handle Axios Error
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status || 503;
      const data = axiosError.response?.data as any;

      logResponse(status, false, duration);

      // Log to DB
      addLog({
        id: logId,
        timestamp: new Date().toISOString(),
        method: 'POST',
        url: axiosError.config?.url || 'N/A',
        path: '/api/verify/customer-user-create',
        headers: Object.fromEntries(request.headers.entries()),
        query: {},
        body: requestData.password ? { ...requestData, password: '***' } : requestData,
        response: {
          status,
          statusText: axiosError.response?.statusText || 'Error',
          headers: axiosError.response?.headers ? Object.fromEntries(Object.entries(axiosError.response.headers)) : {},
          body: data || { error: axiosError.message },
          duration
        },
        ip,
        userAgent,
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: data?.code || (status === 503 ? 'EXTERNAL_API_UNREACHABLE' : `HTTP_${status}`),
            message: data?.message || axiosError.message || 'Error communicating with external API',
            details: data,
          },
        },
        { status }
      );
    }

    // Handle Unknown Error
    addLog({
      id: logId,
      timestamp: new Date().toISOString(),
      method: 'POST',
      url: 'N/A',
      path: '/api/verify/customer-user-create',
      headers: Object.fromEntries(request.headers.entries()),
      query: {},
      body: requestData.password ? { ...requestData, password: '***' } : requestData,
      response: {
        status: 500,
        statusText: 'Internal Server Error',
        headers: {},
        body: { error: error instanceof Error ? error.message : 'Unknown error' },
        duration,
      },
      ip,
      userAgent,
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred.',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}