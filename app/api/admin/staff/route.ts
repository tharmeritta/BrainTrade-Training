import { NextRequest, NextResponse } from 'next/server';
import { requireAdminOrIT } from '@/lib/session';
import { fsGetAll, fsAdd, fsUpdateMany } from '@/lib/firestore-db';
import { createApprovalRequest } from '@/lib/services/approval-service';
import type { StaffAccount } from '@/types';

// GET /api/admin/staff — list all staff (passwords included for admin/it editing)
export async function GET() {
  try { 
    await requireAdminOrIT(); 
  } catch (err: any) { 
    console.warn('[GET /api/admin/staff] Auth failed:', err.message);
    return NextResponse.json({ error: 'Unauthorized', message: err.message }, { status: 401 }); 
  }

  try {
    console.log('[GET /api/admin/staff] Fetching staff_accounts...');
    const staff = await fsGetAll<StaffAccount>('staff_accounts');
    
    // Sort by sortOrder (asc), then by createdAt (desc) if sortOrder is missing
    staff.sort((a, b) => {
      if (a.sortOrder !== undefined && b.sortOrder !== undefined) {
        return a.sortOrder - b.sortOrder;
      }
      if (a.sortOrder !== undefined) return -1;
      if (b.sortOrder !== undefined) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    console.log(`[GET /api/admin/staff] Success: found ${staff.length} accounts`);
    return NextResponse.json({ staff });
  } catch (err: any) {
    console.error('[GET /api/admin/staff] CRITICAL ERROR:', err);
    return NextResponse.json({ 
      error: 'Database error', 
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let user;
  try { user = await requireAdminOrIT(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  
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
  if (!['admin', 'manager', 'it', 'evaluator', 'trainer'].includes(role)) {
    return NextResponse.json({ error: 'role must be admin, manager, it, evaluator, or trainer' }, { status: 400 });
  }

  try {
    // Check for duplicate username and find max sortOrder
    const existing = await fsGetAll<StaffAccount>('staff_accounts');
    if (existing.some(s => s.username === username.trim())) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
    }

    const maxSortOrder = existing.reduce((max, s) => Math.max(max, s.sortOrder ?? 0), 0);

    // IT role requires approval
    if (user.role === 'it') {
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
  } catch (err: any) {
    console.error('[POST /api/admin/staff] Firestore error:', err);
    return NextResponse.json({ error: 'Database error', details: err.message }, { status: 500 });
  }
}

// PATCH /api/admin/staff — bulk update sort order
export async function PATCH(req: NextRequest) {
  let user;
  try { user = await requireAdminOrIT(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  
  // IT role cannot bulk re-order (for simplicity, or requires approval)
  if (user.role === 'it') {
    return NextResponse.json({ error: 'IT role cannot bulk re-order' }, { status: 403 });
  }

  try {
    const { order } = await req.json(); // Array of { id: string, sortOrder: number }
    if (!Array.isArray(order)) {
      return NextResponse.json({ error: 'Invalid order format' }, { status: 400 });
    }

    const updates = order.map(item => ({
      id: item.id,
      patch: { sortOrder: item.sortOrder }
    }));

    await fsUpdateMany<StaffAccount>('staff_accounts', updates);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[PATCH /api/admin/staff] Bulk update error:', err);
    return NextResponse.json({ error: 'Database error', details: err.message }, { status: 500 });
  }
}
