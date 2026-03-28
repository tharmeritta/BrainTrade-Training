'use client';

import React, { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';

import type { AgentStats } from '@/types';
import { STAGGER_CONTAINER } from '@/lib/animations';
import { getCompletionStatus } from '@/lib/completion';
import { deriveSteps, scoreColor } from '@/lib/training';
import { STEPS, BADGE, StepId, BadgeType } from '@/constants/training';

// Modular Components
import { BackgroundEffects } from './BackgroundEffects';
import { ProfileSidebar } from './ProfileSidebar';
import { ModuleHeader } from './ModuleHeader';
import { ModuleCard } from './ModuleCard';
import { StepTimeline } from './StepTimeline';

// Lazy-load celebration UI for performance
const CongratulationsCard = dynamic(
  () => import('./celebration/CongratulationsCard').then(mod => mod.CongratulationsCard),
  { ssr: false }
);

interface Props {
  agentName: string;
  agentId: string;
  agentStageName?: string;
  stats: AgentStats | null;
  onLogout: () => void;
}

export default function AgentTrainingHub({ agentName, agentId, agentStageName, stats, onLogout }: Props) {
  const t         = useTranslations('trainingHub');
  const navT      = useTranslations('nav');
  const pathname  = usePathname();
  const locale    = pathname.split('/')[1] ?? 'th';
  
  const derived = useMemo(() => deriveSteps(stats), [stats]);

  const hrefs: Record<StepId, string> = useMemo(() => ({
    learn:     `/${locale}/learn`,
    quiz:      `/${locale}/quiz`,
    'ai-eval': `/${locale}/ai-eval`,
  }), [locale]);

  const doneCount   = useMemo(() => STEPS.filter(s => derived[s.id].passed).length, [derived]);
  const pct         = Math.round((doneCount / STEPS.length) * 100);
  const badge       = (stats?.badge ?? 'developing') as BadgeType;
  const badgeCfg    = BADGE[badge];
  const score       = stats?.overallScore ?? 0;
  const ringColor   = useMemo(() => scoreColor(score), [score]);
  
  const initials    = useMemo(() => {
    const parts = agentName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [agentName]);
  
  const allDone = useMemo(() => {
    if (!stats) return false;
    const { trainingComplete } = getCompletionStatus(stats, stats.activeScenariosCount);
    return trainingComplete;
  }, [stats]);

  const currentStep = useMemo(() => STEPS.find(s => !derived[s.id].passed && !derived[s.id].locked), [derived]);

  return (
    <div
      className="w-full h-full flex flex-col lg:flex-row bg-[color:var(--hub-bg)]"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      <BackgroundEffects badgeColor={badgeCfg.color} />

      <ProfileSidebar
        agentName={agentName}
        agentStageName={agentStageName}
        score={score}
        ringColor={ringColor}
        initials={initials}
        allDone={allDone}
        currentStep={currentStep}
        badgeCfg={badgeCfg}
        pct={pct}
        xp={stats?.xp ?? 0}
        level={stats?.level ?? 1}
        skills={stats?.skills ?? { foundation: 0, product: 0, process: 0, payment: 0, communication: 0 }}
        derived={derived}
        onLogout={onLogout}
        t={t}
        navT={navT}
        locale={locale}
      />

      <div className="relative z-10 flex-1 flex flex-col lg:overflow-y-auto">
        <ModuleHeader doneCount={doneCount} stats={stats} t={t} />

        <div className="px-6 py-8 lg:px-10 lg:py-12">
          {allDone && <CongratulationsCard t={t} />}

          {/* Desktop Grid Layout */}
          <motion.div 
            variants={STAGGER_CONTAINER}
            initial="initial"
            animate="animate"
            className="hidden md:grid grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 pb-10"
          >
            {STEPS.map((step) => (
              <ModuleCard
                key={step.id}
                step={step}
                state={derived[step.id]}
                href={hrefs[step.id]}
                t={t}
                navT={navT}
              />
            ))}
          </motion.div>

          {/* Mobile Timeline Layout */}
          <div className="md:hidden pb-10">
            <StepTimeline
              steps={STEPS}
              derived={derived}
              hrefs={hrefs}
              t={t}
              navT={navT}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
