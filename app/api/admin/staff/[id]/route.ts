import { NextRequest, NextResponse } from 'next/server';
import { requireAdminOrIT } from '@/lib/session';
import { fsUpdate, fsDelete, fsGetAll, fsGet } from '@/lib/firestore-db';
import { createApprovalRequest } from '@/lib/services/approval-service';
import type { StaffAccount } from '@/types';

// PATCH /api/admin/staff/:id — update username / password / name / role / active
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let user;
  try { user = await requireAdminOrIT(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const { id } = await params;
  const body: Partial<Pick<StaffAccount, 'username' | 'password' | 'name' | 'role' | 'active'>> = await req.json();

  const target = await fsGet<StaffAccount>('staff_accounts', id);
  const targetName = target?.name || id;

  // IT role requires approval
  if (user.role === 'it') {
    const actionType = (Object.keys(body).length === 1 && 'active' in body) ? 'toggle_staff' : 'edit_staff';
    await createApprovalRequest(
      { uid: user.uid, name: user.name },
      actionType,
      body,
      { id, name: targetName }
    );
    return NextResponse.json({ message: 'Request submitted for approval' }, { status: 202 });
  }

  // If username is being changed, check for duplicates
  if (body.username) {
    const existing = await fsGetAll<StaffAccount>('staff_accounts');
    if (existing.some(s => s.username === body.username?.trim() && s.id !== id)) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
    }
  }

  await fsUpdate('staff_accounts', id, {
    ...body,
    updatedAt: new Date().toISOString()
  });
  return NextResponse.json({ ok: true });
}
// DELETE /api/admin/staff/:id — remove a staff account
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let user;
  try { user = await requireAdminOrIT(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const { id } = await params;

  const target = await fsGet<StaffAccount>('staff_accounts', id);
  const targetName = target?.name || id;

  // IT role requires approval
  if (user.role === 'it') {
    await createApprovalRequest(
      { uid: user.uid, name: user.name },
      'delete_staff',
      null,
      { id, name: targetName }
    );
    return NextResponse.json({ message: 'Request submitted for approval' }, { status: 202 });
  }

  await fsDelete('staff_accounts', id);
  return NextResponse.json({ ok: true });
}
