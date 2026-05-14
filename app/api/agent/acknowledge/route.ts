import { NextResponse } from 'next/server';
import { fsGet, fsUpdate } from '@/lib/server/db';
import { updateAgentOverallScore } from '@/lib/services/stats-service';
import { AuditService } from '@/lib/services/audit-service';
import { BatchService } from '@/lib/services/batch-service';

/**
 * POST /api/agent/acknowledge
 * Body: { agentId: string, agentName: string }
 * 
 * Used by agents to acknowledge their graduation/completion.
 * This is the final step before a batch can be archived.
 */
export async function POST(req: Request) {
  try {
    const { agentId, agentName } = await req.json();

    if (!agentId) {
      return NextResponse.json({ error: 'Missing agentId' }, { status: 400 });
    }

    const now = new Date().toISOString();
    
    // 1. Update progress doc
    await fsUpdate('agent_progress', agentId, {
      acknowledged: true,
      acknowledgedAt: now,
      updatedAt: now
    });

    // 2. Audit log
    await AuditService.log({
      userId: agentId,
      userName: agentName || 'Agent',
      userRole: 'agent',
      action: 'graduation_acknowledged',
      targetId: agentId,
      targetName: agentName,
      details: { timestamp: now }
    });

    // 3. Recalculate stats to ensure projection is updated
    await updateAgentOverallScore(agentId, agentName || 'Agent');

    // 4. Check if the entire batch is now complete (all evaluated AND all acknowledged)
    const activePeriod = await BatchService.findActivePeriodForAgent(agentId);
    if (activePeriod) {
      await BatchService.checkBatchCompletion(activePeriod.id);
    }

    return NextResponse.json({ success: true, acknowledgedAt: now });
  } catch (err: any) {
    console.error('[Acknowledge API] Error:', err);
    return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
  }
}
