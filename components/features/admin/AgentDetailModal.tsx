'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Target, Zap, TrendingUp, ClipboardCheck, X, Clock, GraduationCap, ShieldCheck, Loader2 } from 'lucide-react';
import type { AgentStats } from '@/types';
import { BadgePill } from './AdminComponents';
import { scoreColor, timeAgo } from './AdminHelpers';

function DetailedQuizHistory({ stats, onOverride }: { stats: AgentStats, onOverride: (mod: string, type: 'quiz') => Promise<void> }) {
  const t = useTranslations('admin');
  const [loading, setLoading] = useState<string | null>(null);

  const handleOverride = async (mod: string) => {
    if (!confirm(`Are you sure you want to manually mark "${mod}" as PASSED for ${stats.agent.name}?`)) return;
    setLoading(mod);
    await onOverride(mod, 'quiz');
    setLoading(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Target size={18} className="text-amber-500" />
        <h4 className="font-bold text-base">{t('agentDetail.quizHistory')}</h4>
      </div>
      {(['foundation', 'product', 'process', 'payment'] as const).map(topic => {
        const q = stats.quiz[topic];
        const history = q?.history || [];
        const isPassed = q?.passed || history.some(h => h.passed);

        return (
          <div key={topic} className="bg-secondary/20 rounded-2xl p-4 border border-border/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold capitalize text-foreground">{t(`modules.${topic}`)}</span>
                {!isPassed && (
                  <button 
                    onClick={() => handleOverride(topic)}
                    disabled={loading === topic}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 transition-all border border-amber-500/20"
                    title="Manual Pass Override"
                  >
                    {loading === topic ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
                    <span className="text-[10px] font-black uppercase tracking-tight">Override</span>
                  </button>
                )}
              </div>
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
                    {h.manualOverride && <span className="text-[8px] font-black uppercase bg-blue-500/10 text-blue-500 px-1 rounded ml-1">Manual Override</span>}
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

function DetailedAiEvalHistory({ stats, onOverride }: { stats: AgentStats, onOverride: (mod: string, type: 'ai-eval') => Promise<void> }) {
  const t = useTranslations('admin');
  const [loading, setLoading] = useState<number | null>(null);
  const history = stats.aiEval?.history || [];
  const locale  = t('tabs.overview') === 'ภาพรวม' ? 'th-TH' : 'en-GB';

  const handleOverride = async (lv: number) => {
    if (!confirm(`Are you sure you want to manually mark Level ${lv} as PASSED for ${stats.agent.name}?`)) return;
    setLoading(lv);
    await onOverride(lv.toString(), 'ai-eval');
    setLoading(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Zap size={18} className="text-purple-500" />
        <h4 className="font-bold text-base">{t('agentDetail.aiEvalLogs')}</h4>
      </div>
      {history.length === 0 ? (
        <div className="text-center py-8 bg-secondary/20 rounded-2xl border border-dashed border-border text-muted-foreground text-xs">{t('agentDetail.noAiSessions')}</div>
      ) : (
        <div className="space-y-3">
          {([1, 2, 3, 4] as const).map(lv => {
            const lvData = stats.aiEval?.levels?.[lv];
            const lvHistory = history.filter(h => h.level === lv);
            const isPassed = lvData?.passed;

            if (!lvData) return (
              <div key={lv} className="flex items-center gap-4 bg-secondary/10 p-4 rounded-2xl border border-dashed border-border/40 opacity-40 group relative">
                <div className="w-12 h-12 rounded-xl bg-secondary flex flex-col items-center justify-center border border-border">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none mb-0.5">{t('agentDetail.lvl')}</span>
                  <span className="text-lg font-black text-muted-foreground leading-none">{lv}</span>
                </div>
                <span className="text-xs text-muted-foreground/50">{t('agentDetail.noAttempts')}</span>
                <button 
                  onClick={() => handleOverride(lv)}
                  disabled={loading === lv}
                  className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 transition-all border border-purple-500/20"
                  title="Manual Pass Override"
                >
                  {loading === lv ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                  <span className="text-[11px] font-black uppercase tracking-tight">Override</span>
                </button>
              </div>
            );

            return (
              <div key={lv} className="bg-secondary/20 rounded-2xl border border-border/50 overflow-hidden group relative">
                {!isPassed && (
                   <button 
                    onClick={() => handleOverride(lv)}
                    disabled={loading === lv}
                    className="absolute right-4 top-4 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 transition-all border border-purple-500/20 z-10"
                    title="Manual Pass Override"
                  >
                    {loading === lv ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                    <span className="text-[10px] font-black uppercase tracking-tight">Override</span>
                  </button>
                )}
                {/* Level header */}
                <div className="flex items-center gap-4 p-4">
                  <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center border shrink-0 ${lvData.passed ? 'bg-purple-500/10 border-purple-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
                    <span className={`text-[10px] font-bold uppercase leading-none mb-0.5 ${lvData.passed ? 'text-purple-400' : 'text-amber-400'}`}>{t('agentDetail.lvl')}</span>
                    <span className={`text-lg font-black leading-none ${lvData.passed ? 'text-purple-400' : 'text-amber-400'}`}>{lv}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-black ${scoreColor(lvData.avgScore)}`}>{lvData.avgScore}/100</span>
                        <span className="text-[10px] text-muted-foreground">avg · best {lvData.bestScore}/100</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">{t('agentDetail.attempts', { count: lvData.attempts })}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${lvData.passed ? 'bg-purple-500/10 text-purple-400' : 'bg-amber-500/10 text-amber-400'}`}>
                          {lvData.passed ? t('agentDetail.passed') : t('agentDetail.inProgress')}
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${scoreColor(lvData.avgScore).replace('text-', 'bg-').replace('-400', '-400').replace('-500', '-500')}`}
                        style={{ width: `${lvData.avgScore}%`, background: lvData.avgScore >= 70 ? '#60A5FA' : lvData.avgScore >= 50 ? '#FBBF24' : '#F87171' }} />
                    </div>
                  </div>
                </div>
                {/* Per-attempt rows */}
                {lvHistory.length > 0 && (
                  <div className="border-t border-border/30 px-4 pb-3 pt-2 space-y-1.5">
                    {lvHistory.map((h, i) => (
                      <div key={i} className="flex items-center justify-between bg-card/40 px-3 py-2 rounded-xl text-[11px] border border-border/30">
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${h.passed ? 'bg-purple-400' : 'bg-amber-400'}`} />
                          <span className={`font-bold ${scoreColor(h.score)}`}>{h.score}/100</span>
                          {h.manualOverride && <span className="text-[8px] font-black uppercase bg-purple-500/10 text-purple-500 px-1 rounded ml-1">Manual Override</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold uppercase text-[9px] ${h.passed ? 'text-purple-400' : 'text-amber-400'}`}>
                            {h.passed ? t('agentDetail.pass') : t('agentDetail.fail')}
                          </span>
                          <span className="text-muted-foreground/60">{new Date(h.timestamp).toLocaleString(locale, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
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

export default function AgentDetailModal({ stats, onClose, onRefresh }: { stats: AgentStats; onClose: () => void; onRefresh?: () => void }) {
  const t = useTranslations('admin');
  const [activeTab, setActiveTab] = useState<'quiz' | 'ai' | 'qa'>('quiz');

  const handleOverride = async (moduleId: string, type: 'quiz' | 'ai-eval') => {
    try {
      const res = await fetch('/api/admin/agents/override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: stats.agent.id, moduleId, type })
      });
      if (res.ok) {
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error('Override failed:', err);
    }
  };

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
              {activeTab === 'quiz'  && <DetailedQuizHistory stats={stats} onOverride={handleOverride} />}
              {activeTab === 'ai'    && <DetailedAiEvalHistory stats={stats} onOverride={handleOverride} />}
              {activeTab === 'qa'    && <DetailedHumanEvaluations stats={stats} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
