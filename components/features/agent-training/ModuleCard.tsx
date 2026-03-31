'use client';

import React, { memo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, Lock, XCircle, Zap, RotateCcw, ArrowRight, Star } from 'lucide-react';
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
      whileHover={locked ? {} : { y: -8, transition: { duration: 0.3, ease: 'easeOut' } }}
      className="group relative flex flex-col rounded-[2.5rem] overflow-hidden transition-all duration-500 h-full border backdrop-blur-md"
      style={{
        background: locked 
          ? 'rgba(15, 23, 42, 0.4)' 
          : isNext 
            ? `linear-gradient(135deg, rgba(255,255,255,0.05) 0%, ${color}10 100%)` 
            : 'rgba(255, 255, 255, 0.03)',
        borderColor: locked 
          ? 'rgba(255, 255, 255, 0.05)' 
          : passed ? color + '40' 
          : hasFailed ? 'rgba(248,113,113,0.3)' 
          : isNext ? color + '50' 
          : 'rgba(255, 255, 255, 0.08)',
        opacity: locked ? 0.5 : 1,
        boxShadow: isNext ? `0 20px 50px -12px ${color}30` : 'none',
      }}
    >
      {/* Decorative Gradient Glow */}
      <div 
        className="absolute -top-24 -right-24 w-48 h-48 blur-[100px] rounded-full opacity-20 pointer-events-none transition-opacity duration-700 group-hover:opacity-40"
        style={{ background: color }} 
      />

      <div className="p-8 pb-6 flex items-start justify-between relative z-10">
        <div className="relative">
          <motion.div 
            className="w-16 h-16 rounded-[1.25rem] flex items-center justify-center border shadow-xl transition-all duration-700 group-hover:scale-110 group-hover:rotate-[10deg]"
            style={{
              background: locked ? 'rgba(255,255,255,0.02)' : `linear-gradient(135deg, ${color}25, ${color}05)`,
              borderColor: locked ? 'rgba(255,255,255,0.05)' : color + '40',
              boxShadow: !locked ? `0 8px 32px -8px ${color}40` : 'none'
            }}>
            {passed
              ? <CheckCircle2 size={32} style={{ color }} />
              : locked ? <Lock size={24} className="text-muted-foreground/40" />
              : hasFailed ? <XCircle size={32} className="text-red-400" />
              : <Icon size={32} style={{ color }} />
            }
          </motion.div>
          
          {/* Rank Badge Indicator */}
          {passed && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-4 border-[color:var(--hub-card)] flex items-center justify-center shadow-lg">
              <Star size={10} className="text-white fill-current" />
            </div>
          )}
        </div>

        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black tracking-[0.3em] opacity-30 uppercase"
              style={{ color: locked ? 'inherit' : color }}>
              Phase {stepNum}
            </span>
          </div>
          {isNext && (
            <motion.div 
              animate={{ 
                boxShadow: [`0 0 0px ${color}00`, `0 0 15px ${color}40`, `0 0 0px ${color}00`] 
              }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-lg" 
              style={{ background: color, color: '#fff' }}>
              <Zap size={10} fill="currentColor" className="animate-pulse" /> 
              {t('next')}
            </motion.div>
          )}
        </div>
      </div>

      <div className="px-8 flex-1 flex flex-col relative z-10">
        <div className="mb-2">
           <span className="text-[11px] font-black uppercase tracking-[0.2em] opacity-50" style={{ color: locked ? 'inherit' : color }}>
             {t(sublabelKey)}
           </span>
        </div>
        <h3 className="text-2xl font-black text-foreground mb-3 leading-tight group-hover:translate-x-1.5 transition-transform duration-500 tracking-tight">
          {navT(labelKey)}
        </h3>
        <p className="text-[14px] leading-relaxed text-muted-foreground mb-8 font-medium opacity-80 line-clamp-3">
          {t(descKey)}
        </p>

        {/* Sub-steps / Progress Details */}
        {!locked && (
           <div className="flex flex-wrap gap-2.5 mb-8">
             {passed ? (
                <div className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                  <CheckCircle2 size={12} />
                  {t('passed')}
                </div>
             ) : hasFailed ? (
                <div className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 bg-red-500/10 text-red-400 border-red-500/20">
                  <RotateCcw size={12} />
                  {t('failed')}
                </div>
             ) : isNext && (
                <div className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-2"
                     style={{ background: `${color}10`, color, borderColor: color + '20' }}>
                  <Target size={12} className="text-current" />
                  Active Task
                </div>
             )}
           </div>
        )}
      </div>

      <div className="p-8 pt-0 mt-auto relative z-10">
        {score !== undefined && !locked && (
          <div className="mb-8">
            <div className="flex justify-between items-end mb-3">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-50">Mastery Level</span>
              <span className="text-lg font-black" style={{ color: hasFailed ? '#F87171' : scoreColor(score) }}>{score}%</span>
            </div>
            <div className="h-3 rounded-full bg-white/5 overflow-hidden p-0.5 border border-white/5 shadow-inner backdrop-blur-sm">
               <motion.div 
                 className="h-full rounded-full relative"
                 initial={{ width: 0 }}
                 animate={{ width: `${score}%` }}
                 transition={{ delay: 0.3, duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                 style={{ 
                   background: hasFailed 
                    ? 'linear-gradient(90deg, #F87171, #EF4444)' 
                    : `linear-gradient(90deg, ${color}60, ${color})`,
                   boxShadow: !hasFailed ? `0 0 15px ${color}40` : 'none'
                 }}
               >
                 <div className="absolute inset-0 bg-white/20 mix-blend-overlay animate-shimmer" style={{ backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }} />
               </motion.div>
            </div>
          </div>
        )}

        {locked ? (
          <div className="w-full flex items-center justify-center gap-3 py-5 rounded-[1.25rem] bg-white/[0.02] border border-white/5 text-muted-foreground/30 text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-500">
            <Lock size={16} /> {t('locked')}
          </div>
        ) : (
          <Link href={href}
            className="group/btn w-full flex items-center justify-center gap-3 py-5 rounded-[1.25rem] text-sm font-black transition-all duration-500 border shadow-lg hover:shadow-2xl active:scale-[0.98]"
            style={{ 
              background: isNext ? color : 'rgba(255,255,255,0.03)',
              borderColor: isNext ? color : color + '30',
              color: isNext ? '#fff' : color,
              boxShadow: isNext ? `0 15px 35px -10px ${color}50` : 'none'
            }}
          >
            {passed ? (
              <><RotateCcw size={18} className="group-hover/btn:rotate-180 transition-transform duration-1000" />{t('retake')}</>
            ) : (
              <>{t('startNow')}<ArrowRight size={18} className="transition-transform group-hover/btn:translate-x-2" /></>
            )}
          </Link>
        )}
      </div>

      {/* Decorative noise/texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("/noise.svg")' }} />
    </motion.div>
  );
});

function Target(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
  );
}

ModuleCard.displayName = 'ModuleCard';
