import { getAdminDb } from '@/lib/server/firebase-admin';
import { getAllAgentStats } from '@/lib/agents';
import type { AgentStats, TrainingPeriod } from '@/types';

export interface BatchHistorySnapshot {
  id: string;              // The trainingPeriodId
  periodName: string;
  completedAt: string;
  trainerName: string;
  trainerId: string;
  agentStats: AgentStats[]; // The "frozen" stats for every agent in the batch
  weights: any;
  summary: {
    totalAgents: number;
    passCount: number;
    avgScore: number;
  };
}

export const HistoryService = {
  /**
   * Create a permanent, static snapshot of a training batch's results.
   */
  async archiveBatch(periodId: string): Promise<BatchHistorySnapshot> {
    const db = getAdminDb();
    
    // 1. Get the period details
    const periodDoc = await db.collection('training_periods').doc(periodId).get();
    if (!periodDoc.exists) throw new Error('Training period not found');
    const period = periodDoc.data() as TrainingPeriod;

    // 2. Get the current stats for all agents in THIS batch
    // This uses the targetPeriodId filter to ignore results from other batches
    const stats = await getAllAgentStats(periodId);

    // 3. Calculate batch summary
    const totalAgents = stats.length;
    const passCount = stats.filter(s => s.overallScore >= 70).length; // Default threshold
    const avgScore = totalAgents > 0 
      ? Math.round(stats.reduce((acc, s) => acc + s.overallScore, 0) / totalAgents)
      : 0;

    const snapshot: BatchHistorySnapshot = {
      id: periodId,
      periodName: period.name,
      completedAt: new Date().toISOString(),
      trainerName: period.trainerName,
      trainerId: period.trainerId,
      agentStats: stats,
      weights: period.scoringWeights,
      summary: {
        totalAgents,
        passCount,
        avgScore
      }
    };

    // 4. Persist to history collection
    await db.collection('training_history').doc(periodId).set(snapshot);

    console.log(`[HistoryService] Archived batch ${periodId} with ${totalAgents} agents.`);
    
    return snapshot;
  },

  /**
   * Retrieve a stored snapshot if it exists.
   */
  async getBatchSnapshot(periodId: string): Promise<BatchHistorySnapshot | null> {
    const db = getAdminDb();
    const doc = await db.collection('training_history').doc(periodId).get();
    return doc.exists ? (doc.data() as BatchHistorySnapshot) : null;
  }
};
