import { AiEvalScenario } from '@/types/ai-eval';

export const DIFF = {
  beginner:     { label: 'Beginner',     color: 'emerald', border: 'border-l-emerald-500',  bg: 'bg-emerald-500/10',  text: 'text-emerald-500',  badge: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  intermediate: { label: 'Intermediate', color: 'amber',   border: 'border-l-amber-500',    bg: 'bg-amber-500/10',    text: 'text-amber-500',    badge: 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  advanced:     { label: 'Advanced',     color: 'rose',    border: 'border-l-rose-500',      bg: 'bg-rose-500/10',     text: 'text-rose-500',     badge: 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400' },
  expert:       { label: 'Expert',       color: 'purple',  border: 'border-l-purple-500',    bg: 'bg-purple-500/10',   text: 'text-purple-500',   badge: 'border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400' },
} as const;

export const DIFF_ORDER: (keyof typeof DIFF)[] = ['beginner', 'intermediate', 'advanced', 'expert'];

export const EMPTY_FORM: Partial<AiEvalScenario> = {
  difficulty: 'beginner', isActive: true, maxTurns: 12, passThreshold: 7
};

export const inputCls = "w-full bg-secondary/40 border border-border/40 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all placeholder:text-muted-foreground/40";
export const textareaCls = `${inputCls} resize-none`;
