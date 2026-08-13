'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Lock, CheckCircle2, ChevronRight, Star, HelpCircle, type LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { QuizDefinition, Language } from '@/lib/quiz-data';
import { playGamifiedSound, triggerHaptic } from './gamification';

interface ArcadeStageCardProps {
  mKey: string;
  quiz: QuizDefinition;
  locked: boolean;
  passed: boolean;
  score: number;
  stars: number;
  lang: Language;
  locale: string;
  index: number;
  prereqTitle?: string;
  iconMap: Record<string, LucideIcon>;
  onSelect: () => void;
}

export function ArcadeStageCard({
  mKey,
  quiz,
  locked,
  passed,
  score,
  stars,
  lang,
  locale,
  index,
  prereqTitle,
  iconMap,
  onSelect,
}: ArcadeStageCardProps) {
  const t = useTranslations('quizSelection');

  const Icon = (quiz.icon ? iconMap[quiz.icon] : null) || HelpCircle;
  const color = quiz.color || '#D97706';
  const glow = `${color}15`;

  const total = quiz.questions.length;
  const thresholdPct = Math.round((quiz.passThreshold ?? 0.7) * 100);

  const handleClick = () => {
    if (locked) {
      playGamifiedSound('wrong');
      triggerHaptic('wrong');
    } else {
      playGamifiedSound('correct');
      triggerHaptic('correct');
    }
    onSelect();
  };

  return (
    <motion.button
      tabIndex={0}
      aria-label={`${typeof quiz.title === 'string' ? quiz.title : (quiz.title?.[lang] || quiz.title?.en)} - ${
        locked ? 'Locked' : passed ? 'Passed' : 'Available'
      }`}
      onClick={handleClick}
      disabled={locked}
      className="w-full flex items-center gap-4 p-5 rounded-3xl border-2 text-left transition-all group relative overflow-hidden shadow-lg select-none"
      style={{
        borderColor: passed ? `${color}60` : locked ? 'rgba(0,0,0,0.08)' : `${color}30`,
        background: passed ? glow : locked ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.85)',
        opacity: locked ? 0.6 : 1,
        cursor: locked ? 'not-allowed' : 'pointer',
      }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: locked ? 0.6 : 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      whileHover={locked ? {} : { scale: 1.015, borderColor: `${color}80`, y: -2 }}
      whileTap={locked ? {} : { scale: 0.98 }}
    >
      {/* Side Color Accent Bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-2 rounded-l-3xl"
        style={{ background: locked ? 'rgba(0,0,0,0.2)' : color }}
      />

      {/* Stage Icon Box */}
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-md ml-1"
        style={{
          background: locked ? 'rgba(0,0,0,0.05)' : glow,
          border: `1.5px solid ${locked ? 'rgba(0,0,0,0.1)' : color + '40'}`,
        }}
      >
        {locked ? (
          <Lock size={22} className="text-muted-foreground" />
        ) : (
          <Icon size={26} style={{ color }} />
        )}
      </div>

      {/* Main Info Section */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          {/* Title */}
          <h3 className="font-black text-foreground text-base leading-tight">
            {typeof quiz.title === 'string'
              ? quiz.title
              : quiz.title?.[lang] || quiz.title?.en || quiz.title?.th || (quiz as any).mKey || ''}
          </h3>

          {/* 3-Star Rating Badges */}
          {!locked && (
            <div className="flex items-center gap-0.5 ml-auto">
              {[1, 2, 3].map(starNum => (
                <Star
                  key={starNum}
                  size={13}
                  className={`transition-all ${
                    starNum <= stars
                      ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]'
                      : 'text-muted-foreground/30 fill-muted/10'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {typeof quiz.description === 'string'
            ? quiz.description
            : quiz.description?.[lang] || quiz.description?.en || quiz.description?.th || ''}
        </p>

        {/* Chips & Tags */}
        <div className="mt-2.5 flex items-center gap-2 flex-wrap">
          {passed && (
            <span
              className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-sm"
              style={{ background: `${color}25`, color }}
            >
              <CheckCircle2 size={11} />
              {t('passed')} ({score}%)
            </span>
          )}

          {locked && prereqTitle && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {t('passFirst', { title: prereqTitle })}
            </span>
          )}

          {!locked && (
            <>
              {total > 0 && (
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: glow, color }}
                >
                  {t('questions', { count: total })}
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                {t('passScore', { threshold: thresholdPct })}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Action Chevron / Status Icon */}
      {locked ? (
        <Lock size={18} className="shrink-0 text-muted-foreground" />
      ) : passed ? (
        <CheckCircle2 size={20} className="shrink-0" style={{ color }} />
      ) : (
        <ChevronRight
          size={20}
          className="shrink-0 transition-transform group-hover:translate-x-1"
          style={{ color }}
        />
      )}
    </motion.button>
  );
}
