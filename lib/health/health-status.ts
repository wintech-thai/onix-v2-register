/**
 * Shared utilities for composing standardized health-check responses.
 *
 * The health payload centralizes uptime calculations, metadata stamping,
 * and dependency check formatting so both API routes and diagnostic tests
 * can reuse the same logic.
 */

export type HealthCheckStatus = 'ok' | 'warn' | 'error';

export interface HealthCheckEntry {
  /**
   * Short identifier for the subsystem (e.g., "application", "database").
   */
  name: string;
  /**
   * Status indicator understood by monitoring tools.
   */
  status: HealthCheckStatus;
  /**
   * Optional human-readable message that describes the subsystem condition.
   */
  message?: string;
  /**
   * Optional structured metadata (latency, host, etc.).
   */
  details?: Record<string, unknown>;
}

export interface HealthPayload {
  status: 'healthy' | 'degraded' | 'unhealthy';
  service: string;
  version: string;
  commit: string;
  buildTime: string;
  environment: string;
  uptime: {
    milliseconds: number;
    seconds: number;
    formatted: string;
  };
  timestamp: string;
  checks: Record<string, HealthCheckEntry>;
}

export const DEFAULT_HEALTH_CHECKS: HealthCheckEntry[] = [
  {
    name: 'application',
    status: 'ok',
    message: 'Application process is running',
  },
];

/**
 * Default options for the payload builder.
 */
const DEFAULT_OPTIONS = {
  serviceName: 'onix-v2-register',
  versionEnv: 'NEXT_PUBLIC_APP_VERSION',
  commitEnv: 'NEXT_PUBLIC_GIT_COMMIT',
  buildEnv: 'NEXT_PUBLIC_BUILD_TIMESTAMP',
  environmentEnv: 'RUNTIME_ENV',
};

/**
 * Builds a standardized health payload.
 *
 * @param startedAt Epoch timestamp representing when the process booted.
 * @param checks List of subsystem diagnostics to embed in the payload.
 * @param options Optional overrides for metadata sources.
 */
export function buildHealthPayload(
  startedAt: number,
  checks: HealthCheckEntry[] = [],
  options: Partial<typeof DEFAULT_OPTIONS> = {}
): HealthPayload {
  const resolvedOptions = { ...DEFAULT_OPTIONS, ...options };
  const now = Date.now();
  const uptimeMs = Math.max(0, now - startedAt);
  const uptimeSeconds = Math.floor(uptimeMs / 1000);

  const normalizedChecks = checks.length > 0 ? checks : DEFAULT_HEALTH_CHECKS;

  const checksMap = normalizedChecks.reduce<Record<string, HealthCheckEntry>>((acc, check) => {
    acc[check.name] = check;
    return acc;
  }, {});

  return {
    status: deriveOverallStatus(normalizedChecks),
    service: resolvedOptions.serviceName,
    version: getEnv(resolvedOptions.versionEnv, '1.0.0'),
    commit: getEnv(resolvedOptions.commitEnv, 'unknown'),
    buildTime: getEnv(resolvedOptions.buildEnv, 'unknown'),
    environment: getEnv(resolvedOptions.environmentEnv, 'development'),
    uptime: {
      milliseconds: uptimeMs,
      seconds: uptimeSeconds,
      formatted: formatUptime(uptimeSeconds),
    },
    timestamp: new Date(now).toISOString(),
    checks: checksMap,
  };
}

/**
 * Determines the aggregate health status from individual checks.
 */
export function deriveOverallStatus(checks: HealthCheckEntry[]): HealthPayload['status'] {
  if (checks.some((check) => check.status === 'error')) {
    return 'unhealthy';
  }

  if (checks.some((check) => check.status === 'warn')) {
    return 'degraded';
  }

  return 'healthy';
}

/**
 * Reads an environment variable and falls back to a default value.
 */
export function getEnv(variable: string, fallback: string): string {
  return process.env[variable] ?? fallback;
}

/**
 * Formats seconds into a human-readable duration string.
 */
export function formatUptime(totalSeconds: number): string {
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);

  return parts.join(' ');
}
