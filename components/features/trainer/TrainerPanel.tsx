'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { GraduationCap, Presentation, Waves } from 'lucide-react';
import { WaveManagementTab } from './WaveManagementTab';
import { PresentationSystemTab } from './PresentationSystemTab';

interface TrainerPanelProps {
  role: 'admin' | 'manager' | 'it' | 'trainer' | 'hr';
  uid?: string;
  name?: string;
  readOnly?: boolean;
}

export type TrainingSubDomain = 'wave' | 'presentation';

export default function TrainerPanel({ role, uid, name, readOnly }: TrainerPanelProps) {
  const t = useTranslations('trainer');
  const [subDomain, setSubDomain] = useState<TrainingSubDomain>('wave');

  return (
    <div className="flex flex-col gap-6 flex-1 min-h-0">
      {/* Top Header & Sub-Domain Segmented Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/50 pb-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg bg-amber-500/10 border border-amber-500/20 text-amber-500">
            <GraduationCap size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-foreground tracking-tight">
              {t('management')}
            </h2>
            <p className="text-xs text-muted-foreground font-medium opacity-80">
              {subDomain === 'wave'
                ? 'จัดการคอร์สอบรม รุ่นนักเรียน และบันทึกเวลาเรียน (Wave & Roster Management)'
                : 'จัดการสไลด์บทเรียน บันทึกย่อผู้สอน และระบบถ่ายทอดสด (Presentation System)'}
            </p>
          </div>
        </div>

        {/* Segmented Sub-Domain Switcher */}
        <div
          role="tablist"
          aria-label={t('management')}
          className="flex items-center rounded-2xl bg-secondary/40 p-1.5 border border-border/60 shadow-inner relative"
        >
          <button
            id="tab-wave"
            role="tab"
            aria-selected={subDomain === 'wave'}
            aria-controls="tabpanel-wave"
            onClick={() => setSubDomain('wave')}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                setSubDomain('presentation');
              }
            }}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              subDomain === 'wave'
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {subDomain === 'wave' && (
              <motion.div
                layoutId="trainer-active-subdomain"
                className="absolute inset-0 bg-card rounded-xl shadow-md ring-1 ring-border"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Waves size={16} className={subDomain === 'wave' ? 'text-amber-500' : ''} aria-hidden="true" />
              <span>Wave Management</span>
            </span>
          </button>

          <button
            id="tab-presentation"
            role="tab"
            aria-selected={subDomain === 'presentation'}
            aria-controls="tabpanel-presentation"
            onClick={() => setSubDomain('presentation')}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                setSubDomain('wave');
              }
            }}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              subDomain === 'presentation'
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {subDomain === 'presentation' && (
              <motion.div
                layoutId="trainer-active-subdomain"
                className="absolute inset-0 bg-card rounded-xl shadow-md ring-1 ring-border"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Presentation size={16} className={subDomain === 'presentation' ? 'text-primary' : ''} aria-hidden="true" />
              <span>Presentation System</span>
            </span>
          </button>
        </div>
      </div>

      {/* Domain Sub-Tab Views */}
      <div
        role="tabpanel"
        id={subDomain === 'wave' ? 'tabpanel-wave' : 'tabpanel-presentation'}
        aria-labelledby={subDomain === 'wave' ? 'tab-wave' : 'tab-presentation'}
        tabIndex={0}
        className="flex-1 flex flex-col min-h-0 focus-visible:outline-none"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={subDomain}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 flex flex-col min-h-0 w-full"
          >
            {subDomain === 'wave' && (
              <WaveManagementTab role={role} uid={uid} name={name} readOnly={readOnly} />
            )}
            {subDomain === 'presentation' && (
              <PresentationSystemTab role={role} uid={uid} name={name} readOnly={readOnly} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

