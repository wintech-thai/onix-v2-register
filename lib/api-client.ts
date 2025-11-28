/**
 * API Client for ONIX v2 Registration Microservice
 *
 * Centralized API client using axios for all backend communication.
 * Handles request/response interceptors, error handling, and logging.
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

// ============================================
// TYPES
// ============================================

export interface ApiError {
  code: string;
  message: string;
  status?: number;
  details?: unknown;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

// ============================================
// API CLIENT INSTANCE
// ============================================

const apiClient: AxiosInstance = axios.create({
  baseURL: '/api', // Use Next.js API routes as proxy (avoids CORS)
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// REQUEST INTERCEPTOR
// ============================================

apiClient.interceptors.request.use(
  (config) => {
    // Log request (structured logging)
    const logData = {
      timestamp: new Date().toISOString(),
      type: 'API_REQUEST',
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
    };
    console.log('[API Request]', JSON.stringify(logData));

    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// ============================================
// RESPONSE INTERCEPTOR
// ============================================

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful response
    const logData = {
      timestamp: new Date().toISOString(),
      type: 'API_RESPONSE',
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
    };
    console.log('[API Response]', JSON.stringify(logData));

    return response;
  },
  (error: AxiosError) => {
    // Log error response
    const logData = {
      timestamp: new Date().toISOString(),
      type: 'API_ERROR',
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      url: error.config?.url,
    };

    // Use warn for expected client errors (4xx), error for server errors (5xx) or network errors
    const status = error.response?.status;
    if (status && status >= 400 && status < 500) {
      console.warn('[API Client Error]', JSON.stringify(logData));
    } else {
      console.error('[API Error]', JSON.stringify(logData));
    }

    return Promise.reject(error);
  }
);

// ============================================
// ERROR HANDLER
// ============================================

/**
 * Converts Axios error to standardized API error
 */
export function handleApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;

    // Network error (no response)
    if (!axiosError.response) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Network error. Please check your internet connection and try again.',
        details: axiosError.message,
      };
    }

    // HTTP error (with response)
    const status = axiosError.response.status;
    const data = axiosError.response.data as any;

    // Check if error is in nested structure (success: false, error: {...})
    if (data?.success === false && data?.error) {
      return {
        code: data.error.code || `HTTP_${status}`,
        message: data.error.message || getDefaultErrorMessage(status),
        status,
        details: data.error.details || data,
      };
    }

    // Otherwise use flat structure
    return {
      code: data?.code || `HTTP_${status}`,
      message: data?.message || getDefaultErrorMessage(status),
      status,
      details: data,
    };
  }

  // Unknown error
  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred. Please try again.',
    details: error instanceof Error ? error.message : 'Unknown error',
  };
}

/**
 * Gets default error message for HTTP status code
 */
function getDefaultErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return 'Bad request. Please check your input and try again.';
    case 401:
      return 'Unauthorized. Please check your credentials.';
    case 403:
      return 'Forbidden. You do not have permission to access this resource.';
    case 404:
      return 'Not found. The requested resource does not exist.';
    case 409:
      return 'Conflict. The resource already exists or there is a conflict.';
    case 422:
      return 'Validation error. Please check your input.';
    case 429:
      return 'Too many requests. Please try again later.';
    case 500:
      return 'Internal server error. Please try again later.';
    case 502:
      return 'Bad gateway. The server is temporarily unavailable.';
    case 503:
      return 'Service unavailable. Please try again later.';
    case 504:
      return 'Gateway timeout. The server took too long to respond.';
    default:
      return 'An error occurred. Please try again.';
  }
}

// ============================================
// REGISTRATION API ENDPOINTS
// ============================================

/**
 * Confirms existing user invitation
 */
export async function confirmUserInvite(params: {
  org: string;
  token: string;
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  orgUserId: string;
  invitedBy?: string;
}): Promise<ApiResponse> {
  try {
    const { org, token, username, email, password, firstName, lastName, orgUserId, invitedBy } =
      params;
    const response = await apiClient.post('/verify/user-invite', {
      org,
      token,
      regType: 'user-invite-confirm',
      email,
      userName: username,
      password,
      name: firstName,
      lastName,
      orgUserId,
      invitedBy,
    });

    // Check if the API response indicates success
    if (response.data?.success === false) {
      // API returned success: false, treat as error
      return {
        success: false,
        error: response.data.error || {
          code: 'API_ERROR',
          message: 'API request failed',
          details: response.data,
        },
      };
    }

    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleApiError(error) };
  }
}

/**
 * Confirms new user signup with password
 */
export async function confirmUserSignup(params: {
  org: string;
  token: string;
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  orgUserId: string;
}): Promise<ApiResponse> {
  try {
    const { org, token, username, email, password, firstName, lastName, orgUserId } = params;
    const response = await apiClient.post('/verify/user-invite', {
      org,
      token,
      regType: 'user-signup-confirm',
      email,
      userName: username,
      password,
      name: firstName,
      lastName,
      orgUserId,
    });

    // Check if the API response indicates success
    if (response.data?.success === false) {
      // API returned success: false, treat as error
      return {
        success: false,
        error: response.data.error || {
          code: 'API_ERROR',
          message: 'API request failed',
          details: response.data,
        },
      };
    }

    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleApiError(error) };
  }
}

/**
 * Confirms customer email verification
 * Calls Next.js API route which proxies to external API
 *
 * API Endpoint: POST /api/Registration/org/{orgId}/action/ConfirmCustomerEmailVerification/{token}/{custId}
 *
 * Returns response data which may include:
 * - username: string (for redirect to user-signup-confirm)
 * - email: string
 * - orgUserId: string
 * - other user data
 */
export async function confirmEmailVerification(params: {
  org: string;
  token: string;
  custId: string;
}): Promise<ApiResponse> {
  try {
    const response = await apiClient.post('/verify/customer', {
      org: params.org,
      token: params.token,
      custId: params.custId,
    });

    // Check if the API response indicates success
    if (response.data?.success === false) {
      // API returned success: false, treat as error
      return {
        success: false,
        error: response.data.error || {
          code: 'API_ERROR',
          message: 'API request failed',
          details: response.data,
        },
      };
    }

    // Return the response data which may contain username for redirect
    return {
      success: true,
      data: response.data?.data || response.data, // Handle both {data: {...}} and direct response
    };
  } catch (error) {
    return { success: false, error: handleApiError(error) };
  }
}

/**
 * Confirms password reset
 */
export async function confirmPasswordReset(params: {
  org: string;
  token: string;
  username: string;
  email: string;
  newPassword: string;
  orgUserId: string;
}): Promise<ApiResponse> {
  try {
    const { org, token, username, email, newPassword, orgUserId } = params;
    const response = await apiClient.post('/auth/forgot-password', {
      org,
      token,
      email,
      userName: username,
      password: newPassword,
      orgUserId,
    });

    // Check if the API response indicates success
    if (response.data?.success === false) {
      // API returned success: false, treat as error
      return {
        success: false,
        error: response.data.error || {
          code: 'API_ERROR',
          message: 'API request failed',
          details: response.data,
        },
      };
    }

    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleApiError(error) };
  }
}

// ============================================
// EXPORT
// ============================================

export default apiClient;
