import { NextRequest, NextResponse } from 'next/server';
import { withApiAuth, apiError } from '@/lib/api-utils';
import { fsGetAll, fsAdd, fsUpdateMany } from '@/lib/server/db';
import { createApprovalRequest } from '@/lib/services/approval-service';
import type { StaffAccount } from '@/types';

// GET /api/admin/staff — list all staff (passwords included for admin/it editing)
export const GET = withApiAuth(async () => {
  const staff = await fsGetAll<StaffAccount>('staff_accounts');
  
  // Sort by sortOrder (asc), then by createdAt (desc) if sortOrder is missing
  staff.sort((a, b) => {
    if (a.sortOrder !== undefined && b.sortOrder !== undefined) {
      return a.sortOrder - b.sortOrder;
    }
    if (a.sortOrder !== undefined) return -1;
    if (b.sortOrder !== undefined) return 1;
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  // Sanitize: remove passwords before sending to client
  const sanitizedStaff = staff.map(s => {
    const { password, ...rest } = s;
    return rest;
  });

  return NextResponse.json({ staff: sanitizedStaff });
}, ['admin', 'manager']);

export const POST = withApiAuth(async (req, _, user) => {
  let body;
  try {
    body = await req.json();
  } catch {
    return apiError('Invalid JSON body', 400);
  }

  const { username, password, name, role } = body;
  if (!username?.trim() || !password?.trim() || !name?.trim()) {
    return apiError('username, password, and name are required', 400);
  }
  if (!['admin', 'manager', 'it', 'evaluator', 'trainer', 'hr'].includes(role)) {
    return apiError('role must be admin, manager, hr, it, evaluator, or trainer', 400);
  }

  // Check for duplicate username and find max sortOrder
  const existing = await fsGetAll<StaffAccount>('staff_accounts');
  if (existing.some(s => s.username === username.trim())) {
    return apiError('Username already taken', 409);
  }

  const maxSortOrder = existing.reduce((max, s) => Math.max(max, s.sortOrder ?? 0), 0);

  // IT and Manager roles require approval
  if (user.role === 'it' || user.role === 'manager') {
    await createApprovalRequest(
      { uid: user.uid, name: user.name },
      'create_staff',
      { username, password, name, role, active: true, createdAt: new Date().toISOString(), sortOrder: maxSortOrder + 1 },
      { name: `${name} (${username})` }
    );
    return NextResponse.json({ message: 'Request submitted for approval' }, { status: 202 });
  }

  const account = await fsAdd('staff_accounts', {
    username: username.trim(),
    password: password.trim(),
    name: name.trim(),
    role,
    active: true,
    createdAt: new Date().toISOString(),
    sortOrder: maxSortOrder + 1,
  });
  return NextResponse.json(account, { status: 201 });
}, ['admin', 'manager']);

// PATCH /api/admin/staff — bulk update sort order
export const PATCH = withApiAuth(async (req, _, user) => {
  // IT and Manager roles cannot bulk re-order (for simplicity, or requires approval)
  if (user.role === 'it' || user.role === 'manager') {
    return apiError('This role cannot bulk re-order', 403);
  }

  const { order } = await req.json(); // Array of { id: string, sortOrder: number }
  if (!Array.isArray(order)) {
    return apiError('Invalid order format', 400);
  }

  const updates = order.map(item => ({
    id: item.id,
    patch: { sortOrder: item.sortOrder }
  }));

  await fsUpdateMany<StaffAccount>('staff_accounts', updates);
  return NextResponse.json({ ok: true });
}, ['admin', 'manager']);
