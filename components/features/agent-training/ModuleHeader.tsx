import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FADE_IN } from '@/lib/animations';
import { STEPS, BADGE } from '@/constants/training';
import type { AgentStats } from '@/types';
import { Calendar, Shield } from 'lucide-react';

interface ModuleHeaderProps {
  doneCount: number;
  stats: AgentStats | null;
  t: (key: string, values?: any) => string;
}

export const ModuleHeader = memo(({ doneCount, stats, t }: ModuleHeaderProps) => {
  const badge = (stats?.badge ?? 'developing') as keyof typeof BADGE;
  const badgeCfg = BADGE[badge];

  // Derive training day (mocked for now, but usually comes from training period)
  const trainingDay = useMemo(() => {
    if (!stats?.agent.createdAt) return 1;
    const start = new Date(stats.agent.createdAt).getTime();
    const now = new Date().getTime();
    const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24)) + 1;
    return Math.min(Math.max(diff, 1), 5); // Assuming 5-day batch
  }, [stats]);

  return (
    <motion.div
      variants={FADE_IN}
      initial="initial"
      animate="animate"
      className="shrink-0 px-6 py-6 border-b bg-card/30 backdrop-blur-xl sticky top-0 z-20"
      style={{ borderColor: 'rgba(255,255,255,0.05)' }}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex w-12 h-12 rounded-2xl items-center justify-center border shadow-inner"
               style={{ background: badgeCfg.bg, borderColor: badgeCfg.border }}>
            <Shield size={24} style={{ color: badgeCfg.color }} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground opacity-60">
                {t('trainingModules')}
              </span>
              <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-secondary border border-border/40">
                <Calendar size={10} className="text-primary" />
                <span className="text-[10px] font-black uppercase tracking-tight text-primary">Day {trainingDay} of 5</span>
              </div>
            </div>
            <h2 className="text-2xl font-black leading-none text-foreground tracking-tight">
               Learning Pathway
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-center">
          <div className="flex flex-col items-end mr-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50 mb-0.5">Overall Progress</span>
            <div className="flex items-center gap-2">
               <div className="w-24 h-1.5 rounded-full bg-secondary overflow-hidden">
                 <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(doneCount / STEPS.length) * 100}%` }}
                    className="h-full bg-primary rounded-full"
                 />
               </div>
               <span className="text-xs font-black text-foreground">{Math.round((doneCount / STEPS.length) * 100)}%</span>
            </div>
          </div>
          <span className="text-[11px] font-black px-4 py-2 rounded-xl shrink-0 border bg-background/50 backdrop-blur-md shadow-sm"
            style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            {doneCount} / {STEPS.length} Completed
          </span>
        </div>
      </div>
    </motion.div>
  );
});

ModuleHeader.displayName = 'ModuleHeader';
