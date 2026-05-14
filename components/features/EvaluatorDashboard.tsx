'use client';

/**
 * EvaluatorDashboard — Sales Simulation evaluation interface.
 * Fully theme-aware (light/dark) and bilingual (TH/EN) using next-intl.
 * Refactored for maintainability: logic moved to hooks, UI split into components.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  Search, Activity, Activity as ActivityIcon, ArrowLeft, CheckCircle2, 
  ChevronRight, LogOut, Zap, Loader2, Keyboard, 
  ClipboardCheck, X, AlertTriangle, Check
} from 'lucide-react';

import { ScoreRing } from '@/components/ui/ScoreRing';
import { AgentPerformancePanel } from '@/components/features/evaluator/AgentPerformancePanel';
import ThemeToggle from '@/components/ui/ThemeToggle';
import LangToggle from '@/components/ui/LangToggle';
import ChangePasswordModal from '@/components/features/admin/ChangePasswordModal';

import { EvalForm } from './evaluator/EvalForm';
import { EvalHistoryCard } from './evaluator/EvalHistoryCard';
import { OverviewPanel } from './evaluator/OverviewPanel';
import { useEvaluatorDashboard } from './evaluator/useEvaluatorDashboard';
import { 
  calcScore, emptyCriteria, STATUS_CFG 
} from '@/lib/evaluator-helpers';

import type { SalesCallCriteria } from '@/types';
import type { CompletionStatus } from '@/lib/completion';

// --- Keyboard Shortcuts Hook (Local for context) ---

function useKeyboardShortcuts(
  isEnabled: boolean,
  onTogglePerf: (idx: number) => void,
  onToggleRedFlag: (idx: number) => void,
  onToggleResult: () => void,
  onSave: () => void
) {
  useEffect(() => {
    if (!isEnabled) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      
      if (['1', '2', '3', '4'].includes(e.key)) {
        e.preventDefault();
        onTogglePerf(parseInt(e.key) - 1);
      }
      const rfKeys: Record<string, number> = { q: 0, w: 1, e: 2, r: 3, Q: 0, W: 1, E: 2, R: 3 };
      if (rfKeys[e.key] !== undefined) {
        e.preventDefault();
        onToggleRedFlag(rfKeys[e.key]);
      }
      if (e.key === ' ') {
        e.preventDefault();
        onToggleResult();
      }
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEnabled, onTogglePerf, onToggleRedFlag, onToggleResult, onSave]);
}

// --- Main Component ---

interface EvaluatorDashboardProps {
  evaluatorId: string;
  evaluatorName: string;
  passwordChanged: boolean;
}

export default function EvaluatorDashboard({ evaluatorId, evaluatorName, passwordChanged }: EvaluatorDashboardProps) {
  const t = useTranslations('evaluator');

  // Layout state
  const [sidebarCollapsed, setSidebarCollapsed]   = useState(false);
  const [profileOpen, setProfileOpen]             = useState(false);
  const [isPwModalOpen, setIsPwModalOpen]         = useState(false);

  // Hook-managed state
  const {
    agents, agentSearch, setAgentSearch, statusFilter, setStatusFilter,
    selectedAgent, setSelectedAgent, handleSelectAgent,
    tab, setTab,
    agentStats, loadingStats,
    allAgentStats, myEvals, agentEvals, loadingHistory,
    criteria, setCriteria,
    saving, saveSuccess, saveError,
    editingEval, handleEditEval,
    handleSave, togglePerf, toggleRedFlag, toggleResult,
    isLive, filteredAgents, evaluatedIds
  } = useEvaluatorDashboard(evaluatorId, evaluatorName);

  // Shortcuts
  useKeyboardShortcuts(!!selectedAgent && tab === 'new', togglePerf, toggleRedFlag, toggleResult, handleSave);

  // Force password change on first login
  useEffect(() => {
    if (!passwordChanged) setIsPwModalOpen(true);
  }, [passwordChanged]);

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/20" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <ChangePasswordModal isOpen={isPwModalOpen} onClose={() => setIsPwModalOpen(false)} />

      {/* Keyboard Shortcuts Help */}
      <div className="fixed bottom-24 right-6 z-50 group">
        <div className="bg-card/80 backdrop-blur-xl border border-border rounded-full p-2.5 shadow-lg text-muted-foreground hover:text-foreground transition-all cursor-help">
          <Keyboard size={20} />
        </div>
        <div className="absolute bottom-full right-0 mb-3 w-64 bg-card border border-border rounded-2xl shadow-2xl p-4 opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-y-2 group-hover:translate-y-0">
          <p className="text-xs font-black uppercase tracking-widest text-primary mb-3">Evaluator Hotkeys</p>
          <div className="space-y-2.5 text-[11px]">
            <div className="flex items-center justify-between"><span className="font-medium">Performance (1-4)</span><kbd className="px-1.5 py-0.5 rounded bg-secondary border border-border font-bold">1-4</kbd></div>
            <div className="flex items-center justify-between"><span className="font-medium">Red Flags (Q-R)</span><kbd className="px-1.5 py-0.5 rounded bg-secondary border border-border font-bold">Q-R</kbd></div>
            <div className="flex items-center justify-between"><span className="font-medium">Toggle Pass/Fail</span><kbd className="px-1.5 py-0.5 rounded bg-secondary border border-border font-bold">Space</kbd></div>
            <div className="flex items-center justify-between"><span className="font-medium">Save Evaluation</span><kbd className="px-1.5 py-0.5 rounded bg-secondary border border-border font-bold">⌘ + Enter</kbd></div>
          </div>
        </div>
      </div>

      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute top-[40%] right-[-10%] w-[30%] h-[40%] bg-purple-500/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] bg-amber-500/10 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 flex min-h-screen">

        {/* -- Sidebar ---------------------------------------------------- */}
        <aside className={`flex flex-col shrink-0 bg-background/70 backdrop-blur-2xl border-r border-border/40 sticky top-0 h-screen transition-all duration-300 ${sidebarCollapsed ? 'w-[60px]' : 'w-[220px]'}`}>

          <div className={`flex items-center h-16 border-b border-border/40 px-4 ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="relative w-8 h-8 rounded-xl overflow-hidden shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-cyan to-brand-purple" />
              <span className="relative z-10 flex items-center justify-center w-full h-full text-xs font-black text-white tracking-tight">B</span>
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-foreground tracking-tight truncate">BrainTrade</p>
                <p className="text-[10px] text-muted-foreground truncate">{t('evaluatorPanel')}</p>
              </div>
            )}
          </div>

          <div className="px-3 pt-4 pb-2 relative">
            <button
              onClick={() => setProfileOpen(v => !v)}
              className={`w-full flex items-center gap-2.5 rounded-xl border transition-all hover:opacity-80 active:scale-[0.98] bg-blue-500/15 text-blue-400 border-blue-500/20 ${sidebarCollapsed ? 'justify-center p-2' : 'px-3 py-2.5'}`}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black uppercase shrink-0 bg-blue-500/15 text-blue-400 border border-blue-500/20">
                {evaluatorName.charAt(0)}
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-bold text-foreground truncate">{evaluatorName}</p>
                  <p className="text-[10px] font-black uppercase tracking-wider text-blue-400">{t('evaluatorRole')}</p>
                </div>
              )}
            </button>

            <AnimatePresence>
              {profileOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setProfileOpen(false)} 
                    onKeyDown={(e) => { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') setProfileOpen(false); }}
                    role="button" 
                    tabIndex={0} 
                    aria-label="Close" 
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 4, scale: 0.97 }}
                    className={`absolute z-50 top-full mt-2 bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl shadow-black/20 overflow-hidden ${sidebarCollapsed ? 'left-full ml-2 top-0 w-[220px]' : 'left-3 right-3'}`}
                  >
                    <div className="px-4 py-3 border-b border-border/50 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black uppercase border shrink-0 bg-blue-500/15 text-blue-400 border-blue-500/20">{evaluatorName.charAt(0)}</div>
                      <div className="flex-1 min-w-0 text-left"><p className="text-sm font-bold text-foreground truncate">{evaluatorName}</p><p className="text-[10px] font-black uppercase tracking-wider text-blue-400">{t('evaluatorRole')}</p></div>
                    </div>
                    <div className="p-2">
                      <button onClick={() => { setIsPwModalOpen(true); setProfileOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all">
                        <Zap size={14} className="shrink-0" /> {t('changePw')}
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <nav className="flex flex-col gap-0.5 px-2 py-2">
            {!sidebarCollapsed && <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 px-3 mb-1">{t('workspace')}</p>}
            <button
              onClick={() => setSelectedAgent(null)}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${!selectedAgent ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'} ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
            >
              {!selectedAgent && <motion.div layoutId="sidebar-indicator" className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-full" transition={{ type: 'spring', stiffness: 500, damping: 35 }} />}
              <Activity size={16} className="shrink-0" />
              {!sidebarCollapsed && <span className="flex-1 text-left">{t('overview')}</span>}
              {!sidebarCollapsed && isLive && <Loader2 size={10} className="animate-spin text-blue-500/50" />}
            </button>
          </nav>

          <div className="flex-1 flex flex-col min-h-0">
            {!sidebarCollapsed && (
              <div className="px-3 pb-2 space-y-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 px-0 pt-2">{t('agents')}</p>
                <div className="relative"><Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" /><input type="text" value={agentSearch} onChange={e => setAgentSearch(e.target.value)} placeholder={t('searchPlaceholder')} className="w-full pl-7 pr-3 py-1.5 rounded-lg text-xs bg-secondary/40 border border-border focus:ring-1 focus:ring-primary/20 outline-none" /></div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as CompletionStatus | '')} className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-secondary/40 border border-border outline-none appearance-none cursor-pointer text-foreground">
                  <option value="">{t('allStatus')}</option><option value="needs-eval">{t('statusNeedsEval')}</option><option value="in-progress">{t('statusInProgress')}</option><option value="cleared">{t('statusCleared')}</option><option value="not-started">{t('statusNotStarted')}</option>
                </select>
                <p className="text-[10px] text-muted-foreground/50">{t('agentCount', { count: filteredAgents.length })}</p>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
              {filteredAgents.map(({ agent, status }) => {
                const cfg    = STATUS_CFG[status];
                const active = selectedAgent?.id === agent.id;
                return (
                  <button key={agent.id} onClick={() => handleSelectAgent(agent)} className={`relative w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'} ${sidebarCollapsed ? 'justify-center px-2' : ''}`}>
                    {active && <motion.div layoutId="sidebar-indicator" className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-full" transition={{ type: 'spring', stiffness: 500, damping: 35 }} />}
                    <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
                    {!sidebarCollapsed && <><span className="flex-1 text-left truncate">{agent.name}</span>{evaluatedIds.has(agent.id) && <CheckCircle2 size={11} className="text-primary/60 shrink-0" />}</>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-border/40 p-2 flex flex-col gap-1">
            <button onClick={() => { fetch('/api/auth/session', { method: 'DELETE' }); window.location.replace('/login'); }} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all ${sidebarCollapsed ? 'justify-center' : ''}`}><LogOut size={15} className="shrink-0" />{!sidebarCollapsed && <span>{t('signOut')}</span>}</button>
            <button onClick={() => setSidebarCollapsed(v => !v)} className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-muted-foreground/60 hover:text-muted-foreground hover:bg-secondary/40 transition-all ${sidebarCollapsed ? 'justify-center' : ''}`}><ChevronRight size={13} className={`shrink-0 transition-transform duration-300 ${sidebarCollapsed ? '' : 'rotate-180'}`} />{!sidebarCollapsed && <span>{t('collapse')}</span>}</button>
          </div>
        </aside>

        {/* -- Main area ------------------------------------------------ */}
        <div className="flex flex-col flex-1 min-w-0">

          <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-6 bg-background/60 backdrop-blur-2xl border-b border-border/40">
            <div className="flex items-center gap-2 min-w-0">
              {selectedAgent ? (
                <><button onClick={() => setSelectedAgent(null)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground shrink-0"><ArrowLeft size={16} /></button><div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs shrink-0">{selectedAgent.name.slice(0, 2).toUpperCase()}</div><div className="min-w-0"><h1 className="text-sm font-black text-foreground tracking-tight leading-tight truncate">{selectedAgent.name}</h1><p className="text-[10px] text-muted-foreground leading-tight">{t('salesEvalSubtitle')}</p></div></>
              ) : (
                <><Activity size={18} className="text-primary shrink-0" /><div><h1 className="text-sm font-black text-foreground tracking-tight leading-tight">{t('overview')}</h1><p className="text-[10px] text-muted-foreground leading-tight">{new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</p></div></>
              )}
            </div>

            <div className="flex items-center gap-2">
              {selectedAgent && (
                <div className="flex gap-1 p-1 bg-muted/30 border border-border/40 rounded-xl">
                  {(['new', 'history'] as const).map(tabId => (
                    <button key={tabId} onClick={() => setTab(tabId)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${tab === tabId ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                      {tabId === 'new' ? t('tabNew') : (agentEvals.length > 0 ? t('tabHistory', { count: agentEvals.length }) : t('tabHistoryEmpty'))}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-0.5 p-1 bg-muted/50 border border-border/50 rounded-full"><LangToggle /><ThemeToggle /></div>
            </div>
          </header>

          <main className="flex-1 overflow-auto bg-secondary/5">
            <AnimatePresence mode="wait">
              {!selectedAgent ? (
                <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="p-6"><OverviewPanel myEvals={myEvals} agents={agents} allAgentStats={allAgentStats} onEvaluate={handleSelectAgent} /></motion.div>
              ) : tab === 'new' ? (
                <motion.div key="eval-new" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="p-6">
                  <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
                    <div className="w-full lg:w-[400px] shrink-0"><div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pb-4 pr-1"><AgentPerformancePanel stats={agentStats} loading={loadingStats} /></div></div>
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-primary/5 border border-primary/10"><ActivityIcon size={18} className="text-primary" /><span className="text-sm font-bold text-primary">{t('salesSimBadge')}</span></div>
                      {editingEval && (<div className="flex items-center justify-between px-5 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-sm font-bold"><span>{t('editBanner')}</span><button onClick={() => { setCriteria(emptyCriteria()); handleEditEval(null as any); }}><X size={16} /></button></div>)}
                      <EvalForm criteria={criteria} onChange={setCriteria} />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="eval-history" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="p-6">
                  <div className="max-w-2xl mx-auto space-y-4">
                    {loadingHistory ? (<div className="py-12 text-center"><Loader2 className="animate-spin mx-auto text-primary/40" size={32} /></div>) : agentEvals.length === 0 ? (<div className="py-12 text-center opacity-40"><ClipboardCheck className="mx-auto mb-4" size={48} /><p className="text-sm">{t('noHistory')}</p></div>) : agentEvals.map(ev => (<EvalHistoryCard key={ev.id} ev={ev} onEdit={handleEditEval} />))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          <AnimatePresence>
            {selectedAgent && tab === 'new' && (
              <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }} className="border-t border-border/40 bg-background/80 backdrop-blur-xl px-6 py-3.5 flex items-center justify-center z-30">
                <div className="w-full max-w-5xl flex items-center gap-4">
                  <ScoreRing score={calcScore(criteria)} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-foreground flex items-center gap-2">{saveSuccess ? t('saved') : editingEval ? t('editingEvaluation') : t('salesSimStatus')}{!saveSuccess && (<span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-black ${criteria.finalResult === 'failed' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'}`}>{criteria.finalResult === 'failed' ? t('failedCaps') : t('passedCaps')}</span>)}</div>
                    {(() => {
                      if (criteria.finalResult === 'failed' && criteria.failReason) return <div className="text-xs text-red-500 font-bold truncate max-w-md">{criteria.failReason}</div>;
                      const fc = Object.values(criteria.redFlags).filter(Boolean).length;
                      if (fc === 4) return <div className="text-xs text-red-400 font-black">{t('failAllFlags')}</div>;
                      if (fc > 0)  return <div className="text-xs text-red-400 font-semibold">{t('redFlagDeduction', { points: fc * 25, count: fc })}</div>;
                      return <div className="text-xs text-muted-foreground/40">{t('noRedFlags')}</div>;
                    })()}
                  </div>
                  <button onClick={handleSave} disabled={saving || saveSuccess} className={`shrink-0 px-6 py-2.5 rounded-xl font-black text-sm transition-all shadow-lg ${saveSuccess ? 'bg-emerald-500 text-white shadow-emerald-500/20' : saveError ? 'bg-red-500 text-white shadow-red-500/20' : 'bg-primary text-white shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]'}`}>
                    {saving ? <Loader2 className="animate-spin" size={16} /> : saveSuccess ? <span className="flex items-center gap-1.5"><Check size={14} /> {t('saved')}</span> : saveError ? <span className="flex items-center gap-1.5"><AlertTriangle size={14} /> {t('saveFailed')}</span> : (editingEval ? t('saveBtnEdit') : t('saveBtnNew', { score: calcScore(criteria) }))}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
