import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/session';
import { fsGetAll as gcsGetAll, fsAdd as gcsAdd } from '@/lib/firestore-db';
import type { StaffAccount } from '@/types';

// GET /api/admin/staff — list all managers + evaluators (passwords included for admin editing)
export async function GET() {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  try {
    const staff = await gcsGetAll<StaffAccount>('staff_accounts');
    return NextResponse.json({ staff });
  } catch {
    return NextResponse.json({ staff: [] });
  }
}

// POST /api/admin/staff — create new manager or evaluator
export async function POST(req: NextRequest) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const { username, password, name, role } = await req.json();
  if (!username?.trim() || !password?.trim() || !name?.trim()) {
    return NextResponse.json({ error: 'username, password, and name are required' }, { status: 400 });
  }
  if (!['manager', 'evaluator', 'trainer'].includes(role)) {
    return NextResponse.json({ error: 'role must be manager, evaluator, or trainer' }, { status: 400 });
  }

  // Check for duplicate username
  const existing = await gcsGetAll<StaffAccount>('staff_accounts');
  if (existing.some(s => s.username === username.trim())) {
    return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
  }

  const account = await gcsAdd('staff_accounts', {
    username: username.trim(),
    password: password.trim(),
    name: name.trim(),
    role,
    active: true,
    createdAt: new Date().toISOString(),
  });
  return NextResponse.json(account, { status: 201 });
}
