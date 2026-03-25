import { NextRequest, NextResponse } from 'next/server';
import { requireAdminOrIT } from '@/lib/session';
import { fsGetAll, fsAdd } from '@/lib/firestore-db';
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

  // IT role requires approval
  if (user.role === 'it') {
    await createApprovalRequest(
      { uid: user.uid, name: user.name },
      'create_staff',
      { username, password, name, role, active: true, createdAt: new Date().toISOString() },
      { name: `${name} (${username})` }
    );
    return NextResponse.json({ message: 'Request submitted for approval' }, { status: 202 });
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
