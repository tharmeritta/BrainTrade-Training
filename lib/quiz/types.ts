export type Language = 'en' | 'th';
export type QuestionType = 'tf' | 'mcq' | 'fill';

export interface QuizPhase {
  name: Record<Language, string>;
  color: string;
  light: string;
}

export interface QuestionData {
  en: string;
  th: string;
  type: QuestionType;
  a?: string;
  options?: { en: string[]; th: string[] };
  correctIdx?: number;
  phase?: number;   // index into QuizDefinition.phases[]
  isNew?: boolean;
  explain?: { en: string; th: string };
}

export interface QuizUIOverrides {
  scoreLabel?: Record<Language, string>;
  finishTitle?: Record<Language, string>;
  finishSub?: Record<Language, string>;
  feedbackHigh?: Record<Language, string>;
  feedbackMid?: Record<Language, string>;
  feedbackLow?: Record<Language, string>;
}

export interface QuizDefinition {
  id: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
  questions: QuestionData[];
  phases?: QuizPhase[];
  uiOverrides?: QuizUIOverrides;
  passThreshold?: number; // override global 0.7 default
  // Dynamic UI Metadata
  order?: number;
  section?: string;
  icon?: string;
  color?: string;
  prerequisiteId?: string | null;
}

export const PASS_THRESHOLD = 0.7; // 70%

export const UI_STRINGS = {
  en: {
    next: 'Next Question',
    prev: 'Previous',
    seeResults: 'See Results',
    explanation: 'Explanation',
  },
  th: {
    next: 'ถัดไป',
    prev: 'ย้อนกลับ',
    seeResults: 'ดูผลคะแนน',
    explanation: 'คำอธิบาย',
  }
};
