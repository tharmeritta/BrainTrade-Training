import { NextRequest, NextResponse } from 'next/server';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;
const SESSION_SECRET = process.env.SESSION_SECRET!;
const FIVE_DAYS = 60 * 60 * 24 * 5;

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  const res = NextResponse.json({ status: 'ok' });
  res.cookies.set('session', SESSION_SECRET, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: FIVE_DAYS,
    path: '/',
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ status: 'ok' });
  res.cookies.delete('session');
  return res;
}
