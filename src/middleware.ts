import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const APP_PREFIXES = ['/app', '/dashboard'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAppRoute = APP_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (!isAppRoute) {
    return NextResponse.next();
  }

  const bypassAuth = process.env.BYPASS_AUTH === 'true';
  if (bypassAuth) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/login')) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = '/login';
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/app/:path*', '/dashboard/:path*'],
};
