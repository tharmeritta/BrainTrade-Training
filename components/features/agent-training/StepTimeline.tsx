'use client';

import React, { memo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, Lock, XCircle, Zap, RotateCcw, ArrowRight, ChevronRight } from 'lucide-react';
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/animations';
import { StepState, scoreColor } from '@/lib/training';
import { STEPS } from '@/constants/training';

interface StepTimelineProps {
  steps: typeof STEPS;
  derived: Record<string, StepState>;
  hrefs: Record<string, string>;
  t: (key: string, values?: any) => string;
  navT: (key: string) => string;
}

export const StepTimeline = memo(({ steps, derived, hrefs, t, navT }: StepTimelineProps) => {
  return (
    <motion.div 
      variants={STAGGER_CONTAINER}
      initial="initial"
      animate="animate"
      className="flex flex-col gap-6"
    >
      {steps.map((step, idx) => {
        const state = derived[step.id];
        const { Icon, color, labelKey, sublabelKey, step: stepNum } = step;
        const { locked, passed, score } = state;
        const isNext    = !locked && !passed && score === undefined;
        const hasFailed = !locked && !passed && score !== undefined && score < 70;
        const isLast    = idx === steps.length - 1;

        return (
          <motion.div key={step.id} variants={STAGGER_ITEM} className="relative flex gap-4">
            {/* Timeline Line */}
            {!isLast && (
              <div 
                className="absolute left-[23px] top-[46px] bottom-[-24px] w-0.5 rounded-full z-0"
                style={{ background: passed ? color : 'var(--hub-border)', opacity: locked ? 0.3 : 0.6 }}
              />
            )}

            {/* Icon Column */}
            <div className="relative z-10 flex-shrink-0">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm transition-all duration-500"
                style={{
                  background: locked ? 'var(--hub-locked-bg)' : `${color}15`,
                  borderColor: locked ? 'var(--hub-dim-border)' : passed ? color : color + '40',
                }}
              >
                {passed
                  ? <CheckCircle2 size={24} style={{ color }} />
                  : locked ? <Lock size={18} style={{ color: 'var(--hub-dim)' }} />
                  : hasFailed ? <XCircle size={24} style={{ color: '#F87171' }} />
                  : <Icon size={24} style={{ color }} />
                }
              </div>
            </div>

            {/* Content Column */}
            <div className="flex-1 pb-2">
              <Link 
                href={locked ? '#' : hrefs[step.id]}
                className={`group block rounded-3xl p-5 border transition-all duration-300 ${locked ? 'cursor-not-allowed' : 'active:scale-[0.98]'}`}
                style={{
                  background: locked ? 'rgba(0,0,0,0.02)' : 'var(--hub-card)',
                  borderColor: isNext ? color + '40' : 'var(--hub-border)',
                  opacity: locked ? 0.7 : 1,
                  boxShadow: isNext ? `0 10px 30px -10px ${color}20` : 'none',
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-1 block"
                      style={{ color: locked ? 'var(--hub-dim)' : color }}>
                      {t(sublabelKey)}
                    </span>
                    <h3 className="text-lg font-black text-[color:var(--hub-text)] leading-tight">
                      {navT(labelKey)}
                    </h3>
                  </div>
                  {isNext && (
                    <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg bg-amber-500 text-white shadow-sm">
                      <Zap size={9} fill="currentColor" /> {t('next')}
                    </span>
                  )}
                </div>

                {score !== undefined && !locked && (
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-1.5 rounded-full bg-[color:var(--hub-progress-bg)] overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${score}%` }}
                        className="h-full rounded-full"
                        style={{ background: hasFailed ? '#F87171' : color }}
                      />
                    </div>
                    <span className="text-[10px] font-bold" style={{ color: hasFailed ? '#F87171' : scoreColor(score) }}>
                      {score}%
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {passed && (
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        {t('passed')}
                      </span>
                    )}
                    {hasFailed && (
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md bg-red-500/10 text-red-500 border border-red-500/20">
                        {t('failed')}
                      </span>
                    )}
                  </div>
                  
                  {!locked && (
                    <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest group-hover:gap-2.5 transition-all" style={{ color }}>
                      {passed ? t('retake') : t('startNow')}
                      <ChevronRight size={14} />
                    </div>
                  )}
                </div>
              </Link>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
});

StepTimeline.displayName = 'StepTimeline';
