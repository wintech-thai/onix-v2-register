/**
 * Unit Tests for URL Parser
 *
 * Tests Base64 decoding, JSON parsing, Zod validation, and error handling.
 */

import {
  decodeDataParam,
  parseRegistrationUrl,
  validateToken,
  isValidOrganization,
  REGISTRATION_TYPES,
  type RegistrationType,
} from '@/lib/url-parser';

describe('URL Parser - decodeDataParam', () => {
  describe('Successful decoding', () => {
    it('should decode valid Base64 encoded JSON data', () => {
      const data = { username: 'testuser', email: 'test@example.com' };
      const jsonString = JSON.stringify(data);
      const base64 = Buffer.from(jsonString).toString('base64');
      const encoded = encodeURIComponent(base64);

      const result = decodeDataParam(encoded);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(data);
      }
    });

    it('should decode data with special characters', () => {
      const data = {
        name: "O'Brien",
        email: 'test+tag@example.com',
        message: 'Hello, World! 你好',
      };
      const jsonString = JSON.stringify(data);
      const base64 = Buffer.from(jsonString).toString('base64');
      const encoded = encodeURIComponent(base64);

      const result = decodeDataParam(encoded);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(data);
      }
    });

    it('should handle data without URL encoding', () => {
      const data = { simple: 'data' };
      const jsonString = JSON.stringify(data);
      const base64 = Buffer.from(jsonString).toString('base64');

      const result = decodeDataParam(base64);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(data);
      }
    });

    it('should decode nested object structures', () => {
      const data = {
        user: {
          profile: {
            name: 'John Doe',
            age: 30,
          },
          settings: {
            notifications: true,
          },
        },
      };
      const jsonString = JSON.stringify(data);
      const base64 = Buffer.from(jsonString).toString('base64');
      const encoded = encodeURIComponent(base64);

      const result = decodeDataParam(encoded);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(data);
      }
    });
  });

  describe('Error handling', () => {
    it('should return error for empty string', () => {
      const result = decodeDataParam('');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('empty');
      }
    });

    it('should return error for invalid Base64', () => {
      const invalidBase64 = 'not-valid-base64!!!';

      const result = decodeDataParam(invalidBase64);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    it('should return error for invalid JSON', () => {
      const invalidJson = Buffer.from('{ invalid json }').toString('base64');

      const result = decodeDataParam(invalidJson);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('JSON');
      }
    });

    it('should return error for non-object JSON', () => {
      const primitiveValue = Buffer.from('"just a string"').toString('base64');

      const result = decodeDataParam(primitiveValue);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    it('should handle malformed URL encoding gracefully', () => {
      const malformed = 'invalid%url%encoding';

      const result = decodeDataParam(malformed);

      expect(result.success).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty object', () => {
      const data = {};
      const jsonString = JSON.stringify(data);
      const base64 = Buffer.from(jsonString).toString('base64');

      const result = decodeDataParam(base64);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({});
      }
    });

    it('should handle data with null values', () => {
      const data = { field: null };
      const jsonString = JSON.stringify(data);
      const base64 = Buffer.from(jsonString).toString('base64');

      const result = decodeDataParam(base64);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ field: null });
      }
    });

    it('should handle large data objects', () => {
      const largeData = {
        items: Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          name: `Item ${i}`,
        })),
      };
      const jsonString = JSON.stringify(largeData);
      const base64 = Buffer.from(jsonString).toString('base64');

      const result = decodeDataParam(base64);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(largeData);
      }
    });

    it('should handle Unicode characters', () => {
      const data = {
        thai: 'สวัสดี',
        chinese: '你好',
        emoji: '🎉🎊',
        arabic: 'مرحبا',
      };
      const jsonString = JSON.stringify(data);
      const base64 = Buffer.from(jsonString).toString('base64');

      const result = decodeDataParam(base64);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(data);
      }
    });
  });
});

