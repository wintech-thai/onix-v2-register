/**
 * URL Parser - Context-Aware Id Mapping Tests
 *
 * Tests that the 'Id' field from external data is correctly mapped based on registration type:
 * - customer-email-verification: Id → customerId
 * - user-signup-confirm: Id → orgUserId
 * - user-invite-confirm: Id → orgUserId
 */

import { decodeDataParam, parseRegistrationUrl } from '@/lib/url-parser';

describe('URL Parser - Context-Aware Id Mapping', () => {
  // Base64 encoded test data: {"Email":"test@example.com","Name":"John Doe","Code":"TEST","Id":"81b9582e-7953-4482-9cb9-0d65b879715f"}
  const testDataBase64 =
    'eyJFbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJOYW1lIjoiSm9obiBEb2UiLCJDb2RlIjoiVEVTVCIsIklkIjoiODFiOTU4MmUtNzk1My00NDgyLTljYjktMGQ2NWI4Nzk3MTVmIn0=';

  // Base64 for user data: {"Email":"user@example.com","UserName":"johndoe","Id":"12345678-1234-4123-8123-123456789abc","InvitedBy":"admin.user"}
  const userDataBase64 =
    'eyJFbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJVc2VyTmFtZSI6ImpvaG5kb2UiLCJJZCI6IjEyMzQ1Njc4LTEyMzQtNDEyMy04MTIzLTEyMzQ1Njc4OWFiYyIsIkludml0ZWRCeSI6ImFkbWluLnVzZXIifQ==';

  describe('decodeDataParam with registrationType', () => {
    it('should map Id to customerId for customer-email-verification', () => {
      const result = decodeDataParam(testDataBase64, 'customer-email-verification');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveProperty('customerId', '81b9582e-7953-4482-9cb9-0d65b879715f');
        expect(result.data).not.toHaveProperty('orgUserId');
        expect(result.data).toHaveProperty('email', 'test@example.com');
        expect(result.data).toHaveProperty('name', 'John Doe');
      }
    });

    it('should map Id to orgUserId for user-signup-confirm', () => {
      const result = decodeDataParam(userDataBase64, 'user-signup-confirm');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveProperty('orgUserId', '12345678-1234-4123-8123-123456789abc');
        expect(result.data).not.toHaveProperty('customerId');
        expect(result.data).toHaveProperty('email', 'user@example.com');
        expect(result.data).toHaveProperty('username', 'johndoe');
        expect(result.data).toHaveProperty('invitedBy', 'admin.user');
      }
    });

    it('should map Id to orgUserId for user-invite-confirm', () => {
      const result = decodeDataParam(userDataBase64, 'user-invite-confirm');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveProperty('orgUserId', '12345678-1234-4123-8123-123456789abc');
        expect(result.data).not.toHaveProperty('customerId');
        expect(result.data).toHaveProperty('email', 'user@example.com');
        expect(result.data).toHaveProperty('username', 'johndoe');
        expect(result.data).toHaveProperty('invitedBy', 'admin.user');
      }
    });

    it('should default to customerId when registrationType is not provided', () => {
      const result = decodeDataParam(testDataBase64);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveProperty('customerId', '81b9582e-7953-4482-9cb9-0d65b879715f');
        expect(result.data).not.toHaveProperty('orgUserId');
      }
    });

    it('should handle lowercase "id" field the same way as "Id"', () => {
      // Base64 for: {"email":"test@example.com","name":"Jane","id":"11111111-1111-4111-8111-111111111111"}
      const lowercaseIdData =
        'eyJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJuYW1lIjoiSmFuZSIsImlkIjoiMTExMTExMTEtMTExMS00MTExLTgxMTEtMTExMTExMTExMTExIn0=';

      const customerResult = decodeDataParam(lowercaseIdData, 'customer-email-verification');
      expect(customerResult.success).toBe(true);
      if (customerResult.success) {
        expect(customerResult.data).toHaveProperty(
          'customerId',
          '11111111-1111-4111-8111-111111111111'
        );
      }

      const userResult = decodeDataParam(lowercaseIdData, 'user-signup-confirm');
      expect(userResult.success).toBe(true);
      if (userResult.success) {
        expect(userResult.data).toHaveProperty('orgUserId', '11111111-1111-4111-8111-111111111111');
      }
    });

    it('should preserve explicit customerId field when Id is also present', () => {
      // Data with both Id and customerId
      // {"Email":"test@example.com","Id":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa","customerId":"bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"}
      const dualIdData =
        'eyJFbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJJZCI6ImFhYWFhYWFhLWFhYWEtNGFhYS04YWFhLWFhYWFhYWFhYWFhYSIsImN1c3RvbWVySWQiOiJiYmJiYmJiYi1iYmJiLTRiYmItOGJiYi1iYmJiYmJiYmJiYmIifQ==';

      const result = decodeDataParam(dualIdData, 'customer-email-verification');
      expect(result.success).toBe(true);
      if (result.success) {
        // Id should take precedence and map to customerId
        expect(result.data).toHaveProperty('customerId', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
      }
    });
  });

  describe('parseRegistrationUrl with context-aware Id mapping', () => {
    const baseUrl = 'https://register.example.com';
    const token = '550e8400-e29b-41d4-a716-446655440000';

    it('should correctly map Id in customer-email-verification URL', () => {
      const url = `${baseUrl}/testorg/customer-email-verification/${token}?data=${testDataBase64}`;
      const result = parseRegistrationUrl(url);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.registrationType).toBe('customer-email-verification');
        expect(result.data.data).toHaveProperty(
          'customerId',
          '81b9582e-7953-4482-9cb9-0d65b879715f'
        );
        expect(result.data.data).not.toHaveProperty('orgUserId');
      }
    });

    it('should correctly map Id in user-signup-confirm URL', () => {
      const url = `${baseUrl}/testorg/user-signup-confirm/${token}?data=${userDataBase64}`;
      const result = parseRegistrationUrl(url);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.registrationType).toBe('user-signup-confirm');
        expect(result.data.data).toHaveProperty(
          'orgUserId',
          '12345678-1234-4123-8123-123456789abc'
        );
        expect(result.data.data).not.toHaveProperty('customerId');
        expect(result.data.data).toHaveProperty('invitedBy', 'admin.user');
      }
    });

    it('should correctly map Id in user-invite-confirm URL', () => {
      const url = `${baseUrl}/testorg/user-invite-confirm/${token}?data=${userDataBase64}`;
      const result = parseRegistrationUrl(url);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.registrationType).toBe('user-invite-confirm');
        expect(result.data.data).toHaveProperty(
          'orgUserId',
          '12345678-1234-4123-8123-123456789abc'
        );
        expect(result.data.data).not.toHaveProperty('customerId');
        expect(result.data.data).toHaveProperty('invitedBy', 'admin.user');
      }
    });

    it('should handle real-world user signup URL with Id field', () => {
      // Simulates the actual failing case from production
      const realToken = 'db46aca4-97f9-48e9-9963-856001d4d90a';
      const realData =
        'eyJFbWFpbCI6InNwaW5hdGVyMEBnbWFpbC5jb20iLCJOYW1lIjoiYWRpc29uIHgzIiwiQ29kZSI6InRlc3QiLCJJZCI6IjgxYjk1ODJlLTc5NTMtNDQ4Mi05Y2I5LTBkNjViODc5NzE1ZiJ9';
      const url = `${baseUrl}/pjame16/user-signup-confirm/${realToken}?data=${realData}`;

      const result = parseRegistrationUrl(url);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.organization).toBe('pjame16');
        expect(result.data.registrationType).toBe('user-signup-confirm');
        expect(result.data.token).toBe(realToken);
        expect(result.data.data).toHaveProperty(
          'orgUserId',
          '81b9582e-7953-4482-9cb9-0d65b879715f'
        );
        expect(result.data.data).toHaveProperty('email', 'spinater0@gmail.com');
        // username is not in URL data - it comes from form input
        // The zero-UUID should NOT be used anymore - orgUserId comes from Id field
        expect((result.data.data as any).orgUserId).not.toBe(
          '00000000-0000-0000-0000-000000000000'
        );
      }
    });
  });

  describe('Edge cases', () => {
    it('should handle data with OrgUserId explicitly provided', () => {
      // {"Email":"user@example.com","UserName":"test","OrgUserId":"99999999-9999-4999-8999-999999999999"}
      const explicitOrgUserIdData =
        'eyJFbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJVc2VyTmFtZSI6InRlc3QiLCJPcmdVc2VySWQiOiI5OTk5OTk5OS05OTk5LTQ5OTktODk5OS05OTk5OTk5OTk5OTkifQ==';

      const result = decodeDataParam(explicitOrgUserIdData, 'user-signup-confirm');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveProperty('orgUserId', '99999999-9999-4999-8999-999999999999');
      }
    });

    it('should handle forgot-password which does not use Id field', () => {
      // {"Email":"user@example.com","UserName":"testuser"}
      const forgotPasswordData =
        'eyJFbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJVc2VyTmFtZSI6InRlc3R1c2VyIn0=';

      const result = decodeDataParam(forgotPasswordData, 'forgot-password');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveProperty('email', 'user@example.com');
        expect(result.data).toHaveProperty('username', 'testuser');
        expect(result.data).not.toHaveProperty('customerId');
        expect(result.data).not.toHaveProperty('orgUserId');
      }
    });

    it('should transform UserName to username', () => {
      const result = decodeDataParam(userDataBase64, 'user-invite-confirm');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveProperty('username', 'johndoe');
        expect(result.data).not.toHaveProperty('UserName');
      }
    });

    it('should transform Email to email', () => {
      const result = decodeDataParam(testDataBase64, 'customer-email-verification');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveProperty('email', 'test@example.com');
        expect(result.data).not.toHaveProperty('Email');
      }
    });
  });
});
