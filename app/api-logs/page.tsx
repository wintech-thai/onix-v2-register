'use client';

/**
 * API Logs Viewer Page
 *
 * Displays all API calls with full request/response details.
 * Shows method, URL, headers, body, response status, and timing.
 */

import { useEffect, useState } from 'react';
import { ApiCallLog } from '@/lib/api-logger';

export default function ApiLogsPage() {
  const [logs, setLogs] = useState<ApiCallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  // Fetch logs
  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/logs');
      const data = await response.json();

      if (data.success) {
        setLogs(data.data.logs);
        setError(null);
      } else {
        setError('Failed to load logs');
      }
    } catch (err) {
      setError('Error fetching logs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Clear logs
  const clearLogs = async () => {
    if (!confirm('Are you sure you want to clear all logs?')) {
      return;
    }

    try {
      const response = await fetch('/api/logs', { method: 'DELETE' });
      const data = await response.json();

      if (data.success) {
        setLogs([]);
        alert('Logs cleared successfully');
      } else {
        alert('Failed to clear logs');
      }
    } catch (err) {
      alert('Error clearing logs');
      console.error(err);
    }
  };

  // Initial load
  useEffect(() => {
    fetchLogs();
  }, []);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchLogs, 2000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    if (!filter) return true;
    const searchLower = filter.toLowerCase();
    return (
      log.method.toLowerCase().includes(searchLower) ||
      log.path.toLowerCase().includes(searchLower) ||
      log.url.toLowerCase().includes(searchLower) ||
      log.response.status.toString().includes(searchLower)
    );
  });

  // Toggle expand
  const toggleExpand = (id: string) => {
    setExpandedLog(expandedLog === id ? null : id);
  };

  // Get status color
  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600';
    if (status >= 400 && status < 500) return 'text-yellow-600';
    if (status >= 500) return 'text-red-600';
    return 'text-gray-600';
  };

  // Get status background
  const getStatusBg = (status: number) => {
    if (status >= 200 && status < 300) return 'bg-green-50 border-green-200';
    if (status >= 400 && status < 500) return 'bg-yellow-50 border-yellow-200';
    if (status >= 500) return 'bg-red-50 border-red-200';
    return 'bg-gray-50 border-gray-200';
  };

  // Format JSON
  const formatJson = (obj: any) => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return String(obj);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">API Call Logs</h1>
              <p className="mt-1 text-sm text-gray-600">
                Real-time API request/response monitoring
              </p>
              <span className="inline-flex items-center mt-2 px-3 py-1 text-xs font-semibold text-amber-900 bg-amber-100 border border-amber-200 rounded-full">
                Internal documentation — restricted access
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                ← Back to Home
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Controls */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Filter by method, path, URL, or status..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">Auto-refresh (2s)</span>
              </label>

              <button
                onClick={fetchLogs}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                Refresh
              </button>

              <button
                onClick={clearLogs}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
              >
                Clear Logs
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 flex items-center space-x-6 text-sm text-gray-600">
            <span>
              Total Logs: <strong className="text-gray-900">{logs.length}</strong>
            </span>
            <span>
              Filtered: <strong className="text-gray-900">{filteredLogs.length}</strong>
            </span>
            <span>
              Success:{' '}
              <strong className="text-green-600">
                {logs.filter((l) => l.response.status >= 200 && l.response.status < 300).length}
              </strong>
            </span>
            <span>
              Client Errors:{' '}
              <strong className="text-yellow-600">
                {logs.filter((l) => l.response.status >= 400 && l.response.status < 500).length}
              </strong>
            </span>
            <span>
              Server Errors:{' '}
              <strong className="text-red-600">
                {logs.filter((l) => l.response.status >= 500).length}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading logs...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-gray-600 text-lg mb-2">No API calls logged yet</p>
            <p className="text-gray-500 text-sm">Make some API requests to see them appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLogs.map((log) => {
              const isExpanded = expandedLog === log.id;

              return (
                <div
                  key={log.id}
                  className={`bg-white border rounded-lg overflow-hidden transition-all ${
                    isExpanded ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  {/* Summary */}
                  <div
                    onClick={() => toggleExpand(log.id)}
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          {/* Method Badge */}
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-mono font-semibold rounded">
                            {log.method}
                          </span>

                          {/* Status Badge */}
                          <span
                            className={`px-2 py-1 text-xs font-mono font-semibold rounded border ${getStatusBg(
                              log.response.status
                            )} ${getStatusColor(log.response.status)}`}
                          >
                            {log.response.status} {log.response.statusText}
                          </span>

                          {/* Duration */}
                          <span className="text-xs text-gray-500">{log.response.duration}ms</span>

                          {/* Timestamp */}
                          <span className="text-xs text-gray-400">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>

                        {/* Internal Path */}
                        <p className="text-xs text-gray-500 mb-1">
                          <span className="font-semibold">Internal:</span> {log.path}
                        </p>

                        {/* External API URL - Prominent Display */}
                        <div className="bg-blue-50 border border-blue-200 rounded px-2 py-1 mb-1">
                          <p className="text-xs font-semibold text-blue-700 mb-0.5">
                            🚀 External API Call:
                          </p>
                          <p className="text-xs font-mono text-blue-900 break-all">
                            {log.method} {log.url}
                          </p>
                        </div>
                      </div>

                      {/* Expand Icon */}
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ml-4 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t bg-gray-50">
                      <div className="p-4 space-y-4">
                        {/* External API Details */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-4 mb-4">
                          <h4 className="text-sm font-bold text-blue-900 mb-3 flex items-center">
                            <svg
                              className="w-5 h-5 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                              />
                            </svg>
                            External API Call
                          </h4>
                          <div className="space-y-2">
                            <div>
                              <p className="text-xs font-semibold text-gray-700 mb-1">Method</p>
                              <p className="font-mono text-sm text-gray-900 bg-white px-2 py-1 rounded border border-blue-200">
                                {log.method}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-700 mb-1">URL</p>
                              <p className="font-mono text-xs text-gray-900 bg-white px-2 py-1 rounded border border-blue-200 break-all">
                                {log.url}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Metadata */}
                        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                          <div>
                            <p className="text-gray-500 mb-1">IP Address</p>
                            <p className="font-mono text-gray-900">{log.ip}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 mb-1">User Agent</p>
                            <p className="font-mono text-xs text-gray-900 truncate">
                              {log.userAgent}
                            </p>
                          </div>
                        </div>

                        {/* Request Headers */}
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-2">
                            Request Headers
                          </p>
                          <div className="bg-gray-900 rounded-lg p-3 overflow-x-auto">
                            <pre className="text-xs text-green-400 font-mono">
                              {formatJson(log.headers)}
                            </pre>
                          </div>
                        </div>

                        {/* Request Body */}
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                              />
                            </svg>
                            Request Body
                          </p>
                          <div className="bg-gray-900 rounded-lg p-3 overflow-x-auto">
                            <pre className="text-xs text-green-400 font-mono">
                              {log.body && Object.keys(log.body).length > 0
                                ? formatJson(log.body)
                                : '{}  // Empty body - parameters in URL'}
                            </pre>
                          </div>
                        </div>

                        {/* Response Headers */}
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-2">
                            Response Headers
                          </p>
                          <div className="bg-gray-900 rounded-lg p-3 overflow-x-auto">
                            <pre className="text-xs text-blue-400 font-mono">
                              {formatJson(log.response.headers)}
                            </pre>
                          </div>
                        </div>

                        {/* Response Body */}
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 8l-4 4m0 0l4 4m-4-4h18"
                              />
                            </svg>
                            Response Body
                          </p>
                          <div className="bg-gray-900 rounded-lg p-3 overflow-x-auto">
                            <pre className="text-xs text-blue-400 font-mono">
                              {formatJson(log.response.body)}
                            </pre>
                          </div>
                        </div>

                        {/* Copy Button */}
                        <div className="flex justify-end">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(
                                JSON.stringify(
                                  {
                                    request: {
                                      method: log.method,
                                      url: log.url,
                                      headers: log.headers,
                                      body: log.body,
                                    },
                                    response: {
                                      status: log.response.status,
                                      statusText: log.response.statusText,
                                      headers: log.response.headers,
                                      body: log.response.body,
                                      duration: log.response.duration,
                                    },
                                  },
                                  null,
                                  2
                                )
                              );
                              alert('Copied to clipboard!');
                            }}
                            className="px-4 py-2 bg-gray-700 text-white text-sm font-medium rounded-md hover:bg-gray-600 transition-colors"
                          >
                            Copy Full Log
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-500">
            <p>API logs are stored in memory and will be cleared on server restart.</p>
            <p className="mt-1">Maximum 100 logs are kept at any time.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
