'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { 
  X, ChevronDown, AlertCircle, Edit3, Flag, Clock, Zap, AlertTriangle 
} from 'lucide-react';

import { ScoreRing } from '@/components/ui/ScoreRing';
import { FADE_IN } from '@/lib/animations';
import { PERFORMANCE_KEYS, RED_FLAG_KEYS, timeAgo } from '@/lib/evaluator-helpers';
import type { AgentEvaluation, SalesCallCriteria } from '@/types';

interface EvalHistoryCardProps {
  ev: AgentEvaluation;
  onEdit: (ev: AgentEvaluation) => void;
}

export const EvalHistoryCard = ({
  ev, onEdit,
}: EvalHistoryCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const t = useTranslations('evaluator');
  const c = ev.criteria as SalesCallCriteria;
  const redFlagCount = c?.redFlags ? Object.values(c.redFlags).filter(Boolean).length : 0;

  return (
    <motion.div variants={FADE_IN} className="rounded-2xl overflow-hidden bg-card border border-border shadow-sm">
      <button className="w-full flex items-center gap-4 px-4 py-3.5 text-left hover:bg-secondary/30 transition-colors" onClick={() => setExpanded(v => !v)}>
        <div className="relative shrink-0">
          <ScoreRing score={ev.totalScore} size="sm" />
          {c?.finalResult === 'failed' && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 border-2 border-card">
              <X size={8} strokeWidth={4} />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="text-sm font-bold text-foreground">{t('salesSimLabel')}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${c?.finalResult === 'failed' ? 'bg-red-500/15 text-red-500 border border-red-500/20' : 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/20'}`}>
              {c?.finalResult === 'failed' ? t('failedCaps') : t('passedCaps')}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{ev.evaluatorName}</span>
            {redFlagCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 flex items-center gap-1">
                <Flag size={8} /> {redFlagCount}
              </span>
            )}
          </div>
          {c?.generalRemark && <p className="text-xs text-muted-foreground truncate">{c.generalRemark}</p>}
          <div className="flex items-center gap-1 mt-1">
            <Clock size={9} className="text-muted-foreground/40" />
            <span className="text-[10px] text-muted-foreground/40">{timeAgo(ev.evaluatedAt, t)}</span>
          </div>
        </div>
        <ChevronDown size={13} className={`text-muted-foreground transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 space-y-3 border-t border-border bg-secondary/10">
              {c?.finalResult === 'failed' && c?.failReason && (
                <div className="pt-3">
                  <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3">
                    <div className="text-[10px] font-bold text-red-500 uppercase mb-1 flex items-center gap-1.5">
                      <AlertCircle size={10} /> {t('reasonForFailure')}
                    </div>
                    <p className="text-sm text-foreground">{c.failReason}</p>
                  </div>
                </div>
              )}
              
              {c?.performance && (
                <div className="pt-3 space-y-2">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">{t('agentPerfSection')}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {PERFORMANCE_KEYS.map(key => {
                      const p = c.performance[key];
                      if (!p) return null;
                      const hasInteraction = p.agentInvolve !== null || p.comment.trim() !== '';
                      if (!hasInteraction) return (
                        <div key={key} className="flex items-start gap-2 bg-secondary/5 p-2.5 rounded-xl border border-border/50 opacity-40">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5 bg-secondary text-muted-foreground/40 border border-border/50">
                            {t('naLabel')}
                          </span>
                          <div className="min-w-0">
                            <div className="text-[10px] font-bold text-muted-foreground/50 truncate">{t(`performanceItems.${key}`)}</div>
                            <div className="text-[10px] italic text-muted-foreground/30 mt-0.5">{t('notEvaluated')}</div>
                          </div>
                        </div>
                      );

                      return (
                        <div key={key} className="flex items-start gap-2 bg-card p-2.5 rounded-xl border border-border">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5 ${p.agentInvolve === true ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : p.agentInvolve === false ? 'bg-muted-foreground/10 text-muted-foreground border border-border' : 'bg-secondary text-muted-foreground/40 border border-border'}`}>
                            {p.agentInvolve === true ? t('yLabel') : p.agentInvolve === false ? t('nLabel') : t('naLabel')}
                          </span>
                          <div className="min-w-0">
                            <div className="text-[10px] font-bold text-muted-foreground truncate">{t(`performanceItems.${key}`)}</div>
                            {p.comment && <div className="text-xs text-foreground mt-0.5 leading-snug">{p.comment}</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {c?.qaThoughts && (
                <div className="rounded-xl p-3 bg-card border border-border">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase">{t('qaSection')}</div>
                    {c?.qaImpact && c.qaImpact !== 'none' && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${c.qaImpact === 'immediate_fail' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}`}>
                        {c.qaImpact === 'immediate_fail' ? <AlertTriangle size={8} /> : <Zap size={8} />}
                        {t(c.qaImpact === 'notify_improve' ? 'qaImpactNotifyImprove' : 'qaImpactImmediateFail')}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{c.qaThoughts}</p>
                </div>
              )}

              {c?.redFlags && Object.values(c.redFlags).some(Boolean) && (
                <div className="rounded-xl p-3 bg-red-500/5 border border-red-500/20">
                  <div className="text-[10px] font-bold text-red-400/70 uppercase mb-2 flex items-center gap-1.5">
                    <AlertTriangle size={10} /> {t('redFlagsTitle')}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {RED_FLAG_KEYS.filter(k => c.redFlags[k]).map(key => (
                      <div key={key} className="flex items-center gap-1.5 px-2 py-1 rounded bg-red-500/10 border border-red-500/20">
                        <X size={8} className="text-red-400 shrink-0" />
                        <span className="text-[10px] font-bold text-red-400">{t(`redFlagItems.${key}.label`)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <button onClick={() => onEdit(ev)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors pt-2">
                <Edit3 size={12} /> {t('editLabel')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
