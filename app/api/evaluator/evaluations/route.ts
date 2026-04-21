import { NextResponse } from 'next/server';
import { getServerUser } from '@/lib/session';
import { fsQuery, fsAdd } from '@/lib/firestore-db';
import type { AgentEvaluation } from '@/types';

export async function GET(req: Request) {
  const user = await getServerUser();
  if (!user || !['evaluator', 'admin', 'manager'].includes(user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const agentId      = searchParams.get('agentId');
  const evaluatorId  = searchParams.get('evaluatorId');

  const where: any[] = [];
  if (agentId)     where.push({ field: 'agentId', op: '==', value: agentId });
  if (evaluatorId) where.push({ field: 'evaluatorId', op: '==', value: evaluatorId });

  const evals = await fsQuery<AgentEvaluation>('agent_evaluations', {
    where,
    orderBy: { field: 'evaluatedAt', direction: 'desc' }
  });

  return NextResponse.json({ evaluations: evals });
}

export async function POST(req: Request) {
  const user = await getServerUser();
  if (!user || !['evaluator', 'admin', 'manager'].includes(user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const record = await fsAdd<Omit<AgentEvaluation, 'id'>>('agent_evaluations', {
    ...body,
    evaluatedAt: new Date().toISOString(),
  });
  return NextResponse.json({ evaluation: record });
}
