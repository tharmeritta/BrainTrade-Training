import { NextRequest, NextResponse } from 'next/server';
import { makeSessionToken } from '@/lib/session';
import { fsGetAll } from '@/lib/firestore-db';
import { getAdminAuth } from '@/lib/firebase-admin';
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

  // Fallback for environment variables (for initial login after deployment)
  const envUser = (process.env.ADMIN_USERNAME || 'Tharme Ritta').trim();
  const envPass = (process.env.ADMIN_PASSWORD || '').trim();

  const cleanUser = username?.trim();
  const cleanPass = password?.trim();

  if (envUser && envPass && cleanUser === envUser && cleanPass === envPass) {
    const role = 'admin';
    const id = 'env-admin';
    let firebaseToken: string | undefined;
    try {
      firebaseToken = await getAdminAuth().createCustomToken(id, { role });
    } catch (err) {
      console.warn('Failed to create custom token for env admin:', err);
    }

    const res = NextResponse.json({ status: 'ok', role, firebaseToken });
    setSession(res, makeSessionToken(role, id, envUser, false));
    return res;
  }

  try {
    let staff = await fsGetAll<StaffAccount>('staff_accounts');
    let account = staff.find(
      s => s.username === username && s.password === password && s.active,
    );

    if (!account) {
      const users = await fsGetAll<any>('users');
      const userMatch = users.find(
        u => (u.username === username || u.email === username) && 
             (u.password === password || u.password === undefined) &&
             u.active
      );
      if (userMatch) {
        account = {
          id: userMatch.uid || userMatch.id,
          username: userMatch.username || userMatch.email,
          password: userMatch.password || '',
          name: userMatch.name || 'Admin',
          role: (userMatch.role as any) || 'admin',
          active: true,
          passwordChanged: true,
          createdAt: userMatch.createdAt || new Date().toISOString()
        };
      }
    }

    if (account) {
      let firebaseToken: string | undefined;
      try {
        firebaseToken = await getAdminAuth().createCustomToken(account.id, { role: account.role });
      } catch (err) {
        console.warn('Failed to create custom token:', err);
      }

      const res = NextResponse.json({ status: 'ok', role: account.role, firebaseToken });
      setSession(res, makeSessionToken(account.role, account.id, account.name, !!account.passwordChanged));
      return res;
    }
  } catch (err: any) {
    return NextResponse.json({ error: 'Database error' }, { status: 503 });
  }

  return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
}

export async function DELETE() {
  const res = NextResponse.json({ status: 'ok' });
  res.cookies.delete('session');
  return res;
}
