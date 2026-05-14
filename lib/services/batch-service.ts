import { fsGet, fsUpdate, fsQuery, fsGetAll, fsUpdateMany } from '@/lib/server/db';
import { getAdminDb } from '@/lib/server/firebase-admin';
import { HistoryService } from './history-service';
import type { TrainingPeriod, AgentEvaluation, Agent } from '@/types';

export const BatchService = {
  /**
   * Find the active training period for an agent.
   */
  async findActivePeriodForAgent(agentId: string): Promise<TrainingPeriod | null> {
    const periods = await fsGetAll<TrainingPeriod>('training_periods');
    return periods.find(p => p.active && p.agentIds.includes(agentId)) || null;
  },

  /**
   * Deeply synchronize evaluations that were recorded without a trainingPeriodId.
   */
  async relinkOrphanedEvaluations(): Promise<number> {
    const db = getAdminDb();
    const [evals, periods] = await Promise.all([
      fsGetAll<AgentEvaluation>('agent_evaluations'),
      fsGetAll<TrainingPeriod>('training_periods')
    ]);

    // Find evals missing a batch link
    const orphans = evals.filter(e => !e.trainingPeriodId);
    if (orphans.length === 0) return 0;

    let fixedCount = 0;
    const batch = db.batch();

    for (const ev of orphans) {
      // Find a period where:
      // 1. Agent was part of the batch
      // 2. Evaluation timestamp is between period start and period completion
      const evDate = new Date(ev.evaluatedAt).getTime();
      
      const matchingPeriod = periods.find(p => {
        const isAgentInBatch = p.agentIds?.includes(ev.agentId);
        if (!isAgentInBatch) return false;

        const startTime = new Date(p.startDate).getTime();
        const endTime = p.completedAt ? new Date(p.completedAt).getTime() : Infinity;
        
        return evDate >= startTime && evDate <= endTime;
      });

      if (matchingPeriod) {
        const ref = db.collection('agent_evaluations').doc(ev.id);
        batch.update(ref, { trainingPeriodId: matchingPeriod.id });
        fixedCount++;
      }
    }

    if (fixedCount > 0) {
      await batch.commit();
    }

    return fixedCount;
  },

  /**
   * Check if all agents in a training period have been evaluated.
   * If yes, finalize the batch and archive it.
   */
  async checkBatchCompletion(periodId: string): Promise<boolean> {
    const db = getAdminDb();
    const periodRef = db.collection('training_periods').doc(periodId);
    const periodDoc = await periodRef.get();
    
    if (!periodDoc.exists || !periodDoc.data()?.active) return false;
    const period = periodDoc.data() as TrainingPeriod;

    const agentIds = period.agentIds || [];
    if (agentIds.length === 0) return false;

    // Check how many agents in this batch have a finalized evaluation
    const evaluationSnap = await db.collection('agent_evaluations')
      .where('trainingPeriodId', '==', periodId)
      .get();
    
    const evaluatedAgentIds = new Set(evaluationSnap.docs.map(doc => doc.data().agentId));

    // Check how many agents have acknowledged (from agent_progress)
    const progressSnap = await db.collection('agent_progress')
      .where('acknowledged', '==', true)
      .get();
    
    const acknowledgedAgentIds = new Set(progressSnap.docs.map(doc => doc.id));

    // A batch is complete if EVERY agent has:
    // 1. At least one evaluation record in this period
    // 2. Acknowledged their graduation
    const isComplete = agentIds.every(id => 
      evaluatedAgentIds.has(id) && acknowledgedAgentIds.has(id)
    );

    if (isComplete) {
      console.log(`[BatchService] Finalizing training period: ${period.name} (${periodId})`);
      
      const now = new Date().toISOString();
      
      // 1. Create a frozen snapshot in history
      await HistoryService.archiveBatch(periodId);

      // 2. Mark period as inactive
      await periodRef.update({
        active: false,
        completedAt: now,
        updatedAt: now
      });
      
      return true;
    }

    return false;
  }
};
