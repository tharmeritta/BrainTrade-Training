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
  
  // Personas & Prompts
  customerPersona: z.string(), // Deep prompt for the Customer behavior
  evaluatorInstructions: z.string().optional(), // Specific instructions for the "Shadow Coach"
  
  // Parameters
  initialMood: z.string(), // e.g., "Irritated but reachable"
  objective: z.string(), // e.g., "Wants to know about the 60-day journey safety"
  
  // Pass/Fail Logic
  passThreshold: z.number().default(7),
  requiredCriteria: z.array(z.string()).default(['rapport', 'objectionHandling', 'credibility', 'closing', 'naturalness']),
  
  // State Machine Transitions
  maxTurns: z.number().default(15),
  winCondition: z.string().optional(), // Text hint for when to trigger "passed"
  failCondition: z.string().optional(), // Text hint for when to "hang up"
  
  isActive: z.boolean().default(true),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type AiEvalScenario = z.infer<typeof AiEvalScenarioSchema>;

/**
 * 2. LLM Raw Turn Response
 * This is what the AI is expected to return every turn.
 */
export const AiEvalTurnResponseSchema = z.object({
  // Customer Dialogue (What the user sees)
  dialogue: z.string(),
  mood: z.string(),
  objectiveState: z.string(), // Progress towards their goal
  
  // Internal State (Decision logic)
  intent: z.enum(['continue', 'buy', 'hang_up']),
  
  // Evaluation (The Shadow Coach part)
  score: z.number().min(0).max(10),
  criteria: z.record(z.string(), z.number().min(0).max(10)),
  strengths: z.string(),
  improvements: z.string(),
  coachingScript: z.string(),
  coachingTip: z.string(),
  buyingSignal: z.string().optional(),
});

export type AiEvalTurnResponse = z.infer<typeof AiEvalTurnResponseSchema>;

/**
 * 3. Session State
 * Persistent state for a single training session.
 */
export interface AiEvalSession {
  id: string;
  agentId: string;
  agentName: string;
  scenarioId: string;
  level: number;
  
  messages: PitchMessage[];
  coaching: Record<number, AiEvalTurnResponse>;
  
  currentMood: string;
  customerProfile: {
    name: string;
    occupation: string;
    age: number;
    objective: string;
  };
  
  status: 'active' | 'passed' | 'failed';
  turnCount: number;
  startTime: string;
  lastUpdate: string;
}
