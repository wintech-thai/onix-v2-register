/**
 * Proxy for ONIX v2 Registration Microservice
 *
 * Features:
 * 1. Internationalization routing (locale detection and redirection)
 * 2. Audit logging for all requests
 *
 * Note: Next.js 16 proxy runs in Edge Runtime by default
 * Renamed from middleware.ts to proxy.ts per Next.js 16 convention
 */

import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale, isValidLocale, type Locale } from './i18n';

// Log version info on first load
let versionLogged = false;
if (!versionLogged) {
  const commitId = process.env.NEXT_PUBLIC_GIT_COMMIT || process.env.GIT_COMMIT || 'unknown';
  const version = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';
  const buildTime = process.env.NEXT_PUBLIC_BUILD_TIMESTAMP || 'unknown';

  console.log('═══════════════════════════════════════════════════');
  console.log('🚀 ONIX v2 Registration - Application Started');
  console.log('═══════════════════════════════════════════════════');
  console.log(`📦 Version:    ${version}`);
  console.log(`🔖 Commit ID:  ${commitId}`);
  console.log(`🕐 Build Time: ${buildTime}`);
  console.log(`🌍 Environment: ${process.env.RUNTIME_ENV || 'development'}`);
  console.log('═══════════════════════════════════════════════════');

  versionLogged = true;
}

// Audit log structure
interface AuditLog {
  Host: string;
  HttpMethod: string;
  StatusCode: number;
  Path: string;
  QueryString: string;
  UserAgent: string;
  RequestSize: number;
  ResponseSize: number;
  LatencyMs: number;
  Scheme: string;
  ClientIp: string;
  CfClientIp: string;
  CustomStatus: string;
  CustomDesc: string;
  Environment: string | undefined;
  Locale: string;
  userInfo: UserInfo;
}

interface UserInfo {
  userId?: string;
  sessionId?: string;
}

/**
 * Get preferred locale from Accept-Language header
 */
function getLocaleFromHeader(request: NextRequest): Locale {
  const acceptLanguage = request.headers.get('accept-language');

  if (!acceptLanguage) {
    return defaultLocale;
  }

  // Parse accept-language header
  // Format: "en-US,en;q=0.9,th;q=0.8"
  const languages = acceptLanguage
    .split(',')
    .map((lang) => {
      const [locale, q = 'q=1'] = lang.trim().split(';');
      const quality = parseFloat(q.split('=')[1] || '1');
      return { locale: locale.toLowerCase(), quality };
    })
    .sort((a, b) => b.quality - a.quality);

  // Find first matching locale
  for (const { locale } of languages) {
    // Check exact match (e.g., "en", "th")
    if (locales.includes(locale as any)) {
      return locale as Locale;
    }

    // Check language prefix (e.g., "en-US" -> "en")
    const prefix = locale.split('-')[0];
    if (locales.includes(prefix as any)) {
      return prefix as Locale;
    }
  }

  return defaultLocale as Locale;
}

/**
 * Check if pathname has a locale prefix
 */
function pathnameHasLocale(pathname: string): boolean {
  return locales.some((locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`);
}

/**
 * Main proxy function
 */
export async function proxy(request: NextRequest) {
  const startTime = Date.now();
  const { pathname, search } = request.nextUrl;

  // Skip proxy for:
  // - Health endpoints
  // - API routes
  // - Static files (_next/static, _next/image)
  // - Public files (favicon, images, etc.)
  if (
    pathname === '/health' ||
    pathname === '/api/health' ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot|otf)$/)
  ) {
    return NextResponse.next();
  }

  // ============================================
  // 1. INTERNATIONALIZATION ROUTING
  // ============================================

  // Check if pathname already has a locale
  if (!pathnameHasLocale(pathname)) {
    // Get locale from cookie or Accept-Language header
    const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
    let locale: Locale = defaultLocale;

    if (cookieLocale && isValidLocale(cookieLocale)) {
      locale = cookieLocale;
    } else {
      locale = getLocaleFromHeader(request);
    }

    // Redirect to locale-prefixed path
    const newUrl = new URL(`/${locale}${pathname}${search}`, request.url);
    const response = NextResponse.redirect(newUrl);

    // Set locale cookie
    response.cookies.set('NEXT_LOCALE', locale, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
    });

    return response;
  }

  // Continue with the request
  const response = NextResponse.next();

  // Extract locale from pathname for cookie setting
  const pathLocale = pathname.split('/')[1];
  if (isValidLocale(pathLocale)) {
    response.cookies.set('NEXT_LOCALE', pathLocale, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
    });
  }

  // ============================================
  // 2. AUDIT LOGGING
  // ============================================

  const method = request.method;
  const scheme = request.nextUrl.protocol.replace(':', '');
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
  const userAgent = request.headers.get('user-agent') || '';

  // Extract client IP
  let clientIp = '';
  const xForwardedFor =
    request.headers.get('x-original-forwarded-for') || request.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    clientIp = xForwardedFor.split(',')[0].trim();
  }

  const cfClientIp = request.headers.get('cf-connecting-ip') || '';
  const requestSize = parseInt(request.headers.get('content-length') || '0', 10);

  // Calculate response time
  const endTime = Date.now();
  const latencyMs = endTime - startTime;

  // Build audit log object
  const auditLog: AuditLog = {
    Host: host,
    HttpMethod: method,
    StatusCode: response.status,
    Path: pathname,
    QueryString: search,
    UserAgent: userAgent,
    RequestSize: requestSize,
    ResponseSize: 0,
    LatencyMs: latencyMs,
    Scheme: scheme,
    ClientIp: clientIp,
    CfClientIp: cfClientIp,
    CustomStatus: response.headers.get('CUST_STATUS') || '',
    CustomDesc: response.status !== 200 ? response.statusText : '',
    Environment: process.env.RUNTIME_ENV || 'development',
    Locale: pathLocale || defaultLocale,
    userInfo: {},
  };

  // Log to console (structured JSON)
  console.log(JSON.stringify(auditLog));

  // Optionally send to external logging endpoint
  await sendAuditLog(auditLog);

  return response;
}

/**
 * Sends audit log to external endpoint (Logstash)
 */
async function sendAuditLog(auditLog: AuditLog): Promise<void> {
  const logEndpoint = process.env.NEXT_PUBLIC_LOG_ENDPOINT;

  if (!logEndpoint) {
    return;
  }

  try {
    const response = await fetch(logEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(auditLog),
    });

    if (!response.ok) {
      console.warn(`Failed to send audit log, status code = [${response.status}]`);
    }
  } catch (error) {
    console.error(
      'Error sending audit log:',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

// Configure which paths the proxy should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (handled separately)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, images, fonts
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot|otf)$).*)',
  ],
};
