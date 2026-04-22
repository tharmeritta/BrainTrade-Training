import { NextResponse } from 'next/server';
import { getServerUser } from '@/lib/session';
import { fsQuery, fsAdd } from '@/lib/firestore-db';
import { BatchService } from '@/lib/services/batch-service';
import { updateAgentOverallScore } from '@/lib/services/stats-service';
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
  const agentId = body.agentId;

  // Find active training period for this agent
  const activePeriod = await BatchService.findActivePeriodForAgent(agentId);
  const trainingPeriodId = activePeriod?.id;

  const record = await fsAdd<Omit<AgentEvaluation, 'id'>>('agent_evaluations', {
    ...body,
    trainingPeriodId, // Link to the batch
    evaluatedAt: new Date().toISOString(),
  });

  // If we found a period, check if it's now complete
  if (trainingPeriodId) {
    await BatchService.checkBatchCompletion(trainingPeriodId);
  }

  // Update agent overall score and persist stats
  await updateAgentOverallScore(agentId, body.agentName || 'Agent', {
    id: user.uid,
    name: user.name,
    role: user.role
  });

  return NextResponse.json({ evaluation: record });
}
