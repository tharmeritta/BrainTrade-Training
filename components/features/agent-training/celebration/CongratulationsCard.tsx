'use client';

import React, { memo } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Award, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { FADE_IN, STAGGER_CONTAINER } from '@/lib/animations';
import { Confetti } from './Confetti';
import { TrophyHero } from './TrophyHero';

interface CongratulationsCardProps {
  t: (key: string, values?: any) => string;
  graduated?: boolean;
  acknowledged?: boolean;
  onAcknowledge?: () => Promise<void>;
  onOpenCertificate?: () => void;
}

export const CongratulationsCard = memo(({ t, graduated, acknowledged, onAcknowledge, onOpenCertificate }: CongratulationsCardProps) => {
  const [isSaving, setIsSaving] = React.useState(false);
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

  const handleConfirm = async () => {
    if (!onAcknowledge || isSaving) return;
    setIsSaving(true);
    try {
      await onAcknowledge();
    } finally {
      setIsSaving(false);
    }
  };

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
        {(graduated || acknowledged) && <Confetti />}
        
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
             {acknowledged ? "Graduation Confirmed" : graduated ? "Graduation Ready" : t('allFinished')}
          </motion.h2>

          <motion.h3 
            variants={{
              initial: { opacity: 0, scale: 0.8 },
              animate: { opacity: 1, scale: 1, transition: { type: 'spring', damping: 12, stiffness: 200 } }
            }}
            className="text-4xl lg:text-6xl font-black text-[color:var(--hub-text)] mb-6 tracking-tight leading-tight max-w-2xl bg-gradient-to-b from-[color:var(--hub-text)] to-[color:var(--hub-text)]/70 bg-clip-text text-transparent"
          >
            {acknowledged ? "Officially Certified!" : graduated ? "You've Graduated!" : t('congratsTitle')}
          </motion.h3>
          
          <motion.p variants={FADE_IN} className="text-xl text-[color:var(--hub-muted)] font-medium max-w-2xl leading-relaxed mb-10">
            {acknowledged 
              ? "Your certification has been registered in the system. You are now officially cleared for live operations. Success awaits!"
              : graduated 
                ? "Excellent news! Your supervisor has reviewed your performance and you have passed the final evaluation. Please confirm to finalize your record." 
                : t('congratsDesc')}
          </motion.p>

          <motion.div variants={FADE_IN} className="w-full h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent mb-10" />

          <motion.div variants={FADE_IN} className="flex flex-col items-center gap-6">
            {!graduated && !acknowledged ? (
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
            ) : acknowledged ? (
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={20} />
                  <span className="text-sm font-black uppercase tracking-wider">Certified & Cleared</span>
                </div>
                {onOpenCertificate && (
                  <button
                    onClick={onOpenCertificate}
                    className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all"
                  >
                    <Award size={16} />
                    <span>Download Certificate</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button
                  onClick={handleConfirm}
                  disabled={isSaving}
                  className="group relative px-10 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-[0_20px_40px_-10px_rgba(245,158,11,0.5)] transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 overflow-hidden"
                >
                  <div className="relative z-10 flex items-center gap-3">
                    {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Award size={18} />}
                    <span>Confirm Graduation</span>
                    {!isSaving && <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </button>

                {onOpenCertificate && (
                  <button
                    onClick={onOpenCertificate}
                    className="flex items-center gap-2 px-7 py-4 rounded-[2rem] bg-card border border-border text-foreground font-black text-xs uppercase tracking-wider hover:bg-secondary transition-all shadow-md"
                  >
                    <Award size={16} />
                    <span>View Certificate</span>
                  </button>
                )}
              </div>
            )}
            
            <div className="flex items-center gap-2 text-xs font-bold text-[color:var(--hub-dim)] opacity-60">
              {acknowledged ? (
                <span>Recorded at {new Date().toLocaleDateString()}</span>
              ) : graduated ? (
                <span>Confirming will archive your training batch to the history records.</span>
              ) : (
                <>
                  <Award size={14} />
                  <span>Evaluation will be conducted by a supervisor shortly.</span>
                </>
              )}
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
