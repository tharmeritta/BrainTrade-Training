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

  // NEW: Single ChatGPT instruction prompt (replaces two-phase persona+evaluator)
  systemPrompt: z.string().optional(),

  // Legacy Personas & Prompts (kept for backward compat & fallback)
  customerPersona: z.string().optional(),
  evaluatorInstructions: z.string().optional(),

  // Parameters
  initialMood: z.string().optional(),
  objective: z.string().optional(),

  // Pass/Fail Logic (legacy — verdict now comes directly from ChatGPT)
  passThreshold: z.number().default(35),
  requiredCriteria: z.array(z.string()).default(['rapport', 'objectionHandling', 'credibility', 'closing', 'naturalness']),

  // State Machine
  maxTurns: z.number().default(12),
  maxTurnsPerRound: z.number().default(6),
  maxRounds: z.number().default(2),
  minTurnsToWin: z.number().default(3),
  winCondition: z.string().optional(),
  failCondition: z.string().optional(),
  bypassPrompt: z.string().optional(), // Prompt for external AI practice

  isActive: z.boolean().default(true),
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

  // NEW: final verdict reason from ChatGPT
  verdictReason?: string;
}
