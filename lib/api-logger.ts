/**
 * API Call Logger
 *
 * In-memory logger for capturing API requests and responses.
 * Stores full details of API calls for debugging and monitoring.
 */

export interface ApiCallLog {
  id: string;
  timestamp: string;
  method: string;
  url: string;
  path: string;
  headers: Record<string, string>;
  query: Record<string, string>;
  body: any;
  response: {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: any;
    duration: number;
  };
  ip: string;
  userAgent: string;
}

// In-memory storage (max 100 logs)
const logs: ApiCallLog[] = [];
const MAX_LOGS = 100;

/**
 * Add a new API call log
 */
export function addLog(log: ApiCallLog): void {
  logs.unshift(log); // Add to beginning

  // Keep only last MAX_LOGS entries
  if (logs.length > MAX_LOGS) {
    logs.splice(MAX_LOGS);
  }
}

/**
 * Get all logs
 */
export function getLogs(): ApiCallLog[] {
  return [...logs];
}

/**
 * Get logs filtered by criteria
 */
export function getFilteredLogs(filters: {
  method?: string;
  path?: string;
  status?: number;
  limit?: number;
}): ApiCallLog[] {
  let filtered = [...logs];

  if (filters.method) {
    filtered = filtered.filter((log) => log.method === filters.method);
  }

  if (filters.path) {
    filtered = filtered.filter((log) => log.path.includes(filters.path!));
  }

  if (filters.status) {
    filtered = filtered.filter((log) => log.response.status === filters.status);
  }

  if (filters.limit) {
    filtered = filtered.slice(0, filters.limit);
  }

  return filtered;
}

/**
 * Clear all logs
 */
export function clearLogs(): void {
  logs.splice(0, logs.length);
}

/**
 * Get log by ID
 */
export function getLogById(id: string): ApiCallLog | undefined {
  return logs.find((log) => log.id === id);
}

/**
 * Generate unique log ID
 */
export function generateLogId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
