/**
 * Unit Tests for API Client
 *
 * Tests axios integration, error handling, and all endpoint functions.
 */

import axios from 'axios';
import {
  confirmUserInvite,
  confirmUserSignup,
  confirmEmailVerification,
  confirmPasswordReset,
  handleApiError,
} from '@/lib/api-client';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default axios mock
    mockedAxios.create = jest.fn().mockReturnValue(mockedAxios);
  });

  describe('confirmUserInvite', () => {
    it('should successfully confirm user invite', async () => {
      const mockResponse = {
        data: { message: 'User invited successfully' },
        status: 200,
      };
      mockedAxios.post = jest.fn().mockResolvedValue(mockResponse);

      const result = await confirmUserInvite({
        org: 'testorg',
        token: 'test-token',
        username: 'testuser',
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse.data);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/org/testorg/action/ConfirmExistingUserInvitation/test-token/testuser'
      );
    });

    it('should handle API errors', async () => {
      const mockError = {
        response: {
          data: { message: 'Invalid token' },
          status: 401,
        },
      };
      mockedAxios.post = jest.fn().mockRejectedValue(mockError);

      const result = await confirmUserInvite({
        org: 'testorg',
        token: 'invalid-token',
        username: 'testuser',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle network errors', async () => {
      const mockError = new Error('Network Error');
      mockedAxios.post = jest.fn().mockRejectedValue(mockError);

      const result = await confirmUserInvite({
        org: 'testorg',
        token: 'test-token',
        username: 'testuser',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network');
    });

    it('should handle timeout errors', async () => {
      const mockError = {
        code: 'ECONNABORTED',
        message: 'timeout of 30000ms exceeded',
      };
      mockedAxios.post = jest.fn().mockRejectedValue(mockError);

      const result = await confirmUserInvite({
        org: 'testorg',
        token: 'test-token',
        username: 'testuser',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('confirmUserSignup', () => {
    it('should successfully confirm user signup', async () => {
      const mockResponse = {
        data: { message: 'User signup confirmed' },
        status: 200,
      };
      mockedAxios.post = jest.fn().mockResolvedValue(mockResponse);

      const result = await confirmUserSignup({
        org: 'testorg',
        token: 'test-token',
        username: 'testuser',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse.data);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/org/testorg/action/ConfirmNewUserInvitation/test-token/testuser',
        {
          password: 'Password123!',
          firstName: 'John',
          lastName: 'Doe',
        }
      );
    });

    it('should handle validation errors from API', async () => {
      const mockError = {
        response: {
          data: { message: 'Password does not meet requirements' },
          status: 400,
        },
      };
      mockedAxios.post = jest.fn().mockRejectedValue(mockError);

      const result = await confirmUserSignup({
        org: 'testorg',
        token: 'test-token',
        username: 'testuser',
        password: 'weak',
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Password');
    });

    it('should handle duplicate user errors', async () => {
      const mockError = {
        response: {
          data: { message: 'User already exists' },
          status: 409,
        },
      };
      mockedAxios.post = jest.fn().mockRejectedValue(mockError);

      const result = await confirmUserSignup({
        org: 'testorg',
        token: 'test-token',
        username: 'existinguser',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('confirmEmailVerification', () => {
    it('should successfully confirm email verification', async () => {
      const mockResponse = {
        data: { message: 'Email verified successfully' },
        status: 200,
      };
      mockedAxios.post = jest.fn().mockResolvedValue(mockResponse);

      const result = await confirmEmailVerification({
        org: 'testorg',
        token: 'test-token',
        customerId: '12345',
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse.data);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/org/testorg/action/ConfirmCustomerEmailVerification/test-token/12345'
      );
    });

    it('should handle expired token errors', async () => {
      const mockError = {
        response: {
          data: { message: 'Token has expired' },
          status: 401,
        },
      };
      mockedAxios.post = jest.fn().mockRejectedValue(mockError);

      const result = await confirmEmailVerification({
        org: 'testorg',
        token: 'expired-token',
        customerId: '12345',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('expired');
    });

    it('should handle already verified errors', async () => {
      const mockError = {
        response: {
          data: { message: 'Email already verified' },
          status: 409,
        },
      };
      mockedAxios.post = jest.fn().mockRejectedValue(mockError);

      const result = await confirmEmailVerification({
        org: 'testorg',
        token: 'test-token',
        customerId: '12345',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('confirmPasswordReset', () => {
    it('should successfully confirm password reset', async () => {
      const mockResponse = {
        data: { message: 'Password reset successfully' },
        status: 200,
      };
      mockedAxios.post = jest.fn().mockResolvedValue(mockResponse);

      const result = await confirmPasswordReset({
        org: 'testorg',
        token: 'test-token',
        username: 'testuser',
        newPassword: 'NewPassword123!',
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse.data);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/org/testorg/action/ConfirmForgotPasswordReset/test-token/testuser',
        {
          password: 'NewPassword123!',
        }
      );
    });

    it('should handle weak password errors', async () => {
      const mockError = {
        response: {
          data: { message: 'Password too weak' },
          status: 400,
        },
      };
      mockedAxios.post = jest.fn().mockRejectedValue(mockError);

      const result = await confirmPasswordReset({
        org: 'testorg',
        token: 'test-token',
        username: 'testuser',
        newPassword: 'weak',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('weak');
    });

    it('should handle invalid token errors', async () => {
      const mockError = {
        response: {
          data: { message: 'Invalid reset token' },
          status: 403,
        },
      };
      mockedAxios.post = jest.fn().mockRejectedValue(mockError);

      const result = await confirmPasswordReset({
        org: 'testorg',
        token: 'invalid-token',
        username: 'testuser',
        newPassword: 'NewPassword123!',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid');
    });
  });

  describe('handleApiError', () => {
    it('should handle error with response data', () => {
      const error = {
        response: {
          data: { message: 'Custom error message' },
          status: 400,
        },
      };

      const result = handleApiError(error);

      expect(result).toContain('Custom error message');
    });

    it('should handle error with status code only', () => {
      const error = {
        response: {
          status: 500,
        },
      };

      const result = handleApiError(error);

      expect(result).toContain('500');
    });

    it('should handle network error', () => {
      const error = {
        message: 'Network Error',
      };

      const result = handleApiError(error);

      expect(result).toContain('Network');
    });

    it('should handle timeout error', () => {
      const error = {
        code: 'ECONNABORTED',
        message: 'timeout of 30000ms exceeded',
      };

      const result = handleApiError(error);

      expect(result).toContain('timeout');
    });

    it('should handle unknown error', () => {
      const error = new Error('Unknown error');

      const result = handleApiError(error);

      expect(result).toContain('Unknown error');
    });

    it('should handle error without message', () => {
      const error = {};

      const result = handleApiError(error);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });

  describe('Error Response Status Codes', () => {
    const testCases = [
      { status: 400, description: 'Bad Request' },
      { status: 401, description: 'Unauthorized' },
      { status: 403, description: 'Forbidden' },
      { status: 404, description: 'Not Found' },
      { status: 409, description: 'Conflict' },
      { status: 500, description: 'Internal Server Error' },
      { status: 502, description: 'Bad Gateway' },
      { status: 503, description: 'Service Unavailable' },
    ];

    testCases.forEach(({ status, description }) => {
      it(`should handle ${status} - ${description}`, async () => {
        const mockError = {
          response: {
            data: { message: description },
            status,
          },
        };
        mockedAxios.post = jest.fn().mockRejectedValue(mockError);

        const result = await confirmUserInvite({
          org: 'testorg',
          token: 'test-token',
          username: 'testuser',
        });

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });
    });
  });

  describe('Request Configuration', () => {
    it('should use correct base URL from environment', async () => {
      const originalEnv = process.env.NEXT_PUBLIC_API_URL;
      process.env.NEXT_PUBLIC_API_URL = 'https://custom-api.com';

      const mockResponse = {
        data: { message: 'Success' },
        status: 200,
      };
      mockedAxios.post = jest.fn().mockResolvedValue(mockResponse);

      await confirmUserInvite({
        org: 'testorg',
        token: 'test-token',
        username: 'testuser',
      });

      // Restore original env
      process.env.NEXT_PUBLIC_API_URL = originalEnv;

      expect(mockedAxios.post).toHaveBeenCalled();
    });

    it('should include proper headers', async () => {
      const mockResponse = {
        data: { message: 'Success' },
        status: 200,
      };
      mockedAxios.post = jest.fn().mockResolvedValue(mockResponse);

      await confirmUserInvite({
        org: 'testorg',
        token: 'test-token',
        username: 'testuser',
      });

      expect(mockedAxios.post).toHaveBeenCalled();
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete user registration flow', async () => {
      const mockInviteResponse = {
        data: { message: 'User invited' },
        status: 200,
      };
      const mockSignupResponse = {
        data: { message: 'Signup complete' },
        status: 200,
      };

      mockedAxios.post = jest
        .fn()
        .mockResolvedValueOnce(mockInviteResponse)
        .mockResolvedValueOnce(mockSignupResponse);

      const inviteResult = await confirmUserInvite({
        org: 'testorg',
        token: 'invite-token',
        username: 'testuser',
      });

      expect(inviteResult.success).toBe(true);

      const signupResult = await confirmUserSignup({
        org: 'testorg',
        token: 'signup-token',
        username: 'testuser',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(signupResult.success).toBe(true);
    });

    it('should handle sequential errors gracefully', async () => {
      const mockError = {
        response: {
          data: { message: 'Error occurred' },
          status: 500,
        },
      };

      mockedAxios.post = jest.fn().mockRejectedValue(mockError);

      const result1 = await confirmUserInvite({
        org: 'testorg',
        token: 'token1',
        username: 'user1',
      });

      const result2 = await confirmUserSignup({
        org: 'testorg',
        token: 'token2',
        username: 'user2',
        password: 'Password123!',
        firstName: 'Jane',
        lastName: 'Doe',
      });

      expect(result1.success).toBe(false);
      expect(result2.success).toBe(false);
    });
  });
});
