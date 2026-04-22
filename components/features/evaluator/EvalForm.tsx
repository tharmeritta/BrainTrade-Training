'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { 
  Check, Activity, Zap, AlertTriangle, AlertCircle, CheckCircle2, X 
} from 'lucide-react';

import { 
  STAGGER_CONTAINER, STAGGER_ITEM 
} from '@/lib/animations';
import { 
  PERFORMANCE_KEYS, RED_FLAG_KEYS 
} from '@/lib/evaluator-helpers';
import type { 
  SalesCallCriteria, SalesCallPerformanceItem 
} from '@/types';

interface EvalFormProps {
  criteria: SalesCallCriteria;
  onChange: (c: SalesCallCriteria) => void;
}

export const EvalForm = ({
  criteria, onChange,
}: EvalFormProps) => {
  const t = useTranslations('evaluator');

  function setPerf(key: keyof SalesCallCriteria['performance'], field: keyof SalesCallPerformanceItem, val: any) {
    onChange({ ...criteria, performance: { ...criteria.performance, [key]: { ...criteria.performance[key], [field]: val } } });
  }
  function setRedFlag(key: keyof SalesCallCriteria['redFlags'], val: boolean) {
    onChange({ ...criteria, redFlags: { ...criteria.redFlags, [key]: val } });
  }
  const redFlagCount = Object.values(criteria.redFlags).filter(Boolean).length;

  return (
    <motion.div variants={STAGGER_CONTAINER} initial="initial" animate="animate" className="space-y-5">
      {/* Section 1: Agent Performance */}
      <motion.div variants={STAGGER_ITEM} className="rounded-2xl overflow-hidden border border-border shadow-sm">
        <div className="px-4 py-3 bg-blue-500/[0.07] border-b border-border flex items-center justify-between">
          <span className="text-xs font-black text-foreground uppercase tracking-wider">{t('agentPerfHeader')}</span>
          {(() => {
            const n = PERFORMANCE_KEYS.filter(k => criteria.performance[k].agentInvolve !== null || criteria.performance[k].comment).length;
            const done = n === PERFORMANCE_KEYS.length;
            return (
              <span className={`text-[10px] font-semibold flex items-center gap-1 ${done ? 'text-emerald-400' : 'text-muted-foreground/40'}`}>
                {done && <Check size={9} />}
                {t('itemsFilled', { n, total: PERFORMANCE_KEYS.length })}
              </span>
            );
          })()}
        </div>
        <div className="p-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PERFORMANCE_KEYS.map((key, idx) => {
            const perf = criteria.performance[key];
            const isUnhandled = key === 'unhandledQuestions';
            const value = perf.agentInvolve;

            const activeBorder    = isUnhandled ? 'border-red-500/30' : 'border-blue-500/30';
            const activeBg        = isUnhandled ? 'bg-red-500/[0.04]' : 'bg-blue-500/[0.04]';
            const activeText      = isUnhandled ? 'text-red-400' : 'text-blue-400';

            return (
              <div key={key}
                className={`rounded-xl border p-3 space-y-2 transition-colors ${value !== null ? `${activeBorder} ${activeBg}` : 'border-border bg-card'}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-secondary flex items-center justify-center text-[10px] font-black text-muted-foreground/60 border border-border">{idx + 1}</div>
                    <span className={`text-xs font-semibold leading-snug ${value !== null ? activeText : 'text-foreground'}`}>
                      {t(`performanceItems.${key}`)}
                    </span>
                  </div>
                  <div className="flex bg-secondary/50 p-0.5 rounded-lg border border-border/40">
                    {[true, false, null].map((val) => {
                      const isSel = value === val;
                      const label = val === true ? t('yLabel') : val === false ? t('nLabel') : t('naLabel');
                      
                      let selClass = 'bg-card text-foreground shadow-sm';
                      if (isSel) {
                        if (val === true) selClass = isUnhandled ? 'bg-red-500 text-white shadow-md shadow-red-500/20' : 'bg-blue-500 text-white shadow-md shadow-blue-500/20';
                        else if (val === false) selClass = 'bg-muted-foreground text-white shadow-sm';
                        else selClass = 'bg-secondary text-muted-foreground border border-border/50 shadow-sm';
                      }

                      return (
                        <button
                          key={String(val)}
                          onClick={() => setPerf(key, 'agentInvolve', val)}
                          className={`px-2 py-1 rounded-md text-[10px] font-black transition-all ${isSel ? selClass : 'text-muted-foreground/40 hover:text-muted-foreground'}`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <textarea
                  value={perf.comment} onChange={e => setPerf(key, 'comment', e.target.value)}
                  placeholder={t('commentPlaceholder')} rows={1}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-xs text-foreground outline-none resize-none transition-colors placeholder:text-muted-foreground/40 bg-secondary/40 border border-border ${value !== null && isUnhandled ? 'focus:border-red-500/40' : 'focus:border-blue-500/40'}`}
                />
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Section 2: QA Thoughts */}
      <motion.div variants={STAGGER_ITEM} className="rounded-2xl overflow-hidden border border-border bg-card shadow-sm">
        <div className="px-4 py-3 bg-blue-500/[0.07] border-b border-border flex items-center justify-between">
          <span className="text-xs font-black text-foreground uppercase tracking-wider">{t('qaHeader')}</span>
          {criteria.qaThoughts.trim() && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />}
        </div>
        <div className="p-3 space-y-3">
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">{t('qaLabel')}</label>
            <textarea
              value={criteria.qaThoughts} onChange={e => onChange({ ...criteria, qaThoughts: e.target.value })}
              placeholder={t('qaPlaceholder')} rows={3}
              className="w-full px-3 py-2 rounded-xl text-sm text-foreground outline-none resize-none transition-colors placeholder:text-muted-foreground/40 bg-secondary/40 border border-border focus:border-blue-500/40"
            />
          </div>

          <div className="pt-1.5 border-t border-border/50">
            <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">{t('qaImpactLabel')}</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['none', 'notify_improve', 'immediate_fail'] as const).map(impact => {
                const isActive = criteria.qaImpact === impact;
                let activeClass = 'bg-primary/10 border-primary text-primary shadow-sm';
                if (impact === 'immediate_fail') activeClass = 'bg-red-500/10 border-red-500 text-red-500 shadow-sm';
                else if (impact === 'notify_improve') activeClass = 'bg-amber-500/10 border-amber-500 text-amber-500 shadow-sm';

                return (
                  <button
                    key={impact}
                    onClick={() => onChange({ ...criteria, qaImpact: impact })}
                    className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-all flex items-center justify-center gap-1 ${isActive ? activeClass : 'bg-secondary/40 border-border text-muted-foreground hover:bg-secondary/60'}`}
                  >
                    {impact === 'none' && <Activity size={10} />}
                    {impact === 'notify_improve' && <Zap size={10} />}
                    {impact === 'immediate_fail' && <AlertTriangle size={10} />}
                    {t(impact === 'none' ? 'qaImpactNone' : impact === 'notify_improve' ? 'qaImpactNotifyImprove' : 'qaImpactImmediateFail')}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Section 3: Red Flags */}
      <motion.div variants={STAGGER_ITEM} className={`rounded-2xl overflow-hidden border transition-colors shadow-sm ${redFlagCount === 4 ? 'border-red-500/60' : redFlagCount > 0 ? 'border-red-500/35' : 'border-border'}`}>
        <div className={`px-4 py-3 flex items-center justify-between border-b border-border ${redFlagCount === 4 ? 'bg-red-500/20' : redFlagCount > 0 ? 'bg-red-500/10' : 'bg-red-500/5'}`}>
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-red-400" />
            <span className="text-xs font-black text-foreground uppercase tracking-wider">{t('redFlagHeader')}</span>
          </div>
          <div className="flex items-center gap-2">
            {redFlagCount > 0 && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40">
                −{redFlagCount * 25} pts
              </span>
            )}
            {redFlagCount === 4 && (
              <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-red-600/30 text-red-300 border border-red-500/50 animate-pulse">
                {t('failedCaps')}
              </span>
            )}
          </div>
        </div>
        <div className="px-4 py-2 text-xs text-muted-foreground bg-secondary/10 border-b border-border">{t('redFlagNote')}</div>
        <div>
          {RED_FLAG_KEYS.map((key, i) => {
            const checked = criteria.redFlags[key];
            const shortcutKey = ['Q', 'W', 'E', 'R'][i];
            return (
              <div key={key} className={`px-4 py-3 ${checked ? 'bg-red-500/5' : i % 2 === 0 ? 'bg-card' : 'bg-secondary/20'} ${i < RED_FLAG_KEYS.length - 1 ? 'border-b border-border' : ''}`}>
                <div className="flex items-start gap-3">
                  <button onClick={() => setRedFlag(key, !checked)}
                    className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border shrink-0 ${checked ? 'bg-red-500/30 border-red-500/70' : 'bg-secondary border-border'}`}>
                    {checked ? <X size={9} className="text-red-400" /> : <span className="text-[8px] font-black text-muted-foreground/40">{shortcutKey}</span>}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-semibold ${checked ? 'text-red-400' : 'text-foreground'}`}>{t(`redFlagItems.${key}.label`)}</span>
                      {checked
                        ? <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500/15 text-red-400">{t('redFlagPts')}</span>
                        : <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-secondary text-muted-foreground/35">{t('ptsIfFlagged')}</span>
                      }
                    </div>
                    <div className="text-xs text-muted-foreground/60 mt-0.5">{t(`redFlagItems.${key}.guideline`)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Section 4: Final Evaluation Result */}
      <motion.div variants={STAGGER_ITEM} className="rounded-2xl overflow-hidden border border-border bg-card shadow-sm">
        <div className="px-4 py-3 bg-primary/5 border-b border-border flex items-center justify-between">
          <span className="text-xs font-black text-foreground uppercase tracking-wider">{t('finalResultHeader')}</span>
          <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">[Space] to toggle</span>
        </div>
        <div className="p-3 space-y-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onChange({ ...criteria, finalResult: 'passed' })}
              className={`flex-1 py-2.5 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${criteria.finalResult === 'passed' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 shadow-lg shadow-emerald-500/10' : 'border-border bg-secondary/20 text-muted-foreground opacity-60 hover:opacity-100'}`}
            >
              <CheckCircle2 size={16} />
              <span className="text-sm font-black">{t('finalResultPassed')}</span>
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...criteria, finalResult: 'failed' })}
              className={`flex-1 py-2.5 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${criteria.finalResult === 'failed' ? 'border-red-500 bg-red-500/10 text-red-600 shadow-lg shadow-red-500/10' : 'border-border bg-secondary/20 text-muted-foreground opacity-60 hover:opacity-100'}`}
            >
              <AlertCircle size={16} />
              <span className="text-sm font-black">{t('finalResultFailed')}</span>
            </button>
          </div>

          {criteria.finalResult === 'failed' && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
              <label className="text-xs font-bold text-red-500 uppercase tracking-widest">{t('failReasonLabel')}</label>
              <textarea
                value={criteria.failReason || ''}
                onChange={e => onChange({ ...criteria, failReason: e.target.value })}
                placeholder={t('failReasonPlaceholder')}
                rows={3}
                className="w-full px-4 py-3 rounded-xl text-sm text-foreground outline-none resize-none bg-red-500/[0.03] border border-red-500/20 focus:border-red-500/40"
              />
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* General Remark */}
      <motion.div variants={STAGGER_ITEM}>
        <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">
          {t('generalRemarkLabel')}
          {criteria.generalRemark.trim() && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />}
        </label>
        <textarea
          value={criteria.generalRemark} onChange={e => onChange({ ...criteria, generalRemark: e.target.value })}
          placeholder={t('generalRemarkPlaceholder')} rows={2}
          className="w-full px-3 py-2 rounded-xl text-sm text-foreground outline-none resize-none bg-secondary/40 border border-border focus:border-blue-500/40"
        />
      </motion.div>
    </motion.div>
  );
};
