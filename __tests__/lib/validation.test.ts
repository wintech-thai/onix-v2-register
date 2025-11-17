/**
 * Unit Tests for Validation Utilities
 *
 * Tests Zod schemas, password strength calculation, and validation helpers.
 */

import {
  emailSchema,
  usernameSchema,
  passwordSchema,
  nameSchema,
  customerIdSchema,
  userInviteConfirmSchema,
  userSignupConfirmSchema,
  customerEmailVerificationSchema,
  forgotPasswordSchema,
  validatePasswordStrength,
  getPasswordStrengthLabel,
  sanitizeInput,
  isNotEmpty,
  isValidEmail,
  passwordsMatch,
} from '@/lib/validation';

describe('Validation - Email Schema', () => {
  it('should accept valid email addresses', () => {
    const validEmails = [
      'test@example.com',
      'user.name@example.com',
      'user+tag@example.co.uk',
      'test_user@sub.example.com',
      'a@b.c',
    ];

    validEmails.forEach((email) => {
      const result = emailSchema.safeParse(email);
      expect(result.success).toBe(true);
    });
  });

  it('should reject invalid email addresses', () => {
    const invalidEmails = [
      'notanemail',
      '@example.com',
      'user@',
      'user @example.com',
      'user@.com',
      '',
    ];

    invalidEmails.forEach((email) => {
      const result = emailSchema.safeParse(email);
      expect(result.success).toBe(false);
    });
  });

  it('should trim and lowercase email addresses', () => {
    const result = emailSchema.safeParse('  Test@Example.COM  ');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('test@example.com');
    }
  });

  it('should enforce maximum length', () => {
    const longEmail = 'a'.repeat(250) + '@example.com';
    const result = emailSchema.safeParse(longEmail);
    expect(result.success).toBe(false);
  });
});

describe('Validation - Username Schema', () => {
  it('should accept valid usernames', () => {
    const validUsernames = [
      'user',
      'user123',
      'user_name',
      'user-name',
      'User123',
      'a_b-c',
    ];

    validUsernames.forEach((username) => {
      const result = usernameSchema.safeParse(username);
      expect(result.success).toBe(true);
    });
  });

  it('should reject invalid usernames', () => {
    const invalidUsernames = [
      'ab', // Too short
      'user name', // Space
      'user@name', // Special char
      'user!', // Special char
      '',
      'a'.repeat(21), // Too long
    ];

    invalidUsernames.forEach((username) => {
      const result = usernameSchema.safeParse(username);
      expect(result.success).toBe(false);
    });
  });

  it('should trim whitespace', () => {
    const result = usernameSchema.safeParse('  username  ');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('username');
    }
  });

  it('should enforce length constraints', () => {
    expect(usernameSchema.safeParse('ab').success).toBe(false); // Too short
    expect(usernameSchema.safeParse('abc').success).toBe(true); // Min length
    expect(usernameSchema.safeParse('a'.repeat(20)).success).toBe(true); // Max length
    expect(usernameSchema.safeParse('a'.repeat(21)).success).toBe(false); // Too long
  });
});

describe('Validation - Password Schema', () => {
  it('should accept valid passwords', () => {
    const validPasswords = [
      'Password123!',
      'MyP@ssw0rd',
      'Str0ng!Pass',
      'C0mpl3x#Pass',
      'Aa1!aaaa',
    ];

    validPasswords.forEach((password) => {
      const result = passwordSchema.safeParse(password);
      expect(result.success).toBe(true);
    });
  });

  it('should reject passwords without uppercase', () => {
    const result = passwordSchema.safeParse('password123!');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('uppercase');
    }
  });

  it('should reject passwords without lowercase', () => {
    const result = passwordSchema.safeParse('PASSWORD123!');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('lowercase');
    }
  });

  it('should reject passwords without numbers', () => {
    const result = passwordSchema.safeParse('Password!');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('number');
    }
  });

  it('should reject passwords without special characters', () => {
    const result = passwordSchema.safeParse('Password123');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('special');
    }
  });

  it('should reject passwords shorter than 8 characters', () => {
    const result = passwordSchema.safeParse('Pass1!');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('8');
    }
  });

  it('should reject passwords longer than 100 characters', () => {
    const longPassword = 'A1!' + 'a'.repeat(98);
    const result = passwordSchema.safeParse(longPassword);
    expect(result.success).toBe(false);
  });
});

