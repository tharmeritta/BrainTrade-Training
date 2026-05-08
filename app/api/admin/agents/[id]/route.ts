import { NextRequest, NextResponse } from 'next/server';
import { withApiAuth, apiError } from '@/lib/api-utils';
import { fsUpdate, fsDelete, fsGet } from '@/lib/firestore-db';
import { createApprovalRequest } from '@/lib/services/approval-service';

export const PATCH = withApiAuth(async (req, { params }, user) => {
  const { id } = await params;
  const body = await req.json();
  const update: Record<string, unknown> = {};

  const target = await fsGet<any>('agents', id);
  const targetName = target?.name || id;

  // IT and Manager roles require approval for everything in agent management
  if (user.role === 'it' || user.role === 'manager') {
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
      return apiError('Only admins can change agent status', 403);
    }
    update.active = body.active;
  }
  if (typeof body.name === 'string') {
    if (!body.name.trim()) return apiError('Name required', 400);
    update.name = body.name.trim();
    update.normalizedName = body.name.trim().toLowerCase().replace(/\s+/g, ' ');
  }
  if (typeof body.stageName === 'string') update.stageName = body.stageName.trim();
  await fsUpdate('agents', id, update);
  return NextResponse.json({ ok: true });
}, ['admin', 'manager', 'it', 'trainer', 'hr']);

export const DELETE = withApiAuth(async (_req, { params }, user) => {
  const { id } = await params;

  const target = await fsGet<any>('agents', id);
  const targetName = target?.name || id;

  // IT and Manager roles require approval
  if (user.role === 'it' || user.role === 'manager') {
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
}, ['admin', 'it']);
