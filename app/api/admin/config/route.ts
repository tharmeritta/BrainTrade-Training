import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/session';
import { getAdminDb } from '@/lib/firebase-admin';

export async function GET() {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

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
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

  try {
    const { id, data } = await req.json();
    if (!id || !data) return NextResponse.json({ error: 'ID and Data required' }, { status: 400 });

    const db = getAdminDb();
    await db.collection('module_config').doc(id).set({
      ...data,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Update config error:', err);
    return NextResponse.json({ error: 'Failed to update config', details: err.message }, { status: 500 });
  }
}
