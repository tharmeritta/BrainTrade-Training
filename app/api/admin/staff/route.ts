import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/session';
import { fsGetAll, fsAdd } from '@/lib/firestore-db';
import type { StaffAccount } from '@/types';

// GET /api/admin/staff — list all managers + evaluators (passwords included for admin editing)
export async function GET() {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  try {
    const staff = await fsGetAll<StaffAccount>('staff_accounts');
    return NextResponse.json({ staff });
  } catch (err: any) {
    console.error('[GET /api/admin/staff] Firestore error:', err);
    return NextResponse.json({ error: 'Database error', details: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { username, password, name, role } = body;
  if (!username?.trim() || !password?.trim() || !name?.trim()) {
    return NextResponse.json({ error: 'username, password, and name are required' }, { status: 400 });
  }
  if (!['admin', 'manager', 'evaluator', 'trainer'].includes(role)) {
    return NextResponse.json({ error: 'role must be admin, manager, evaluator, or trainer' }, { status: 400 });
  }

  try {
    // Check for duplicate username
    const existing = await fsGetAll<StaffAccount>('staff_accounts');
    if (existing.some(s => s.username === username.trim())) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
    }

    const account = await fsAdd('staff_accounts', {
      username: username.trim(),
      password: password.trim(),
      name: name.trim(),
      role,
      active: true,
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json(account, { status: 201 });
  } catch (err: any) {
    console.error('[POST /api/admin/staff] Firestore error:', err);
    return NextResponse.json({ error: 'Database error', details: err.message }, { status: 500 });
  }
}
