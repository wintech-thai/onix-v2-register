/**
 * Customer Email Verification API Route (Proxy)
 *
 * POST /api/verify/customer
 *
 * Proxies customer email verification requests to the external API.
 * This avoids CORS issues by making the external API call server-side.
 *
 * External API Endpoint:
 * POST /api/Registration/org/{orgId}/action/ConfirmCustomerEmailVerification/{token}/{custId}
 *
 * Request Body:
 * {
 *   org: string;        // Organization ID
 *   token: string;      // Verification token
 *   custId: string;     // Customer ID (UUID)
 * }
 *
 * Response:
 * - 200: Verification successful
 * - 400: Invalid request data
 * - 500: External API error
 */

import { NextRequest, NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';
import { z } from 'zod';
import { addLog, generateLogId } from '@/lib/api-logger';
import { EXTERNAL_API_URL, REQUEST_TIMEOUT } from '@/lib/env';

// ============================================
// CONFIGURATION
// ============================================
// EXTERNAL_API_URL and REQUEST_TIMEOUT imported from @/lib/env
// EXTERNAL_API_URL automatically syncs with NEXT_PUBLIC_API_URL

// ============================================
// VALIDATION SCHEMA
// ============================================

const verificationRequestSchema = z.object({
  org: z
    .string()
    .min(2, 'Organization ID must be at least 2 characters')
    .max(50, 'Organization ID must not exceed 50 characters')
    .regex(/^[a-z0-9_-]+$/i, 'Organization ID contains invalid characters'),
  token: z.string().min(1, 'Token is required'), // Verification token (UUID)
  custId: z.string().min(1, 'Customer ID is required'), // Customer ID (UUID)
});

type VerificationRequest = z.infer<typeof verificationRequestSchema>;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Logs API request details
 */
function logRequest(data: VerificationRequest, ip: string) {
  const logData = {
    timestamp: new Date().toISOString(),
    type: 'PROXY_REQUEST',
    endpoint: '/api/verify/customer',
    org: data.org,
    token: data.token,
    custId: data.custId,
    ip,
  };
  console.log('[Proxy Request]', JSON.stringify(logData));
}

/**
 * Logs API response details
 */
function logResponse(status: number, success: boolean, duration: number) {
  const logData = {
    timestamp: new Date().toISOString(),
    type: 'PROXY_RESPONSE',
    endpoint: '/api/verify/customer',
    status,
    success,
    durationMs: duration,
  };
  console.log('[Proxy Response]', JSON.stringify(logData));
}

/**
 * Logs API errors
 */
function logError(error: unknown, data: Partial<VerificationRequest>) {
  const logData = {
    timestamp: new Date().toISOString(),
    type: 'PROXY_ERROR',
    endpoint: '/api/verify/customer',
    org: data.org,
    error: error instanceof Error ? error.message : 'Unknown error',
  };
  console.error('[Proxy Error]', JSON.stringify(logData));
}

// ============================================
// API ROUTE HANDLER
// ============================================

/**
 * POST /api/verify/customer
 * Handles customer email verification requests
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let requestData: Partial<VerificationRequest> = {};
  const logId = generateLogId();

  try {
    // Parse request body
    const body = await request.json();
    requestData = body;

    // Validate request data
    const validation = verificationRequestSchema.safeParse(body);

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

    // Get client IP for logging
    const ip =
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Log incoming request
    logRequest(validatedData, ip);

    // Construct external API URL using correct Registration endpoint
    // POST /api/Registration/org/{orgId}/action/ConfirmCustomerEmailVerification/{token}/{custId}
    const externalUrl = `${EXTERNAL_API_URL}/api/Registration/org/${validatedData.org}/action/ConfirmCustomerEmailVerification/${validatedData.token}/${validatedData.custId}`;

    // Prepare request body and headers
    const requestBody = {}; // Empty body (parameters are in URL)
    const requestHeaders = {
      'Content-Type': 'application/json',
      'User-Agent': 'ONIX-v2-Registration/1.0',
      // Add authentication headers if required by external API
      // 'Authorization': `Bearer ${process.env.API_SECRET_KEY}`,
      // 'X-API-Key': process.env.API_KEY,
    };

    // Log external API call details
    console.log('\n========================================');
    console.log('🚀 EXTERNAL API CALL');
    console.log('========================================');
    console.log(`METHOD: POST`);
    console.log(`URL: ${externalUrl}`);
    console.log(`\nHEADERS:`);
    console.log(JSON.stringify(requestHeaders, null, 2));
    console.log(`\nBODY:`);
    console.log(JSON.stringify(requestBody, null, 2));
    console.log(`\nREQUEST PARAMS:`);
    console.log(`  - Organization: ${validatedData.org}`);
    console.log(`  - Token: ${validatedData.token}`);
    console.log(`  - Customer ID: ${validatedData.custId}`);
    console.log('========================================\n');

    // Call external API (server-to-server, no CORS issues)
    const response = await axios.post(externalUrl, requestBody, {
      timeout: REQUEST_TIMEOUT,
      headers: requestHeaders,
      validateStatus: (status) => status < 600, // Don't throw on 4xx/5xx
    });

    const duration = Date.now() - startTime;

    // Log response
    logResponse(response.status, response.status >= 200 && response.status < 300, duration);

    // Log external API response details
    console.log('\n========================================');
    console.log('📥 EXTERNAL API RESPONSE');
    console.log('========================================');
    console.log(`STATUS: ${response.status} ${response.statusText}`);
    console.log(`DURATION: ${duration}ms`);
    console.log(`\nRESPONSE HEADERS:`);
    console.log(JSON.stringify(response.headers, null, 2));
    console.log(`\nRESPONSE BODY:`);
    console.log(JSON.stringify(response.data, null, 2));
    console.log('========================================\n');

    // Add to API call logs
    const apiLog = {
      id: logId,
      timestamp: new Date().toISOString(),
      method: 'POST',
      url: externalUrl,
      path: '/api/verify/customer',
      headers: Object.fromEntries(request.headers.entries()),
      query: {},
      body: validatedData,
      response: {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(Object.entries(response.headers)),
        body: response.data,
        duration,
      },
      ip,
      userAgent,
    };
    addLog(apiLog);

    // Validate external API response
    // Success criteria: HTTP 200 AND status field === "OK"
    if (response.status >= 200 && response.status < 300) {
      // Check if response has status field
      const responseStatus = response.data?.status;

      if (responseStatus && responseStatus.toUpperCase() === 'OK') {
        // Success response - both HTTP 200 and status: "OK"
        return NextResponse.json(
          {
            success: true,
            data: response.data,
          },
          { status: 200 }
        );
      } else {
        // HTTP 200 but status is not "OK" - treat as error
        console.warn(
          `⚠️ External API returned HTTP ${response.status} but status field is "${responseStatus}" (expected "OK")`
        );

        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_STATUS',
              message:
                response.data?.description ||
                response.data?.message ||
                'External API returned invalid status',
              details: response.data,
            },
          },
          { status: 400 } // Return 400 to indicate failure
        );
      }
    } else {
      // Error response from external API (HTTP error status)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: `HTTP_${response.status}`,
            message:
              response.data?.description ||
              response.data?.message ||
              response.statusText ||
              'External API error',
            details: response.data,
          },
        },
        { status: response.status }
      );
    }
  } catch (error: unknown) {
    const duration = Date.now() - startTime;
    const ip =
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Log error
    logError(error, requestData);

    // Handle axios errors
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      // Network error (no response from external API)
      if (!axiosError.response) {
        logResponse(0, false, duration);

        // Add to API call logs
        const apiLog = {
          id: logId,
          timestamp: new Date().toISOString(),
          method: 'POST',
          url: 'N/A',
          path: '/api/verify/customer',
          headers: Object.fromEntries(request.headers.entries()),
          query: {},
          body: requestData,
          response: {
            status: 503,
            statusText: 'Service Unavailable',
            headers: {},
            body: { error: axiosError.message },
            duration,
          },
          ip,
          userAgent,
        };
        addLog(apiLog);

        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'EXTERNAL_API_UNREACHABLE',
              message: 'Unable to reach external API. Please try again later.',
              details: axiosError.message,
            },
          },
          { status: 503 } // Service Unavailable
        );
      }

      // HTTP error response from external API
      const status = axiosError.response.status;
      const data = axiosError.response.data as any;

      logResponse(status, false, duration);

      // Add to API call logs
      const apiLog = {
        id: logId,
        timestamp: new Date().toISOString(),
        method: 'POST',
        url: axiosError.config?.url || 'N/A',
        path: '/api/verify/customer',
        headers: Object.fromEntries(request.headers.entries()),
        query: {},
        body: requestData,
        response: {
          status,
          statusText: axiosError.response.statusText,
          headers: Object.fromEntries(Object.entries(axiosError.response.headers)),
          body: data,
          duration,
        },
        ip,
        userAgent,
      };
      addLog(apiLog);

      return NextResponse.json(
        {
          success: false,
          error: {
            code: data?.code || `HTTP_${status}`,
            message: data?.message || axiosError.message || 'External API error',
            details: data,
          },
        },
        { status }
      );
    }

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_JSON',
            message: 'Invalid JSON in request body',
          },
        },
        { status: 400 }
      );
    }

    // Handle unknown errors
    logResponse(500, false, duration);

    // Add to API call logs
    const apiLog = {
      id: logId,
      timestamp: new Date().toISOString(),
      method: 'POST',
      url: 'N/A',
      path: '/api/verify/customer',
      headers: Object.fromEntries(request.headers.entries()),
      query: {},
      body: requestData,
      response: {
        status: 500,
        statusText: 'Internal Server Error',
        headers: {},
        body: { error: error instanceof Error ? error.message : 'Unknown error' },
        duration,
      },
      ip,
      userAgent,
    };
    addLog(apiLog);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred. Please try again later.',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/verify/customer
 * Handles preflight CORS requests
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      Allow: 'POST, OPTIONS',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

/**
 * GET /api/verify/customer
 * Returns method not allowed for GET requests
 */
export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'GET method is not supported for this endpoint. Use POST instead.',
      },
    },
    {
      status: 405,
      headers: {
        Allow: 'POST, OPTIONS',
      },
    }
  );
}
