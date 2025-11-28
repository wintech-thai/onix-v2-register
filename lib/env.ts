/**
 * Environment Configuration
 *
 * Centralized environment variable management with automatic sync logic.
 * EXTERNAL_API_URL automatically uses NEXT_PUBLIC_API_URL if not explicitly set.
 *
 * @module lib/env
 */

// ============================================
// Environment Variable Sync Logic
// ============================================

/**
 * Get environment variable with fallback
 */
function getEnv(key: string, fallback?: string): string {
  const value = process.env[key];
  if (value !== undefined && value !== '') {
    return value;
  }
  if (fallback !== undefined) {
    return fallback;
  }
  throw new Error(`Environment variable ${key} is not set and no fallback provided`);
}

/**
 * Get optional environment variable
 */
function getOptionalEnv(key: string, fallback: string = ''): string {
  return process.env[key] || fallback;
}

// ============================================
// Public Environment Variables (Client-side)
// ============================================

/**
 * Public API URL - Accessible from both client and server
 * This is the primary API URL used throughout the application
 */
export const NEXT_PUBLIC_API_URL = getEnv('NEXT_PUBLIC_API_URL', '/api');

/**
 * Public Log Endpoint - Optional
 */
export const NEXT_PUBLIC_LOG_ENDPOINT = getOptionalEnv('NEXT_PUBLIC_LOG_ENDPOINT');

// ============================================
// Server-only Environment Variables
// ============================================

/**
 * External API URL - Server-side only
 *
 * **Auto-sync Logic**:
 * If EXTERNAL_API_URL is not explicitly set, it will automatically use
 * the value from NEXT_PUBLIC_API_URL. This ensures consistency and
 * eliminates the need to set the same URL in two places.
 *
 * Usage in Docker:
 * ```bash
 * # Only need to set one variable:
 * docker run -e NEXT_PUBLIC_API_URL="https://api.example.com" ...
 *
 * # EXTERNAL_API_URL will automatically = NEXT_PUBLIC_API_URL
 * ```
 */
export const EXTERNAL_API_URL = getEnv('EXTERNAL_API_URL', NEXT_PUBLIC_API_URL);

/**
 * Environment Group (dev, staging, production)
 */
export const ENV_GROUP = getOptionalEnv('ENV_GROUP', 'dev');

/**
 * Node Environment
 */
export const NODE_ENV = getOptionalEnv('NODE_ENV', 'development');

/**
 * Runtime Environment
 */
export const RUNTIME_ENV = getOptionalEnv('RUNTIME_ENV', 'development');

/**
 * Server Port
 */
export const PORT = parseInt(getOptionalEnv('PORT', '3000'), 10);

/**
 * Log Endpoint - Server-side
 */
export const LOG_ENDPOINT = getOptionalEnv('LOG_ENDPOINT');

// ============================================
// Request Configuration
// ============================================

/**
 * Default request timeout (30 seconds)
 */
export const REQUEST_TIMEOUT = 30000;

/**
 * Maximum retry attempts for failed requests
 */
export const MAX_RETRY_ATTEMPTS = 3;

/**
 * Retry delay in milliseconds
 */
export const RETRY_DELAY = 1000;

// ============================================
// Environment Validation
// ============================================

/**
 * Validate required environment variables
 * Throws error if validation fails
 */
export function validateEnvironment(): void {
  const errors: string[] = [];

  // Required variables
  if (!NEXT_PUBLIC_API_URL) {
    errors.push('NEXT_PUBLIC_API_URL is required');
  }

  // Validate URL format
  if (NEXT_PUBLIC_API_URL && !NEXT_PUBLIC_API_URL.startsWith('/') && !NEXT_PUBLIC_API_URL.startsWith('http')) {
    errors.push('NEXT_PUBLIC_API_URL must start with / or http(s)://');
  }

  // Validate PORT
  if (isNaN(PORT) || PORT < 1 || PORT > 65535) {
    errors.push(`PORT must be a valid port number (1-65535), got: ${PORT}`);
  }

  if (errors.length > 0) {
    throw new Error(`Environment validation failed:\n${errors.join('\n')}`);
  }
}

// ============================================
// Environment Info
// ============================================

/**
 * Get environment information for logging/debugging
 */
export function getEnvironmentInfo(): Record<string, string | number | boolean> {
  return {
    // Public variables
    NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_LOG_ENDPOINT: NEXT_PUBLIC_LOG_ENDPOINT || '(not set)',

    // Server variables
    EXTERNAL_API_URL,
    ENV_GROUP,
    NODE_ENV,
    RUNTIME_ENV,
    PORT,
    LOG_ENDPOINT: LOG_ENDPOINT || '(not set)',

    // Sync status
    IS_API_SYNCED: EXTERNAL_API_URL === NEXT_PUBLIC_API_URL,
  };
}

/**
 * Log environment configuration (server-side only)
 * Safe for production - doesn't expose sensitive data
 */
export function logEnvironmentInfo(): void {
  if (typeof window !== 'undefined') {
    console.warn('logEnvironmentInfo() should only be called on server-side');
    return;
  }

  const info = getEnvironmentInfo();

  console.log('═══════════════════════════════════════════════════');
  console.log('🔧 Environment Configuration');
  console.log('═══════════════════════════════════════════════════');
  console.log(`📦 Environment Group:    ${info.ENV_GROUP}`);
  console.log(`🌍 Node Environment:     ${info.NODE_ENV}`);
  console.log(`🚀 Runtime Environment:  ${info.RUNTIME_ENV}`);
  console.log(`🔗 Public API URL:       ${info.NEXT_PUBLIC_API_URL}`);
  console.log(`🔗 External API URL:     ${info.EXTERNAL_API_URL}`);
  console.log(`✅ API URLs Synced:      ${info.IS_API_SYNCED ? 'Yes' : 'No'}`);
  console.log(`🔌 Server Port:          ${info.PORT}`);
  console.log('═══════════════════════════════════════════════════');
}

// ============================================
// Type Exports
// ============================================

export type EnvironmentGroup = 'dev' | 'staging' | 'production';
export type NodeEnvironment = 'development' | 'production' | 'test';

// ============================================
// Default Export
// ============================================

export default {
  // Public
  NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_LOG_ENDPOINT,

  // Server
  EXTERNAL_API_URL,
  ENV_GROUP,
  NODE_ENV,
  RUNTIME_ENV,
  PORT,
  LOG_ENDPOINT,

  // Request config
  REQUEST_TIMEOUT,
  MAX_RETRY_ATTEMPTS,
  RETRY_DELAY,

  // Utilities
  validateEnvironment,
  getEnvironmentInfo,
  logEnvironmentInfo,
};
