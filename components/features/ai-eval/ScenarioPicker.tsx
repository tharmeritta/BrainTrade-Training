'use client';

import { memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, Trophy, Target, Lock, CheckCircle2,
  Play, Smile, RotateCcw, ShieldCheck,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ActiveAgentUI } from '@/components/ui/ActiveAgentUI';
import { StepProgress } from './StepProgress';
import type { EvalScenario } from './types';

const DIFFICULTY_MAP: Record<string, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4,
};

interface ScenarioPickerProps {
  scenarios: EvalScenario[];
  completedLevels: number[];
  passedScenarios: string[];
  unlockMode: 'sequential' | 'flexible';
  onSelect: (id: string) => void;
  onBack: () => void;
  agentName: string | null;
  error?: string | null;
  loading?: boolean;
  configLoading?: boolean;
  onClearError?: () => void;
}

export const ScenarioPicker = memo(({
  scenarios, completedLevels, passedScenarios, unlockMode, onSelect, onBack, agentName,
  error, loading, configLoading, onClearError,
}: ScenarioPickerProps) => {
  const t = useTranslations('aiEval');

  const levels = useMemo(() => {
    const groups: Record<number, { name: string; scenarios: EvalScenario[] }> = {
      1: { name: t('levelLabel', { n: 1 }), scenarios: [] },
      2: { name: t('levelLabel', { n: 2 }), scenarios: [] },
      3: { name: t('levelLabel', { n: 3 }), scenarios: [] },
      4: { name: t('levelLabel', { n: 4 }), scenarios: [] },
    };
    scenarios.forEach(s => {
      const lv = DIFFICULTY_MAP[s.difficulty] || 1;
      groups[lv].scenarios.push(s);
    });
    return Object.entries(groups)
      .filter(([, group]) => group.scenarios.length > 0)
      .map(([lv, group]) => ({ level: parseInt(lv), ...group }));
  }, [scenarios, t]);

  const passedCount      = passedScenarios.length;
  const totalScenarios   = scenarios.length;
  const progressPercent  = totalScenarios > 0 ? (passedCount / totalScenarios) * 100 : 0;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-10">
      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-2xl p-4 flex items-center justify-between gap-4 text-rose-700 dark:text-rose-400 text-sm font-bold"
          >
            <div className="flex items-center gap-3">
              <Lock size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
            {onClearError && (
              <button onClick={onClearError} className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-lg transition-colors">
                <ChevronLeft size={18} className="rotate-90" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4 flex-1">
          <button
            onClick={onBack}
            disabled={loading}
            className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-all group disabled:opacity-50"
          >
            <div className="p-1.5 rounded-lg group-hover:bg-primary/10 transition-colors">
              <ChevronLeft size={18} />
            </div>
            {t('backToSelection')}
          </button>

          <div>
            <h2 className="text-3xl font-black tracking-tight text-foreground mb-2">{t('roadmapTitle')}</h2>
            <p className="text-muted-foreground text-sm font-medium max-w-lg">
              {t('roadmapDesc')}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-xl border border-primary/10 shadow-sm">
              {unlockMode === 'flexible' ? (
                <>
                  <RotateCcw size={14} className="text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-tight text-primary">{t('flexibleUnlock')}</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={14} className="text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-tight text-primary">{t('sequentialUnlock')}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/5 rounded-xl border border-emerald-500/10 shadow-sm">
              <Trophy size={14} className="text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-tight text-emerald-500">
                {t('completedCount', { passed: passedCount, total: totalScenarios })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <StepProgress current={2} />
            <ActiveAgentUI agentName={agentName || 'Guest Mode'} />
          </div>
          <div className="w-48 space-y-1.5">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              <span>{t('overallProgress')}</span>
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

      {/* Levels */}
      <div className={`space-y-12 relative ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="absolute left-8 top-10 bottom-10 w-0.5 bg-gradient-to-b from-primary/20 via-primary/5 to-transparent hidden md:block" />

        {levels.map((levelGroup) => {
          const prevLevelExists  = levels.some(l => l.level === levelGroup.level - 1);
          // Don't evaluate lock state until config (completedLevels) has loaded to prevent flash
          const isLevelLocked    = !configLoading && levelGroup.level > 1 && prevLevelExists && !completedLevels.includes(levelGroup.level - 1);
          const isLevelPassed    = completedLevels.includes(levelGroup.level);

          return (
            <div key={levelGroup.level} className="relative space-y-6">
              {/* Level header */}
              <div className="flex items-center gap-4 relative z-10">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl border-4 border-background transition-all duration-500 ${
                  isLevelLocked
                    ? 'bg-secondary text-muted-foreground/40'
                    : isLevelPassed
                    ? 'bg-emerald-500 text-white scale-110 shadow-emerald-500/20'
                    : 'bg-primary text-white scale-110 shadow-primary/20'
                }`}>
                  {isLevelLocked
                    ? <Lock size={24} />
                    : isLevelPassed
                    ? <CheckCircle2 size={24} />
                    : <Target size={24} />}
                </div>
                <div>
                  <h3 className={`font-black text-xl tracking-tight ${isLevelLocked ? 'text-muted-foreground' : 'text-foreground'}`}>
                    {levelGroup.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isLevelLocked ? 'text-muted-foreground/60' : 'text-primary'}`}>
                      {t('scenariosCount', { count: levelGroup.scenarios.length })}
                    </span>
                    {isLevelPassed && (
                      <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                        <span className="w-1 h-1 rounded-full bg-emerald-500" />
                        {t('levelCompleted')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Scenarios grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:ml-20">
                {levelGroup.scenarios.map((s, idx) => {
                  const isCompleted = passedScenarios.includes(s.id);
                  const isLocked    = isLevelLocked;

                  return (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      onClick={() => !isLocked && !loading && onSelect(s.id)}
                      className={`group relative bg-card border-2 rounded-[2rem] p-6 transition-all duration-500 ${
                        isLocked
                          ? 'opacity-60 grayscale cursor-not-allowed border-transparent bg-secondary/30'
                          : isCompleted
                          ? 'cursor-pointer border-emerald-500/20 hover:border-emerald-500/40 bg-emerald-500/[0.02]'
                          : 'cursor-pointer border-black/5 dark:border-white/10 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5'
                      } ${loading ? 'cursor-wait' : ''}`}
                    >
                      {isCompleted && (
                        <div className="absolute top-4 right-4 bg-emerald-500 text-white p-1.5 rounded-full shadow-lg shadow-emerald-500/30 z-20">
                          <CheckCircle2 size={14} />
                        </div>
                      )}

                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            s.difficulty === 'beginner'     ? 'bg-emerald-500/10 text-emerald-600' :
                            s.difficulty === 'intermediate' ? 'bg-amber-500/10 text-amber-600'     :
                            s.difficulty === 'advanced'     ? 'bg-rose-500/10 text-rose-600'       :
                                                              'bg-purple-500/10 text-purple-600'
                          }`}>
                            {t(`difficultyLabel.${s.difficulty}`)}
                          </div>
                          <div className="text-[10px] font-black text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md">
                            {t('minThreshold', { score: s.passThreshold })}
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

                        {!isLocked && (
                          <div className="pt-4 mt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                              {isCompleted ? t('retrainBtn') : t('startSimBtn')}
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

                      {isLocked && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/20 backdrop-blur-[1px] rounded-[2rem] z-10">
                          <div className="bg-white/90 dark:bg-card/90 p-3 rounded-2xl shadow-xl border border-black/5 flex items-center gap-3">
                            <Lock size={16} className="text-muted-foreground" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('locked')}</span>
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
