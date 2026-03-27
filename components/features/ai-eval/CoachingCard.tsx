'use client';

import { memo, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { CoachingData } from './types';

/* ─── Score Style Helper ────────────────────────────────────────────────────── */

export const SCORE_STYLE = (score: number) =>
  score >= 7
    ? { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800', dot: 'bg-emerald-500' }
    : score >= 5
    ? { badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800', dot: 'bg-amber-400' }
    : { badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800', dot: 'bg-rose-500' };

/* ─── CoachingCard ──────────────────────────────────────────────────────────── */

export const CoachingCard = memo(({ coaching, autoExpand, onUseScript, criteriaKeys }: {
  coaching: CoachingData;
  autoExpand: boolean;
  onUseScript?: (text: string) => void;
  criteriaKeys: string[];
}) => {
  const [open, setOpen] = useState(autoExpand);
  const { score, criteria, strengths, improvements, coachingScript, coachingTip } = coaching;
  const style = SCORE_STYLE(score);
  const t = useTranslations('aiEval');

  return (
    <div className="ml-9 mt-1.5 mb-1">
      <button
        onClick={() => setOpen(v => !v)}
        className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-xl border transition-all hover:opacity-80 ${style.badge}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />
        <span className="font-black">{score}/10</span>
        <span className="opacity-50">·</span>
        <span>{open ? t('hideCoaching') : t('viewCoaching')}</span>
        <ChevronDown size={11} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="mt-2 bg-white dark:bg-card border border-black/5 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
              <div className="divide-y divide-black/5 dark:divide-white/5">
                {criteria && (
                  <div className="px-4 py-3 bg-secondary/10">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-2.5">{t('performanceBreakdown')}</p>
                    <div className="space-y-2">
                      {criteriaKeys.map((key) => {
                        const val = (criteria as Record<string, number>)[key] || 0;
                        return (
                          <div key={key}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-bold text-foreground/70">
                                {t.raw(`criteria.${key}`) ? t(`criteria.${key}` as any) : key}
                              </span>
                              <span className="text-[10px] font-black text-primary">{val}/10</span>
                            </div>
                            <div className="h-1 w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${val * 10}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                className={`h-full rounded-full ${val >= 7 ? 'bg-emerald-500' : val >= 5 ? 'bg-amber-400' : 'bg-rose-500'}`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {strengths && (
                  <div className="px-4 py-3">
                    <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">✓ {t('strengthsLabel')}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{strengths}</p>
                  </div>
                )}
                {improvements && (
                  <div className="px-4 py-3">
                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-wider mb-1">↑ {t('improvementsLabel')}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{improvements}</p>
                  </div>
                )}
                {coachingTip && (
                  <div className="px-4 py-3">
                    <p className="text-[10px] font-black text-primary uppercase tracking-wider mb-1">💡 {t('techniqueLabel')}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{coachingTip}</p>
                  </div>
                )}
                {coachingScript && (
                  <div className="px-4 py-3 bg-primary/5 dark:bg-primary/10">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[10px] font-black text-primary uppercase tracking-wider">💬 {t('scriptLabel')}</p>
                      {onUseScript && (
                        <button
                          onClick={() => onUseScript(coachingScript)}
                          className="text-[10px] font-black bg-primary text-white px-2 py-0.5 rounded-md hover:bg-primary/80 transition-all active:scale-95"
                        >
                          {t('useScriptBtn')}
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-primary/80 dark:text-primary/70 leading-relaxed font-medium">
                      &ldquo;{coachingScript}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

CoachingCard.displayName = 'CoachingCard';

/* ─── ScoreTrend ────────────────────────────────────────────────────────────── */

export const ScoreTrend = memo(({ coaching }: { coaching: Map<number, CoachingData> }) => {
  const scores = useMemo(() => Array.from(coaching.values()).map(c => c.score), [coaching]);
  if (scores.length < 2) return null;
  const max = 10; const min = 0; const height = 16; const width = 100;
  const points = scores.map((s, i) => {
    const x = (i / (scores.length - 1)) * width;
    const y = height - ((s - min) / (max - min)) * height;
    return `${x},${y}`;
  }).join(' ');
  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-secondary/20 rounded-lg border border-black/5 dark:border-white/5 animate-in fade-in zoom-in duration-500 shrink-0">
      <div className="flex flex-col">
        <span className="text-[8px] font-black text-muted-foreground uppercase leading-none mb-0.5">Progress</span>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-16 h-4 overflow-visible">
          <polyline fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" className="text-primary" points={points} />
          <circle cx={width} cy={height - ((scores[scores.length - 1] - min) / (max - min)) * height} r="2" className="fill-primary" />
        </svg>
      </div>
    </div>
  );
});

ScoreTrend.displayName = 'ScoreTrend';
