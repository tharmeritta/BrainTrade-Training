'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Target, Zap, TrendingUp, ClipboardCheck, X, Clock, GraduationCap } from 'lucide-react';
import type { AgentStats } from '@/types';
import { BadgePill } from './AdminComponents';
import { scoreColor, timeAgo } from './AdminHelpers';

function DetailedQuizHistory({ stats }: { stats: AgentStats }) {
  const t = useTranslations('admin');
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Target size={18} className="text-amber-500" />
        <h4 className="font-bold text-base">{t('agentDetail.quizHistory')}</h4>
      </div>
      {(['foundation', 'product', 'process', 'payment'] as const).map(topic => {
        const q = stats.quiz[topic];
        const history = q?.history || [];
        return (
          <div key={topic} className="bg-secondary/20 rounded-2xl p-4 border border-border/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold capitalize text-foreground">{t(`modules.${topic}`)}</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-black ${scoreColor(q?.bestScore)}`}>{t('agentDetail.best')}: {q?.bestScore ?? 0}%</span>
                <span className="text-[10px] text-muted-foreground uppercase">{t('agentDetail.attempts', { count: q?.attempts ?? 0 })}</span>
              </div>
            </div>
            <div className="space-y-2">
              {history.length === 0 ? (
                <p className="text-[10px] text-muted-foreground italic">{t('agentDetail.noAttempts')}</p>
              ) : history.map((h, i) => (
                <div key={i} className="flex items-center justify-between bg-card/40 px-3 py-2 rounded-xl text-[11px] border border-border/30">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${h.passed ? 'bg-blue-500' : 'bg-red-500'}`} />
                    <span className="font-medium text-foreground">{h.score}/{h.total}</span>
                    <span className="text-muted-foreground">({Math.round(h.score/h.total*100)}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold uppercase text-[9px] ${h.passed ? 'text-blue-500' : 'text-red-500'}`}>
                      {h.passed ? t('agentDetail.pass') : t('agentDetail.fail')}
                    </span>
                    <span className="text-muted-foreground/60">{new Date(h.timestamp).toLocaleDateString(t('tabs.overview') === 'ภาพรวม' ? 'th-TH' : 'en-GB', { day: 'numeric', month: 'short' })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DetailedAiEvalHistory({ stats }: { stats: AgentStats }) {
  const t = useTranslations('admin');
  const history = stats.aiEval?.history || [];
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Zap size={18} className="text-purple-500" />
        <h4 className="font-bold text-base">{t('agentDetail.aiEvalLogs')}</h4>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {history.length === 0 ? (
          <div className="text-center py-8 bg-secondary/20 rounded-2xl border border-dashed border-border text-muted-foreground text-xs">{t('agentDetail.noAiSessions')}</div>
        ) : history.map((h, i) => (
          <div key={i} className="flex items-center gap-4 bg-secondary/20 p-4 rounded-2xl border border-border/50">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex flex-col items-center justify-center border border-purple-500/20">
              <span className="text-[10px] font-bold text-purple-400 uppercase leading-none mb-0.5">{t('agentDetail.lvl')}</span>
              <span className="text-lg font-black text-purple-400 leading-none">{h.level}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-black ${scoreColor(h.score)}`}>{h.score}/100</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${h.passed ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-400'}`}>
                  {h.passed ? t('agentDetail.passed') : t('agentDetail.notPassed')}
                </span>
              </div>
              <div className="text-[10px] text-muted-foreground">{new Date(h.timestamp).toLocaleString(t('tabs.overview') === 'ภาพรวม' ? 'th-TH' : 'en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


function DetailedHumanEvaluations({ stats }: { stats: AgentStats }) {
  const t = useTranslations('admin');
  const evals = stats.humanEvaluations || [];
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <ClipboardCheck size={18} className="text-blue-500" />
        <h4 className="font-bold text-base">{t('agentDetail.humanQa')}</h4>
      </div>
      <div className="space-y-3">
        {evals.length === 0 ? (
          <div className="text-center py-8 bg-secondary/20 rounded-2xl border border-dashed border-border text-muted-foreground text-xs">{t('agentDetail.noHumanEvals')}</div>
        ) : evals.map((ev, i) => (
          <div key={i} className="bg-secondary/20 p-4 rounded-2xl border border-border/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center font-black text-blue-400 text-sm border border-blue-500/20">
                  {ev.totalScore}
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase font-bold">{t('agentDetail.evaluatedBy')}</div>
                  <div className="text-xs font-bold text-foreground">{ev.evaluatorName}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-muted-foreground uppercase font-bold">{new Date(ev.evaluatedAt).toLocaleDateString(t('tabs.overview') === 'ภาพรวม' ? 'th-TH' : 'en-GB', { day: 'numeric', month: 'short' })}</div>
                <div className="text-[9px] text-muted-foreground/60">{timeAgo(ev.evaluatedAt, t)}</div>
              </div>
            </div>
            {ev.comments && (
              <div className="bg-card/40 p-3 rounded-xl border border-border/30">
                <p className="text-[11px] text-muted-foreground leading-relaxed italic">&quot;{ev.comments}&quot;</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AgentDetailModal({ stats, onClose }: { stats: AgentStats; onClose: () => void }) {
  const t = useTranslations('admin');
  const [activeTab, setActiveTab] = useState<'quiz' | 'ai' | 'qa'>('quiz');

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
        {/* Header Profile */}
        <div className="px-8 py-8 bg-gradient-to-br from-secondary/50 to-secondary/20 border-b border-border relative shrink-0">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground">
            <X size={20} />
          </button>
          
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-blue-500/20 shrink-0">
              {stats.agent.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                <h3 className="text-2xl font-black text-foreground tracking-tight">{stats.agent.name}</h3>
                <BadgePill badge={stats.badge} />
                <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold ${stats.agent.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {stats.agent.active ? t('agentDetail.active') : t('agentDetail.inactive')}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
                <div className="flex items-center gap-1.5"><Clock size={14} /> {t('agentDetail.lastActive')}: {timeAgo(stats.lastActive, t)}</div>
                <div className="flex items-center gap-1.5"><GraduationCap size={14} /> {t('agentDetail.overallScore')}: <span className={`font-bold ${scoreColor(stats.overallScore)}`}>{stats.overallScore}%</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-8 border-b border-border bg-card shrink-0">
          <div className="flex gap-8 overflow-x-auto scrollbar-hide">
            {[
              { id: 'quiz',  label: t('agentDetail.tabs.quiz'), icon: Target },
              { id: 'ai',    label: t('agentDetail.tabs.ai'),   icon: Zap },
              { id: 'qa',    label: t('agentDetail.tabs.qa'), icon: ClipboardCheck },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`py-4 border-b-2 transition-all flex items-center gap-2 text-sm font-bold whitespace-nowrap ${
                  activeTab === t.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <t.icon size={16} /> {t.label}
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
              {activeTab === 'quiz'  && <DetailedQuizHistory stats={stats} />}
              {activeTab === 'ai'    && <DetailedAiEvalHistory stats={stats} />}
              {activeTab === 'qa'    && <DetailedHumanEvaluations stats={stats} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
