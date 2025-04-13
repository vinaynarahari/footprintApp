import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Define CSP header
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.plaid.com https://cdn.plaid.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https://*.plaid.com;
    font-src 'self';
    frame-src 'self' https://*.plaid.com;
    connect-src 'self' 
      https://*.plaid.com 
      https://cdn.plaid.com 
      https://sandbox.plaid.com 
      https://*.supabase.co 
      https://upkwjzxfavnybjzsoqpu.supabase.co;
  `.replace(/\s{2,}/g, ' ').trim();

  // Add security headers
  const headers = response.headers;
  headers.set('Content-Security-Policy', cspHeader);
  headers.set('X-Frame-Options', 'DENY');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 