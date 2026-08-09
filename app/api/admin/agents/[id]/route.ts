import { NextRequest, NextResponse } from 'next/server';
import { withApiAuth, apiError } from '@/lib/api-utils';
import { fsUpdate, fsDelete, fsGet } from '@/lib/server/db';
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

export const DELETE = withApiAuth(async (req, { params }, user) => {
  const { id } = await params;

  const target = await fsGet<any>('agents', id);
  const targetName = target?.name || id;
  const isGraduated = target?.completedAll === true || target?.status === 'graduated';
  const force = req.nextUrl?.searchParams?.get('force') === 'true';

  // IT and Manager roles require approval
  if (user.role === 'it' || user.role === 'manager') {
    await createApprovalRequest(
      { uid: user.uid, name: user.name },
      'delete_agent',
      { force, isGraduated },
      { id, name: targetName }
    );
    return NextResponse.json({ message: 'Request submitted for approval' }, { status: 202 });
  }

  // Soft-archive graduated agents by default to protect certificate & audit trail
  if (isGraduated && !force) {
    await fsUpdate('agents', id, {
      active: false,
      status: 'archived',
      archivedAt: new Date().toISOString(),
      archivedBy: user.name || user.uid,
    });
    return NextResponse.json({ 
      ok: true, 
      archived: true, 
      message: 'Graduated agent moved to Alumni Archive. Certificate verification remains intact.' 
    });
  }

  await fsDelete('agents', id);
  return NextResponse.json({ ok: true });
}, ['admin', 'it']);
