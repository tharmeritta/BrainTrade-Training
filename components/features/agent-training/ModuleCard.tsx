'use client';

import React, { memo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, Lock, XCircle, Zap, RotateCcw, ArrowRight, Star } from 'lucide-react';
import { STAGGER_ITEM } from '@/lib/animations';
import { StepState, scoreColor } from '@/lib/training';
import { STEPS } from '@/constants/training';
import { playGamifiedSound, triggerHaptic } from '@/components/features/quiz/gamification';

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

  // Calculate 3-Star Mastery Rating
  let stars = 0;
  if (score !== undefined && score >= 100) stars = 3;
  else if (score !== undefined && score >= 85) stars = 2;
  else if (passed || (score !== undefined && score >= 70)) stars = 1;

  const handleCardClick = () => {
    if (locked) {
      playGamifiedSound('wrong');
      triggerHaptic('wrong');
    } else {
      playGamifiedSound('correct');
      triggerHaptic('correct');
    }
  };

  return (
    <motion.div
      data-tour={`${step.id}-module`}
      variants={STAGGER_ITEM}
      whileHover={locked ? {} : { y: -8, scale: 1.01, transition: { duration: 0.3, ease: 'easeOut' } }}
      className="group relative flex flex-col rounded-[2.5rem] overflow-hidden transition-all duration-500 h-full border backdrop-blur-xl"
      style={{
        background: locked 
          ? 'rgba(15, 23, 42, 0.4)' 
          : isNext 
            ? `linear-gradient(135deg, rgba(255,255,255,0.08) 0%, ${color}15 100%)` 
            : 'rgba(255, 255, 255, 0.04)',
        borderColor: locked 
          ? 'rgba(255, 255, 255, 0.08)' 
          : passed ? color + '60' 
          : hasFailed ? 'rgba(248,113,113,0.4)' 
          : isNext ? color + '80' 
          : 'rgba(255, 255, 255, 0.12)',
        opacity: locked ? 0.5 : 1,
        boxShadow: isNext ? `0 20px 50px -12px ${color}40` : passed ? `0 10px 30px -10px ${color}20` : 'none',
      }}
    >
      {/* Decorative Gradient Glow */}
      <div 
        className="absolute -top-24 -right-24 w-48 h-48 blur-[100px] rounded-full opacity-20 pointer-events-none transition-opacity duration-700 group-hover:opacity-60"
        style={{ background: color }} 
      />

      <div className="p-8 pb-6 flex items-start justify-between relative z-10">
        <div className="relative">
          <motion.div 
            className="w-16 h-16 rounded-[1.25rem] flex items-center justify-center border shadow-2xl transition-all duration-700 group-hover:scale-110 group-hover:rotate-[8deg]"
            style={{
              background: locked ? 'rgba(255,255,255,0.02)' : `linear-gradient(135deg, ${color}35, ${color}10)`,
              borderColor: locked ? 'rgba(255,255,255,0.08)' : color + '60',
              boxShadow: !locked ? `0 8px 32px -8px ${color}50` : 'none'
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
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center shadow-lg">
              <Star size={10} className="text-white fill-current animate-pulse" />
            </div>
          )}
        </div>

        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black tracking-[0.3em] uppercase opacity-70"
              style={{ color: locked ? 'inherit' : color }}>
              Phase {stepNum}
            </span>
            {/* 3-Star Mastery Rating Badges */}
            {!locked && (
              <div className="flex items-center gap-0.5 ml-1">
                {[1, 2, 3].map(starNum => (
                  <Star
                    key={starNum}
                    size={13}
                    className={`transition-all duration-300 ${
                      starNum <= stars
                        ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]'
                        : 'text-muted-foreground/30 fill-muted/10'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
          {isNext && (
            <motion.div 
              animate={{ 
                boxShadow: [`0 0 0px ${color}00`, `0 0 20px ${color}60`, `0 0 0px ${color}00`] 
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
           <span className="text-[11px] font-black uppercase tracking-[0.2em] opacity-60" style={{ color: locked ? 'inherit' : color }}>
             {t(sublabelKey)}
           </span>
        </div>
        <h3 className="text-2xl font-black text-foreground mb-3 leading-tight group-hover:translate-x-1.5 transition-transform duration-500 tracking-tight">
          {navT(labelKey)}
        </h3>
        <p className="text-[14px] leading-relaxed text-muted-foreground mb-8 font-medium opacity-85 line-clamp-3">
          {t(descKey)}
        </p>

        {/* Sub-steps / Progress Details */}
        {!locked && (
           <div className="flex flex-wrap gap-2.5 mb-8">
             {passed ? (
                <div className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-sm">
                  <CheckCircle2 size={12} />
                  {t('passed')}
                </div>
             ) : hasFailed ? (
                <div className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 bg-red-500/10 text-red-400 border-red-500/30 shadow-sm">
                  <RotateCcw size={12} />
                  {t('failed')}
                </div>
             ) : isNext && (
                <div className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 shadow-sm"
                     style={{ background: `${color}15`, color, borderColor: color + '40' }}>
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
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">Mastery Level</span>
              <span className="text-lg font-black" style={{ color: hasFailed ? '#F87171' : scoreColor(score) }}>{score}%</span>
            </div>
            <div className="h-3.5 rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/10 shadow-inner backdrop-blur-sm">
               <motion.div 
                 className="h-full rounded-full relative"
                 initial={{ width: 0 }}
                 animate={{ width: `${score}%` }}
                 transition={{ delay: 0.3, duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                 style={{ 
                   background: hasFailed 
                    ? 'linear-gradient(90deg, #F87171, #EF4444)' 
                    : `linear-gradient(90deg, ${color}70, ${color})`,
                   boxShadow: !hasFailed ? `0 0 15px ${color}60` : 'none'
                 }}
               >
                 <div className="absolute inset-0 bg-white/30 mix-blend-overlay animate-shimmer" style={{ backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }} />
               </motion.div>
            </div>
          </div>
        )}

        {locked ? (
          <div
            tabIndex={0}
            role="button"
            aria-disabled="true"
            onClick={handleCardClick}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCardClick(); }}
            className="w-full flex items-center justify-center gap-3 py-5 rounded-[1.25rem] bg-white/[0.02] border border-white/5 text-muted-foreground/40 text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-500 cursor-not-allowed"
          >
            <Lock size={16} /> {t('locked')}
          </div>
        ) : (
          <Link href={href}
            onClick={handleCardClick}
            className="group/btn w-full flex items-center justify-center gap-3 py-5 rounded-[1.25rem] text-sm font-black transition-all duration-500 border shadow-lg hover:shadow-2xl active:scale-[0.98]"
            style={{ 
              background: isNext ? color : 'rgba(255,255,255,0.05)',
              borderColor: isNext ? color : color + '40',
              color: isNext ? '#fff' : color,
              boxShadow: isNext ? `0 15px 35px -10px ${color}60` : 'none'
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
