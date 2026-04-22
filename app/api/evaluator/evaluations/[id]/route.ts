import { NextResponse } from 'next/server';
import { getServerUser } from '@/lib/session';
import { fsUpdate, fsGet } from '@/lib/firestore-db';
import { BatchService } from '@/lib/services/batch-service';
import { updateAgentOverallScore } from '@/lib/services/stats-service';
import type { AgentEvaluation } from '@/types';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getServerUser();
  if (!user || !['evaluator', 'admin', 'manager'].includes(user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  
  // Get existing to find trainingPeriodId
  const existing = await fsGet<AgentEvaluation>('agent_evaluations', id);
  
  await fsUpdate('agent_evaluations', id, { ...body, updatedAt: new Date().toISOString() });
  
  const agentId = body.agentId || existing?.agentId;

  if (existing?.trainingPeriodId) {
    await BatchService.checkBatchCompletion(existing.trainingPeriodId);
  } else if (agentId) {
    // If it didn't have one, maybe it should now?
    const activePeriod = await BatchService.findActivePeriodForAgent(agentId);
    if (activePeriod) {
      await fsUpdate('agent_evaluations', id, { trainingPeriodId: activePeriod.id });
      await BatchService.checkBatchCompletion(activePeriod.id);
    }
  }

  // Update agent overall score and persist stats
  if (agentId) {
    await updateAgentOverallScore(agentId, body.agentName || existing?.agentName || 'Agent', {
      id: user.uid,
      name: user.name,
      role: user.role
    });
  }

  return NextResponse.json({ ok: true });
}
