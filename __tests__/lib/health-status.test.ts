import {
  buildHealthPayload,
  DEFAULT_HEALTH_CHECKS,
  deriveOverallStatus,
  formatUptime,
  type HealthCheckEntry,
} from '@/lib/health/health-status';

const ORIGINAL_ENV = { ...process.env };

describe('health status utilities', () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    jest.restoreAllMocks();
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  describe('buildHealthPayload', () => {
    it('uses default metadata and checks when no overrides are provided', () => {
      delete process.env.NEXT_PUBLIC_APP_VERSION;
      delete process.env.NEXT_PUBLIC_GIT_COMMIT;
      delete process.env.NEXT_PUBLIC_BUILD_TIMESTAMP;
      delete process.env.RUNTIME_ENV;

      const mockNow = 1_700_000_000_000;
      jest.spyOn(Date, 'now').mockReturnValue(mockNow);

      const payload = buildHealthPayload(mockNow - 5_000);

      expect(payload.status).toBe('healthy');
      expect(payload.service).toBe('onix-v2-register');
      expect(payload.version).toBe('1.0.0');
      expect(payload.commit).toBe('unknown');
      expect(payload.environment).toBe('development');
      expect(payload.buildTime).toBe('unknown');
      expect(payload.uptime.milliseconds).toBe(5_000);
      expect(payload.uptime.seconds).toBe(5);
      expect(payload.checks).toEqual(
        DEFAULT_HEALTH_CHECKS.reduce<Record<string, HealthCheckEntry>>((acc, check) => {
          acc[check.name] = check;
          return acc;
        }, {}),
      );
    });

    it('honors environment metadata when provided', () => {
      process.env.NEXT_PUBLIC_APP_VERSION = '2.3.4';
      process.env.NEXT_PUBLIC_GIT_COMMIT = 'abc123';
      process.env.NEXT_PUBLIC_BUILD_TIMESTAMP = '2025-01-01T00:00:00.000Z';
      process.env.RUNTIME_ENV = 'staging';

      const mockNow = 1_700_000_010_000;
      jest.spyOn(Date, 'now').mockReturnValue(mockNow);

      const payload = buildHealthPayload(mockNow - 10_000);

      expect(payload.version).toBe('2.3.4');
      expect(payload.commit).toBe('abc123');
      expect(payload.buildTime).toBe('2025-01-01T00:00:00.000Z');
      expect(payload.environment).toBe('staging');
      expect(payload.uptime.milliseconds).toBe(10_000);
      expect(payload.uptime.formatted).toBe('10s');
    });

    it('returns degraded status when any check is in warn state', () => {
      const mockNow = 1_700_000_020_000;
      jest.spyOn(Date, 'now').mockReturnValue(mockNow);

      const checks: HealthCheckEntry[] = [
        { name: 'database', status: 'warn', message: 'Replication lag detected' },
      ];

      const payload = buildHealthPayload(mockNow - 30_000, checks);

      expect(payload.status).toBe('degraded');
      expect(payload.checks.database).toEqual(checks[0]);
    });

    it('returns unhealthy status when any check is in error state', () => {
      const mockNow = 1_700_000_030_000;
      jest.spyOn(Date, 'now').mockReturnValue(mockNow);

      const checks: HealthCheckEntry[] = [
        { name: 'redis', status: 'ok' },
        { name: 'upstreamApi', status: 'error', message: 'Timeouts detected' },
      ];

      const payload = buildHealthPayload(mockNow - 45_000, checks);

      expect(payload.status).toBe('unhealthy');
      expect(payload.checks.upstreamApi).toEqual(checks[1]);
    });

    it('allows overriding metadata via options argument', () => {
      const mockNow = 1_700_000_040_000;
      jest.spyOn(Date, 'now').mockReturnValue(mockNow);

      const payload = buildHealthPayload(mockNow - 60_000, [], {
        serviceName: 'custom-service',
        versionEnv: 'CUSTOM_VERSION',
      });

      expect(payload.service).toBe('custom-service');
      expect(payload.version).toBe('1.0.0');
    });
  });

  describe('deriveOverallStatus', () => {
    it('returns healthy when all checks are ok', () => {
      const status = deriveOverallStatus([{ name: 'app', status: 'ok' }]);
      expect(status).toBe('healthy');
    });

    it('returns degraded when at least one check warns', () => {
      const status = deriveOverallStatus([
        { name: 'app', status: 'ok' },
        { name: 'database', status: 'warn' },
      ]);
      expect(status).toBe('degraded');
    });

    it('returns unhealthy when at least one check errors', () => {
      const status = deriveOverallStatus([
        { name: 'app', status: 'ok' },
        { name: 'queue', status: 'warn' },
        { name: 'upstream', status: 'error' },
      ]);
      expect(status).toBe('unhealthy');
    });
  });

  describe('formatUptime', () => {
    it('formats duration into human-readable segments', () => {
      expect(formatUptime(93784)).toBe('1d 2h 3m 4s');
      expect(formatUptime(65)).toBe('1m 5s');
      expect(formatUptime(4)).toBe('4s');
    });
  });
});
