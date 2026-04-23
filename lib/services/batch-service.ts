import { fsGet, fsUpdate, fsQuery, fsGetAll, fsUpdateMany } from '@/lib/firestore-db';
import { getAdminDb } from '@/lib/firebase-admin';
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
   * Check if all agents in a training period have graduated.
   * If yes, finalize the batch.
   */
  async checkBatchCompletion(periodId: string): Promise<boolean> {
    const db = getAdminDb();
    const periodRef = db.collection('training_periods').doc(periodId);
    const periodDoc = await periodRef.get();
    
    if (!periodDoc.exists || !periodDoc.data()?.active) return false;
    const period = periodDoc.data() as TrainingPeriod;

    // Get all agents in this batch to check their graduation status
    const agentIds = period.agentIds || [];
    if (agentIds.length === 0) return false;

    // Fetch agents in chunks of 30 (Firestore in limit)
    const graduatedStatuses: boolean[] = [];
    for (let i = 0; i < agentIds.length; i += 30) {
      const chunk = agentIds.slice(i, i + 30);
      const snap = await db.collection('agents').where('__name__', 'in', chunk).get();
      snap.docs.forEach(doc => {
        graduatedStatuses.push(!!doc.data().graduated);
      });
    }

    // Check if every agent in the batch is graduated
    const isComplete = graduatedStatuses.length === agentIds.length && graduatedStatuses.every(g => g === true);

    if (isComplete) {
      console.log(`[BatchService] Finalizing training period: ${period.name} (${periodId})`);
      
      const now = new Date().toISOString();
      
      // Mark period as inactive
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
