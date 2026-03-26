'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, User as UserIcon, Bot, ChevronLeft, Play,
  CheckCircle2, Trophy, RotateCcw, ArrowRight,
  Lock, BookOpen, AlertTriangle, ChevronRight, History,
  ChevronDown, Smile, Frown, Meh, Zap, Loader2, XCircle,
  Target, BarChart3, ShieldCheck
} from 'lucide-react';

import type { PitchMessage } from '@/types';
import { getAgentSession } from '@/lib/agent-session';
import { TRANSITION } from '@/lib/animations';

import { useTranslations } from 'next-intl';
import { ActiveAgentUI } from '@/components/ui/ActiveAgentUI';

/* ─── Constants & Types ────────────────────────────────────────────────────── */

const CRITERIA_KEYS = [
  'rapport',
  'objectionHandling',
  'credibility',
  'closing',
  'naturalness',
];

type Step = 'intro' | 'scenarios' | 'chat';

/* ─── Interfaces ───────────────────────────────────────────────────────────── */

interface Scenario {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  passThreshold: number;
  initialMood?: string;
  objective?: string;
}

interface CoachingData {
  score: number;
  criteria?: Record<string, number>;
  strengths: string;
  improvements: string;
  coachingScript: string;
  coachingTip: string;
  metadata?: Record<string, any>;
}

interface IntroViewProps {
  onContinue: () => void;
  guideline: string | null;
  agentName: string | null;
  loading: boolean;
  criteriaKeys: string[];
}

interface CustomerProfile {
  name: string;
  occupation: string;
  age: number;
  mood?: string;
  objective: string;
}

interface ChatViewProps {
  messages: PitchMessage[];
  coaching: Map<number, CoachingData>;
  customerProfile: CustomerProfile | null;
  input: string;
  setInput: (v: string) => void;
  loading: boolean;
  passed: boolean;
  failed: boolean;
  error: string | null;
  onSend: () => void;
  onReset: (clearHistory: boolean) => void;
  onClearError: () => void;
  onUseScript: (text: string) => void;
  bottomRef: React.RefObject<HTMLDivElement>;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  criteriaKeys: string[];
}

/* ─── Step Progress Indicator ──────────────────────────────────────────────── */

const StepProgress = ({ current }: { current: 1 | 2 | 3 }) => (
  <div className="flex items-center gap-1.5">
    {([1, 2, 3] as const).map(s => (
      <div
        key={s}
        className={`rounded-full transition-all duration-300 ${
          s === current
            ? 'w-5 h-1.5 bg-primary'
            : s < current
            ? 'w-1.5 h-1.5 bg-primary/40'
            : 'w-1.5 h-1.5 bg-muted-foreground/20'
        }`}
      />
    ))}
  </div>
);

/* ─── Coaching Card ─────────────────────────────────────────────────────────── */

