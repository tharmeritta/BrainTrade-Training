import { fsGet, fsUpdate, fsQuery, fsGetAll, fsUpdateMany } from '@/lib/firestore-db';
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
   * Check if all agents in a training period have been evaluated.
   * If yes, finalize the batch.
   */
  async checkBatchCompletion(periodId: string): Promise<boolean> {
    const period = await fsGet<TrainingPeriod>('training_periods', periodId);
    if (!period || !period.active) return false;

    // Get all evaluations for this specific batch
    const evaluations = await fsQuery<AgentEvaluation>('agent_evaluations', {
      where: [{ field: 'trainingPeriodId', op: '==', value: periodId }]
    });

    // Unique agent IDs who have been evaluated in this batch
    const evaluatedAgentIds = new Set(evaluations.map(e => e.agentId));

    // Check if every agent in the batch has at least one evaluation
    const isComplete = period.agentIds.every(id => evaluatedAgentIds.has(id));

    if (isComplete) {
      console.log(`[BatchService] Finalizing training period: ${period.name} (${periodId})`);
      
      const now = new Date().toISOString();
      
      // 1. Mark period as inactive
      await fsUpdate('training_periods', periodId, {
        active: false,
        completedAt: now,
        updatedAt: now
      });

      // 2. Mark all agents in this batch as graduated
      const agentUpdates = period.agentIds.map(id => ({
        id,
        patch: {
          graduated: true,
          graduatedAt: now
        } as Partial<Agent>
      }));

      await fsUpdateMany('agents', agentUpdates);
      
      return true;
    }

    return false;
  }
};
