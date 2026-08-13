'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Star, Trophy, Flame } from 'lucide-react';
import type { Language } from '@/lib/quiz-data';
import { getRankForXp, getNextRankProgress, HeartLivesIndicator, StreakShieldBadge } from './gamification';

interface QuizPlayerHUDProps {
  passedCount: number;
  totalCount: number;
  quizScores: Record<string, number>;
  lang: Language;
}

export function QuizPlayerHUD({ passedCount, totalCount, quizScores, lang }: QuizPlayerHUDProps) {
  // Compute total XP and total stars
  const { totalXp, totalStars, level } = useMemo(() => {
    let xp = 0;
    let stars = 0;

    Object.values(quizScores).forEach(score => {
      if (score > 0) {
        xp += 100 + Math.round(score * 2);
        if (score >= 100) stars += 3;
        else if (score >= 85) stars += 2;
        else if (score >= 70) stars += 1;
      }
    });

    const calculatedLevel = Math.max(1, Math.floor(xp / 250) + 1);
    return { totalXp: xp, totalStars: stars, level: calculatedLevel };
  }, [quizScores]);

  const currentRank = getRankForXp(totalXp);
  const nextRankInfo = getNextRankProgress(totalXp);

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative w-full rounded-3xl border-2 border-primary/20 bg-card/90 backdrop-blur-xl p-5 shadow-2xl overflow-hidden mb-6"
    >
      {/* Background Subtle Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-amber-500/5 to-emerald-500/5 pointer-events-none -z-10" />

      {/* Top Info Bar: Rank & Status Badges */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        {/* Player Level & Rank Title */}
        <div className="flex items-center gap-3">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner border"
            style={{
              background: currentRank.badgeBg,
              borderColor: currentRank.badgeBorder,
              color: currentRank.badgeText,
            }}
          >
            {currentRank.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-primary text-primary-foreground">
                LVL {level}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {currentRank.title[lang]}
              </span>
            </div>
            <h2 className="text-lg font-black text-foreground tracking-tight mt-0.5">
              {totalXp} <span className="text-xs font-bold text-primary">XP</span>
            </h2>
          </div>
        </div>

        {/* Badges: Hearts, Shield, Streak & Stars */}
        <div className="flex items-center gap-2 flex-wrap">
          <HeartLivesIndicator lives={3} maxLives={3} />
          <StreakShieldBadge active={true} />

          {/* Daily Streak */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-black shadow-sm">
            <Flame size={14} className="fill-amber-500 text-amber-500 animate-pulse" />
            <span>3 Days</span>
          </div>

          {/* Stars Counter */}
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 text-amber-500 text-xs font-black shadow-sm">
            <Star size={14} className="fill-amber-400 text-amber-400" />
            <span>{totalStars}</span>
          </div>

          {/* Completed Quizzes Badge */}
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-black shadow-sm">
            <Trophy size={14} />
            <span>
              {passedCount} / {totalCount}
            </span>
          </div>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-muted-foreground">{currentRank.title[lang]}</span>
          <span className="text-primary font-black">
            {nextRankInfo.nextRank
              ? `${nextRankInfo.pct}% to ${nextRankInfo.nextRank.title[lang]}`
              : 'MAX RANK REACHED!'}
          </span>
        </div>
        <div className="h-3.5 w-full rounded-full bg-secondary overflow-hidden relative border border-border/80 shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-500 via-emerald-500 to-cyan-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${nextRankInfo.pct}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>
    </motion.div>
  );
}
