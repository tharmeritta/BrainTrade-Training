export type UserRole = 'admin' | 'manager' | 'agent' | 'evaluator' | 'trainer';

export interface StaffAccount {
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'admin' | 'manager' | 'evaluator' | 'trainer';
  active: boolean;
  createdAt: string;
  passwordChanged?: boolean;
}

export interface PitchMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ── Agent tracking ─────────────────────────────────────────────────────────

export interface Agent {
  id: string;
  name: string;
  stageName?: string;
  active: boolean;
  createdAt: Date;
}

export interface ModuleQuizStat {
  bestScore: number;       // 0–100 percentage
  passed: boolean;
  attempts: number;
  history?: { score: number; total: number; passed: boolean; timestamp: string }[];
}

export interface AgentStats {
  agent: Agent;
  quiz: {
    product?: ModuleQuizStat;
    process?: ModuleQuizStat;
    payment?: ModuleQuizStat;
  };
  aiEval: { 
    avgScore: number; 
    count: number;
    history?: { score: number; level: number; passed: boolean; timestamp: string }[];
  } | null;
  pitch: { 
    highestLevel: number; 
    sessionCount: number; 
    completedLevels?: number[];
    history?: { level: number; closedSale: boolean; timestamp: string }[];
  } | null;
  evalCompletedLevels?: number[];
  humanEvaluations?: AgentEvaluation[];
  overallScore: number;
  badge: 'elite' | 'strong' | 'developing' | 'needs-work';
  lastActive: string | null;
}

// ── Admin API response shapes ───────────────────────────────────────────────

export interface ModuleStat {
  moduleId: string;          // 'learn' | 'quiz' | 'ai-eval' | 'pitch'
  label: string;
  avgScore: number;          // completion rate 0–100
  passCount: number;         // agents who completed this module
  totalAttempts: number;     // total active agents
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

// ── Sales call evaluation schema ────────────────────────────────────────────

export interface SalesCallPerformanceItem {
  agentInvolve: boolean;   // Y = yes this item was observed
  comment: string;
  remark?: string;
}

export interface SalesCallCriteria {
  // Section 1 – Agent Performance
  performance: {
    agentStruggle:         SalesCallPerformanceItem;
    unhandledQuestions:    SalesCallPerformanceItem;
    toneOfVoice:           SalesCallPerformanceItem;
    chemistryFriendliness: SalesCallPerformanceItem;
  };
  // Section 2 – QA Thoughts
  qaThoughts: string;
  // Section 3 – Red Flags (true = agent mentioned it = red flag)
  redFlags: {
    officeLocation:         boolean;
    withdrawalAfterDeposit: boolean;
    exaggeratingProfit:     boolean;
    actualCommission:       boolean;
  };
  // Overall evaluator remark
  generalRemark: string;
}

/** Backward-compat alias — keep existing import sites working */
export type EvaluationCriteria = SalesCallCriteria;

export type EvaluationSessionType = 'pitch' | 'ai-eval' | 'live' | 'roleplay';

export interface AgentEvaluation {
  id: string;
  agentId: string;
  agentName: string;
  evaluatorId: string;
  evaluatorName: string;
  criteria: SalesCallCriteria;
  totalScore: number;          // 0–100: 100 − (redFlagCount × 25)
  comments: string;            // summary comment shown in lists
  sessionNotes: string;        // private evaluator note
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

// ── Trainer ────────────────────────────────────────────────────────────────

export interface TrainingPeriod {
  id: string;
  name: string;           // e.g. "March 2026 Batch"
  agentIds: string[];
  agentNames: Record<string, string>; // agentId -> name
  totalDays: number;      // configurable, starts at 5, can be increased/decreased
  startDate: string;      // YYYY-MM-DD
  trainerId: string;
  trainerName: string;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface TrainingDayRecord {
  id: string;
  trainingPeriodId: string;
  agentId: string;
  dayNumber: number;      // 1-based
  date: string;           // YYYY-MM-DD
  attendance: 'present' | 'late' | 'absent';
  topics: string;
  notes: string;
  createdAt: string;
  updatedAt?: string;
}

export type DisciplineType = 'late' | 'sick_leave' | 'personal_leave' | 'absent_no_reason' | 'other';

export interface DisciplineRecord {
  id: string;
  agentId: string;
  agentName: string;
  trainingPeriodId: string;
  trainerId: string;
  trainerName: string;
  date: string;           // YYYY-MM-DD
  type: DisciplineType;
  description: string;
  createdAt: string;
}
