/**
 * Test Utilities
 *
 * Provides utility functions for testing React components with necessary providers.
 * Includes custom render function, mock data generators, and common test helpers.
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ============================================
// CUSTOM RENDER FUNCTION
// ============================================

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  locale?: 'en' | 'th';
  dictionary?: any;
}

/**
 * Custom render function that wraps components with necessary providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: CustomRenderOptions
): RenderResult & { user: ReturnType<typeof userEvent.setup> } {
  const { locale = 'en', dictionary, ...renderOptions } = options || {};

  // Create user event instance
  const user = userEvent.setup();

  // Wrapper component with providers
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
  }

  const rendered = render(ui, { wrapper: Wrapper, ...renderOptions });

  return { ...rendered, user };
}

// Re-export everything from React Testing Library
export * from '@testing-library/react';

// Export userEvent separately
export { userEvent };

// ============================================
// MOCK DATA GENERATORS
// ============================================

/**
 * Generate mock user invite data
 */
export function generateUserInviteData(overrides?: Partial<any>) {
  return {
    username: 'testuser',
    email: 'test@example.com',
    ...overrides,
  };
}

/**
 * Generate mock user signup data
 */
export function generateUserSignupData(overrides?: Partial<any>) {
  return {
    username: 'testuser',
    email: 'test@example.com',
    ...overrides,
  };
}

/**
 * Generate mock customer verification data
 */
export function generateCustomerVerificationData(overrides?: Partial<any>) {
  return {
    customerId: '12345',
    name: 'John Doe',
    email: 'john@example.com',
    ...overrides,
  };
}

/**
 * Generate mock forgot password data
 */
export function generateForgotPasswordData(overrides?: Partial<any>) {
  return {
    username: 'testuser',
    email: 'test@example.com',
    ...overrides,
  };
}

/**
 * Generate valid UUID token
 */
export function generateToken(): string {
  return 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
}

/**
 * Generate valid Base64 encoded data parameter
 */
export function generateDataParam(data: object): string {
  const jsonString = JSON.stringify(data);
  const base64 = Buffer.from(jsonString).toString('base64');
  return encodeURIComponent(base64);
}

// ============================================
// MOCK DICTIONARY
// ============================================

/**
 * Mock English dictionary for testing
 */
export const mockEnglishDictionary = {
  navigation: {
    title: 'Please Scan Register',
    language: 'Language',
    english: 'English',
    thai: 'ภาษาไทย',
  },
  common: {
    loading: 'Loading...',
    error: 'An error occurred',
    success: 'Success',
    cancel: 'Cancel',
    submit: 'Submit',
    confirm: 'Confirm',
    required: 'This field is required',
    back: 'Back',
    close: 'Close',
  },
  validation: {
    email: {
      invalid: 'Please enter a valid email address',
      required: 'Email is required',
    },
    password: {
      required: 'Password is required',
      minLength: 'Password must be at least 8 characters',
      uppercase: 'Password must contain at least one uppercase letter',
      lowercase: 'Password must contain at least one lowercase letter',
      number: 'Password must contain at least one number',
      special: 'Password must contain at least one special character',
    },
    confirmPassword: {
      required: 'Please confirm your password',
      mismatch: 'Passwords do not match',
    },
    name: {
      required: 'Name is required',
      minLength: 'Name must be at least 2 characters',
      maxLength: 'Name must not exceed 50 characters',
    },
    username: {
      required: 'Username is required',
      minLength: 'Username must be at least 3 characters',
      maxLength: 'Username must not exceed 20 characters',
    },
  },
  forms: {
    userInvite: {
      title: 'Confirm User Invitation',
      description: 'Please confirm your account details',
      username: 'Username',
      email: 'Email',
      confirmButton: 'Confirm Invitation',
      success: 'Your account has been confirmed successfully!',
    },
    userSignup: {
      title: 'Complete Your Registration',
      description: 'Please fill in your details to complete registration',
      username: 'Username',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      firstName: 'First Name',
      lastName: 'Last Name',
      submitButton: 'Complete Registration',
      cancelButton: 'Cancel',
      success: 'Registration complete! You can now log in.',
    },
    customerVerification: {
      title: 'Email Verification',
      description: 'Please confirm your email address',
      name: 'Name',
      email: 'Email',
      confirmButton: 'Verify Email',
      success: 'Your email has been verified successfully!',
    },
    forgotPassword: {
      title: 'Reset Your Password',
      description: 'Please enter a new password for your account',
      username: 'Username',
      email: 'Email',
      newPassword: 'New Password',
      confirmPassword: 'Confirm New Password',
      submitButton: 'Reset Password',
      success: 'Your password has been reset successfully!',
    },
  },
  errors: {
    tokenExpired: 'This link has expired. Please request a new one.',
    tokenInvalid: 'This link is invalid. Please check your email and try again.',
    apiError: 'Unable to connect to the server. Please try again later.',
    networkError: 'Network error. Please check your internet connection.',
    unknownError: 'An unexpected error occurred. Please try again.',
    validationError: 'Please check the form and correct any errors.',
    serverError: 'Server error. Please try again later.',
    notFound: 'The requested page was not found.',
    unauthorized: 'You are not authorized to access this page.',
    forbidden: 'Access to this resource is forbidden.',
  },
  success: {
    userInviteConfirmed: 'Your account has been confirmed successfully!',
    userSignupComplete: 'Registration complete! You can now log in.',
    emailVerified: 'Your email has been verified successfully!',
    passwordReset: 'Your password has been reset successfully!',
  },
  home: {
    title: 'Welcome to Please Scan Register',
    description: 'Registration and verification service',
    invalidLink: 'Invalid registration link. Please check your email for the correct link.',
  },
};

