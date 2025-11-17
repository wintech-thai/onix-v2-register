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
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
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
    console.error('[API Error]', JSON.stringify(logData));

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
}): Promise<ApiResponse> {
  try {
    const { org, token, username } = params;
    const response = await apiClient.post(
      `/org/${org}/action/ConfirmExistingUserInvitation/${token}/${username}`
    );
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
  password: string;
  firstName: string;
  lastName: string;
}): Promise<ApiResponse> {
  try {
    const { org, token, username, password, firstName, lastName } = params;
    const response = await apiClient.post(
      `/org/${org}/action/ConfirmNewUserInvitation/${token}/${username}`,
      {
        password,
        firstName,
        lastName,
      }
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleApiError(error) };
  }
}

/**
 * Confirms customer email verification
 */
export async function confirmEmailVerification(params: {
  org: string;
  token: string;
  customerId: string;
}): Promise<ApiResponse> {
  try {
    const { org, token, customerId } = params;
    const response = await apiClient.post(
      `/org/${org}/action/ConfirmCustomerEmailVerification/${token}/${customerId}`
    );
    return { success: true, data: response.data };
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
  newPassword: string;
}): Promise<ApiResponse> {
  try {
    const { org, token, username, newPassword } = params;
    const response = await apiClient.post(
      `/org/${org}/action/ConfirmForgotPasswordReset/${token}/${username}`,
      {
        newPassword,
      }
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleApiError(error) };
  }
}

// ============================================
// EXPORT
// ============================================

export default apiClient;
