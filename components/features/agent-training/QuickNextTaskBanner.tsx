'use client';

import React, { memo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, Clock, Sparkles } from 'lucide-react';
import { STEPS } from '@/constants/training';
import { StepState } from '@/lib/training';
import { playGamifiedSound, triggerHaptic } from '@/components/features/quiz/gamification';

interface QuickNextTaskBannerProps {
  currentStep?: typeof STEPS[number];
  derived: Record<string, StepState>;
  locale: string;
  t: (key: string, values?: any) => string;
}

export const QuickNextTaskBanner = memo(({ currentStep, derived, locale, t }: QuickNextTaskBannerProps) => {
  if (!currentStep) return null;

  const { Icon, color, labelKey, step: stepNum, id } = currentStep;
  const href = `/${locale}/${id}`;

  const handleClick = () => {
    playGamifiedSound('correct');
    triggerHaptic('correct');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 p-6 rounded-[2.5rem] border border-amber-500/30 bg-gradient-to-r from-card via-card to-amber-500/10 shadow-2xl relative overflow-hidden group"
    >
      {/* Ambient Pulsing Glow */}
      <div 
        className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 transition-opacity duration-700 group-hover:opacity-100 opacity-40"
        style={{ background: `${color}25` }}
      />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Next Step Info */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div 
            className="w-14 h-14 rounded-2xl flex items-center justify-center border shadow-lg shrink-0 transition-transform group-hover:scale-110"
            style={{
              background: `linear-gradient(135deg, ${color}35, ${color}10)`,
              borderColor: `${color}60`,
              boxShadow: `0 8px 32px -8px ${color}50`,
            }}
          >
            <Icon size={28} style={{ color }} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span 
                className="text-[10px] font-black uppercase tracking-[0.2em] px-2.5 py-0.5 rounded-full border"
                style={{
                  background: `${color}15`,
                  color,
                  borderColor: `${color}30`,
                }}
              >
                RECOMMENDED NEXT TASK
              </span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground font-mono">
                <Clock size={12} />
                ~10 mins
              </span>
            </div>

            <h3 className="text-xl font-black text-foreground tracking-tight leading-snug">
              Phase {stepNum}: {t(labelKey)}
            </h3>
          </div>
        </div>

        {/* Action Button */}
        <Link
          href={href}
          onClick={handleClick}
          className="w-full md:w-auto px-7 py-3.5 rounded-2xl text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 group-hover:shadow-2xl shrink-0"
          style={{
            background: `linear-gradient(135deg, ${color}, ${color}dd)`,
            boxShadow: `0 10px 30px -8px ${color}60`,
          }}
        >
          <Zap size={16} className="fill-current animate-pulse" />
          <span>Launch Next Task</span>
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
});

QuickNextTaskBanner.displayName = 'QuickNextTaskBanner';