// ============================================
// MOCK API RESPONSES
// ============================================

/**
 * Mock successful API response
 */
export const mockSuccessResponse = {
  success: true,
  data: { message: 'Operation completed successfully' },
};

/**
 * Mock error API response
 */
export const mockErrorResponse = {
  success: false,
  error: {
    message: 'Operation failed',
    code: 'ERROR_CODE',
  },
};

// ============================================
// TEST HELPERS
// ============================================

/**
 * Wait for element to be removed with timeout
 */
export async function waitForElementToBeRemoved(
  callback: () => HTMLElement | null,
  options?: { timeout?: number }
) {
  const { timeout = 3000 } = options || {};
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (!callback()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  throw new Error('Element was not removed within timeout');
}

/**
 * Wait for loading to finish
 */
export async function waitForLoadingToFinish(
  getByText: (text: string | RegExp) => HTMLElement
) {
  try {
    await waitForElementToBeRemoved(() => {
      try {
        return getByText(/loading/i);
      } catch {
        return null;
      }
    });
  } catch {
    // Loading element not found or already removed
  }
}

/**
 * Fill form field and trigger validation
 */
export async function fillField(
  user: ReturnType<typeof userEvent.setup>,
  element: HTMLElement,
  value: string
) {
  await user.clear(element);
  await user.type(element, value);
  await user.tab(); // Trigger blur for validation
}

/**
 * Submit form
 */
export async function submitForm(
  user: ReturnType<typeof userEvent.setup>,
  submitButton: HTMLElement
) {
  await user.click(submitButton);
}

/**
 * Check if element has error
 */
export function hasError(element: HTMLElement): boolean {
  return (
    element.getAttribute('aria-invalid') === 'true' ||
    element.classList.contains('error') ||
    !!element.parentElement?.querySelector('[role="alert"]')
  );
}

/**
 * Get error message for field
 */
export function getErrorMessage(element: HTMLElement): string | null {
  const ariaDescribedBy = element.getAttribute('aria-describedby');
  if (ariaDescribedBy) {
    const errorElement = document.getElementById(ariaDescribedBy);
    return errorElement?.textContent || null;
  }
  return null;
}

/**
 * Check if button is loading
 */
export function isButtonLoading(button: HTMLElement): boolean {
  return (
    button.hasAttribute('disabled') ||
    button.textContent?.toLowerCase().includes('loading') ||
    false
  );
}

/**
 * Mock axios for API tests
 */
export function mockAxios() {
  return {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    request: jest.fn(),
  };
}

/**
 * Create mock dictionary with overrides
 */
export function createMockDictionary(overrides?: Partial<typeof mockEnglishDictionary>) {
  return {
    ...mockEnglishDictionary,
    ...overrides,
  };
}
