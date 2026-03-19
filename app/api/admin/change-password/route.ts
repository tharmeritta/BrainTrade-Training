import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/session';
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
        username: 'admin', // Default for bootstrap
        password: newPassword,
        name: user.name,
        role: user.role,
        active: true,
        createdAt: new Date().toISOString(),
        passwordChanged: true,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Change password error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
