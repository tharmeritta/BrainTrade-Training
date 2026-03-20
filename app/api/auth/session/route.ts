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

  // Fallback for environment variables (for initial login after deployment)
  const envUser = process.env.ADMIN_USERNAME;
  const envPass = process.env.ADMIN_PASSWORD;

  const cleanUser = username?.trim();
  const cleanPass = password?.trim();

  console.log('Login Attempt:', { 
    username: cleanUser, 
    hasEnvUser: !!envUser, 
    hasEnvPass: !!envPass,
    envUserMatch: cleanUser === envUser 
  });

  if (envUser && envPass && cleanUser === envUser && cleanPass === envPass) {
    console.log('Login Success: Environment Fallback');
    const res = NextResponse.json({ status: 'ok', role: 'admin' });
    setSession(res, makeSessionToken('admin', 'env-admin', 'Environment Admin', true));
    return res;
  }

  try {
    console.log('Attempting Firestore Login...');
    let staff = await fsGetAll<StaffAccount>('staff_accounts');
    let account = staff.find(
      s => s.username === username && s.password === password && s.active,
    );

    // 2. Fallback to 'users' collection (for credentials from seed-admin.mjs)
    if (!account) {
      const users = await fsGetAll<any>('users');
      // seed-admin.mjs uses email as the identifier, but we check both username and email
      const userMatch = users.find(
        u => (u.username === username || u.email === username) && 
             (u.password === password || u.password === undefined) && // users might use Firebase Auth
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
      const res = NextResponse.json({ status: 'ok', role: account.role });
      setSession(res, makeSessionToken(account.role, account.id, account.name, !!account.passwordChanged));
      return res;
    }
  } catch (err: any) {
    console.error('Login Database Error:', err);
    return NextResponse.json({ 
      error: 'Database error', 
      details: err.message,
      code: err.code 
    }, { status: 503 });
  }

  return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
}

export async function DELETE() {
  const res = NextResponse.json({ status: 'ok' });
  res.cookies.delete('session');
  return res;
}
