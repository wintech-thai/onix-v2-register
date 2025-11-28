/**
 * Public `/health` route that mirrors the API health endpoint but lives
 * at the root path (useful for load balancers that expect `/health`).
 *
 * The handler reuses the shared health payload builder to keep parity
 * between `/api/health` and `/health`.
 */

import { NextResponse } from 'next/server';
import { buildHealthPayload } from '@/lib/health/health-status';

const processStartTime = Date.now();

export async function GET() {
  const healthPayload = buildHealthPayload(processStartTime);

  return NextResponse.json(healthPayload, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Content-Type': 'application/json',
    },
  });
}
