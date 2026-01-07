// File: lib/url-parser.ts

/**
 * URL Parser & Validation Utilities
 *
 * Parses and validates registration URLs following the pattern:
 * https://<host>/<organization>/<registration-type>/<token>?data=<base64_of_json_string>
 */

import { z } from 'zod';

// ============================================
// TYPES
// ============================================

export type RegistrationType =
  | 'user-invite-confirm'
  | 'user-signup-confirm'
  | 'customer-email-verification'
  | 'forgot-password'
  | 'customer-user-create'
  | 'customer-forgot-password'; 

export const REGISTRATION_TYPES: RegistrationType[] = [
  'user-invite-confirm',
  'user-signup-confirm',
  'customer-email-verification',
  'forgot-password',
  'customer-user-create',
  'customer-forgot-password',
];

// ============================================
// ZOD SCHEMAS
// ============================================

// User Invite Confirm Data Schema
export const UserInviteDataSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  email: z.string().email('Invalid email address'),
  orgUserId: z.string().uuid('Organization User ID must be a valid UUID').optional(),
  invitedBy: z
    .string()
    .trim()
    .min(1, 'Invited By is required')
    .max(100, 'Invited By must not exceed 100 characters'),
});

// User Signup Confirm Data Schema
export const UserSignupDataSchema = z.object({
  username: z.string().min(1, 'Username is required').optional(),
  email: z.string().email('Invalid email address'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  orgUserId: z.string().uuid('Organization User ID must be a valid UUID').optional(),
});

// Customer Email Verification Data Schema
export const CustomerVerificationDataSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  name: z.string().min(1, 'Name is required').max(255, 'Name must not exceed 255 characters'),
  email: z.string().email('Invalid email address'),
});

// Forgot Password Data Schema
export const ForgotPasswordDataSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  email: z.string().email('Invalid email address'),
});

// Customer User Create Data Schema
export const CustomerUserCreateDataSchema = z.object({
  email: z.string().email('Invalid email address'),
  customerId: z.string().min(1),
});

export const CustomerResetPasswordDataSchema = z.object({
  email: z.string().email('Invalid email address'),
  customerId: z.string().min(1, 'Customer ID is required'),
});

// Type inference from schemas
export type UserInviteData = z.infer<typeof UserInviteDataSchema>;
export type UserSignupData = z.infer<typeof UserSignupDataSchema>;
export type CustomerVerificationData = z.infer<typeof CustomerVerificationDataSchema>;
export type ForgotPasswordData = z.infer<typeof ForgotPasswordDataSchema>;
export type CustomerUserCreateData = z.infer<typeof CustomerUserCreateDataSchema>;
export type CustomerResetPasswordData = z.infer<typeof CustomerResetPasswordDataSchema>;

// Union type for all data types
export type RegistrationData =
  | UserInviteData
  | UserSignupData
  | CustomerVerificationData
  | ForgotPasswordData
  | CustomerUserCreateData
  | CustomerResetPasswordData;

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

export type ParseResult<T> = { success: true; data: T } | { success: false; error: ParseError };

// ============================================
// VALIDATION FUNCTIONS
// ============================================

export function isValidUUID(token: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(token);
}

export function isValidOrganization(org: string): boolean {
  const orgRegex = /^[a-z0-9_-]+$/i;
  return orgRegex.test(org) && org.length >= 2 && org.length <= 50;
}

export function isValidRegistrationType(type: string): type is RegistrationType {
  return REGISTRATION_TYPES.includes(type as RegistrationType);
}

// ============================================
// DECODING FUNCTIONS
// ============================================

