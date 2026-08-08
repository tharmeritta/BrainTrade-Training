import { NextRequest, NextResponse } from 'next/server';
import { makeSessionToken } from '@/lib/session/server';
import { fsGetWhere, fsGetAll } from '@/lib/server/db';
import { getAdminAuth } from '@/lib/server/firebase-admin';
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

  const isDev = process.env.NODE_ENV === 'development';

  // Dev mode quick login credentials for localhost testing
  const DEV_ACCOUNTS: Record<string, { role: string; name: string }> = {
    'admin':     { role: 'admin',     name: 'System Admin' },
    'manager':   { role: 'manager',   name: 'Sales Manager' },
    'trainer':   { role: 'trainer',   name: 'Lead Trainer' },
    'evaluator': { role: 'evaluator', name: 'Lead Evaluator' },
  };

  if (isDev && cleanUser) {
    const devAcc = DEV_ACCOUNTS[cleanUser.toLowerCase()];
    if (devAcc && (cleanPass === 'password123' || cleanPass === 'admin123' || cleanPass === 'manager123' || cleanPass === '123456' || !cleanPass)) {
      const res = NextResponse.json({ status: 'ok', role: devAcc.role });
      setSession(res, makeSessionToken(devAcc.role as any, `dev-${cleanUser}`, devAcc.name, true));
      console.log(`[Auth Dev] Granted local login for ${devAcc.role} (${cleanUser})`);
      return res;
    }
  }

  if (envUser && envPass && cleanUser === envUser && cleanPass === envPass) {
    const role = 'admin';
    const id = 'env-admin';
    let firebaseToken: string | undefined;
    try {
      firebaseToken = await getAdminAuth().createCustomToken(id, { role });
      console.log(`[Auth] Created custom token for id: ${id}, role: ${role}`);
    } catch (err: any) {
      console.error('[Auth] Custom Token Creation Failed:', err.message);
      if (err.code === 'auth/invalid-argument') console.error('[Auth] Check if Project ID matches Service Account.');
    }

    const res = NextResponse.json({ status: 'ok', role, firebaseToken });
    setSession(res, makeSessionToken(role, id, envUser, false));
    return res;
  }

  try {
    const cleanUser = username?.trim();
    const cleanPass = password?.trim();

    // Query staff_accounts by both username and email
    const [staffByUsername, staffByEmail] = await Promise.all([
      fsGetWhere<StaffAccount>('staff_accounts', 'username', cleanUser),
      fsGetWhere<StaffAccount>('staff_accounts', 'email', cleanUser)
    ]);

    const staffMatches = [...staffByUsername, ...staffByEmail];
    let account = staffMatches.find(s => 
      (s.password === cleanPass || s.password === undefined) && 
      (s.active === true || (s.active as any) === 'true' || s.active === undefined)
    );

    // Fallback: Query active staff_accounts
    if (!account && cleanUser) {
      const activeStaff = await fsGetWhere<StaffAccount>('staff_accounts', 'active', true);
      account = activeStaff.find(s => {
        const uMatch = s.username?.trim().toLowerCase() === cleanUser.toLowerCase();
        const eMatch = (s as any).email?.trim().toLowerCase() === cleanUser.toLowerCase();
        const pMatch = s.password === cleanPass || s.password === undefined;
        return (uMatch || eMatch) && pMatch;
      });
    }

    if (!account && cleanUser) {
      // Fallback: Query legacy users collection (checking both username and email)
      const [userByUsername, userByEmail] = await Promise.all([
        fsGetWhere<any>('users', 'username', cleanUser),
        fsGetWhere<any>('users', 'email', cleanUser)
      ]);
      
      const allMatches = [...userByUsername, ...userByEmail];
      const userMatch = allMatches.find(
        u => (u.password === cleanPass || u.password === undefined) && (u.active === true || (u.active as any) === 'true' || u.active === undefined)
      );
      
      if (userMatch) {
        account = {
          id: userMatch.uid || userMatch.id,
          username: userMatch.username || userMatch.email,
          password: userMatch.password || '',
          name: userMatch.name || 'Manager',
          role: (userMatch.role as any) || 'manager',
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
        console.log(`[Auth] Created custom token for account: ${account.id}, role: ${account.role}`);
      } catch (err: any) {
        console.error('[Auth] Custom Token Creation Failed for account:', err.message);
      }

      const res = NextResponse.json({ status: 'ok', role: account.role, firebaseToken });
      setSession(res, makeSessionToken(account.role, account.id, account.name, !!account.passwordChanged));
      return res;
    }
  } catch (err: any) {
    console.error('[Auth API] Database connection error:', err.message);
    if (isDev && cleanUser) {
      const devRole = cleanUser.toLowerCase().includes('manager') ? 'manager' : 'admin';
      const res = NextResponse.json({ status: 'ok', role: devRole });
      setSession(res, makeSessionToken(devRole as any, `dev-${cleanUser}`, cleanUser, true));
      console.warn(`[Auth Fallback] Database error caught, granted dev session for role: ${devRole}`);
      return res;
    }
    return NextResponse.json({ error: 'Database error' }, { status: 503 });
  }

  return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
}

export async function DELETE() {
  const res = NextResponse.json({ status: 'ok' });
  res.cookies.delete('session');
  return res;
}
