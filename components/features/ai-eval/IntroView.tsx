'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Zap, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { TRANSITION } from '@/lib/animations';
import { ActiveAgentUI } from '@/components/ui/ActiveAgentUI';
import { StepProgress } from './StepProgress';

interface IntroViewProps {
  onContinue: () => void;
  guideline: string | null;
  agentName: string | null;
  loading: boolean;
  criteriaKeys: string[];
}

export const IntroView = memo(({ onContinue, guideline, agentName, loading, criteriaKeys }: IntroViewProps) => {
  const t = useTranslations('aiEval');

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={TRANSITION.base}
        className="bg-card rounded-3xl shadow-2xl border border-black/5 dark:border-white/5 overflow-hidden"
      >
        <div className="bg-gradient-to-br from-primary to-primary/80 px-8 py-8 text-primary-foreground relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 blur-3xl rounded-full" />
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                  <Zap size={20} className="text-white" />
                </div>
                <h1 className="text-2xl font-black tracking-tight">{t('title')}</h1>
              </div>
              <p
                className="opacity-90 text-sm leading-relaxed max-w-2xl font-medium"
                dangerouslySetInnerHTML={{ __html: t.raw('introDesc') }}
              />
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
              {guideline || 'Please wait for guidelines to load...'}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-7 h-7 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-xs font-black">2</span>
              <h3 className="font-black text-foreground text-base tracking-tight">{t('criteriaTitle')}</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {criteriaKeys.map((key) => (
                <span
                  key={key}
                  className="bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 text-foreground text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm"
                >
                  {t.raw(`criteria.${key}`) ? t(`criteria.${key}` as any) : key}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={onContinue}
            disabled={loading || !guideline}
            className="w-full flex items-center justify-center gap-2.5 bg-foreground text-background hover:bg-primary hover:text-white transition-all duration-500 py-4 rounded-2xl font-black text-base shadow-xl active:scale-[0.99] group disabled:opacity-50"
          >
            {loading ? t('connecting') : t('startSimBtn')}
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </motion.div>
    </div>
  );
});

IntroView.displayName = 'IntroView';