export function decodeDataParam(
  encodedData: string,
  registrationType?: RegistrationType
): ParseResult<unknown> {
  try {
    const urlDecoded = decodeURIComponent(encodedData);
    let base64Decoded: string;
    if (typeof window !== 'undefined') {
      base64Decoded = atob(urlDecoded);
    } else {
      base64Decoded = Buffer.from(urlDecoded, 'base64').toString('utf-8');
    }

    const jsonData = JSON.parse(base64Decoded);
    const transformedData = transformDataKeys(jsonData, registrationType);

    return { success: true, data: transformedData };
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

function transformDataKeys(data: any, registrationType?: RegistrationType): unknown {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const transformed: any = {};

  const keyMappings: Record<string, string> = {
    Name: 'name',
    name: 'name',
    Email: 'email',
    email: 'email',
    Code: 'code',
    code: 'code',
    UserName: 'username',
    Username: 'username',
    username: 'username',
    FirstName: 'firstName',
    firstName: 'firstName',
    LastName: 'lastName',
    Lastname: 'lastName',
    lastName: 'lastName',
    Password: 'password',
    password: 'password',
    OrgUserId: 'orgUserId',
    orgUserId: 'orgUserId',
    InvitedBy: 'invitedBy',
    invitedBy: 'invitedBy',
  };

  // Handle 'Id' field if present
  if ('Id' in data || 'id' in data) {
    const idValue = data.Id || data.id;
    if (registrationType === 'customer-email-verification') {
      transformed.customerId = idValue;
    } else if (
      registrationType === 'user-signup-confirm' ||
      registrationType === 'user-invite-confirm'
    ) {
      transformed.orgUserId = idValue;
    } else {
      transformed.customerId = idValue;
    }
  }

  // Handle explicit customerId
  if ('customerId' in data && !transformed.customerId) {
    transformed.customerId = data.customerId;
  }

  // Standard Key Mapping
  for (const [externalKey, internalKey] of Object.entries(keyMappings)) {
    if (externalKey in data) {
      const value = data[externalKey];
      transformed[internalKey] = value === null ? undefined : value;
    }
  }

  // CamelCase fallback
  for (const key in data) {
    if (!(key in keyMappings) && key !== 'Id' && key !== 'id' && key !== 'customerId') {
      const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
      const value = data[key];
      transformed[camelKey] = value === null ? undefined : value;
    }
  }

  if (registrationType === 'customer-forgot-password') {
    if (!transformed.customerId && transformed.orgUserId) {
      transformed.customerId = transformed.orgUserId;
    }
    if (!transformed.customerId && data.OrgUserId) {
      transformed.customerId = data.OrgUserId;
    }
  }

  return transformed;
}

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
      case 'customer-user-create':
        schema = CustomerUserCreateDataSchema;
        break;
      case 'customer-forgot-password': 
        schema = CustomerResetPasswordDataSchema;
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

export function parseRegistrationUrl(url: string): ParseResult<ParsedRegistrationUrl> {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);

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

    if (!isValidOrganization(organization)) {
      return {
        success: false,
        error: {
          code: 'INVALID_URL',
          message: `Invalid organization name: ${organization}`,
        },
      };
    }

    if (!isValidRegistrationType(registrationType)) {
      return {
        success: false,
        error: {
          code: 'INVALID_URL',
          message: `Invalid registration type: ${registrationType}. Must be one of: ${REGISTRATION_TYPES.join(', ')}`,
        },
      };
    }

    if (!isValidUUID(token)) {
      return {
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid token format. Token must be a valid UUID.',
        },
      };
    }

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

    const decodeResult = decodeDataParam(dataParam, registrationType);
    if (!decodeResult.success) {
      return decodeResult as ParseResult<ParsedRegistrationUrl>;
    }

    const validationResult = validateData(registrationType, decodeResult.data);
    if (!validationResult.success) {
      return validationResult as ParseResult<ParsedRegistrationUrl>;
    }

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

// ... Helper functions (isTokenExpired, generateRegistrationUrl, etc.) remain the same
// but are included if you need the full file as requested.

export function isTokenExpired(timestampMs: number): boolean {
  const now = Date.now();
  const expiryMs = 24 * 60 * 60 * 1000;
  return now - timestampMs > expiryMs;
}

export function generateRegistrationUrl(params: {
  host: string;
  organization: string;
  registrationType: RegistrationType;
  token: string;
  data: Record<string, unknown>;
}): string {
  const { host, organization, registrationType, token, data } = params;

  const jsonString = JSON.stringify(data);
  let base64Encoded: string;

  if (typeof window !== 'undefined') {
    base64Encoded = btoa(jsonString);
  } else {
    base64Encoded = Buffer.from(jsonString).toString('base64');
  }

  const urlEncoded = encodeURIComponent(base64Encoded);

  return `https://${host}/${organization}/${registrationType}/${token}?data=${urlEncoded}`;
}

export function extractOrganization(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    return pathParts[0] || null;
  } catch {
    return null;
  }
}

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

export function extractToken(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    return pathParts[2] || null;
  } catch {
    return null;
  }
}