describe('Validation - Name Schema', () => {
  it('should accept valid names', () => {
    const validNames = [
      'John',
      'Mary Jane',
      "O'Brien",
      'Jean-Pierre',
      'Ann',
      'Mary Ann',
    ];

    validNames.forEach((name) => {
      const result = nameSchema.safeParse(name);
      expect(result.success).toBe(true);
    });
  });

  it('should reject invalid names', () => {
    const invalidNames = [
      'A', // Too short
      'John123', // Numbers
      'John@Doe', // Special char
      'John_Doe', // Underscore
      '',
      'a'.repeat(51), // Too long
    ];

    invalidNames.forEach((name) => {
      const result = nameSchema.safeParse(name);
      expect(result.success).toBe(false);
    });
  });

  it('should trim whitespace', () => {
    const result = nameSchema.safeParse('  John Doe  ');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('John Doe');
    }
  });
});

describe('Validation - Customer ID Schema', () => {
  it('should accept valid customer IDs', () => {
    const validIds = ['12345', 'CUST-001', 'abc123', 'customer_id_123'];

    validIds.forEach((id) => {
      const result = customerIdSchema.safeParse(id);
      expect(result.success).toBe(true);
    });
  });

  it('should reject empty customer ID', () => {
    const result = customerIdSchema.safeParse('');
    expect(result.success).toBe(false);
  });

  it('should trim whitespace', () => {
    const result = customerIdSchema.safeParse('  12345  ');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('12345');
    }
  });
});

