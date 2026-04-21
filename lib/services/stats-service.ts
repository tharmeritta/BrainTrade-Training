import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { getAgentStats } from '@/lib/agents';

const GLOBAL_STATS_DOC = 'stats/global';

export interface GlobalStats {
  totalQuizScore: number;
  totalQuizAttempts: number;
  totalAiEvalScore: number;
  totalAiEvalAttempts: number;
  totalAgents: number;
  activeAgents: number;
  moduleStats: {
    [moduleId: string]: {
      sum: number;
      count: number;
      passCount: number;
    };
  };
}

export async function updateGlobalQuizStats(moduleId: string, score: number, passed: boolean) {
  const db = getAdminDb();
  const docRef = db.doc(GLOBAL_STATS_DOC);
  
  await docRef.set({
    totalQuizScore: FieldValue.increment(score),
    totalQuizAttempts: FieldValue.increment(1),
    [`moduleStats.${moduleId}.sum`]: FieldValue.increment(score),
    [`moduleStats.${moduleId}.count`]: FieldValue.increment(1),
    [`moduleStats.${moduleId}.passCount`]: FieldValue.increment(passed ? 1 : 0),
  }, { merge: true });
}

export async function updateGlobalAiEvalStats(score: number, passed: boolean) {
  const db = getAdminDb();
  const docRef = db.doc(GLOBAL_STATS_DOC);
  
  await docRef.set({
    totalAiEvalScore: FieldValue.increment(score),
    totalAiEvalAttempts: FieldValue.increment(1),
    [`moduleStats.ai-eval.sum`]: FieldValue.increment(score),
    [`moduleStats.ai-eval.count`]: FieldValue.increment(1),
    [`moduleStats.ai-eval.passCount`]: FieldValue.increment(passed ? 1 : 0),
  }, { merge: true });
}

export async function updateGlobalLearningStats(moduleId: string) {
  const db = getAdminDb();
  const docRef = db.doc(GLOBAL_STATS_DOC);
  
  await docRef.set({
    [`moduleStats.learn.count`]: FieldValue.increment(1),
    [`moduleStats.learn.sum`]: FieldValue.increment(100),
    [`moduleStats.learn.passCount`]: FieldValue.increment(1),
  }, { merge: true });
}

export async function updateGlobalAgentCounts(totalDelta: number, activeDelta: number) {
  const db = getAdminDb();
  const docRef = db.doc(GLOBAL_STATS_DOC);
  await docRef.set({
    totalAgents: FieldValue.increment(totalDelta),
    activeAgents: FieldValue.increment(activeDelta),
  }, { merge: true });
}

export async function updateAgentOverallScore(agentId: string, agentName: string) {
  const stats = await getAgentStats(agentId, agentName);
  const db = getAdminDb();
  await db.collection('agents').doc(agentId).update({
    overallScore: stats.overallScore,
    badge: stats.badge,
    lastActive: stats.lastActive
  });
}

export async function getGlobalStats(): Promise<GlobalStats | null> {
  const db = getAdminDb();
  const snap = await db.doc(GLOBAL_STATS_DOC).get();
  return snap.exists ? (snap.data() as GlobalStats) : null;
}
