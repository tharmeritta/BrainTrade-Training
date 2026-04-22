'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Target, Zap, TrendingUp, ClipboardCheck } from 'lucide-react';
import type { AgentStats } from '@/types';
import { AgentPerformancePanel } from '@/components/features/evaluator/AgentPerformancePanel';

// Modular Components
import ProfileHeader from './agent-detail/ProfileHeader';
import { 
  DetailedQuizHistory, 
  DetailedAiEvalHistory, 
  DetailedHumanEvaluations 
} from './agent-detail/HistorySections';

export default function AgentDetailModal({ 
  stats, 
  onClose, 
  onRefresh, 
  readOnly 
}: { 
  stats: AgentStats; 
  onClose: () => void; 
  onRefresh?: () => void; 
  readOnly?: boolean; 
}) {
  const t = useTranslations('admin');
  const [activeTab, setActiveTab] = useState<'summary' | 'quiz' | 'ai' | 'qa'>('summary');
  const [isBulkLoading, setIsBulkLoading] = useState(false);

  const handleOverride = async (moduleId: string, type: 'quiz' | 'ai-eval', score?: number, extra?: any) => {
    try {
      const res = await fetch('/api/admin/agents/override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          agentId: stats.agent.id, 
          agentName: stats.agent.name,
          moduleId, 
          type, 
          score,
          ...extra
        })
      });
      if (res.ok) {
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error('Override failed:', err);
    }
  };

  const handleBypass = async (level: number, reason: string) => {
    await handleOverride(level.toString(), 'ai-eval', 100, { isBypassed: true, bypassReason: reason });
  };

  const handleMasterPass = async () => {
    if (!confirm(t('agentDetail.masterPassConfirm', { name: stats.agent.name }) || `Are you sure you want to mark ALL quizzes and AI levels as PASSED for ${stats.agent.name}?`)) return;
    
    setIsBulkLoading(true);
    try {
      const res = await fetch('/api/admin/agents/override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          agentId: stats.agent.id, 
          agentName: stats.agent.name,
          moduleId: 'all', 
          type: 'bulk-pass'
        })
      });
      if (res.ok) {
        if (onRefresh) onRefresh();
        alert(t('agentDetail.masterPassSuccess') || "Agent marked as passed.");
      }
    } catch (err) {
      console.error('Master pass failed:', err);
    } finally {
      setIsBulkLoading(false);
    }
  };

  const tabs = [
    { id: 'summary', label: t('agentDetail.tabs.summary'), icon: TrendingUp },
    { id: 'quiz',    label: t('agentDetail.tabs.quiz'),    icon: Target },
    { id: 'ai',      label: t('agentDetail.tabs.ai'),      icon: Zap },
    { id: 'qa',      label: t('agentDetail.tabs.qa'),      icon: ClipboardCheck },
  ] as const;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 lg:p-8"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-card border border-border rounded-[2.5rem] w-full max-w-5xl h-[85vh] shadow-2xl relative overflow-hidden flex flex-col"
      >
        <ProfileHeader 
          stats={stats} 
          onClose={onClose} 
          onMasterPass={handleMasterPass} 
          isBulkLoading={isBulkLoading} 
          readOnly={readOnly} 
        />

        {/* Tab Navigation */}
        <div className="px-8 border-b border-border bg-card shrink-0">
          <div className="flex gap-8 overflow-x-auto scrollbar-hide">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 border-b-2 transition-all flex items-center gap-2 text-sm font-bold whitespace-nowrap ${
                  activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon size={16} /> {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-card/30">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'summary' && (
                <div className="max-w-2xl mx-auto">
                  <AgentPerformancePanel stats={stats} loading={false} />
                </div>
              )}
              {activeTab === 'quiz'  && <DetailedQuizHistory stats={stats} onOverride={handleOverride} readOnly={readOnly} />}
              {activeTab === 'ai'    && <DetailedAiEvalHistory stats={stats} onOverride={handleOverride} onBypass={handleBypass} readOnly={readOnly} />}
              {activeTab === 'qa'    && <DetailedHumanEvaluations stats={stats} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
