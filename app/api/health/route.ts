/**
 * Health Check API Route
 *
 * Returns application health status, version, and uptime information.
 * Used by Kubernetes/Docker for liveness and readiness probes.
 */

import { NextResponse } from 'next/server';
import { buildHealthPayload } from '@/lib/health/health-status';
import { logEnvironmentInfo } from '@/lib/env';

const processStartTime = Date.now();
let hasLoggedEnv = false;

export async function GET() {
  // Log environment info on first health check
  if (!hasLoggedEnv) {
    logEnvironmentInfo();
    hasLoggedEnv = true;
  }

  const healthPayload = buildHealthPayload(processStartTime);

  return NextResponse.json(healthPayload, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Content-Type': 'application/json',
    },
  });
}
