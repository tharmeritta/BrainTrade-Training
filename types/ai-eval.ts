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
  
  // Personas & Prompts
  customerPersona: z.string(), // Deep prompt for the Customer behavior
  evaluatorInstructions: z.string().optional(), // Specific instructions for the "Shadow Coach"
  
  // Parameters
  initialMood: z.string(), // e.g., "Irritated but reachable"
  objective: z.string(), // e.g., "Wants to know about the 60-day journey safety"
  
  // Pass/Fail Logic
  passThreshold: z.number().default(35), // Updated for 50 total
  requiredCriteria: z.array(z.string()).default(['rapport', 'objectionHandling', 'credibility', 'closing', 'naturalness']),

  // State Machine Transitions
  maxTurns: z.number().default(12), // Total turns across rounds
  maxTurnsPerRound: z.number().default(6),
  maxRounds: z.number().default(2),
  minTurnsToWin: z.number().default(3), 
  winCondition: z.string().optional(), 
  failCondition: z.string().optional(), 
  
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
  
  // Internal State (Decision logic)
  intent: z.enum(['continue', 'buy', 'hang_up']).default('continue'),
  
  // Evaluation (The Coaching part) - Optional during dialogue turns
  score: z.number().min(0).max(50).optional(),
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
}
