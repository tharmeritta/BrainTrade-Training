import React from 'react';
import type { AiEvalScenario, AiEvalTurnResponse } from '@/types/ai-eval';
import type { PitchMessage } from '@/types';

// Local aliases for the canonical types — used throughout this feature folder
export type EvalScenario = AiEvalScenario;
export type CoachingData = AiEvalTurnResponse;

export type EvalStep = 'intro' | 'scenarios' | 'chat';

export interface CustomerProfile {
  name: string;
  occupation: string;
  age: number;
  mood?: string;
  objective: string;
}

export interface ChatViewProps {
  messages: PitchMessage[];
  coaching: Map<number, CoachingData>;
  customerProfile: CustomerProfile | null;
  input: string;
  setInput: (v: string) => void;
  loading: boolean;
  passed: boolean;
  failed: boolean;
  error: string | null;
  onSend: () => void;
  onReset: (clearHistory: boolean) => void;
  onClearError: () => void;
  onUseScript: (text: string) => void;
  bottomRef: React.RefObject<HTMLDivElement>;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  criteriaKeys: string[];
}
