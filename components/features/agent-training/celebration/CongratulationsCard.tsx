'use client';

import React, { memo } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Award } from 'lucide-react';
import { FADE_IN, STAGGER_CONTAINER } from '@/lib/animations';
import { Confetti } from './Confetti';
import { TrophyHero } from './TrophyHero';

interface CongratulationsCardProps {
  t: (key: string, values?: any) => string;
}

export const CongratulationsCard = memo(({ t }: CongratulationsCardProps) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [5, -5]), { stiffness: 100, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-5, 5]), { stiffness: 100, damping: 30 });

  function handleMouseMove(e: React.MouseEvent) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ rotateX, rotateY, perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="mb-12 p-1 relative group"
    >
      <div className="relative p-10 lg:p-14 rounded-[3.5rem] border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/15 via-white/5 to-transparent backdrop-blur-3xl flex flex-col items-center text-center overflow-hidden shadow-[0_40px_100px_-20px_rgba(245,158,11,0.2)]">
        <Confetti />
        
        <motion.div 
          className="absolute inset-0 pointer-events-none"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 5 }}
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
          }}
        />

        <TrophyHero />
        
        <motion.div
          variants={STAGGER_CONTAINER}
          initial="initial"
          animate="animate"
          className="relative z-30"
        >
          <motion.h2 variants={FADE_IN} className="text-sm font-black text-amber-500 uppercase tracking-[0.4em] mb-4">
             {t('allFinished')}
          </motion.h2>

          <motion.h3 
            variants={{
              initial: { opacity: 0, scale: 0.8 },
              animate: { opacity: 1, scale: 1, transition: { type: 'spring', damping: 12, stiffness: 200 } }
            }}
            className="text-4xl lg:text-6xl font-black text-[color:var(--hub-text)] mb-6 tracking-tight leading-tight max-w-2xl bg-gradient-to-b from-[color:var(--hub-text)] to-[color:var(--hub-text)]/70 bg-clip-text text-transparent"
          >
            {t('congratsTitle')}
          </motion.h3>
          
          <motion.p variants={FADE_IN} className="text-xl text-[color:var(--hub-muted)] font-medium max-w-2xl leading-relaxed mb-10">
            {t('congratsDesc')}
          </motion.p>

          <motion.div variants={FADE_IN} className="w-full h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent mb-10" />

          <motion.div variants={FADE_IN} className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-5 px-10 py-5 rounded-[2rem] bg-white/40 dark:bg-black/40 border border-amber-500/20 shadow-2xl backdrop-blur-sm group/badge hover:bg-white/60 transition-colors duration-500">
              <div className="relative">
                <div className="w-4 h-4 rounded-full bg-amber-500 animate-ping absolute inset-0 opacity-40" />
                <div className="w-4 h-4 rounded-full bg-amber-500 relative z-10" />
              </div>
              <div className="flex flex-col items-start translate-y-[1px]">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-600 mb-0.5">{t('pendingFinalEval')}</span>
                <span className="text-base font-bold text-[color:var(--hub-text)]">{t('pendingEvalDesc')}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-xs font-bold text-[color:var(--hub-dim)] opacity-60">
              <Award size={14} />
              <span>Evaluation will be conducted by a supervisor shortly.</span>
            </div>
          </motion.div>
        </motion.div>

        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[100px] pointer-events-none -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 blur-[100px] pointer-events-none -ml-32 -mb-32" />
      </div>
    </motion.div>
  );
});

CongratulationsCard.displayName = 'CongratulationsCard';
