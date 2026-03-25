import { NextRequest, NextResponse } from 'next/server';
import { requireAdminOrIT, requireAdminManagerOrTrainer } from '@/lib/session';
import { fsUpdate, fsDelete, fsGet } from '@/lib/firestore-db';
import { createApprovalRequest } from '@/lib/services/approval-service';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let user;
  try { user = await requireAdminManagerOrTrainer(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  
  const { id } = await params;
  const body = await req.json();
  const update: Record<string, unknown> = {};

  const target = await fsGet<any>('agents', id);
  const targetName = target?.name || id;

  // IT role requires approval for everything in agent management
  if (user.role === 'it') {
    const actionType = (typeof body.active === 'boolean') ? 'toggle_agent' : 'edit_agent';
    await createApprovalRequest(
      { uid: user.uid, name: user.name },
      actionType,
      body,
      { id, name: targetName }
    );
    return NextResponse.json({ message: 'Request submitted for approval' }, { status: 202 });
  }

  if (typeof body.active === 'boolean') {
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can change agent status' }, { status: 403 });
    }
    update.active = body.active;
  }
  if (typeof body.name === 'string') {
    if (!body.name.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 });
    update.name = body.name.trim();
  }
  if (typeof body.stageName === 'string') update.stageName = body.stageName.trim();
  await fsUpdate('agents', id, update);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let user;
  try { user = await requireAdminOrIT(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const { id } = await params;

  const target = await fsGet<any>('agents', id);
  const targetName = target?.name || id;

  // IT role requires approval
  if (user.role === 'it') {
    await createApprovalRequest(
      { uid: user.uid, name: user.name },
      'delete_agent',
      null,
      { id, name: targetName }
    );
    return NextResponse.json({ message: 'Request submitted for approval' }, { status: 202 });
  }

  await fsDelete('agents', id);
  return NextResponse.json({ ok: true });
}
