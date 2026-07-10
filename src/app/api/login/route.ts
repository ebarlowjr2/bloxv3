import { NextRequest, NextResponse } from 'next/server';
import { createSessionToken, passwordMatches, SESSION_COOKIE } from '@/lib/session';

export async function POST(request: NextRequest) {
  const appPassword = process.env.APP_PASSWORD;
  const authSecret = process.env.AUTH_SECRET;

  if (!appPassword || !authSecret) {
    return NextResponse.json(
      { success: false, error: 'Login is not configured (missing APP_PASSWORD/AUTH_SECRET).' },
      { status: 500 },
    );
  }

  const body = await request.json().catch(() => null);
  const password = typeof body?.password === 'string' ? body.password : '';

  if (!password || !(await passwordMatches(password, appPassword, authSecret))) {
    return NextResponse.json({ success: false, error: 'Incorrect password.' }, { status: 401 });
  }

  const token = await createSessionToken(authSecret);
  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });
  return response;
}