describe('URL Parser - parseRegistrationUrl', () => {
  it('should parse valid user-invite-confirm URL', () => {
    const url =
      '/en/myorg/user-invite-confirm/a1b2c3d4-e5f6-7890-abcd-ef1234567890?data=eyJ1c2VybmFtZSI6InRlc3QifQ==';

    const result = parseRegistrationUrl(url);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.locale).toBe('en');
      expect(result.data.organization).toBe('myorg');
      expect(result.data.type).toBe('user-invite-confirm');
      expect(result.data.token).toBe('a1b2c3d4-e5f6-7890-abcd-ef1234567890');
      expect(result.data.dataParam).toBe('eyJ1c2VybmFtZSI6InRlc3QifQ==');
    }
  });

  it('should parse valid user-signup-confirm URL', () => {
    const url =
      '/th/acme/user-signup-confirm/12345678-1234-1234-1234-123456789abc?data=encoded';

    const result = parseRegistrationUrl(url);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.locale).toBe('th');
      expect(result.data.organization).toBe('acme');
      expect(result.data.type).toBe('user-signup-confirm');
    }
  });

  it('should parse valid customer-email-verification URL', () => {
    const url =
      '/en/company/customer-email-verification/abcdef12-3456-7890-abcd-ef1234567890?data=test';

    const result = parseRegistrationUrl(url);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe('customer-email-verification');
    }
  });

  it('should parse valid forgot-password URL', () => {
    const url = '/en/org/forgot-password/12345678-abcd-1234-abcd-123456789abc?data=xyz';

    const result = parseRegistrationUrl(url);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe('forgot-password');
    }
  });

  it('should return error for missing data parameter', () => {
    const url = '/en/myorg/user-invite-confirm/a1b2c3d4-e5f6-7890-abcd-ef1234567890';

    const result = parseRegistrationUrl(url);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('data parameter');
    }
  });

  it('should return error for invalid registration type', () => {
    const url = '/en/myorg/invalid-type/a1b2c3d4-e5f6-7890-abcd-ef1234567890?data=test';

    const result = parseRegistrationUrl(url);

    expect(result.success).toBe(false);
  });

  it('should return error for invalid URL format', () => {
    const url = '/invalid/url/structure';

    const result = parseRegistrationUrl(url);

    expect(result.success).toBe(false);
  });

  it('should handle URL with query parameters', () => {
    const url =
      '/en/org/user-invite-confirm/12345678-1234-1234-1234-123456789abc?data=test&extra=param';

    const result = parseRegistrationUrl(url);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.dataParam).toBe('test');
    }
  });
});

describe('URL Parser - validateToken', () => {
  describe('Valid tokens', () => {
    it('should validate correct UUID v4 format', () => {
      const validTokens = [
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        '12345678-1234-1234-1234-123456789abc',
        'abcdef12-3456-7890-abcd-ef1234567890',
        '00000000-0000-0000-0000-000000000000',
        'ffffffff-ffff-ffff-ffff-ffffffffffff',
      ];

      validTokens.forEach((token) => {
        expect(validateToken(token)).toBe(true);
      });
    });

    it('should accept uppercase UUIDs', () => {
      const token = 'A1B2C3D4-E5F6-7890-ABCD-EF1234567890';
      expect(validateToken(token)).toBe(true);
    });

    it('should accept mixed case UUIDs', () => {
      const token = 'A1b2C3d4-E5f6-7890-AbCd-Ef1234567890';
      expect(validateToken(token)).toBe(true);
    });
  });

  describe('Invalid tokens', () => {
    it('should reject tokens with wrong format', () => {
      const invalidTokens = [
        'not-a-uuid',
        '12345678',
        'abcdefgh-ijkl-mnop-qrst-uvwxyz123456',
        '12345678-1234-1234-1234', // Too short
        '12345678-1234-1234-1234-123456789abc-extra', // Too long
        '12345678_1234_1234_1234_123456789abc', // Wrong separator
        '12345678-1234-1234-1234-12345678gabc', // Invalid character
      ];

      invalidTokens.forEach((token) => {
        expect(validateToken(token)).toBe(false);
      });
    });

    it('should reject empty token', () => {
      expect(validateToken('')).toBe(false);
    });

    it('should reject token with spaces', () => {
      expect(validateToken('12345678-1234-1234-1234-123456789abc ')).toBe(false);
      expect(validateToken(' 12345678-1234-1234-1234-123456789abc')).toBe(false);
    });

    it('should reject null or undefined', () => {
      expect(validateToken(null as any)).toBe(false);
      expect(validateToken(undefined as any)).toBe(false);
    });
  });
});

