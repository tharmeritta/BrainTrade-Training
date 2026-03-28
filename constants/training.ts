import { GraduationCap, ClipboardList, Mic } from 'lucide-react';

export const STEPS = [
  { id: 'learn'   as const, step: 1, labelKey: 'learn',  sublabelKey: 'study',   descKey: 'productProcess', Icon: GraduationCap, color: '#818CF8', glow: 'rgba(129,140,248,0.18)' },
  { id: 'quiz'    as const, step: 2, labelKey: 'quiz',   sublabelKey: 'test',    descKey: 'quizDesc',  Icon: ClipboardList, color: '#60A5FA', glow: 'rgba(96,165,250,0.15)'  },
  { id: 'ai-eval' as const, step: 3, labelKey: 'aiEval', sublabelKey: 'analyse', descKey: 'aiEvalDesc',   Icon: Mic,           color: '#F472B6', glow: 'rgba(244,114,182,0.15)' },
] as const;

export type StepId = typeof STEPS[number]['id'];

export const BADGE = {
  elite:        { color: '#FBBF24', bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.3)',  label: 'Elite'      },
  strong:       { color: '#60A5FA', bg: 'rgba(96,165,250,0.10)',  border: 'rgba(96,165,250,0.3)',  label: 'Strong'     },
  developing:   { color: '#818CF8', bg: 'rgba(129,140,248,0.10)', border: 'rgba(129,140,248,0.3)', label: 'Developing' },
  'needs-work': { color: '#F87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.25)',label: 'Needs Work' },
} as const;

export type BadgeType = keyof typeof BADGE;
