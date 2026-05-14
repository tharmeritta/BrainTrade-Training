import { z } from 'zod';
import { PitchMessage } from './index';

/**
 * 1. Scenario Definition
 * Defines the customer persona, instructions, and difficulty.
 */
export const AiEvalScenarioSchema = z.object({
  id: z.string(),
  name: z.string(), // e.g., "The Angry Skeptic"
  description: z.string(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  level: z.number().optional(), // 1, 2, 3, 4
  required: z.boolean().default(false), // If true, must pass for graduation

  // NEW: Single ChatGPT instruction prompt (replaces two-phase persona+evaluator)
  systemPrompt: z.string().optional(),
  
  // NEW: Prompt for external practice (ChatGPT)
  externalPrompt: z.string().optional(),
  auditInstructions: z.string().optional(),

  // Core Persona Data (used for auto-prompt generation)
  customerPersona: z.string().optional(),
  objective: z.string().optional(),
  initialMood: z.string().optional(),
  winCondition: z.string().optional(),
  failCondition: z.string().optional(),

  // Parameters
  passThreshold: z.number().default(35),

  // Legacy / Deprecated Fields
  evaluatorInstructions: z.string().optional(), // DEPRECATED: Use auditInstructions
  maxTurns: z.number().default(12),
  maxTurnsPerRound: z.number().default(6), // DEPRECATED
  maxRounds: z.number().default(2), // DEPRECATED
  minTurnsToWin: z.number().default(3), // DEPRECATED
  requiredCriteria: z.array(z.string()).default(['rapport', 'objectionHandling', 'credibility', 'closing', 'naturalness']),
  bypassPrompt: z.string().optional(), // DEPRECATED

  isActive: z.boolean().default(true),
  isMaster: z.boolean().default(false), // DEPRECATED: Use 'required' to drive importance
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type AiEvalScenario = z.infer<typeof AiEvalScenarioSchema>;

/**
 * 2. LLM Raw Turn Response
 */
export const AiEvalTurnResponseSchema = z.object({
  // Customer Dialogue (What the user sees)
  dialogue: z.string(),
  mood: z.string().optional(),
  objectiveState: z.string().optional(),

  // NEW: ChatGPT verdict — the system reads this to determine pass/fail
  verdict: z.enum(['continue', 'passed', 'failed']).optional(),
  verdictReason: z.string().optional(),

  // Legacy intent (mapped from verdict for backward compat)
  intent: z.enum(['continue', 'buy', 'hang_up']).default('continue'),

  // Coaching feedback (returned by ChatGPT when verdict is passed/failed)
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

/**
 * 3. Session State
 */
export interface AiEvalSession {
  id: string;
  agentId: string;
  agentName: string;
  scenarioId: string;
  level: number;
  round: number; // kept for backward compat (always 1 in new sessions)

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
  turnCountInRound: number; // kept for backward compat
  startTime: string;
  lastUpdate: string;
  trainingPeriodId?: string;

  // NEW: final verdict reason from ChatGPT
  verdictReason?: string;

  // NEW: AI Audit fields
  auditLink?: string;
  auditResult?: AiEvalTurnResponse;
}
