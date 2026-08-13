'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Lock, CheckCircle2, Star, HelpCircle, type LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { QuizDefinition, Language } from '@/lib/quiz-data';
import { playGamifiedSound, triggerHaptic } from './gamification';

export interface StageNodeData {
  mKey: string;
  quiz: QuizDefinition;
  locked: boolean;
  passed: boolean;
  score: number; // 0 - 100
  stars: number; // 0 - 3
  prereqTitle?: string;
  sectionKey: string;
}

interface QuestMapCanvasProps {
  sections: Record<string, (QuizDefinition & { mKey: string })[]>;
  passedModules: Set<string>;
  quizScores: Record<string, number>;
  lang: Language;
  locale: string;
  onSelectStage: (mKey: string, locked: boolean) => void;
  iconMap: Record<string, LucideIcon>;
}

export function QuestMapCanvas({
  sections,
  passedModules,
  quizScores,
  lang,
  locale,
  onSelectStage,
  iconMap,
}: QuestMapCanvasProps) {
  const t = useTranslations('quizSelection');

  // Flatten all stages in order
  const allNodes: StageNodeData[] = React.useMemo(() => {
    const list: StageNodeData[] = [];
    Object.entries(sections).forEach(([sectionKey, quizzes]) => {
      quizzes.forEach(quiz => {
        const passed = passedModules.has(quiz.mKey);
        const score = quizScores[quiz.mKey] ?? (passed ? 100 : 0);

        let stars = 0;
        if (score >= 100) stars = 3;
        else if (score >= 85) stars = 2;
        else if (passed || score >= (quiz.passThreshold ?? 0.7) * 100) stars = 1;

        list.push({
          mKey: quiz.mKey,
          quiz,
          locked: false,
          passed,
          score,
          stars,
          sectionKey,
        });
      });
    });
    return list;
  }, [sections, passedModules, quizScores]);

  // Responsive screen width check for mobile scaling (<380px)
  const [isSmallScreen, setIsSmallScreen] = React.useState(false);

  React.useEffect(() => {
    const checkScreen = () => {
      setIsSmallScreen(window.innerWidth < 380);
    };
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  // Positional logic for winding path (S-curve layout) - dynamically scaled for mobile screens
  const getXOffset = React.useCallback(
    (idx: number) => {
      const amp = isSmallScreen ? 24 : 42;
      const pattern = [0, amp, 0, -amp];
      return pattern[idx % pattern.length];
    },
    [isSmallScreen]
  );

  return (
    <div className="relative w-full py-6 px-3 sm:py-8 sm:px-4 flex flex-col items-center select-none overflow-x-hidden">
      {/* Dynamic Connector Lines & Stage Nodes */}
      <div className="relative w-full max-w-md flex flex-col items-center gap-12">
        {Object.entries(sections).map(([sectionKey, quizzes]) => {
          const sectionLabel =
            sectionKey === 'foundation'
              ? lang === 'th'
                ? 'PART 1: ความรู้พื้นฐาน (FOUNDATION)'
                : 'PART 1: ECOSYSTEM & FOUNDATION'
              : sectionKey === 'sales'
              ? lang === 'th'
                ? 'PART 2: ทักษะหลักและการขาย (SALES & CORE)'
                : 'PART 2: SALES & CORE COMPETENCIES'
              : lang === 'th'
              ? 'PART 3: โบรกเกอร์และการชำระเงิน (BROKER)'
              : 'PART 3: BROKER & PAYMENT';

          return (
            <div key={sectionKey} className="w-full flex flex-col items-center">
              {/* Section Header Divider */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full my-6 flex items-center gap-3"
              >
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-primary/60" />
                <span className="px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-black tracking-widest text-primary uppercase shadow-sm">
                  {sectionLabel}
                </span>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent via-primary/30 to-primary/60" />
              </motion.div>

              {/* Stage Nodes in Section */}
              <div className="w-full flex flex-col items-center gap-14 relative">
                {quizzes.map((quiz, qIdx) => {
                  const globalIdx = allNodes.findIndex(n => n.mKey === quiz.mKey);
                  const nodeData = allNodes[globalIdx];
                  if (!nodeData) return null;

                  const Icon = (quiz.icon ? iconMap[quiz.icon] : null) || HelpCircle;
                  const color = quiz.color || '#D97706';

                  // Determine locked status
                  let locked = false;
                  if (sectionKey === 'other' || (quiz as any).section === 'other') {
                    const salesQuizzes = allNodes.filter(n => n.sectionKey === 'sales');
                    const allSalesPassed = salesQuizzes.every(n => passedModules.has(n.mKey));
                    if (!allSalesPassed) locked = true;
                  } else if (quiz.prerequisiteId) {
                    locked = !passedModules.has(quiz.prerequisiteId);
                  }

                  const passed = nodeData.passed;
                  const stars = nodeData.stars;
                  const xOffset = getXOffset(globalIdx);
                  const nextXOffset = qIdx < quizzes.length - 1 ? getXOffset(globalIdx + 1) : xOffset;
                  const isNextActive = !locked && !passed;

                  return (
                    <div
                      key={quiz.mKey}
                      className="relative flex flex-col items-center group touch-manipulation"
                      style={{ transform: `translateX(${xOffset}px)` }}
                    >
                      {/* Connecting Curved SVG Path to next element */}
                      {qIdx < quizzes.length - 1 && (
                        <div className="absolute top-16 left-1/2 -translate-x-1/2 w-48 h-20 -z-10 pointer-events-none">
                          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 60" preserveAspectRatio="none">
                            <path
                              d={`M 50 0 C 50 30, ${50 + (nextXOffset - xOffset) * 0.8} 30, ${50 + (nextXOffset - xOffset)} 60`}
                              fill="none"
                              stroke={passed ? '#10b981' : 'rgba(156, 163, 175, 0.4)'}
                              strokeWidth={passed ? 3.5 : 2.5}
                              strokeDasharray={passed ? undefined : '5 4'}
                              className={passed ? 'drop-shadow-[0_0_6px_rgba(16,185,129,0.5)]' : ''}
                            />
                          </svg>
                        </div>
                      )}

                      {/* 3-Star Rating Header */}
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3].map(starNum => (
                          <motion.div
                            key={starNum}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: globalIdx * 0.05 + starNum * 0.08 }}
                          >
                            <Star
                              size={14}
                              className={`transition-all duration-300 ${
                                starNum <= stars
                                  ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]'
                                  : 'text-muted-foreground/30 fill-muted/20'
                              }`}
                            />
                          </motion.div>
                        ))}
                      </div>

                      {/* Floating Stage Node Orb */}
                      <motion.button
                        tabIndex={0}
                        aria-label={`${typeof quiz.title === 'string' ? quiz.title : (quiz.title?.[lang] || quiz.title?.en)} - ${
                          locked ? 'Locked' : passed ? 'Passed' : 'Available'
                        }`}
                        onClick={() => {
                          if (locked) {
                            playGamifiedSound('wrong');
                            triggerHaptic('wrong');
                          } else {
                            playGamifiedSound('correct');
                            triggerHaptic('correct');
                          }
                          onSelectStage(quiz.mKey, locked);
                        }}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: locked ? 0.6 : 1 }}
                        whileHover={locked ? { scale: 1.03 } : { scale: 1.1, rotate: 3 }}
                        whileTap={{ scale: 0.92 }}
                        className={`relative w-20 h-20 rounded-3xl flex items-center justify-center border-4 shadow-xl transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/50 ${
                          locked
                            ? 'bg-muted/40 border-border text-muted-foreground cursor-not-allowed'
                            : passed
                            ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border-emerald-500/80 shadow-emerald-500/20 text-emerald-500'
                            : isNextActive
                            ? 'bg-gradient-to-br from-amber-500/20 via-primary/10 to-amber-500/30 border-amber-500 shadow-amber-500/30 text-amber-500 animate-pulse'
                            : 'bg-card border-primary/40 text-primary shadow-primary/10'
                        }`}
                        style={{
                          boxShadow: !locked && passed ? `0 0 20px ${color}35` : undefined,
                        }}
                      >
                        {/* Active Pulse Ring */}
                        {isNextActive && (
                          <span className="absolute -inset-2 rounded-3xl border-2 border-amber-400/60 animate-ping pointer-events-none" />
                        )}

                        {/* Node Icon */}
                        {locked ? (
                          <Lock size={26} className="text-muted-foreground/70" />
                        ) : passed ? (
                          <div className="relative">
                            <Icon size={30} style={{ color }} />
                            <CheckCircle2
                              size={16}
                              className="absolute -bottom-1 -right-1 text-emerald-500 bg-background rounded-full"
                            />
                          </div>
                        ) : (
                          <Icon size={32} style={{ color }} />
                        )}
                      </motion.button>

                      {/* Title & Info Card below node */}
                      <div className="mt-3 text-center max-w-[150px]">
                        <h4 className="text-xs font-black text-foreground leading-tight line-clamp-2">
                          {typeof quiz.title === 'string'
                            ? quiz.title
                            : quiz.title?.[lang] || quiz.title?.en || quiz.title?.th || ''}
                        </h4>

                        {/* Status Chip */}
                        <div className="mt-1 flex items-center justify-center gap-1">
                          {locked ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                              {t('locked') || 'Locked'}
                            </span>
                          ) : passed ? (
                            <span
                              className="text-[10px] font-black px-2 py-0.5 rounded-full"
                              style={{ background: `${color}20`, color }}
                            >
                              {nodeData.score}% Score
                            </span>
                          ) : (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                              Start Quest
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
