import type { AgentStats } from '@/types';

export const BADGE_CONFIG = {
  'elite':        { label: 'Elite',       bg: 'bg-purple-500/15', text: 'text-purple-400', dot: 'bg-purple-400' },
  'strong':       { label: 'Strong',      bg: 'bg-blue-500/15', text: 'text-blue-400', dot: 'bg-blue-400' },
  'developing':   { label: 'Developing',  bg: 'bg-amber-500/15',  text: 'text-amber-400',  dot: 'bg-amber-400'  },
  'needs-work':   { label: 'Needs Help',  bg: 'bg-red-500/15',    text: 'text-red-400',    dot: 'bg-red-400'    },
};

export const MODULE_LABELS: Record<string, string> = { 
  foundation: 'Foundation',
  product: 'Product', 
  process: 'Process', 
  payment: 'Payment' 
};

export function scoreColor(score: number | undefined) {
  if (score === undefined || score === null) return 'text-muted-foreground';
  if (score >= 70) return 'text-blue-500';
  if (score >= 50) return 'text-amber-500';
  return 'text-red-500';
}

export function scoreBg(score: number | undefined) {
  if (score === undefined || score === null) return 'bg-secondary';
  if (score >= 70) return 'bg-blue-500';
  if (score >= 50) return 'bg-amber-400';
  return 'bg-red-400';
}

export function timeAgo(iso: string | null | undefined, t?: (key: string, params?: any) => string) {
  if (!iso) return t ? t('time.never') : 'Never';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return t ? t('time.justNow') : 'Just now';
  if (m < 60) return t ? t('time.m', { m }) : `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return t ? t('time.h', { h }) : `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return t ? t('time.yesterday') : 'Yesterday';
  return t ? t('time.d', { d }) : `${d}d ago`;
}
