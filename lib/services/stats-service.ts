import { fsUpdate, fsGet, fsSet, fsIncrement, fsGetAll } from '@/lib/server/db';
import { getAgentStats, getAllAgentStats } from '@/lib/agents';
import { TRAINING_REGISTRY } from '@/lib/registry';
import { getCompletionStatus } from '@/lib/completion';
import { AuditService } from './audit-service';
import { AgentStats } from '@/types';
import { getAdminDb } from '@/lib/server/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const GLOBAL_STATS_DOC = 'stats/global';

export interface GlobalStats {
  totalQuizScore: number;
  totalQuizAttempts: number;
  totalAiEvalScore: number;
  totalAiEvalAttempts: number;
  totalAgents: number;
  activeAgents: number;
  updatedAt: string;
  moduleStats: {
    [moduleId: string]: {
      sum: number;
      count: number;
      passCount: number;
    };
  };
}

/**
 * Incremental update for Quiz stats
 */
export async function updateGlobalQuizStats(moduleId: string, score: number, passed: boolean) {
  const db = getAdminDb();
  const docRef = db.doc(GLOBAL_STATS_DOC);
  
  await docRef.set({
    totalQuizScore: FieldValue.increment(score),
    totalQuizAttempts: FieldValue.increment(1),
    [`moduleStats.${moduleId}.sum`]: FieldValue.increment(score),
    [`moduleStats.${moduleId}.count`]: FieldValue.increment(1),
    [`moduleStats.${moduleId}.passCount`]: FieldValue.increment(passed ? 1 : 0),
    updatedAt: new Date().toISOString()
  }, { merge: true });
}

/**
 * Incremental update for AI Eval stats
 */
export async function updateGlobalAiEvalStats(score: number, passed: boolean) {
  const db = getAdminDb();
  const docRef = db.doc(GLOBAL_STATS_DOC);
  
  await docRef.set({
    totalAiEvalScore: FieldValue.increment(score),
    totalAiEvalAttempts: FieldValue.increment(1),
    [`moduleStats.ai-eval.sum`]: FieldValue.increment(score),
    [`moduleStats.ai-eval.count`]: FieldValue.increment(1),
    [`moduleStats.ai-eval.passCount`]: FieldValue.increment(passed ? 1 : 0),
    updatedAt: new Date().toISOString()
  }, { merge: true });
}

/**
 * Incremental update for Learning stats
 */
export async function updateGlobalLearningStats(moduleId: string) {
  const db = getAdminDb();
  const docRef = db.doc(GLOBAL_STATS_DOC);
  
  await docRef.set({
    [`moduleStats.learn.count`]: FieldValue.increment(1),
    [`moduleStats.learn.sum`]: FieldValue.increment(100),
    [`moduleStats.learn.passCount`]: FieldValue.increment(1),
    updatedAt: new Date().toISOString()
  }, { merge: true });
}

/**
 * Incremental update for Agent counts
 */
export async function updateGlobalAgentCounts(totalDelta: number, activeDelta: number) {
  const db = getAdminDb();
  const docRef = db.doc(GLOBAL_STATS_DOC);
  await docRef.set({
    totalAgents: FieldValue.increment(totalDelta),
    activeAgents: FieldValue.increment(activeDelta),
    updatedAt: new Date().toISOString()
  }, { merge: true });
}

/**
 * Recalculate everything for a specific agent and persist to their document (Projection)
 * We keep essential sortable fields in the main doc, and heavy JSON in a sub-collection.
 */
