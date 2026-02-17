import { NextResponse, NextRequest } from 'next/server';
import { NextFetchEvent } from 'next/server';

// Security middleware for Next.js
export function securityMiddleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add security headers
  const securityHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  };

  // Apply headers to response
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Content Security Policy for production
  if (process.env.NODE_ENV === 'production') {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://api.bondarys.com https://*.supabase.co",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join('; ');

    response.headers.set('Content-Security-Policy', csp);
  }

  return response;
}

// Rate limiting middleware
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimitMiddleware(request: NextRequest) {
  const ip = request.ip || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 100; // 100 requests per minute

  const rateLimit = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs };

  if (now > rateLimit.resetTime) {
    // Reset the rate limit
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
  } else {
    rateLimit.count++;
    
    if (rateLimit.count > maxRequests) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }
  }

  rateLimitMap.set(ip, rateLimit);
  return NextResponse.next();
}

// Geo-blocking middleware (optional)
export function geoBlockingMiddleware(request: NextRequest) {
  const blockedCountries = process.env.BLOCKED_COUNTRIES?.split(',') || [];
  const country = request.geo?.country;

  if (country && blockedCountries.includes(country)) {
    return new NextResponse('Access Denied', { status: 403 });
  }

  return NextResponse.next();
}

// Bot detection middleware
export function botDetectionMiddleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';
  
  // Common bot patterns
  const botPatterns = [
    /googlebot/i,
    /bingbot/i,
    /slurp/i,
    /duckduckbot/i,
    /baiduspider/i,
    /yandex/i,
    /facebookexternalhit/i,
    /twitterbot/i,
    /linkedinbot/i,
    /whatsapp/i,
    /telegrambot/i,
  ];

  const isBot = botPatterns.some(pattern => pattern.test(userAgent));

  if (isBot) {
    // Allow bots to access static assets and API
    if (request.nextUrl.pathname.startsWith('/api/') || 
        request.nextUrl.pathname.startsWith('/_next/') ||
        request.nextUrl.pathname.startsWith('/images/')) {
      return NextResponse.next();
    }
    
    // Block bots from accessing user-facing pages
    return new NextResponse('Access Denied', { status: 403 });
  }

  return NextResponse.next();
}

// Request logging middleware
export function requestLoggingMiddleware(request: NextRequest) {
  const start = Date.now();
  const { method, url, ip, headers } = request;
  
  console.log(`[${new Date().toISOString()}] ${method} ${url} - IP: ${ip} - UA: ${headers.get('user-agent')}`);
  
  const response = NextResponse.next();
  
  // Log response time
  response.headers.set('X-Response-Time', `${Date.now() - start}ms`);
  
  return response;
}

// Main middleware chain
export default function middleware(request: NextRequest, event: NextFetchEvent) {
  // Apply security middleware first
  let response = securityMiddleware(request);
  
  // Apply rate limiting
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response = rateLimitMiddleware(request);
  }
  
  // Apply bot detection
  response = botDetectionMiddleware(request);
  
  // Apply geo-blocking (if configured)
  if (process.env.ENABLE_GEO_BLOCKING === 'true') {
    response = geoBlockingMiddleware(request);
  }
  
  // Apply request logging
  response = requestLoggingMiddleware(request);
  
  return response;
}
