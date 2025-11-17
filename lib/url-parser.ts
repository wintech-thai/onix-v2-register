/**
 * URL Parser & Validation Utilities
 *
 * Parses and validates registration URLs following the pattern:
 * https://<host>/<organization>/<registration-type>/<token>?data=<base64_of_json_string>
 *
 * Supports:
 * - user-invite-confirm
 * - user-signup-confirm
 * - customer-email-verification
 * - forgot-password
 */

import { z } from 'zod';

// ============================================
// TYPES
// ============================================

export type RegistrationType =
  | 'user-invite-confirm'
  | 'user-signup-confirm'
  | 'customer-email-verification'
  | 'forgot-password';

export const REGISTRATION_TYPES: RegistrationType[] = [
  'user-invite-confirm',
  'user-signup-confirm',
  'customer-email-verification',
  'forgot-password',
];

// ============================================
// ZOD SCHEMAS
// ============================================

// User Invite Confirm Data Schema
export const UserInviteDataSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  email: z.string().email('Invalid email address'),
});

// User Signup Confirm Data Schema
export const UserSignupDataSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  email: z.string().email('Invalid email address'),
});

// Customer Email Verification Data Schema
export const CustomerVerificationDataSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
});

// Forgot Password Data Schema
export const ForgotPasswordDataSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  email: z.string().email('Invalid email address'),
});

// Type inference from schemas
export type UserInviteData = z.infer<typeof UserInviteDataSchema>;
export type UserSignupData = z.infer<typeof UserSignupDataSchema>;
export type CustomerVerificationData = z.infer<typeof CustomerVerificationDataSchema>;
export type ForgotPasswordData = z.infer<typeof ForgotPasswordDataSchema>;

// Union type for all data types
export type RegistrationData =
  | UserInviteData
  | UserSignupData
  | CustomerVerificationData
  | ForgotPasswordData;

// ============================================
// RESULT TYPES
// ============================================

export interface ParsedRegistrationUrl {
  organization: string;
  registrationType: RegistrationType;
  token: string;
  data: RegistrationData;
}

export interface ParseError {
  code:
    | 'INVALID_URL'
    | 'INVALID_TOKEN'
    | 'INVALID_DATA'
    | 'MISSING_PARAM'
    | 'DECODE_ERROR'
    | 'VALIDATION_ERROR';
  message: string;
  details?: unknown;
}

export type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: ParseError };

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * Validates UUID v4 format
 * Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 */
export function isValidUUID(token: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(token);
}

/**
 * Validates organization name
 * Allows alphanumeric characters, hyphens, and underscores
 */
export function isValidOrganization(org: string): boolean {
  const orgRegex = /^[a-z0-9_-]+$/i;
  return orgRegex.test(org) && org.length >= 2 && org.length <= 50;
}

/**
 * Validates registration type
 */
export function isValidRegistrationType(type: string): type is RegistrationType {
  return REGISTRATION_TYPES.includes(type as RegistrationType);
}

// ============================================
// DECODING FUNCTIONS
// ============================================

/**
 * Decodes base64 encoded data parameter
 * Process: URL decode → Base64 decode → JSON parse
 */
