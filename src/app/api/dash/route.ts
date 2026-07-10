import { NextRequest, NextResponse } from 'next/server';
import { startDashTask, getDashTask } from '@/lib/dashClient';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/session';

export const maxDuration = 30;

async function isAuthorized(request: NextRequest): Promise<boolean> {
  if (process.env.BYPASS_AUTH === 'true') return true;
  const authSecret = process.env.AUTH_SECRET;
  if (!authSecret) return false;
  return verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value, authSecret);
}

function unauthorized() {
  return NextResponse.json({ success: false, error: 'Login required.' }, { status: 401 });
}

function bridgeError(err: unknown) {
  return NextResponse.json(
    { success: false, error: err instanceof Error ? err.message : 'DASH relay error.' },
    { status: 502 },
  );
}

// POST /api/dash — start a new DASH task. Returns { id } immediately.
export async function POST(request: NextRequest) {
  if (!(await isAuthorized(request))) return unauthorized();

  const body = await request.json().catch(() => null);
  const task = typeof body?.task === 'string' && body.task.trim() ? body.task.trim() : null;
  if (!task) {
    return NextResponse.json({ success: false, error: 'task is required.' }, { status: 400 });
  }

  try {
    const started = await startDashTask(task, typeof body?.cwd === 'string' ? body.cwd : undefined);
    return NextResponse.json({ success: true, id: started.id, status: started.status });
  } catch (err) {
    return bridgeError(err);
  }
}

// GET /api/dash?id=... — poll status/output of a running or finished task.
export async function GET(request: NextRequest) {
  if (!(await isAuthorized(request))) return unauthorized();

  const id = request.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ success: false, error: 'id is required.' }, { status: 400 });
  }

  try {
    const status = await getDashTask(id);
    return NextResponse.json({ success: true, ...status });
  } catch (err) {
    return bridgeError(err);
  }
}
