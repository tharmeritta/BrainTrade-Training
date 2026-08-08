import { z } from 'zod';
import { PitchMessage } from './index';

export interface LocalizedString {
  th: string;
  en: string;
}

export interface ScenarioChoice {
  id: string; // 'A' | 'B' | 'C' | 'D'
  text: string | LocalizedString;
  isCorrect: boolean;
  score: number; // 0 - 10
  explanation: string | LocalizedString;
}

/**
 * 1. Multiple-Choice AI Scenario Definition
 */
export const AiEvalScenarioSchema = z.object({
  id: z.string(),
  name: z.union([z.string(), z.object({ th: z.string(), en: z.string() })]),
  description: z.union([z.string(), z.object({ th: z.string(), en: z.string() })]).optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).default('beginner'),
  level: z.number().optional(),
  required: z.boolean().default(false),
  isMaster: z.boolean().optional(),
  passThreshold: z.number().default(70),
  isActive: z.boolean().default(true),

  // Customer Persona & Situation (Bilingual)
  customerPersona: z.union([z.string(), z.object({ th: z.string(), en: z.string() })]).optional(),
  initialMood: z.union([z.string(), z.object({ th: z.string(), en: z.string() })]).optional(),
  objective: z.union([z.string(), z.object({ th: z.string(), en: z.string() })]).optional(),
  situation: z.union([z.string(), z.object({ th: z.string(), en: z.string() })]).optional(),

  // Multiple Choice Options
  choices: z.array(z.object({
    id: z.string(),
    text: z.union([z.string(), z.object({ th: z.string(), en: z.string() })]),
    isCorrect: z.boolean(),
    score: z.number().default(0),
    explanation: z.union([z.string(), z.object({ th: z.string(), en: z.string() })])
  })).optional(),

  // Legacy compatibility fields
  winCondition: z.string().optional(),
  failCondition: z.string().optional(),
  systemPrompt: z.string().optional(),
  externalPrompt: z.string().optional(),
  auditInstructions: z.string().optional(),
  maxTurns: z.number().default(12),
  maxTurnsPerRound: z.number().optional(),
  maxRounds: z.number().optional(),
  minTurnsToWin: z.number().optional(),
  bypassPrompt: z.string().optional(),
  requiredCriteria: z.array(z.string()).default(['rapport', 'objectionHandling', 'credibility', 'closing', 'naturalness']),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type AiEvalScenario = z.infer<typeof AiEvalScenarioSchema>;

/**
 * 2. LLM Raw Turn Response / Choice Response
 */
export interface ScenarioSubmitResult {
  scenarioId: string;
  selectedChoiceId: string;
  isCorrect: boolean;
  score: number;
  maxScore: number;
  verdict: 'passed' | 'failed';
  explanation: string;
  feedback: {
    strengths: string;
    improvements: string;
    coachingTip: string;
  };
}

export const AiEvalTurnResponseSchema = z.object({
  dialogue: z.string().optional(),
  mood: z.string().optional(),
  objectiveState: z.string().optional(),
  verdict: z.enum(['continue', 'passed', 'failed']).optional(),
  verdictReason: z.string().optional(),
  intent: z.string().optional(),
  score: z.number().min(0).max(100).optional(),
  criteria: z.record(z.string(), z.number().min(0).max(10)).optional(),
  strengths: z.string().optional(),
  improvements: z.string().optional(),
  coachingScript: z.string().optional(),
  coachingTip: z.string().optional(),
  buyingSignal: z.string().optional(),
  isRoundEnd: z.boolean().default(false),
});

export type AiEvalTurnResponse = z.infer<typeof AiEvalTurnResponseSchema>;

export interface AiEvalSession {
  id: string;
  agentId: string;
  agentName: string;
  scenarioId: string;
  level: number;
  round: number;
  messages: PitchMessage[];
  coaching: Record<number, AiEvalTurnResponse>;
  currentMood: string;
  customerProfile: {
    name: string;
    occupation: string;
    age: number;
    mood?: string;
    objective: string;
  };
  status: 'active' | 'passed' | 'failed';
  turnCount: number;
  turnCountInRound: number;
  startTime: string;
  lastUpdate: string;
  trainingPeriodId?: string;
  verdictReason?: string;
  auditLink?: string;
  auditResult?: AiEvalTurnResponse;
}