const SCORE_STYLE = (score: number) =>
  score >= 7
    ? { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800', dot: 'bg-emerald-500' }
    : score >= 5
    ? { badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800', dot: 'bg-amber-400' }
    : { badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800', dot: 'bg-rose-500' };

const CoachingCard = memo(({ coaching, autoExpand, onUseScript, criteriaKeys }: { 
  coaching: CoachingData; 
  autoExpand: boolean;
  onUseScript?: (text: string) => void;
  criteriaKeys: string[];
}) => {
  const [open, setOpen] = useState(autoExpand);
  const { score, criteria, strengths, improvements, coachingScript, coachingTip } = coaching;
  const style = SCORE_STYLE(score);
  const t = useTranslations('aiEval');

  return (
    <div className="ml-9 mt-1.5 mb-1">
      <button
        onClick={() => setOpen(v => !v)}
        className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-xl border transition-all hover:opacity-80 ${style.badge}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />
        <span className="font-black">{score}/10</span>
        <span className="opacity-50">·</span>
        <span>{open ? t('hideCoaching') : t('viewCoaching')}</span>
        <ChevronDown size={11} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="mt-2 bg-white dark:bg-card border border-black/5 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
              <div className="divide-y divide-black/5 dark:divide-white/5">
                {criteria && (
                  <div className="px-4 py-3 bg-secondary/10">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-2.5">{t('performanceBreakdown')}</p>
                    <div className="space-y-2">
                      {criteriaKeys.map((key) => {
                        const val = (criteria as any)[key] || 0;
                        return (
                          <div key={key}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-bold text-foreground/70">
                                {t.raw(`criteria.${key}`) ? t(`criteria.${key}`) : key}
                              </span>
                              <span className="text-[10px] font-black text-primary">{val}/10</span>
                            </div>
                            <div className="h-1 w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${val * 10}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={`h-full rounded-full ${val >= 7 ? 'bg-emerald-500' : val >= 5 ? 'bg-amber-400' : 'bg-rose-500'}`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {strengths && (
                  <div className="px-4 py-3">
                    <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">✓ {t('strengthsLabel')}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{strengths}</p>
                  </div>
                )}
                {improvements && (
                  <div className="px-4 py-3">
                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-wider mb-1">↑ {t('improvementsLabel')}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{improvements}</p>
                  </div>
                )}
                {coachingTip && (
                  <div className="px-4 py-3">
                    <p className="text-[10px] font-black text-primary uppercase tracking-wider mb-1">💡 {t('techniqueLabel')}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{coachingTip}</p>
                  </div>
                )}
                {coachingScript && (
                  <div className="px-4 py-3 bg-primary/5 dark:bg-primary/10">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[10px] font-black text-primary uppercase tracking-wider">💬 {t('scriptLabel')}</p>
                      {onUseScript && (
                        <button
                          onClick={() => onUseScript(coachingScript)}
                          className="text-[10px] font-black bg-primary text-white px-2 py-0.5 rounded-md hover:bg-primary/80 transition-all active:scale-95"
                        >
                          {t('useScriptBtn')}
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-primary/80 dark:text-primary/70 leading-relaxed font-medium">
                      &ldquo;{coachingScript}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

CoachingCard.displayName = 'CoachingCard';

/* ─── Score Trend Component ────────────────────────────────────────────────── */

const ScoreTrend = memo(({ coaching }: { coaching: Map<number, CoachingData> }) => {
  const scores = useMemo(() => Array.from(coaching.values()).map(c => c.score), [coaching]);
  if (scores.length < 2) return null;
  const max = 10; const min = 0; const height = 16; const width = 100;
  const points = scores.map((s, i) => {
    const x = (i / (scores.length - 1)) * width;
    const y = height - ((s - min) / (max - min)) * height;
    return `${x},${y}`;
  }).join(' ');
  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-secondary/20 rounded-lg border border-black/5 dark:border-white/5 animate-in fade-in zoom-in duration-500 shrink-0">
      <div className="flex flex-col">
        <span className="text-[8px] font-black text-muted-foreground uppercase leading-none mb-0.5">Progress</span>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-16 h-4 overflow-visible">
          <polyline fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" className="text-primary" points={points} />
          <circle cx={width} cy={height - ((scores[scores.length - 1] - min) / (max - min)) * height} r="2" className="fill-primary" />
        </svg>
      </div>
    </div>
  );
});

ScoreTrend.displayName = 'ScoreTrend';

/* ─── Intro View ───────────────────────────────────────────────────────────── */

const IntroView = memo(({ onContinue, guideline, agentName, loading, criteriaKeys }: IntroViewProps) => {
  const t = useTranslations('aiEval');
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={TRANSITION.base} className="bg-card rounded-3xl shadow-2xl border border-black/5 dark:border-white/5 overflow-hidden">
        <div className="bg-gradient-to-br from-primary to-primary/80 px-8 py-8 text-primary-foreground relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 blur-3xl rounded-full" />
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl"><Zap size={20} className="text-white" /></div>
                <h1 className="text-2xl font-black tracking-tight">{t('title')}</h1>
              </div>
              <p className="opacity-90 text-sm leading-relaxed max-w-2xl font-medium" dangerouslySetInnerHTML={{ __html: t.raw('introDesc') }} />
            </div>
            <div className="shrink-0 pt-1 flex flex-col items-end gap-3">
              <StepProgress current={1} />
              <ActiveAgentUI agentName={agentName} />
            </div>
          </div>
        </div>
        <div className="p-8 space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-7 h-7 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-xs font-black">1</span>
              <h3 className="font-black text-foreground text-base tracking-tight">Guideline Instruction</h3>
            </div>
            <div className="bg-secondary/20 rounded-2xl p-6 border border-black/5 dark:border-white/5 whitespace-pre-wrap text-sm leading-relaxed text-foreground font-medium">
              {guideline || "Please wait for guidelines to load..."}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-7 h-7 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-xs font-black">2</span>
              <h3 className="font-black text-foreground text-base tracking-tight">{t('criteriaTitle')}</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {criteriaKeys.map((key) => (
                <span key={key} className="bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 text-foreground text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
                  {t.raw(`criteria.${key}`) ? t(`criteria.${key}`) : key}
                </span>
              ))}
            </div>
          </div>
          <button onClick={onContinue} disabled={loading || !guideline} className="w-full flex items-center justify-center gap-2.5 bg-foreground text-background hover:bg-primary hover:text-white transition-all duration-500 py-4 rounded-2xl font-black text-base shadow-xl active:scale-[0.99] group disabled:opacity-50">
            {loading ? t('connecting') : t('startSimBtn')}
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </motion.div>
    </div>
  );
});
IntroView.displayName = 'IntroView';

/* ─── Scenario Picker ──────────────────────────────────────────────────────── */

const DIFFICULTY_MAP: Record<string, number> = { 'beginner': 1, 'intermediate': 2, 'advanced': 3, 'expert': 4 };

const ScenarioPicker = memo(({ scenarios, completedLevels, passedScenarios, unlockMode, onSelect, onBack, agentName }: { 
  scenarios: Scenario[]; 
  completedLevels: number[]; 
  passedScenarios: string[];
  unlockMode: 'sequential' | 'flexible';
  onSelect: (id: string) => void;
  onBack: () => void;
  agentName: string | null;
}) => {
  const t = useTranslations('aiEval');
  
  const levels = useMemo(() => {
    const groups: Record<number, { name: string, scenarios: Scenario[] }> = {
      1: { name: 'Level 1: Beginner', scenarios: [] },
      2: { name: 'Level 2: Intermediate', scenarios: [] },
      3: { name: 'Level 3: Advanced', scenarios: [] },
      4: { name: 'Level 4: Expert', scenarios: [] }
    };
    
    scenarios.forEach(s => {
      const lv = DIFFICULTY_MAP[s.difficulty] || 1;
      groups[lv].scenarios.push(s);
    });
    
    return Object.entries(groups)
      .filter(([_, group]) => group.scenarios.length > 0)
      .map(([lv, group]) => ({ level: parseInt(lv), ...group }));
  }, [scenarios]);

  const totalScenarios = scenarios.length;
  const passedCount = passedScenarios.length;
  const progressPercent = totalScenarios > 0 ? (passedCount / totalScenarios) * 100 : 0;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4 flex-1">
          <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-all group">
            <div className="p-1.5 rounded-lg group-hover:bg-primary/10 transition-colors">
              <ChevronLeft size={18} />
            </div>
            {t('backToSelection')}
          </button>
          
          <div>
            <h2 className="text-3xl font-black tracking-tight text-foreground mb-2">Training Roadmap</h2>
            <p className="text-muted-foreground text-sm font-medium max-w-lg">
              Master the art of Thai sales through progressive AI simulations. 
              Complete each level to unlock more challenging scenarios.
            </p>
          </div>

          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-xl border border-primary/10 shadow-sm">
              {unlockMode === 'flexible' ? (
                <>
                  <RotateCcw size={14} className="text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-tight text-primary">Flexible Unlock</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={14} className="text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-tight text-primary">Sequential Unlock</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/5 rounded-xl border border-emerald-500/10 shadow-sm">
              <Trophy size={14} className="text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-tight text-emerald-500">{passedCount}/{totalScenarios} Completed</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-4 shrink-0">
          <ActiveAgentUI agentName={agentName} />
          <div className="w-48 space-y-1.5">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              <span>Overall Progress</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden border border-black/5 dark:border-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full shadow-[0_0_12px_rgba(var(--primary),0.3)]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Levels Display */}
      <div className="space-y-12 relative">
        {/* Connector Line (Desktop) */}
        <div className="absolute left-8 top-10 bottom-10 w-0.5 bg-gradient-to-b from-primary/20 via-primary/5 to-transparent hidden md:block" />

        {levels.map((levelGroup) => {
          const isLevelLocked = levelGroup.level > 1 && !completedLevels.includes(levelGroup.level - 1);
          const isLevelPassed = completedLevels.includes(levelGroup.level);

          return (
            <div key={levelGroup.level} className="relative space-y-6">
              {/* Level Header */}
              <div className="flex items-center gap-4 relative z-10">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl border-4 border-background transition-all duration-500 ${
                  isLevelLocked 
                    ? 'bg-secondary text-muted-foreground/40' 
                    : isLevelPassed
                    ? 'bg-emerald-500 text-white scale-110 shadow-emerald-500/20'
                    : 'bg-primary text-white scale-110 shadow-primary/20'
                }`}>
                  {isLevelLocked ? <Lock size={24} /> : isLevelPassed ? <CheckCircle2 size={24} /> : <Target size={24} />}
                </div>
                <div>
                  <h3 className={`font-black text-xl tracking-tight ${isLevelLocked ? 'text-muted-foreground' : 'text-foreground'}`}>
                    {levelGroup.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isLevelLocked ? 'text-muted-foreground/60' : 'text-primary'}`}>
                      {levelGroup.scenarios.length} Scenarios
                    </span>
                    {isLevelPassed && (
                      <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                        <span className="w-1 h-1 rounded-full bg-emerald-500" />
                        Level Completed
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Scenarios Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:ml-20">
                {levelGroup.scenarios.map((s, idx) => {
                  const isCompleted = passedScenarios.includes(s.id);
                  const isLocked = isLevelLocked;
                  
                  return (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      onClick={() => !isLocked && onSelect(s.id)}
                      className={`group relative bg-card border-2 rounded-[2rem] p-6 transition-all duration-500 ${
                        isLocked 
                          ? 'opacity-60 grayscale cursor-not-allowed border-transparent bg-secondary/30' 
                          : isCompleted
                          ? 'cursor-pointer border-emerald-500/20 hover:border-emerald-500/40 bg-emerald-500/[0.02]'
                          : 'cursor-pointer border-black/5 dark:border-white/10 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5'
                      }`}
                    >
                      {isCompleted && (
                        <div className="absolute top-4 right-4 bg-emerald-500 text-white p-1.5 rounded-full shadow-lg shadow-emerald-500/30 z-20">
                          <CheckCircle2 size={14} />
                        </div>
                      )}

                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            s.difficulty === 'beginner' ? 'bg-emerald-500/10 text-emerald-600' :
                            s.difficulty === 'intermediate' ? 'bg-amber-500/10 text-amber-600' :
                            s.difficulty === 'advanced' ? 'bg-rose-500/10 text-rose-600' :
                            'bg-purple-500/10 text-purple-600'
                          }`}>
                            {s.difficulty}
                          </div>
                          <div className="text-[10px] font-black text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md">
                            Min: {s.passThreshold}/10
                          </div>
                        </div>

                        <div>
                          <h4 className="font-black text-lg text-foreground mb-1 group-hover:text-primary transition-colors leading-tight">
                            {s.name}
                          </h4>
                          <p className="text-xs text-muted-foreground font-medium leading-relaxed line-clamp-2 min-h-[2.5rem]">
                            {s.description}
                          </p>
                        </div>

                        {/* Additional Info Badges */}
                        <div className="flex flex-wrap gap-2 pt-2">
                          {s.initialMood && (
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-secondary/50 rounded-lg text-[9px] font-bold text-foreground/70">
                              <Smile size={10} className="opacity-60" />
                              {s.initialMood}
                            </div>
                          )}
                          {s.objective && (
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-secondary/50 rounded-lg text-[9px] font-bold text-foreground/70 max-w-full">
                              <Target size={10} className="opacity-60 shrink-0" />
                              <span className="truncate">{s.objective}</span>
                            </div>
                          )}
                        </div>

                        {/* Action Area */}
                        {!isLocked && (
                          <div className="pt-4 mt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                              {isCompleted ? 'Re-train' : 'Start Simulation'}
                            </span>
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                              isCompleted 
                                ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
                                : 'bg-primary text-white shadow-primary/20 group-hover:scale-110'
                            }`}>
                              <Play size={16} fill="currentColor" className={isCompleted ? '' : 'translate-x-0.5'} />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Locked Overlay */}
                      {isLocked && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/20 backdrop-blur-[1px] rounded-[2rem] z-10">
                          <div className="bg-white/90 dark:bg-card/90 p-3 rounded-2xl shadow-xl border border-black/5 flex items-center gap-3">
                            <Lock size={16} className="text-muted-foreground" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Locked</span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
ScenarioPicker.displayName = 'ScenarioPicker';

/* ─── Message Bubble ────────────────────────────────────────────────────────── */

const MessageBubble = memo(({ m, i }: { m: PitchMessage; i: number }) => {
  const isUser = m.role === 'user';
  const timeStr = m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null;
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ ...TRANSITION.base, delay: Math.min(i * 0.02, 0.15) }} className={`flex items-end gap-2.5 mt-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border ${isUser ? 'bg-primary text-primary-foreground border-primary/20' : 'bg-white dark:bg-card border-black/5 dark:border-white/10 text-foreground'}`}>
        {isUser ? <UserIcon size={13} /> : <Bot size={13} />}
      </div>
      <div className={`flex flex-col gap-1 max-w-[78%] sm:max-w-[68%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap font-medium rounded-2xl border ${isUser ? 'bg-primary text-primary-foreground border-primary/10' : 'bg-white dark:bg-card text-foreground border-black/5 dark:border-white/10'}`}>
          {m.content}
        </div>
        {timeStr && <span className="text-[10px] text-muted-foreground/35 font-medium px-1">{timeStr}</span>}
      </div>
    </motion.div>
  );
});
MessageBubble.displayName = 'MessageBubble';

/* ─── Chat View ────────────────────────────────────────────────────────────── */

const ChatView = memo(({
  messages, coaching, customerProfile, input, setInput, loading, passed, failed, error,
  onSend, onReset, onClearError, onUseScript, bottomRef, textareaRef, criteriaKeys
}: ChatViewProps) => {
  const t = useTranslations('aiEval');
  useEffect(() => {
    const el = textareaRef.current; if (!el) return;
    el.style.height = 'auto'; el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [input, textareaRef]);
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); }
  }, [onSend]);

  return (
    <div className="max-w-4xl mx-auto py-2 px-4">
      <div className="bg-card rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] border border-black/5 dark:border-white/10 flex flex-col overflow-hidden" style={{ height: (passed || failed) ? 'auto' : 'calc(100dvh - 96px)', maxHeight: (passed || failed) ? 'none' : '920px', minHeight: '500px' }}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-black/5 dark:border-white/10 bg-white/90 dark:bg-card/90 backdrop-blur-md z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm ${passed ? 'bg-emerald-500/10 text-emerald-600' : failed ? 'bg-rose-500/10 text-rose-600' : 'bg-primary/10 text-primary'}`}>
              {passed ? <Trophy size={18} /> : failed ? <XCircle size={18} /> : <Zap size={18} />}
            </div>
            <div>
              <span className="font-bold text-foreground text-sm">{t('systemTitle')}</span>
              <p className={`text-[10px] font-bold flex items-center gap-1.5 uppercase tracking-widest ${passed ? 'text-emerald-500' : failed ? 'text-rose-500' : 'text-primary'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${passed ? 'bg-emerald-500' : failed ? 'bg-rose-500' : 'bg-primary animate-pulse'}`} />
                {passed ? t('congrats', { level: '' }) : failed ? 'Simulation Ended' : t('liveSim')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ScoreTrend coaching={coaching} />
            <StepProgress current={3} />
            <button onClick={() => onReset(passed || failed)} className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-rose-50 transition-all py-2 px-3 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10">
              <ChevronLeft size={14} />{(passed || failed) ? t('backToSelection') : t('endTraining')}
            </button>
          </div>
        </div>
        {customerProfile && (
          <div className="px-5 py-3 bg-white dark:bg-card/50 border-b border-black/5 dark:border-white/5 flex flex-wrap items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center">
                {customerProfile.mood?.includes('หงุดหงิด') || failed ? <Frown size={14} className="text-rose-500" /> : <Smile size={14} className="text-emerald-500" />}
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight leading-none mb-0.5">{t('customerLabel')}</p>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-black text-foreground">{customerProfile.name || t('unknown')}</p>
                  {customerProfile.mood && <span className="text-[10px] bg-secondary/80 text-foreground px-1.5 py-0.5 rounded-md font-bold">{customerProfile.mood}</span>}
                </div>
              </div>
            </div>
            <div className="h-6 w-px bg-black/5 dark:bg-white/5 hidden sm:block" />
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight leading-none mb-0.5">{t('occupationAgeLabel')}</p>
              <p className="text-xs font-bold text-foreground">{customerProfile.occupation || t('general')} {customerProfile.age ? `(${customerProfile.age} ${t('yearsOld')})` : ''}</p>
            </div>
            <div className="h-6 w-px bg-black/5 dark:bg-white/5 hidden sm:block" />
            <div className="flex-1 min-w-[200px]">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight leading-none mb-0.5">{t('objectiveLabel')}</p>
              <p className="text-xs font-bold text-primary italic truncate">&ldquo;{customerProfile.objective || t('general')}&rdquo;</p>
            </div>
          </div>
        )}
        <div className={`overflow-y-auto px-5 py-5 bg-slate-50/50 dark:bg-black/10 selection:bg-primary/10 ${(passed || failed) ? '' : 'flex-1'}`}>
          <AnimatePresence initial={false}>
            {messages.map((m, i) => {
              const card = m.role === 'assistant' ? coaching.get(i) : undefined;
              return (
                <React.Fragment key={i}>
                  <MessageBubble m={m} i={i} />
                  {card && <CoachingCard coaching={card} autoExpand={card.score < 6} onUseScript={onUseScript} criteriaKeys={criteriaKeys} />}
                </React.Fragment>
              );
            })}
            {passed && (
              <motion.div key="passed" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={TRANSITION.spring} className="flex flex-col items-center py-6 mt-4">
                <div className="flex items-center gap-4 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white px-8 py-5 rounded-2xl shadow-2xl shadow-emerald-500/30 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2" /><Trophy size={36} className="drop-shadow-lg" />
                  <div className="relative z-10">
                    <p className="font-black text-xl tracking-tight leading-none mb-1">{t('congrats', { level: '' }).replace(' Level ', '')}</p>
                    <p className="text-sm font-bold opacity-90">{t('congratsSub')}</p>
                  </div>
                </div>
              </motion.div>
            )}
            {failed && (
              <motion.div key="failed" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={TRANSITION.spring} className="flex flex-col items-center py-6 mt-4">
                <div className="flex items-center gap-4 bg-gradient-to-br from-rose-500 to-rose-600 text-white px-8 py-5 rounded-2xl shadow-2xl shadow-rose-500/30 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2" /><XCircle size={36} className="drop-shadow-lg" />
                  <div className="relative z-10">
                    <p className="font-black text-xl tracking-tight leading-none mb-1">Session Ended</p>
                    <p className="text-sm font-bold opacity-90">Customer hung up. Try a different approach.</p>
                  </div>
                </div>
              </motion.div>
            )}
            {(passed || failed) && (
              <motion.div key="actions" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row gap-3 pb-4 pt-4">
                <button onClick={() => onReset(true)} className="flex-1 flex items-center justify-center gap-2.5 bg-white dark:bg-white/5 text-foreground hover:bg-secondary transition-all duration-300 px-6 py-3.5 rounded-xl font-bold text-sm border border-black/5 shadow-md active:scale-95">
                  <RotateCcw size={15} />{t('retryBtn', { level: '' }).replace(' Level ', '')}
                </button>
                {passed ? (
                  <button onClick={() => onReset(true)} className="flex-1 flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3.5 rounded-xl font-bold text-sm shadow-xl shadow-emerald-500/20"><ArrowRight size={15} />Next Level Selection</button>
                ) : (
                  <button onClick={() => onReset(true)} className="flex-1 flex items-center justify-center gap-2.5 bg-foreground text-background px-6 py-3.5 rounded-xl font-bold text-sm shadow-xl">
                    <ArrowRight size={15} />Start New Attempt
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>{error && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="flex items-center justify-between gap-3 mt-3 px-4 py-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs font-medium text-rose-700 dark:text-rose-400">
              <span className="leading-relaxed">{error}</span><button onClick={onClearError} className="shrink-0 text-rose-400 hover:text-rose-600 transition-colors font-black px-1">✕</button>
            </motion.div>
          )}</AnimatePresence>
          {loading && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex items-end gap-2 mt-1">
              <div className="w-7 h-7 rounded-xl bg-white dark:bg-card border border-black/5 flex items-center justify-center shrink-0"><Bot size={13} /></div>
              <div className="bg-white dark:bg-card border border-black/5 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
                {[0, 1, 2].map(dot => <span key={dot} className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: `${dot * 0.15}s`, animationDuration: '0.8s' }} />)}
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} className="h-2" />
        </div>
        {!(passed || failed) && (
          <div className="px-4 py-3 bg-white dark:bg-card border-t border-black/5 dark:border-white/10 z-10 shrink-0">
            <div className="flex items-end gap-2 bg-secondary/30 px-4 py-2 rounded-2xl border-2 border-transparent focus-within:border-primary/20 focus-within:bg-white dark:focus-within:bg-black/20 transition-all duration-300">
              <textarea ref={textareaRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder={t('placeholder')} rows={1} className="flex-1 bg-transparent border-none focus:ring-0 py-2 text-sm font-medium placeholder:text-muted-foreground/40 placeholder:italic resize-none overflow-hidden leading-relaxed" />
              <button onClick={onSend} disabled={loading || !input.trim()} className="bg-primary text-white p-2.5 rounded-xl hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-30 disabled:scale-100 shadow-lg shadow-primary/30 mb-0.5 shrink-0"><Send size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
ChatView.displayName = 'ChatView';

/* ─── Main Component ────────────────────────────────────────────────────────── */

export default function AiEvaluation() {
  const [step, setStep] = useState<Step>('intro');
  const [messages, setMessages] = useState<PitchMessage[]>([]);
  const [coaching, setCoaching] = useState<Map<number, CoachingData>>(new Map());
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [agentName, setAgentName] = useState<string | null>(null);
  const [passed, setPassed] = useState(false);
  const [failed, setFailed] = useState(false);
  const [guideline, setGuideline] = useState<string | null>(null);
  const [criteriaKeys, setCriteriaKeys] = useState<string[]>(CRITERIA_KEYS);
  const [error, setError] = useState<string | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [passedScenarios, setPassedScenarios] = useState<string[]>([]);
  const [unlockMode, setUnlockMode] = useState<'sequential' | 'flexible'>('sequential');
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showError = useCallback((msg: string) => {
    setError(msg); if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => setError(null), 7000);
  }, []);

  const fetchConfig = useCallback(async (id: string | null) => {
    try {
      const url = id ? `/api/ai-eval/config?agentId=${id}` : '/api/ai-eval/config';
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.guideline) setGuideline(data.guideline);
        if (data.criteria) setCriteriaKeys(data.criteria);
        if (data.scenarios) setScenarios(data.scenarios);
        if (data.completedLevels) setCompletedLevels(data.completedLevels);
        if (data.passedScenarios) setPassedScenarios(data.passedScenarios);
        if (data.unlockMode) setUnlockMode(data.unlockMode);
      }
    } catch (err) {
      console.error('Failed to fetch AI Eval Config', err);
    }
  }, []);

  useEffect(() => {
    const session = getAgentSession();
    if (session) { 
      setAgentId(session.id); 
      setAgentName(session.name); 
      fetchConfig(session.id);
    }
  }, [fetchConfig]);

  useEffect(() => {
    if (agentId) {
      fetch(`/api/ai-eval/active?agentId=${agentId}`).then(r => r.ok ? r.json() : null).then(data => {
        const s = data?.session;
        if (s && s.messages?.length > 0) {
          setMessages(s.messages);
          setCustomerProfile(s.customerProfile);
          if (s.coaching) {
            const restored = new Map<number, CoachingData>();
            Object.entries(s.coaching).forEach(([k, v]) => restored.set(parseInt(k), v as CoachingData));
            setCoaching(restored);
          }
          if (s.status === 'passed') setPassed(true);
          if (s.status === 'failed') setFailed(true);
          setStep('chat');
        }
      });
    }
  }, [agentId]);

  useEffect(() => { if (step === 'chat') { setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100); } }, [messages, loading, step]);

  const startSession = useCallback(async (scenarioId: string) => {
    if (!agentId) return; setLoading(true); setError(null);
    try {
      const res = await fetch('/api/ai-eval', { 
        method: 'POST', 
        body: JSON.stringify({ agentId, agentName, isStart: true, message: scenarioId }) 
      });
      if (!res.ok) throw new Error('Start failed');
      const data = await res.json();
      setMessages(data.messages || []); setCustomerProfile(data.customerProfile || null);
      setCoaching(new Map()); setPassed(false); setFailed(false); setStep('chat');
    } catch (err: any) { showError(err.message); } finally { setLoading(false); }
  }, [agentId, agentName, showError]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || !agentId || loading || passed || failed) return;
    const userMsgContent = input; setInput(''); setLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: userMsgContent, timestamp: new Date().toISOString() }]);
    try {
      const res = await fetch('/api/ai-eval', { method: 'POST', body: JSON.stringify({ agentId, agentName, message: userMsgContent }) });
      if (!res.ok) throw new Error('Connection failure');
      const data = await res.json();
      if (data.messages) setMessages(data.messages);
      if (data.customerProfile) setCustomerProfile(data.customerProfile);
      if (data.coaching) {
        setCoaching(prev => { const next = new Map(prev); next.set(data.messages.length - 1, data.coaching); return next; });
      }
      if (data.passed) setPassed(true);
      if (data.failed) setFailed(true);
      
      // If passed, refresh progress to update locked levels
      if (data.passed) fetchConfig(agentId);
    } catch (err: any) { showError(err.message); } finally { setLoading(false); }
  }, [input, agentId, agentName, loading, passed, failed, showError, fetchConfig]);

  const handleUseScript = useCallback((text: string) => { setInput(text); textareaRef.current?.focus(); }, []);

  const handleReset = useCallback((clearHistory: boolean) => {
    setStep('scenarios');
    if (clearHistory && agentId) {
      fetch(`/api/ai-eval/active?agentId=${agentId}`, { method: 'DELETE' });
    }
  }, [agentId]);

  return (
    <AnimatePresence mode="wait">
      {step === 'intro' ? (
        <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={TRANSITION.base}>
          <IntroView onContinue={() => setStep('scenarios')} guideline={guideline} agentName={agentName} loading={loading} criteriaKeys={criteriaKeys} />
        </motion.div>
      ) : step === 'scenarios' ? (
        <motion.div key="scenarios" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={TRANSITION.base}>
          <ScenarioPicker 
            scenarios={scenarios} 
            completedLevels={completedLevels} 
            passedScenarios={passedScenarios}
            unlockMode={unlockMode}
            onSelect={startSession} 
            onBack={() => setStep('intro')} 
            agentName={agentName} 
          />
        </motion.div>
      ) : (
        <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={TRANSITION.base}>
          <ChatView messages={messages} coaching={coaching} customerProfile={customerProfile} input={input} setInput={setInput} loading={loading} passed={passed} failed={failed} error={error} onSend={sendMessage} onReset={handleReset} onClearError={() => setError(null)} onUseScript={handleUseScript} bottomRef={bottomRef} textareaRef={textareaRef} criteriaKeys={criteriaKeys} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
