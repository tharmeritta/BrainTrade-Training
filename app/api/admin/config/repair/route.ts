import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/session/server';
import { recalculateGlobalStats, updateAgentOverallScore } from '@/lib/services/stats-service';
import { AuditService } from '@/lib/services/audit-service';
import { BatchService } from '@/lib/services/batch-service';
import { fsGetAll } from '@/lib/server/db';
import { Agent, TrainingPeriod } from '@/types';

/**
 * POST: Trigger a system repair/recalculation
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, agentId } = await req.json();

    if (type === 'global') {
      console.log('[Repair] Starting global stats recalculation...');
      await recalculateGlobalStats();
      
      await AuditService.log({
        userId: user.uid,
        userName: user.name,
        userRole: user.role,
        action: 'system_repair',
        details: { type: 'global_stats' }
      });

      return NextResponse.json({ success: true, message: 'Global stats recalculated' });
    } 

    if (type === 'batches') {
      console.log('[Repair] Starting batch synchronization...');
      const periods = await fsGetAll<TrainingPeriod>('training_periods');
      const activePeriods = periods.filter(p => p.active);
      let fixedCount = 0;

      for (const p of activePeriods) {
        const wasFinalized = await BatchService.checkBatchCompletion(p.id);
        if (wasFinalized) fixedCount++;
      }

      // Also trigger a deep link sync
      const linkedCount = await BatchService.relinkOrphanedEvaluations();

      await AuditService.log({
        userId: user.uid,
        userName: user.name,
        userRole: user.role,
        action: 'system_repair',
        details: { type: 'batch_sync', checked: activePeriods.length, fixed: fixedCount, linked: linkedCount }
      });

      return NextResponse.json({ 
        success: true, 
        message: `Checked ${activePeriods.length} active batches. Finalized ${fixedCount}. Relinked ${linkedCount} evaluations.` 
      });
    }

    if (type === 'agent' && agentId) {
      console.log(`[Repair] Starting repair for agent: ${agentId}`);
      await updateAgentOverallScore(agentId, 'Agent', {
        id: user.uid,
        name: user.name,
        role: user.role
      });

      await AuditService.log({
        userId: user.uid,
        userName: user.name,
        userRole: user.role,
        action: 'system_repair',
        targetId: agentId,
        details: { type: 'single_agent' }
      });

      return NextResponse.json({ success: true, message: 'Agent stats recalculated' });
    }

    if (type === 'all_agents') {
      console.log('[Repair] Starting repair for ALL agents...');
      const agents = await fsGetAll<Agent>('agents');
      const activeAgents = agents.filter(a => a.active);
      
      // Run in small batches to avoid hitting timeouts/limits
      for (const a of activeAgents) {
        await updateAgentOverallScore(a.id, a.name, {
        id: user.uid,
        name: user.name,
        role: user.role
      });
      }

      await AuditService.log({
        userId: user.uid,
        userName: user.name,
        userRole: user.role,
        action: 'system_repair',
        details: { type: 'all_agents', count: activeAgents.length }
      });

      return NextResponse.json({ success: true, message: `Recalculated ${activeAgents.length} agents` });
    }

    return NextResponse.json({ error: 'Invalid repair type' }, { status: 400 });

  } catch (error: any) {
    console.error('Repair error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
