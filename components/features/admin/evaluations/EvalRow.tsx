'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { scoreColor, timeAgo } from '../AdminHelpers';
import DetailedEvaluation from '../DetailedEvaluation';
import type { AdminEval } from './useEvaluationsData';

export default function EvalRow({ ev }: { ev: AdminEval }) {
  const t = useTranslations('admin');
  const [expanded, setExpanded] = useState(false);
  const redFlagCount = ev.criteria?.redFlags
    ? Object.values(ev.criteria.redFlags).filter(Boolean).length
    : 0;

  return (
    <div className="bg-card/60 backdrop-blur-md hover:bg-card border border-border/50 hover:border-primary/20 rounded-2xl transition-all overflow-hidden">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-4 flex items-center gap-5 text-left"
      >
        <div className="w-14 text-center shrink-0">
          <span className={`text-xl tracking-tight font-black ${scoreColor(ev.totalScore)}`}>{ev.totalScore}</span>
          <div className="text-[10px] uppercase font-bold text-muted-foreground mt-0.5">/100</div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-foreground">{ev.agentName}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mx-1">{t('evaluations.evaluatedBy')}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-secondary text-foreground">{ev.evaluatorName}</span>
            {redFlagCount > 0 && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-red-500/10 text-red-500 border border-red-500/20 uppercase tracking-wider">
                {t('evaluations.redFlags', { count: redFlagCount })}
              </span>
            )}
          </div>
          {ev.comments && <p className="text-xs text-muted-foreground truncate mt-1.5">{ev.comments}</p>}
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-[10px] font-medium text-muted-foreground px-3 py-1.5 bg-secondary/30 rounded-lg">{timeAgo(ev.evaluatedAt, t)}</div>
          <ChevronDown size={16} className={`text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-6 pb-6 pt-2 border-t border-border/40">
              <DetailedEvaluation ev={ev} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
