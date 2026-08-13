'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { 
  BookOpen, Target, Zap, ShieldCheck, Settings, 
  Loader2, CheckCircle2, AlertCircle, Activity
} from 'lucide-react';

import { useConfigEditor } from '@/lib/hooks/useConfigEditor';
import { COURSE_MODULES } from '@/lib/courses';

import { SkeletonTable } from '@/components/ui/Skeleton';

// Extracted Editors
import LearnEditor from './adjustments/LearnEditor';
import QuizzesEditor from './adjustments/QuizzesEditor';
import AiEvalEditor from './adjustments/AiEvalEditor';
import OverridesManager from './adjustments/OverridesManager';
import SystemEditor from './adjustments/SystemEditor';
import HealthManager from './adjustments/HealthManager';

type ConfigType = 'learn' | 'quizzes' | 'ai-eval' | 'overrides' | 'features' | 'health';

const TABS: { id: ConfigType; label: string; icon: any }[] = [
  { id: 'learn', label: 'Learn Courses', icon: BookOpen },
  { id: 'quizzes', label: 'Quizzes', icon: Target },
  { id: 'ai-eval', label: 'AI Eval Settings', icon: Zap },
  { id: 'overrides', label: 'Overrides', icon: ShieldCheck },
  { id: 'features', label: 'System', icon: Settings },
  { id: 'health', label: 'Data Health', icon: Activity },
];

export default function AdjustmentsTab({ role, readOnly }: { role: string; readOnly?: boolean }) {
  const t = useTranslations('admin');
  const [activeTab, setActiveTab] = useState<ConfigType>('learn');
  const { 
    configs, loading, saving, saveStatus, hasUnsavedChanges, 
    setHasUnsavedChanges, handleSave 
  } = useConfigEditor(role);

  const initialModules = useMemo(() => {
    if (configs.learn?.modules && Object.keys(configs.learn.modules).length > 0) {
      return configs.learn.modules as any;
    }
    return { ...COURSE_MODULES } as any;
  }, [configs.learn]);

  if (loading) return (
    <div className="space-y-4 p-2">
      <SkeletonTable rows={4} />
    </div>
  );

  const confirmTabChange = (newTab: ConfigType) => {
    if (hasUnsavedChanges && !window.confirm('You have unsaved changes. Your changes will be lost. Continue?')) return;
    setActiveTab(newTab);
    setHasUnsavedChanges(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
            Module Adjustments
            {hasUnsavedChanges && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
          </h2>
          <p className="text-sm text-muted-foreground">Modify training content, quiz questions, and AI behavior.</p>
        </div>
        <AnimatePresence mode="wait">
          {saveStatus !== 'idle' && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className={`text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${saveStatus === 'success' ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' : 'text-red-500 bg-red-500/10 border-red-500/20'}`}>
              {saveStatus === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />} 
              {saveStatus === 'success' ? 'Saved successfully' : 'Failed to save'}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex p-1 rounded-xl bg-secondary/30 border border-border w-fit overflow-x-auto scrollbar-hide relative">
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button 
              key={tab.id}
              onClick={() => confirmTabChange(tab.id)} 
              className={`relative px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {isActive && (
                <motion.div
                  layoutId="adjustments-active-tab"
                  className="absolute inset-0 bg-card rounded-lg shadow-sm border border-border/50"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <tab.icon size={16} /> {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm min-h-[300px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {activeTab === 'learn' && <LearnEditor initialModules={initialModules} data={configs.learn} onSave={d => handleSave('learn', d)} onChange={() => setHasUnsavedChanges(true)} saving={saving} readOnly={readOnly} />}
            {activeTab === 'quizzes' && <QuizzesEditor data={configs.quizzes} onSave={d => handleSave('quizzes', d)} onChange={() => setHasUnsavedChanges(true)} saving={saving} readOnly={readOnly} />}
            {activeTab === 'ai-eval' && <AiEvalEditor data={configs.ai_eval} onSave={d => handleSave('ai_eval', d)} onChange={() => setHasUnsavedChanges(true)} saving={saving} readOnly={readOnly} />}
            {activeTab === 'overrides' && <OverridesManager readOnly={readOnly} />}
            {activeTab === 'features' && <SystemEditor data={configs.features} onSave={d => handleSave('features', d)} onChange={() => setHasUnsavedChanges(true)} saving={saving} readOnly={readOnly} />}
            {activeTab === 'health' && <HealthManager readOnly={readOnly} />}
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}