export async function updateAgentOverallScore(
  agentId: string, 
  agentName: string,
  actingUser?: { id: string; name: string; role: string }
) {
  const db = getAdminDb();

  // Fetch required components for dynamic graduation check
  const [quizzesSnap, scenariosSnap] = await Promise.all([
    db.collection('module_config').doc('quizzes').get(),
    db.collection('aiev_scenarios').where('isActive', '==', true).get()
  ]);

  const requiredQuizIds = quizzesSnap.exists ? quizzesSnap.data()?.required || [] : [];
  const requiredScenarioIds = scenariosSnap.docs
    .map(d => ({ id: d.id, ...d.data() } as any))
    .filter(s => s.required)
    .map(s => s.id);

  const config = { requiredQuizIds, requiredScenarioIds };

  // 0. Get current state to detect transition
  const oldProj = await db.collection('agents').doc(agentId).collection('projections').doc('stats').get();
  const oldStats = oldProj.exists ? oldProj.data() as AgentStats : null;
  const oldStatus = oldStats ? getCompletionStatus(oldStats, config).status : 'not-started';

  const stats = await getAgentStats(agentId, agentName);
  const newStatus = getCompletionStatus(stats, config).status;

  // 1. Update main doc with essential sortable/filterable fields
  const agentUpdate: any = {
    overallScore: stats.overallScore,
    badge: stats.badge,
    lastActive: stats.lastActive,
    updatedAt: new Date().toISOString()
  };

  // Auto-graduate if status is 'cleared'
  if (newStatus === 'cleared') {
    agentUpdate.graduated = true;
    agentUpdate.graduatedAt = agentUpdate.updatedAt;
  }

  await fsUpdate('agents', agentId, agentUpdate);

  // 2. Save heavy payload to sub-collection projection
  await db.collection('agents').doc(agentId).collection('projections').doc('stats').set({
    ...stats,
    updatedAt: new Date().toISOString()
  });

  // 3. Detect Graduation (specifically Needs Eval -> Cleared)
  if (oldStatus === 'needs-eval' && newStatus === 'cleared') {
    await AuditService.log({
      userId: actingUser?.id || 'system',
      userName: actingUser?.name || 'System',
      userRole: actingUser?.role || 'system',
      action: 'agent_graduation',
      targetId: agentId,
      targetName: agentName,
      details: {
        score: stats.overallScore,
        badge: stats.badge
      }
    });
  }
}

/**
 * HEAVY: Recalculate global stats by scanning all agent data.
 * Used for "Repair" or "Full Sync" scenarios.
 */
export async function recalculateGlobalStats() {
  const allStats = await getAllAgentStats();
  const activeAgents = allStats.filter(s => s.agent.active);
  const totalAgents = allStats.length;

  const newGlobal: GlobalStats = {
    totalQuizScore: 0,
    totalQuizAttempts: 0,
    totalAiEvalScore: 0,
    totalAiEvalAttempts: 0,
    totalAgents,
    activeAgents: activeAgents.length,
    updatedAt: new Date().toISOString(),
    moduleStats: {
      learn: { sum: 0, count: 0, passCount: 0 },
      'ai-eval': { sum: 0, count: 0, passCount: 0 }
    }
  };

  // Initialize all required quiz modules in moduleStats
  TRAINING_REGISTRY.quiz.required.forEach(m => {
    newGlobal.moduleStats[m] = { sum: 0, count: 0, passCount: 0 };
  });

  for (const s of allStats) {
    // Aggregating Learning
    const learnCount = s.learnedModules?.length || 0;
    newGlobal.moduleStats.learn.count += learnCount;
    newGlobal.moduleStats.learn.sum   += (learnCount * 100);
    if (learnCount >= TRAINING_REGISTRY.learn.minToUnlockNext) {
      newGlobal.moduleStats.learn.passCount += 1;
    }

    // Aggregating Quizzes
    for (const modId in s.quiz) {
      const q = s.quiz[modId];
      if (newGlobal.moduleStats[modId]) {
        newGlobal.moduleStats[modId].sum += q.bestScore;
        newGlobal.moduleStats[modId].count += q.attempts;
        if (q.passed) newGlobal.moduleStats[modId].passCount += 1;
        
        newGlobal.totalQuizScore += q.bestScore;
        newGlobal.totalQuizAttempts += q.attempts;
      }
    }

    // Aggregating AI Eval
    if (s.aiEval) {
      newGlobal.totalAiEvalScore += s.aiEval.avgScore;
      newGlobal.totalAiEvalAttempts += s.aiEval.count;
      newGlobal.moduleStats['ai-eval'].sum += s.aiEval.avgScore;
      newGlobal.moduleStats['ai-eval'].count += s.aiEval.count;
      if (s.evalCompletedLevels.includes(TRAINING_REGISTRY.eval.requiredLevel)) {
        newGlobal.moduleStats['ai-eval'].passCount += 1;
      }
    }
  }

  await fsSet('stats', 'global', newGlobal);
  return newGlobal;
}

export async function getGlobalStats(): Promise<GlobalStats | null> {
  return await fsGet<GlobalStats>('stats', 'global');
}
