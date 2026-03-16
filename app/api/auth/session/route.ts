import { NextRequest, NextResponse } from 'next/server';
import { makeSessionToken } from '@/lib/session';
import { gcsGetAll } from '@/lib/gcs';
import type { StaffAccount } from '@/types';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;
const FIVE_DAYS      = 60 * 60 * 24 * 5;

function setSession(res: NextResponse, token: string) {
  res.cookies.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: FIVE_DAYS,
    path: '/',
  });
}

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  // 1. Check admin (env vars)
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const res = NextResponse.json({ status: 'ok', role: 'admin' });
    setSession(res, makeSessionToken('admin', 'admin', 'Admin'));
    return res;
  }

  // 2. Check manager / evaluator (GCS staff_accounts)
  try {
    const staff = await gcsGetAll<StaffAccount>('staff_accounts');
    const account = staff.find(
      s => s.username === username && s.password === password && s.active,
    );
    if (account) {
      const res = NextResponse.json({ status: 'ok', role: account.role });
      setSession(res, makeSessionToken(account.role, account.id, account.name));
      return res;
    }
  } catch {
    // GCS unreachable — fall through to 401
  }

  return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
}

export async function DELETE() {
  const res = NextResponse.json({ status: 'ok' });
  res.cookies.delete('session');
  return res;
}
