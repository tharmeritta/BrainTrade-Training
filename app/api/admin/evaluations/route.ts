import { NextResponse } from 'next/server';
import { requireAdminOrManager } from '@/lib/session';
import { getAdminDb } from '@/lib/firebase-admin';
import { fsGetAll } from '@/lib/firestore-db';
import type { AgentEvaluation } from '@/types';

export async function GET(req: Request) {
  try { await requireAdminOrManager(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

  const { searchParams } = new URL(req.url);
  const periodId = searchParams.get('periodId');

  try {
    let evals: AgentEvaluation[];
    
    if (periodId) {
      const db = getAdminDb();
      const snapshot = await db.collection('agent_evaluations')
        .where('trainingPeriodId', '==', periodId)
        .get();
      evals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AgentEvaluation));
    } else {
      evals = await fsGetAll<AgentEvaluation>('agent_evaluations');
    }

    // Safety check: filter out items without evaluatedAt and provide a stable sort
    const validEvals = evals.filter(e => e.evaluatedAt);
    validEvals.sort((a, b) => b.evaluatedAt.localeCompare(a.evaluatedAt));
    return NextResponse.json({ evaluations: validEvals });
  } catch (err: any) {
    console.error('Fetch evaluations error:', err);
    return NextResponse.json({ error: 'Failed to fetch evaluations', details: err.message }, { status: 500 });
  }
}