export function decodeDataParam(encodedData: string): ParseResult<unknown> {
  try {
    // Step 1: URL decode
    const urlDecoded = decodeURIComponent(encodedData);

    // Step 2: Base64 decode
    let base64Decoded: string;
    if (typeof window !== 'undefined') {
      // Browser environment
      base64Decoded = atob(urlDecoded);
    } else {
      // Node.js environment
      base64Decoded = Buffer.from(urlDecoded, 'base64').toString('utf-8');
    }

    // Step 3: JSON parse
    const jsonData = JSON.parse(base64Decoded);

    return { success: true, data: jsonData };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'DECODE_ERROR',
        message: 'Failed to decode data parameter. Please check your registration link.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

/**
 * Validates data against the appropriate schema based on registration type
 */
export function validateData(
  registrationType: RegistrationType,
  data: unknown
): ParseResult<RegistrationData> {
  try {
    let schema: z.ZodSchema;

    switch (registrationType) {
      case 'user-invite-confirm':
        schema = UserInviteDataSchema;
        break;
      case 'user-signup-confirm':
        schema = UserSignupDataSchema;
        break;
      case 'customer-email-verification':
        schema = CustomerVerificationDataSchema;
        break;
      case 'forgot-password':
        schema = ForgotPasswordDataSchema;
        break;
      default:
        return {
          success: false,
          error: {
            code: 'INVALID_DATA',
            message: `Unknown registration type: ${registrationType}`,
          },
        };
    }

    const validated = schema.parse(data);
    return { success: true, data: validated as RegistrationData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Data validation failed: ' + fieldErrors.join(', '),
          details: error.errors,
        },
      };
    }

    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Data validation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

// ============================================
// MAIN PARSER FUNCTION
// ============================================

/**
 * Main parser function
 * Parses registration URL and extracts all components
 *
 * @param url - Full registration URL
 * @returns ParseResult with parsed data or error
 *
 * @example
 * ```ts
 * const result = parseRegistrationUrl(
 *   'https://register.please-scan.com/acme/user-invite-confirm/550e8400-e29b-41d4-a716-446655440000?data=eyJ1c2VybmFtZSI6ImpvaG4iLCJlbWFpbCI6ImpvaG5AZXhhbXBsZS5jb20ifQ=='
 * );
 *
 * if (result.success) {
 *   console.log(result.data.organization); // 'acme'
 *   console.log(result.data.registrationType); // 'user-invite-confirm'
 * } else {
 *   console.error(result.error.message);
 * }
 * ```
 */
export function parseRegistrationUrl(url: string): ParseResult<ParsedRegistrationUrl> {
  try {
    // Parse URL
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);

    // Expected format: /<org>/<type>/<token>
    if (pathParts.length !== 3) {
      return {
        success: false,
        error: {
          code: 'INVALID_URL',
          message: 'Invalid URL format. Expected: /<organization>/<registration-type>/<token>',
        },
      };
    }

    const [organization, registrationType, token] = pathParts;

    // Validate organization
    if (!isValidOrganization(organization)) {
      return {
        success: false,
        error: {
          code: 'INVALID_URL',
          message: `Invalid organization name: ${organization}`,
        },
      };
    }

    // Validate registration type
    if (!isValidRegistrationType(registrationType)) {
      return {
        success: false,
        error: {
          code: 'INVALID_URL',
          message: `Invalid registration type: ${registrationType}. Must be one of: ${REGISTRATION_TYPES.join(', ')}`,
        },
      };
    }

    // Validate token (UUID)
    if (!isValidUUID(token)) {
      return {
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid token format. Token must be a valid UUID.',
        },
      };
    }

    // Extract and decode data parameter
    const dataParam = urlObj.searchParams.get('data');
    if (!dataParam) {
      return {
        success: false,
        error: {
          code: 'MISSING_PARAM',
          message: 'Missing required "data" query parameter in the registration link.',
        },
      };
    }

    // Decode data parameter
    const decodeResult = decodeDataParam(dataParam);
    if (!decodeResult.success) {
      return decodeResult as ParseResult<ParsedRegistrationUrl>;
    }

    // Validate data against schema
    const validationResult = validateData(registrationType, decodeResult.data);
    if (!validationResult.success) {
      return validationResult as ParseResult<ParsedRegistrationUrl>;
    }

    // Success - return parsed data
    return {
      success: true,
      data: {
        organization,
        registrationType,
        token,
        data: validationResult.data,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'INVALID_URL',
        message: 'Failed to parse URL',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Checks if a token is expired (24 hour expiry)
 * Note: This requires the timestamp to be encoded in the data or provided separately
 *
 * @param timestampMs - Timestamp in milliseconds when the token was created
 * @returns true if expired, false otherwise
 */
export function isTokenExpired(timestampMs: number): boolean {
  const now = Date.now();
  const expiryMs = 24 * 60 * 60 * 1000; // 24 hours
  return now - timestampMs > expiryMs;
}

/**
 * Generates a registration URL (useful for testing)
 *
 * @param params - URL generation parameters
 * @returns Complete registration URL
 *
 * @example
 * ```ts
 * const url = generateRegistrationUrl({
 *   host: 'register.please-scan.com',
 *   organization: 'acme',
 *   registrationType: 'user-invite-confirm',
 *   token: '550e8400-e29b-41d4-a716-446655440000',
 *   data: { username: 'john', email: 'john@example.com' }
 * });
 * ```
 */
export function generateRegistrationUrl(params: {
  host: string;
  organization: string;
  registrationType: RegistrationType;
  token: string;
  data: Record<string, unknown>;
}): string {
  const { host, organization, registrationType, token, data } = params;

  // JSON → Base64 → URL encode
  const jsonString = JSON.stringify(data);
  let base64Encoded: string;

  if (typeof window !== 'undefined') {
    // Browser environment
    base64Encoded = btoa(jsonString);
  } else {
    // Node.js environment
    base64Encoded = Buffer.from(jsonString).toString('base64');
  }

  const urlEncoded = encodeURIComponent(base64Encoded);

  return `https://${host}/${organization}/${registrationType}/${token}?data=${urlEncoded}`;
}

/**
 * Extracts just the organization from a URL (lighter weight than full parsing)
 */
export function extractOrganization(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    return pathParts[0] || null;
  } catch {
    return null;
  }
}

/**
 * Extracts just the registration type from a URL
 */
export function extractRegistrationType(url: string): RegistrationType | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    const type = pathParts[1];
    return isValidRegistrationType(type) ? type : null;
  } catch {
    return null;
  }
}

/**
 * Extracts just the token from a URL
 */
export function extractToken(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    return pathParts[2] || null;
  } catch {
    return null;
  }
}
