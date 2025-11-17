/** @type {import('next').NextConfig} */

import { execSync } from 'child_process';

function getGitCommitId() {
  try {
    const commitId = execSync('git rev-parse --short HEAD', {
      encoding: 'utf8',
      cwd: process.cwd(),
    }).trim();
    console.log(`✅ Git commit ID detected: ${commitId}`);
    return commitId;
  } catch (error) {
    console.warn('⚠️ Failed to get Git commit ID:', error.message);
    return 'unknown';
  }
}

function getBuildTimestamp() {
  return new Date().toISOString();
}

const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Next.js 16: Enable Cache Components (replaces experimental.dynamicIO)
  // Temporarily disabled to allow dynamic routes
  // cacheComponents: true,

  // Next.js 16: Proxy configuration (renamed from skipMiddlewareUrlNormalize)
  skipProxyUrlNormalize: true,

  // Configure external image domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
    ],
  },

  // Environment variables available to the client
  env: {
    NEXT_PUBLIC_GIT_COMMIT: process.env.NEXT_PUBLIC_GIT_COMMIT || getGitCommitId(),
    NEXT_PUBLIC_BUILD_TIMESTAMP: process.env.NEXT_PUBLIC_BUILD_TIMESTAMP || getBuildTimestamp(),
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '',
    NEXT_PUBLIC_LOG_ENDPOINT: process.env.NEXT_PUBLIC_LOG_ENDPOINT || '',
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=()',
          },
        ],
      },
    ];
  },

  // Logging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // Output configuration for Docker deployment
  output: 'standalone',

  // Experimental features
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