describe('URL Parser - isValidOrganization', () => {
  it('should accept valid organization names', () => {
    const validOrgs = [
      'myorg',
      'my-org',
      'my_org',
      'org123',
      'ORG',
      'a',
      'organization-name-123',
    ];

    validOrgs.forEach((org) => {
      expect(isValidOrganization(org)).toBe(true);
    });
  });

  it('should reject invalid organization names', () => {
    const invalidOrgs = [
      '',
      'org with spaces',
      'org@special',
      'org#test',
      'org/test',
      'org\\test',
    ];

    invalidOrgs.forEach((org) => {
      expect(isValidOrganization(org)).toBe(false);
    });
  });

  it('should handle edge cases', () => {
    expect(isValidOrganization('a')).toBe(true); // Single character
    expect(isValidOrganization('a'.repeat(100))).toBe(true); // Long name
  });
});

describe('URL Parser - REGISTRATION_TYPES', () => {
  it('should contain all expected registration types', () => {
    expect(REGISTRATION_TYPES).toContain('user-invite-confirm');
    expect(REGISTRATION_TYPES).toContain('user-signup-confirm');
    expect(REGISTRATION_TYPES).toContain('customer-email-verification');
    expect(REGISTRATION_TYPES).toContain('forgot-password');
  });

  it('should have exactly 4 registration types', () => {
    expect(REGISTRATION_TYPES).toHaveLength(4);
  });

  it('should not contain duplicates', () => {
    const unique = [...new Set(REGISTRATION_TYPES)];
    expect(unique).toHaveLength(REGISTRATION_TYPES.length);
  });
});

describe('URL Parser - Integration tests', () => {
  it('should handle complete valid URL parsing flow', () => {
    const data = { username: 'testuser', email: 'test@example.com' };
    const jsonString = JSON.stringify(data);
    const base64 = Buffer.from(jsonString).toString('base64');
    const encoded = encodeURIComponent(base64);
    const url = `/en/myorg/user-invite-confirm/a1b2c3d4-e5f6-7890-abcd-ef1234567890?data=${encoded}`;

    const urlResult = parseRegistrationUrl(url);
    expect(urlResult.success).toBe(true);

    if (urlResult.success) {
      const decodeResult = decodeDataParam(urlResult.data.dataParam);
      expect(decodeResult.success).toBe(true);

      if (decodeResult.success) {
        expect(decodeResult.data).toEqual(data);
      }

      expect(validateToken(urlResult.data.token)).toBe(true);
      expect(isValidOrganization(urlResult.data.organization)).toBe(true);
    }
  });

  it('should handle complete error flow', () => {
    const url = '/invalid/url/structure';

    const urlResult = parseRegistrationUrl(url);
    expect(urlResult.success).toBe(false);
  });

  it('should validate all components of registration URL', () => {
    const validUrl =
      '/en/test-org/user-signup-confirm/12345678-1234-1234-1234-123456789abc?data=test';

    const result = parseRegistrationUrl(validUrl);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(['en', 'th']).toContain(result.data.locale);
      expect(isValidOrganization(result.data.organization)).toBe(true);
      expect(REGISTRATION_TYPES).toContain(result.data.type);
      expect(validateToken(result.data.token)).toBe(true);
    }
  });
});
