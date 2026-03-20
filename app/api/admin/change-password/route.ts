import { NextRequest, NextResponse } from 'next/server';
import { getServerUser, makeSessionToken } from '@/lib/session';
import { fsUpdate, fsGet, fsSet } from '@/lib/firestore-db';
import type { StaffAccount } from '@/types';

export async function POST(req: NextRequest) {
  const user = await getServerUser();
  if (!user || !['admin', 'manager', 'trainer', 'evaluator'].includes(user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { newPassword } = await req.json();
    if (!newPassword || newPassword.length < 4) {
      return NextResponse.json({ error: 'Password too short' }, { status: 400 });
    }

    const existing = await fsGet<StaffAccount>('staff_accounts', user.uid);

    if (existing) {
      // Document exists, update it
      await fsUpdate('staff_accounts', user.uid, { password: newPassword, passwordChanged: true });
    } else {
      // Document doesn't exist (e.g. bootstrap admin), create it
      await fsSet('staff_accounts', user.uid, {
        id: user.uid,
        username: user.name, // Use the username from the session
        password: newPassword,
        name: user.name,
        role: user.role,
        active: true,
        createdAt: new Date().toISOString(),
        passwordChanged: true,
      });
    }

    const res = NextResponse.json({ ok: true });
    
    // Update session token so passwordChanged reflects true
    const newToken = makeSessionToken(user.role, user.uid, user.name, true);
    res.cookies.set('session', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 5, // 5 days
      path: '/',
    });

    return res;
  } catch (err: any) {
    console.error('Change password error:', err);
    return NextResponse.json({ 
      error: 'Server error', 
      details: err.message,
      code: err.code,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }, { status: 500 });
  }
}
