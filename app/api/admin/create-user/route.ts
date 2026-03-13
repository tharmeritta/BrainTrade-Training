import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/session';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const { email, password, name } = await req.json();

    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();

    const userRecord = await adminAuth.createUser({ email, password, displayName: name });
    await adminAuth.setCustomUserClaims(userRecord.uid, { role: 'agent' });

    await adminDb.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      name,
      email,
      role: 'agent',
      createdBy: admin.uid,
      active: true,
      createdAt: FieldValue.serverTimestamp(),
    });

    await adminDb.collection('progress').doc(userRecord.uid).set({
      userId: userRecord.uid,
      modules: {},
      pitchLevel: 1,
      pitchSessionCount: 0,
      certEarned: false,
    });

    return NextResponse.json({ uid: userRecord.uid });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
