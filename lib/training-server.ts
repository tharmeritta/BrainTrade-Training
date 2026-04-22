import { fsGetAll } from '@/lib/firestore-db';
import type { TrainingPeriod } from '@/types';

/**
 * getActiveTrainingPeriod: Find the currently active batch an agent belongs to.
 * This is server-side only as it uses firestore-db (admin SDK).
 */
export async function getActiveTrainingPeriod(agentId: string): Promise<TrainingPeriod | null> {
  const periods = await fsGetAll<TrainingPeriod>('training_periods');
  return periods.find(p => p.active && p.agentIds.includes(agentId)) || null;
}
