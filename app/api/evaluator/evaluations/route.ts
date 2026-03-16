import { NextResponse } from 'next/server';
import { getServerUser } from '@/lib/session';
import { gcsGetAll, gcsAdd } from '@/lib/gcs';
import type { AgentEvaluation } from '@/types';

export async function GET(req: Request) {
  const user = await getServerUser();
  if (!user || !['evaluator', 'admin', 'manager'].includes(user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const agentId      = searchParams.get('agentId');
  const evaluatorId  = searchParams.get('evaluatorId');

  const evals = await gcsGetAll<AgentEvaluation>('agent_evaluations');
  let filtered = evals;
  if (agentId)     filtered = filtered.filter(e => e.agentId === agentId);
  if (evaluatorId) filtered = filtered.filter(e => e.evaluatorId === evaluatorId);

  filtered.sort((a, b) => b.evaluatedAt.localeCompare(a.evaluatedAt));
  return NextResponse.json({ evaluations: filtered });
}

export async function POST(req: Request) {
  const user = await getServerUser();
  if (!user || !['evaluator', 'admin', 'manager'].includes(user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const record = await gcsAdd<Omit<AgentEvaluation, 'id'>>('agent_evaluations', {
    ...body,
    evaluatedAt: new Date().toISOString(),
  });
  return NextResponse.json({ evaluation: record });
}
