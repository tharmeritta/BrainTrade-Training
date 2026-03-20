import { NextResponse } from 'next/server';
import { requireAdminOrManager } from '@/lib/session';
import { fsGetAll } from '@/lib/firestore-db';
import type { AgentEvaluation } from '@/types';

export async function GET() {
  try { await requireAdminOrManager(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

  try {
    const evals = await fsGetAll<AgentEvaluation>('agent_evaluations');
    // Safety check: filter out items without evaluatedAt and provide a stable sort
    const validEvals = evals.filter(e => e.evaluatedAt);
    validEvals.sort((a, b) => b.evaluatedAt.localeCompare(a.evaluatedAt));
    return NextResponse.json({ evaluations: validEvals });
  } catch (err: any) {
    console.error('Fetch evaluations error:', err);
    return NextResponse.json({ error: 'Failed to fetch evaluations', details: err.message }, { status: 500 });
  }
}
