import { 
  SalesCallCriteria, SalesCallPerformanceItem, AgentEvaluation 
} from '@/types';
import { CompletionStatus } from '@/lib/completion';

// --- Constants ---

export const PERFORMANCE_KEYS: (keyof SalesCallCriteria['performance'])[] = [
  'agentStruggle', 'unhandledQuestions', 'toneOfVoice', 'chemistryFriendliness',
];

export const RED_FLAG_KEYS: (keyof SalesCallCriteria['redFlags'])[] = [
  'officeLocation', 'withdrawalAfterDeposit', 'exaggeratingProfit', 'actualCommission',
];

export const STATUS_CFG: Record<CompletionStatus, { color: string; bg: string; border: string; dot: string; label: string }> = {
  'needs-eval':  { color: 'text-amber-400',       bg: 'bg-amber-500/10',    border: 'border-amber-500/25',   dot: 'bg-amber-400',              label: 'Needs Eval'  },
  'cleared':     { color: 'text-emerald-400',      bg: 'bg-emerald-500/10',  border: 'border-emerald-500/25', dot: 'bg-emerald-400',            label: 'Cleared'     },
  'in-progress': { color: 'text-blue-400',         bg: 'bg-blue-500/10',     border: 'border-blue-500/25',    dot: 'bg-blue-400',               label: 'In Progress' },
  'not-started': { color: 'text-muted-foreground', bg: 'bg-secondary/30',    border: 'border-border',         dot: 'bg-muted-foreground/30',    label: 'Not Started' },
};

export const STATUS_ORDER: Record<CompletionStatus, number> = {
  'needs-eval': 0, 'in-progress': 1, 'cleared': 2, 'not-started': 3,
};

// --- Helpers ---

export function emptyPerf(): SalesCallPerformanceItem {
  return { agentInvolve: null, comment: '', remark: '' };
}

export function emptyCriteria(): SalesCallCriteria {
  return {
    performance: {
      agentStruggle: emptyPerf(), unhandledQuestions: emptyPerf(),
      toneOfVoice: emptyPerf(), chemistryFriendliness: emptyPerf(),
    },
    qaThoughts: '',
    qaImpact: 'none',
    redFlags: {
      officeLocation: false, withdrawalAfterDeposit: false,
      exaggeratingProfit: false, actualCommission: false,
    },
    generalRemark: '',
    finalResult: 'passed',
    failReason: '',
  };
}

export function calcScore(criteria: SalesCallCriteria): number {
  if (criteria.finalResult === 'failed') return 0;
  return Math.max(0, 100 - Object.values(criteria.redFlags).filter(Boolean).length * 25);
}

export function timeAgo(iso: string | null | undefined, t: (key: string, p?: any) => string): string {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 2)  return t('justNow');
  if (m < 60) return t('minAgo', { m });
  const h = Math.floor(m / 60);
  if (h < 24) return t('hourAgo', { h });
  return t('dayAgo', { d: Math.floor(h / 24) });
}
