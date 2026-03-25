import { NextRequest, NextResponse } from 'next/server';
import { requireAdminOrIT } from '@/lib/session';
import { getAdminDb } from '@/lib/firebase-admin';
import { createApprovalRequest } from '@/lib/services/approval-service';

export async function GET() {
  try { await requireAdminOrIT(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

  try {
    const db = getAdminDb();
    const snapshot = await db.collection('module_config').get();
    const configs: Record<string, any> = {};
    snapshot.forEach(doc => {
      configs[doc.id] = doc.data();
    });
    return NextResponse.json({ configs });
  } catch (err: any) {
    console.error('Fetch config error:', err);
    return NextResponse.json({ error: 'Failed to fetch config', details: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  let user;
  try { user = await requireAdminOrIT(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

  try {
    const { id, data } = await req.json();
    if (!id || !data) return NextResponse.json({ error: 'ID and Data required' }, { status: 400 });

    // IT role requires approval
    if (user.role === 'it') {
      await createApprovalRequest(
        { uid: user.uid, name: user.name },
        'update_config',
        { key: id, payload: data },
        { id, name: `Config: ${id}` }
      );
      return NextResponse.json({ message: 'Request submitted for approval' }, { status: 202 });
    }

    const db = getAdminDb();
    await db.collection('module_config').doc(id).set({
      ...data,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Update config error:', err);
    return NextResponse.json({ error: 'Failed to update config', details: err.message }, { status: 500 });
  }
}
