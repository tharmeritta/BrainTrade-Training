import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/session';
import { fsUpdate, fsDelete, fsGetAll } from '@/lib/firestore-db';
import type { StaffAccount } from '@/types';

// PATCH /api/admin/staff/:id — update username / password / name / role / active
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const { id } = await params;
  const body: Partial<Pick<StaffAccount, 'username' | 'password' | 'name' | 'role' | 'active'>> = await req.json();

  // If username is being changed, check for duplicates
  if (body.username) {
    const existing = await fsGetAll<StaffAccount>('staff_accounts');
    if (existing.some(s => s.username === body.username && s.id !== id)) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
    }
  }

  await fsUpdate('staff_accounts', id, body);
  return NextResponse.json({ ok: true });
}

// DELETE /api/admin/staff/:id — remove a manager or evaluator account
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const { id } = await params;
  await fsDelete('staff_accounts', id);
  return NextResponse.json({ ok: true });
}
