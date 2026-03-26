import { NextRequest, NextResponse } from 'next/server';
import { requireAdminOrIT, requireAdmin } from '@/lib/session';
import { fsGetAll } from '@/lib/firestore-db';
import { resolveApprovalRequest } from '@/lib/services/approval-service';
import type { ApprovalRequest } from '@/types';

// GET /api/admin/approvals — list all approval requests
export async function GET() {
  try { await requireAdminOrIT(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

  try {
    const requests = await fsGetAll<ApprovalRequest>('approval_requests');
    // Sort by newest first
    requests.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return NextResponse.json({ requests });
  } catch (err: any) {
    console.error('Fetch approvals error:', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

// POST /api/admin/approvals — approve or reject a request
export async function POST(req: NextRequest) {
  let user;
  try { user = await requireAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

  const body = await req.json();
  const { requestId, status, rejectionReason } = body;

  if (!requestId || !['approved', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
  }

  try {
    const resolved = await resolveApprovalRequest(
      requestId,
      { uid: user.uid, name: user.name },
      status,
      rejectionReason
    );
    return NextResponse.json({ success: true, request: resolved });
  } catch (err: any) {
    console.error('Resolve approval error:', err);
    return NextResponse.json({ error: err.message || 'Failed to resolve request' }, { status: 500 });
  }
}
