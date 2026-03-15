export type UserRole = 'admin' | 'agent' | 'evaluator';

export interface PitchMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ── Agent tracking ─────────────────────────────────────────────────────────

export interface Agent {
  id: string;
  name: string;
  active: boolean;
  createdAt: Date;
}

export interface ModuleQuizStat {
  bestScore: number;       // 0–100 percentage
  passed: boolean;
  attempts: number;
}

export interface AgentStats {
  agent: Agent;
  quiz: {
    product?: ModuleQuizStat;
    process?: ModuleQuizStat;
    payment?: ModuleQuizStat;
  };
  aiEval: { avgScore: number; count: number } | null;
  pitch: { highestLevel: number; sessionCount: number } | null;
  overallScore: number;
  badge: 'elite' | 'strong' | 'developing' | 'needs-work';
  lastActive: string | null;
}

// ── Admin API response shapes ───────────────────────────────────────────────

export interface ModuleStat {
  moduleId: 'product' | 'process' | 'payment';
  label: string;
  avgScore: number;
  passCount: number;
  totalAttempts: number;
}

export interface AdminOverviewData {
  totalAgents: number;
  activeAgents: number;
  overallPassRate: number;
  avgAiEvalScore: number;
  weekSessions: number;
  moduleStats: ModuleStat[];
  leaderboard: AgentStats[];
  passFail: { passed: number; failed: number };
}

// ── Evaluator ──────────────────────────────────────────────────────────────

export interface Evaluator {
  id: string;
  name: string;
  active: boolean;
  createdAt: Date;
}

export interface EvaluationCriteria {
  productKnowledge: number;   // 0–10
  communication: number;      // 0–10
  objectionHandling: number;  // 0–10
  closingTechnique: number;   // 0–10
  professionalism: number;    // 0–10
  customerEmpathy: number;    // 0–10
}

export type EvaluationSessionType = 'pitch' | 'ai-eval' | 'live' | 'roleplay';

export interface AgentEvaluation {
  id: string;
  agentId: string;
  agentName: string;
  evaluatorId: string;
  evaluatorName: string;
  criteria: EvaluationCriteria;
  totalScore: number;          // 0–100 (avg of criteria × 10)
  comments: string;
  sessionNotes: string;
  sessionType: EvaluationSessionType;
  evaluatedAt: string;
  updatedAt?: string;
}

// ── Training Module ────────────────────────────────────────────────────────

export type ModuleStatus = 'locked' | 'available' | 'completed';

export interface TrainingModule {
  id: 'product' | 'process' | 'payment' | 'ai-eval' | 'pitch';
  titleTh: string;
  descriptionTh: string;
  href: string;
  learnHref?: string;
  status: ModuleStatus;
  bestScore?: number;
  attempts?: number;
  passed?: boolean;
  requiresModuleId?: string;
}

// ── Agent Progress (for /api/agent/progress endpoint) ─────────────────────

export interface AgentProgress {
  agent: Pick<Agent, 'id' | 'name'>;
  stats: AgentStats;
}
