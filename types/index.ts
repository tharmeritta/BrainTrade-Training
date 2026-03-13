export type UserRole = 'admin' | 'agent';

export interface AppUser {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  createdBy: string;
  active: boolean;
  createdAt: Date;
}

export interface QuizResult {
  id?: string;
  userId: string;
  moduleId: 'product' | 'process' | 'payment';
  score: number;
  totalQuestions: number;
  answers: Record<string, string>;
  timestamp: Date;
}

export interface PitchMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface PitchSession {
  id?: string;
  userId: string;
  level: 1 | 2 | 3;
  messages: PitchMessage[];
  outcome: 'ongoing' | 'closed' | 'failed' | 'abandoned';
  score?: number;
  feedback?: string;
  timestamp: Date;
}

export interface AiEvalLog {
  id?: string;
  userId: string;
  inputText: string;
  claudeScore: number;
  feedback: string;
  timestamp: Date;
}

export interface UserProgress {
  userId: string;
  modules: {
    product?: { completed: boolean; score: number; completedAt?: Date };
    process?: { completed: boolean; score: number; completedAt?: Date };
    payment?: { completed: boolean; score: number; completedAt?: Date };
  };
  pitchLevel: 1 | 2 | 3;
  pitchSessionCount: number;
  certEarned: boolean;
  certEarnedAt?: Date;
}
