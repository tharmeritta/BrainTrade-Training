'use client';

import React, { memo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, Lock, XCircle, Zap, RotateCcw, ArrowRight } from 'lucide-react';
import { STAGGER_ITEM } from '@/lib/animations';
import { StepState, scoreColor } from '@/lib/training';
import { STEPS } from '@/constants/training';

interface ModuleCardProps {
  step: typeof STEPS[number];
  state: StepState;
  href: string;
  t: (key: string, values?: any) => string;
  navT: (key: string) => string;
}

export const ModuleCard = memo(({ step, state, href, t, navT }: ModuleCardProps) => {
  const { Icon, color, labelKey, sublabelKey, descKey, step: stepNum } = step;
  const { locked, passed, score } = state;
  const isNext    = !locked && !passed && score === undefined;
  const hasFailed = !locked && !passed && score !== undefined && score < 70;

  return (
    <motion.div
      variants={STAGGER_ITEM}
      className="group relative flex flex-col rounded-[2rem] overflow-hidden transition-all duration-500 h-full border"
      style={{
        background: locked ? 'var(--hub-locked-bg)' : 'var(--hub-card)',
        borderColor: locked 
          ? 'var(--hub-dim-border)' 
          : passed ? color + '40' 
          : hasFailed ? 'rgba(248,113,113,0.4)' 
          : isNext ? color + '30' 
          : 'var(--hub-border)',
        opacity: locked ? 0.65 : 1,
        boxShadow: isNext ? `0 12px 40px -12px ${color}25` : 'none',
      }}
    >
      <div className="p-7 pb-5 flex items-start justify-between relative z-10">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
          style={{
            background: locked ? 'rgba(0,0,0,0.04)' : `${color}15`,
            borderColor: locked ? 'var(--hub-dim-border)' : color + '30',
          }}>
          {passed
            ? <CheckCircle2 size={28} style={{ color }} />
            : locked ? <Lock size={20} style={{ color: 'var(--hub-dim)' }} />
            : hasFailed ? <XCircle size={28} style={{ color: '#F87171' }} />
            : <Icon size={28} style={{ color }} />
          }
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black tracking-[0.25em] opacity-40 uppercase mb-1"
            style={{ color: locked ? 'var(--hub-dim)' : color }}>
            Step {stepNum < 10 ? `0${stepNum}` : stepNum}
          </span>
          {isNext && (
            <motion.span 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg shadow-sm" 
              style={{ background: color, color: '#fff' }}>
              <Zap size={9} fill="currentColor" /> {t('next')}
            </motion.span>
          )}
        </div>
      </div>

      <div className="px-7 flex-1 flex flex-col relative z-10">
        <div className="mb-1.5">
           <span className="text-[10px] font-black uppercase tracking-[0.18em] opacity-60" style={{ color: locked ? 'var(--hub-dim)' : color }}>
             {t(sublabelKey)}
           </span>
        </div>
        <h3 className="text-xl font-black text-[color:var(--hub-text)] mb-2.5 leading-tight group-hover:translate-x-1 transition-transform duration-300">
          {navT(labelKey)}
        </h3>
        <p className="text-[13px] leading-relaxed text-[color:var(--hub-muted)] mb-8 font-medium">
          {t(descKey)}
        </p>

        {!locked && (
           <div className="flex flex-wrap gap-2 mb-8">
             {passed && (
                <div className="px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-2"
                     style={{ background: `${color}10`, color, borderColor: color + '30' }}>
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: color }} />
                  {t('passed')}
                </div>
             )}
             {hasFailed && (
                <div className="px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-red-500/20 flex items-center gap-2"
                     style={{ background: 'rgba(248,113,113,0.1)', color: '#F87171' }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  {t('failed')}
                </div>
             )}
           </div>
        )}
      </div>

      <div className="p-7 pt-0 mt-auto relative z-10">
        {score !== undefined && !locked && (
          <div className="mb-6">
            <div className="flex justify-between items-end mb-2.5">
              <span className="text-[10px] font-black text-[color:var(--hub-dim)] uppercase tracking-widest">Performance</span>
              <span className="text-sm font-black" style={{ color: hasFailed ? '#F87171' : scoreColor(score) }}>{score}%</span>
            </div>
            <div className="h-2 rounded-full bg-[color:var(--hub-progress-bg)] overflow-hidden p-0.5 border border-white/5 shadow-inner">
               <motion.div 
                 className="h-full rounded-full shadow-[0_0_12px_rgba(0,0,0,0.1)]"
                 initial={{ width: 0 }}
                 animate={{ width: `${score}%` }}
                 transition={{ delay: 0.3, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                 style={{ background: hasFailed ? 'linear-gradient(90deg, #F87171, #EF4444)' : `linear-gradient(90deg, ${color}80, ${color})` }}
               />
            </div>
          </div>
        )}

        {locked ? (
          <div className="w-full flex items-center justify-center gap-2.5 py-4.5 rounded-2xl bg-[color:var(--hub-locked-bg)] border border-[color:var(--hub-dim-border)] text-[color:var(--hub-dim)] text-xs font-black uppercase tracking-widest opacity-80">
            <Lock size={14} /> {t('locked')}
          </div>
        ) : (
          <Link href={href}
            className="group/btn w-full flex items-center justify-center gap-2.5 py-4.5 rounded-2xl text-sm font-black transition-all duration-300 border shadow-sm hover:shadow-xl"
            style={{ 
              background: isNext ? color : `${color}12`,
              borderColor: isNext ? color : color + '40',
              color: isNext ? '#fff' : color,
              boxShadow: isNext ? `0 10px 25px -5px ${color}40` : 'none'
            }}
          >
            {passed ? (
              <><RotateCcw size={16} className="group-hover/btn:rotate-180 transition-transform duration-700" />{t('retake')}</>
            ) : (
              <>{t('startNow')}<ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-1.5" /></>
            )}
          </Link>
        )}
      </div>

      <div className="absolute top-0 right-0 w-32 h-32 blur-[80px] rounded-full opacity-20 pointer-events-none"
           style={{ background: color }} />
    </motion.div>
  );
});

ModuleCard.displayName = 'ModuleCard';
