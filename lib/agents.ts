import { gcsGetAll } from './gcs';
import type { Agent, AgentStats, ModuleStat } from '@/types';

const MODULES = ['product', 'process', 'payment'] as const;

// ── Score helpers ─────────────────────────────────────────────────────────

export function computeBadge(score: number): AgentStats['badge'] {
  if (score >= 85) return 'elite';
  if (score >= 70) return 'strong';
  if (score >= 50) return 'developing';
  return 'needs-work';
}

export function computeOverallScore(stats: Omit<AgentStats, 'overallScore' | 'badge'>): number {
  const quizScores = MODULES.map(m => stats.quiz[m]?.bestScore ?? 0);
  const avgQuiz    = quizScores.reduce((a, b) => a + b, 0) / 3;
  const aiEval     = stats.aiEval?.avgScore ?? 0;
  const pitch      = stats.pitch ? (stats.pitch.highestLevel / 3) * 100 : 0;
  return Math.round(avgQuiz * 0.5 + aiEval * 0.3 + pitch * 0.2);
}

// ── Data types matching GCS records ───────────────────────────────────────

interface QuizRecord   { id: string; agentId: string; moduleId: string; score: number; totalQuestions: number; passed: boolean; timestamp: string; }
interface EvalRecord   { id: string; agentId: string; score: number; timestamp: string; }
interface PitchRecord  { id: string; agentId: string; level: number; timestamp: string; }

// ── Analytics ─────────────────────────────────────────────────────────────

export async function getAllAgentStats(): Promise<AgentStats[]> {
  const [agents, quizDocs, evalDocs, pitchDocs] = await Promise.all([
    gcsGetAll<Agent & { id: string }>('agents'),
    gcsGetAll<QuizRecord>('quiz_results'),
    gcsGetAll<EvalRecord>('ai_eval_logs'),
    gcsGetAll<PitchRecord>('pitch_sessions'),
  ]);

  const activeAgents = agents.filter(a => a.active);

  return activeAgents.map(agent => {
    // Quiz per module
    const quiz: AgentStats['quiz'] = {};
    for (const mod of MODULES) {
      const results = quizDocs.filter(r => r.agentId === agent.id && r.moduleId === mod);
      if (results.length > 0) {
        quiz[mod] = {
          bestScore: Math.max(...results.map(r => Math.round((r.score / r.totalQuestions) * 100))),
          passed:    results.some(r => r.passed),
          attempts:  results.length,
        };
      }
    }

    // AI Eval
    const evals  = evalDocs.filter(e => e.agentId === agent.id);
    const aiEval = evals.length > 0
      ? { avgScore: Math.round(evals.reduce((s, e) => s + e.score, 0) / evals.length), count: evals.length }
      : null;

    // Pitch
    const pitches = pitchDocs.filter(p => p.agentId === agent.id);
    const pitch   = pitches.length > 0
      ? { highestLevel: Math.max(...pitches.map(p => p.level)), sessionCount: pitches.length }
      : null;

    // Last active (ISO strings — direct comparison works)
    const allTimes = [
      ...quizDocs.filter(r => r.agentId === agent.id),
      ...evalDocs.filter(e => e.agentId === agent.id),
      ...pitchDocs.filter(p => p.agentId === agent.id),
    ].map(r => r.timestamp).filter(Boolean).sort();
    const lastActive = allTimes.length > 0 ? allTimes[allTimes.length - 1] : null;

    const partial      = { agent, quiz, aiEval, pitch, lastActive };
    const overallScore = computeOverallScore(partial);
    return { ...partial, overallScore, badge: computeBadge(overallScore) };
  });
}

export async function getModuleStats(): Promise<ModuleStat[]> {
  const quizDocs = await gcsGetAll<QuizRecord>('quiz_results');
  const labels: Record<string, string> = { product: 'Product', process: 'Process', payment: 'Payment' };

  return MODULES.map(moduleId => {
    const results  = quizDocs.filter(d => d.moduleId === moduleId);
    const passed   = results.filter(d => d.passed).length;
    const avgScore = results.length > 0
      ? Math.round(results.reduce((s, d) => s + Math.round((d.score / d.totalQuestions) * 100), 0) / results.length)
      : 0;
    return { moduleId, label: labels[moduleId], avgScore, passCount: passed, totalAttempts: results.length };
  });
}
