/**
 * Health Check API Route
 *
 * Returns application health status, version, and uptime information.
 * Used by Kubernetes/Docker for liveness and readiness probes.
 */

import { NextResponse } from 'next/server';

const startTime = Date.now();

export async function GET() {
  const uptime = Date.now() - startTime;
  const uptimeSeconds = Math.floor(uptime / 1000);

  const healthData = {
    status: 'healthy',
    service: 'onix-v2-register',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    commit: process.env.NEXT_PUBLIC_GIT_COMMIT || 'unknown',
    buildTime: process.env.NEXT_PUBLIC_BUILD_TIMESTAMP || 'unknown',
    environment: process.env.RUNTIME_ENV || 'development',
    uptime: {
      milliseconds: uptime,
      seconds: uptimeSeconds,
      formatted: formatUptime(uptimeSeconds),
    },
    timestamp: new Date().toISOString(),
    checks: {
      application: 'ok',
      // Add more health checks here as needed:
      // - database connectivity
      // - external API availability
      // - Redis connectivity
    },
  };

  return NextResponse.json(healthData, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Format uptime in human-readable format
 */
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);

  return parts.join(' ');
}
