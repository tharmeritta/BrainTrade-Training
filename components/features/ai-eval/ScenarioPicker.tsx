'use client';

import { memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, Trophy, Target, Lock, CheckCircle2,
  Play, Smile, RotateCcw, ShieldCheck,
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { ActiveAgentUI } from '@/components/ui/ActiveAgentUI';
import { StepProgress } from './StepProgress';
import type { EvalScenario } from './types';
import { getPassThresholdPct } from '@/lib/scoring';

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
  const locale = useLocale();
  const lang = (locale === 'en' ? 'en' : 'th') as 'th' | 'en';

  const levels = useMemo(() => {
    const safeT = (key: string, fallback: string) => {
      try {
        const val = t(key as any);
        return val && typeof val === 'string' && !val.includes('aiEval.') ? val : fallback;
      } catch {
        return fallback;
      }
    };

    const groups: Record<number, { name: string; description: string; scenarios: EvalScenario[] }> = {
      1: { name: safeT('level_1_title', 'Level 1: Foundation & Price Objection Handling'), description: safeT('level_1_desc', 'Master price objection reframing and gatekeeper bypass.'), scenarios: [] },
      2: { name: safeT('level_2_title', 'Level 2: Value Pitch & Need Discovery'), description: safeT('level_2_desc', 'Elevator pitches for busy executives and outcome selling.'), scenarios: [] },
      3: { name: safeT('level_3_title', 'Level 3: Advanced Trust & Friction Removal'), description: safeT('level_3_desc', 'Data compliance, security assurance, and payment terms.'), scenarios: [] },
      4: { name: safeT('level_4_title', 'Level 4: Master Class Close & Graduation'), description: safeT('level_4_desc', 'Multi-stakeholder board decisions and final trial closes.'), scenarios: [] },
    };
    scenarios.forEach(s => {
      const lv = s.level || DIFFICULTY_MAP[s.difficulty] || 1;
      if (groups[lv]) {
        groups[lv].scenarios.push(s);
      }
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
              <button 
                type="button"
                onClick={onClearError} 
                aria-label="Clear error notification"
                className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
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
            type="button"
            onClick={onBack}
            disabled={loading}
            className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-all group disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg px-1"
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
                  <p className="text-[10px] font-bold text-muted-foreground mb-1 leading-tight">{levelGroup.description}</p>
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
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      whileHover={isLocked ? {} : { y: -6, scale: 1.02 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.08, duration: 0.4 }}
                      onClick={() => !isLocked && !loading && onSelect(s.id)}
                      className={`group relative bg-card border-2 rounded-[2.25rem] p-6 transition-all duration-500 overflow-hidden shadow-lg ${
                        isLocked
                          ? 'opacity-50 grayscale cursor-not-allowed border-white/5 bg-secondary/20'
                          : isCompleted
                          ? 'cursor-pointer border-emerald-500/30 hover:border-emerald-500/60 bg-emerald-500/[0.03] shadow-emerald-500/10'
                          : 'cursor-pointer border-black/5 dark:border-white/10 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10'
                      } ${loading ? 'cursor-wait' : ''}`}
                    >
                      {/* Ambient Glow */}
                      <div className={`absolute -top-16 -right-16 w-32 h-32 rounded-full blur-[60px] opacity-10 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none ${
                        isCompleted ? 'bg-emerald-500' : 'bg-primary'
                      }`} />

                      {isCompleted && (
                        <div className="absolute top-4 right-4 bg-emerald-500 text-white p-1.5 rounded-full shadow-lg shadow-emerald-500/30 z-20">
                          <CheckCircle2 size={14} />
                        </div>
                      )}

                      <div className="space-y-4 relative z-10">
                        <div className="flex items-start justify-between">
                          <div className="flex flex-wrap gap-2">
                            <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                              s.difficulty === 'beginner'     ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20' :
                              s.difficulty === 'intermediate' ? 'bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-500/20'     :
                              s.difficulty === 'advanced'     ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20'       :
                                                                'bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20'
                            }`}>
                              {t(`difficultyLabel.${s.difficulty}`)}
                            </div>
                            {s.required && (
                              <div className="px-3 py-1 bg-primary text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-md shadow-primary/20">
                                Required
                              </div>
                            )}
                          </div>
                          <div className="text-[10px] font-black text-muted-foreground bg-secondary/60 px-2.5 py-1 rounded-lg border border-black/5 dark:border-white/5">
                            Pass: {getPassThresholdPct(s.passThreshold, 70)}%
                          </div>
                        </div>

                        <div>
                          <h4 className="font-black text-lg text-foreground mb-1 group-hover:text-primary transition-colors leading-tight">
                            {typeof s.name === 'string' ? s.name : (lang === 'th' ? s.name?.th || s.name?.en : s.name?.en || s.name?.th) || ''}
                          </h4>
                          <p className="text-xs text-muted-foreground font-medium leading-relaxed line-clamp-2 min-h-[2.5rem]">
                            {typeof s.customerPersona === 'string' ? s.customerPersona : typeof s.description === 'string' ? s.description : (lang === 'th' ? (s.customerPersona as any)?.th || (s.description as any)?.th : (s.customerPersona as any)?.en || (s.description as any)?.en) || ''}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-1">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 rounded-lg text-[9px] font-black uppercase tracking-wider text-primary">
                            <ShieldCheck size={11} />
                            Telesales Sim
                          </div>
                          {s.initialMood && (
                            <div className="flex items-center gap-1 px-2.5 py-1 bg-secondary/60 rounded-lg text-[9px] font-bold text-foreground/80">
                              <Smile size={11} className="text-amber-400" />
                              <span>{typeof s.initialMood === 'string' ? s.initialMood : (lang === 'th' ? s.initialMood?.th : s.initialMood?.en) || ''}</span>
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
                                : 'bg-primary text-white shadow-primary/30 group-hover:scale-110'
                            }`}>
                              <Play size={15} className="fill-current ml-0.5" />
                            </div>
                          </div>
                        )}
                      </div>

                      {isLocked && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/40 backdrop-blur-[2px] rounded-[2.25rem] z-10">
                          <div className="bg-slate-900/90 text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-2.5">
                            <Lock size={15} className="text-slate-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{t('locked')}</span>
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
