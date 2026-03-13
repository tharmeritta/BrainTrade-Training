import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { moduleId, score, totalQuestions, answers } = await req.json();

    const adminDb = getAdminDb();
    const resultRef = await adminDb.collection('quiz_results').add({
      userId: user.uid,
      moduleId,
      score,
      totalQuestions,
      answers,
      timestamp: FieldValue.serverTimestamp(),
    });

    const passed = score / totalQuestions >= 0.7;

    if (passed) {
      await adminDb.collection('progress').doc(user.uid).set(
        {
          [`modules.${moduleId}`]: {
            completed: true,
            score,
            completedAt: FieldValue.serverTimestamp(),
          },
        },
        { merge: true }
      );
    }

    return NextResponse.json({ resultId: resultRef.id, passed, score, totalQuestions });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
