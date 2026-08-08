import { fsQuery } from '@/lib/server/db';
import type { TrainingPeriod } from '@/types';

/**
 * getActiveTrainingPeriod: Find the currently active batch an agent belongs to.
 * Server-side only (Admin SDK).
 * Optimized: Queries only active training periods instead of fetching all historical records.
 */
export async function getActiveTrainingPeriod(agentId: string): Promise<TrainingPeriod | null> {
  const periods = await fsQuery<TrainingPeriod>('training_periods', {
    where: [{ field: 'active', op: '==', value: true }]
  });
  return periods.find(p => p.agentIds && p.agentIds.includes(agentId)) || null;
}

