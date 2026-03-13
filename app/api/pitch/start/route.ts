import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { level } = await req.json();

    const adminDb = getAdminDb();
    const sessionRef = await adminDb.collection('pitch_sessions').add({
      userId: user.uid,
      level,
      messages: [],
      outcome: 'ongoing',
      timestamp: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ sessionId: sessionRef.id });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
