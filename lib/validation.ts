/**
 * Form Validation Schemas
 *
 * Zod schemas for client-side and server-side form validation.
 * Used with React Hook Form for all registration forms.
 */

import { z } from 'zod';

// ============================================
// COMMON FIELD SCHEMAS
// ============================================

/**
 * Email validation schema
 */
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(255, 'Email must not exceed 255 characters')
  .toLowerCase()
  .trim();

/**
 * Username validation schema
 */
export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username must not exceed 20 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores')
  .trim();

/**
 * Password validation schema
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must not exceed 100 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
    'Password must contain at least one special character'
  );

/**
 * Name validation schema (first name, last name)
 */
export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must not exceed 50 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
  .trim();

/**
 * Customer ID validation schema
 */
export const customerIdSchema = z
  .string()
  .min(1, 'Customer ID is required')
  .max(50, 'Customer ID must not exceed 50 characters')
  .trim();

// ============================================
// USER INVITE CONFIRM FORM
// ============================================

/**
 * User Invite Confirm Form Schema
 * Read-only form with username and email (no user input required)
 */
export const userInviteConfirmSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
});

export type UserInviteConfirmFormData = z.infer<typeof userInviteConfirmSchema>;

// ============================================
// USER SIGNUP CONFIRM FORM
// ============================================

/**
 * User Signup Confirm Form Schema
 * User must provide password, confirm password, first name, and last name
 */
export const userSignupConfirmSchema = z
  .object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    firstName: nameSchema,
    lastName: nameSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type UserSignupConfirmFormData = z.infer<typeof userSignupConfirmSchema>;

// ============================================
// CUSTOMER EMAIL VERIFICATION FORM
// ============================================

/**
 * Customer Email Verification Form Schema
 * Read-only form with customer ID, name, and email
 */
export const customerEmailVerificationSchema = z.object({
  customerId: customerIdSchema,
  name: nameSchema,
  email: emailSchema,
});

export type CustomerEmailVerificationFormData = z.infer<
  typeof customerEmailVerificationSchema
>;

// ============================================
// FORGOT PASSWORD FORM
// ============================================

/**
 * Forgot Password Form Schema
 * User must provide new password and confirm password
 */
export const forgotPasswordSchema = z
  .object({
    username: usernameSchema,
    email: emailSchema,
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Validates password strength and returns feedback
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number; // 0-5
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= 8) {
    score++;
  } else {
    feedback.push('Password must be at least 8 characters long');
  }

  if (password.length >= 12) {
    score++;
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score++;
  } else {
    feedback.push('Add at least one uppercase letter');
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score++;
  } else {
    feedback.push('Add at least one lowercase letter');
  }

  // Number check
  if (/[0-9]/.test(password)) {
    score++;
  } else {
    feedback.push('Add at least one number');
  }

  // Special character check
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score++;
  } else {
    feedback.push('Add at least one special character');
  }

  return {
    isValid: score >= 5,
    score,
    feedback,
  };
}

/**
 * Gets password strength label
 */
export function getPasswordStrengthLabel(score: number): {
  label: string;
  color: string;
} {
  if (score <= 2) {
    return { label: 'Weak', color: 'red' };
  } else if (score <= 3) {
    return { label: 'Fair', color: 'orange' };
  } else if (score <= 4) {
    return { label: 'Good', color: 'yellow' };
  } else {
    return { label: 'Strong', color: 'green' };
  }
}

/**
 * Sanitizes user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
}

/**
 * Validates that a field is not empty
 */
export function isNotEmpty(value: unknown): boolean {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value != null;
}

/**
 * Validates email format (additional client-side check)
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Checks if two passwords match
 */
export function passwordsMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword && password.length > 0;
}
