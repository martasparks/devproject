import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { auth } from "@lib/auth";
import { routing } from './src/i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

export default auth((request) => {
  // Skip internationalization for API routes and static files
  if (
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Handle internationalization for all other routes
  return intlMiddleware(request);
});

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};