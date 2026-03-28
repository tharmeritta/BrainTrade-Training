'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { FADE_IN } from '@/lib/animations';
import { STEPS } from '@/constants/training';

interface ModuleHeaderProps {
  doneCount: number;
  t: (key: string, values?: any) => string;
}

export const ModuleHeader = memo(({ doneCount, t }: ModuleHeaderProps) => {
  return (
    <motion.div
      variants={FADE_IN}
      initial="initial"
      animate="animate"
      className="shrink-0 px-5 py-4 lg:px-6 border-b bg-[color:var(--hub-panel)]"
      style={{ borderColor: 'var(--hub-border)' }}
    >
      <div className="flex items-center gap-3">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.28em] mb-0.5 text-[color:var(--hub-dim)]">
            {t('progress')}
          </p>
          <h2 className="text-base font-black leading-none text-[color:var(--hub-text)]">
            {t('trainingModules')}
          </h2>
        </div>
        <div className="flex-1 h-px ml-1 bg-[color:var(--hub-border)]" />
        <span className="text-xs font-bold px-2.5 py-1 rounded-full shrink-0 border bg-[color:var(--hub-card)] text-[color:var(--hub-muted)]"
          style={{ borderColor: 'var(--hub-border)' }}>
          {t('modulesPassed', { done: doneCount, total: STEPS.length })}
        </span>
      </div>
    </motion.div>
  );
});

ModuleHeader.displayName = 'ModuleHeader';