describe('Validation - User Invite Confirm Schema', () => {
  it('should accept valid user invite data', () => {
    const data = {
      username: 'testuser',
      email: 'test@example.com',
    };

    const result = userInviteConfirmSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should reject missing username', () => {
    const data = {
      email: 'test@example.com',
    };

    const result = userInviteConfirmSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject missing email', () => {
    const data = {
      username: 'testuser',
    };

    const result = userInviteConfirmSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});

describe('Validation - User Signup Confirm Schema', () => {
  it('should accept valid user signup data', () => {
    const data = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      firstName: 'John',
      lastName: 'Doe',
    };

    const result = userSignupConfirmSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should reject mismatched passwords', () => {
    const data = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123!',
      confirmPassword: 'Different123!',
      firstName: 'John',
      lastName: 'Doe',
    };

    const result = userSignupConfirmSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('match');
    }
  });

  it('should reject missing required fields', () => {
    const data = {
      username: 'testuser',
      email: 'test@example.com',
    };

    const result = userSignupConfirmSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});

describe('Validation - Customer Email Verification Schema', () => {
  it('should accept valid customer verification data', () => {
    const data = {
      customerId: '12345',
      name: 'John Doe',
      email: 'john@example.com',
    };

    const result = customerEmailVerificationSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should reject missing customerId', () => {
    const data = {
      name: 'John Doe',
      email: 'john@example.com',
    };

    const result = customerEmailVerificationSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});

describe('Validation - Forgot Password Schema', () => {
  it('should accept valid forgot password data', () => {
    const data = {
      username: 'testuser',
      email: 'test@example.com',
      newPassword: 'NewPassword123!',
      confirmPassword: 'NewPassword123!',
    };

    const result = forgotPasswordSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should reject mismatched passwords', () => {
    const data = {
      username: 'testuser',
      email: 'test@example.com',
      newPassword: 'NewPassword123!',
      confirmPassword: 'Different123!',
    };

    const result = forgotPasswordSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});

describe('Validation - validatePasswordStrength', () => {
  it('should return weak for short password', () => {
    const result = validatePasswordStrength('Pass1!');
    expect(result.score).toBeLessThan(5);
    expect(result.isValid).toBe(false);
    expect(result.feedback.length).toBeGreaterThan(0);
  });

  it('should return strong for complex password', () => {
    const result = validatePasswordStrength('VeryStr0ng!Password');
    expect(result.score).toBeGreaterThanOrEqual(5);
    expect(result.isValid).toBe(true);
    expect(result.feedback.length).toBe(0);
  });

  it('should provide feedback for missing requirements', () => {
    const result = validatePasswordStrength('password');
    expect(result.isValid).toBe(false);
    expect(result.feedback).toContain('Add at least one uppercase letter');
    expect(result.feedback).toContain('Add at least one number');
    expect(result.feedback).toContain('Add at least one special character');
  });

  it('should score based on length', () => {
    const short = validatePasswordStrength('Pass1!aa');
    const long = validatePasswordStrength('Pass1!aaaaaaaa');
    expect(long.score).toBeGreaterThan(short.score);
  });

  it('should handle empty password', () => {
    const result = validatePasswordStrength('');
    expect(result.isValid).toBe(false);
    expect(result.score).toBe(0);
    expect(result.feedback.length).toBeGreaterThan(0);
  });

  it('should give maximum score for excellent password', () => {
    const result = validatePasswordStrength('Exc3ll3nt!P@ssw0rd123');
    expect(result.score).toBe(6);
    expect(result.isValid).toBe(true);
    expect(result.feedback.length).toBe(0);
  });
});

describe('Validation - getPasswordStrengthLabel', () => {
  it('should return Weak for low scores', () => {
    expect(getPasswordStrengthLabel(0).label).toBe('Weak');
    expect(getPasswordStrengthLabel(1).label).toBe('Weak');
    expect(getPasswordStrengthLabel(2).label).toBe('Weak');
  });

  it('should return Fair for medium-low scores', () => {
    expect(getPasswordStrengthLabel(3).label).toBe('Fair');
  });

  it('should return Good for medium-high scores', () => {
    expect(getPasswordStrengthLabel(4).label).toBe('Good');
  });

  it('should return Strong for high scores', () => {
    expect(getPasswordStrengthLabel(5).label).toBe('Strong');
    expect(getPasswordStrengthLabel(6).label).toBe('Strong');
  });

  it('should return appropriate colors', () => {
    expect(getPasswordStrengthLabel(0).color).toBe('red');
    expect(getPasswordStrengthLabel(3).color).toBe('orange');
    expect(getPasswordStrengthLabel(4).color).toBe('yellow');
    expect(getPasswordStrengthLabel(5).color).toBe('green');
  });
});

describe('Validation - sanitizeInput', () => {
  it('should remove HTML tags', () => {
    const input = '<script>alert("xss")</script>';
    const result = sanitizeInput(input);
    expect(result).not.toContain('<');
    expect(result).not.toContain('>');
  });

  it('should remove javascript: protocol', () => {
    const input = 'javascript:alert("xss")';
    const result = sanitizeInput(input);
    expect(result.toLowerCase()).not.toContain('javascript:');
  });

  it('should remove event handlers', () => {
    const input = 'onclick=alert("xss")';
    const result = sanitizeInput(input);
    expect(result.toLowerCase()).not.toContain('onclick=');
  });

  it('should trim whitespace', () => {
    const input = '  clean text  ';
    const result = sanitizeInput(input);
    expect(result).toBe('clean text');
  });

  it('should preserve normal text', () => {
    const input = 'This is normal text';
    const result = sanitizeInput(input);
    expect(result).toBe('This is normal text');
  });
});

describe('Validation - isNotEmpty', () => {
  it('should return true for non-empty strings', () => {
    expect(isNotEmpty('text')).toBe(true);
    expect(isNotEmpty('  text  ')).toBe(true);
  });

  it('should return false for empty strings', () => {
    expect(isNotEmpty('')).toBe(false);
    expect(isNotEmpty('   ')).toBe(false);
  });

  it('should handle non-string values', () => {
    expect(isNotEmpty(123)).toBe(true);
    expect(isNotEmpty(true)).toBe(true);
    expect(isNotEmpty(null)).toBe(false);
    expect(isNotEmpty(undefined)).toBe(false);
  });
});

describe('Validation - isValidEmail', () => {
  it('should accept valid email addresses', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@example.co.uk')).toBe(true);
  });

  it('should reject invalid email addresses', () => {
    expect(isValidEmail('notanemail')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
    expect(isValidEmail('user@')).toBe(false);
  });
});

describe('Validation - passwordsMatch', () => {
  it('should return true for matching passwords', () => {
    expect(passwordsMatch('password', 'password')).toBe(true);
  });

  it('should return false for non-matching passwords', () => {
    expect(passwordsMatch('password1', 'password2')).toBe(false);
  });

  it('should return false for empty passwords', () => {
    expect(passwordsMatch('', '')).toBe(false);
  });

  it('should be case-sensitive', () => {
    expect(passwordsMatch('Password', 'password')).toBe(false);
  });
});
