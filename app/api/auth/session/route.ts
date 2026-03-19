import { NextRequest, NextResponse } from 'next/server';
import { makeSessionToken } from '@/lib/session';
import { fsGetAll } from '@/lib/firestore-db';
import type { StaffAccount } from '@/types';

const FIVE_DAYS = 60 * 60 * 24 * 5;

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

  try {
    const staff = await fsGetAll<StaffAccount>('staff_accounts');
    const account = staff.find(
      s => s.username === username && s.password === password && s.active,
    );
    if (account) {
      const res = NextResponse.json({ status: 'ok', role: account.role });
      setSession(res, makeSessionToken(account.role, account.id, account.name, !!account.passwordChanged));
      return res;
    }
  } catch {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }

  return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
}

export async function DELETE() {
  const res = NextResponse.json({ status: 'ok' });
  res.cookies.delete('session');
  return res;
}
