import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/session';

const APP_PREFIXES = ['/app', '/dashboard'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAppRoute = APP_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (!isAppRoute) {
    return NextResponse.next();
  }

  // Local-dev escape hatch only; production should use APP_PASSWORD/AUTH_SECRET.
  if (process.env.BYPASS_AUTH === 'true') {
    return NextResponse.next();
  }

  const authSecret = process.env.AUTH_SECRET;
  if (authSecret) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (await verifySessionToken(token, authSecret)) {
      return NextResponse.next();
    }
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = '/login';
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/app/:path*', '/dashboard/:path*'],
};
