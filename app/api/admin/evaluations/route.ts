import { NextResponse } from 'next/server';
import { requireAdminOrManager } from '@/lib/session';
import { fsGetAll } from '@/lib/firestore-db';
import type { AgentEvaluation } from '@/types';

export async function GET() {
  try { await requireAdminOrManager(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

  const evals = await fsGetAll<AgentEvaluation>('agent_evaluations');
  evals.sort((a, b) => b.evaluatedAt.localeCompare(a.evaluatedAt));
  return NextResponse.json({ evaluations: evals });
}
