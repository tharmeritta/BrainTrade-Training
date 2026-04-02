'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Search, Plus, X, Pencil, Trash2, Upload, Filter, Eye } from 'lucide-react';
import type { AgentStats } from '@/types';
import { BadgePill } from './AdminComponents';
import { scoreColor, scoreBg, timeAgo, BADGE_CONFIG } from './AdminHelpers';
import { getCompletionStatus, type CompletionStatus } from '@/lib/completion';
import { setAgentSession } from '@/lib/agent-session';
import AgentDetailModal from './AgentDetailModal';
import BulkImportModal from './BulkImportModal';
import { useRouter } from 'next/navigation';

export default function AgentsTab({ role, readOnly }: { role: 'admin' | 'manager' | 'it' | 'trainer' | 'hr'; readOnly?: boolean }) {
  const t = useTranslations('admin');
  const router = useRouter();
  const [agents,       setAgents]       = useState<AgentStats[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [newName,      setNewName]      = useState('');
  const [adding,       setAdding]       = useState(false);
  const [showForm,     setShowForm]     = useState(false);
  const [showBulk,     setShowBulk]     = useState(false);
  const [statusFilter, setStatusFilter] = useState<CompletionStatus | ''>('');
  const [agentErr,     setAgentErr]     = useState('');
  const [editingAgent, setEditingAgent] = useState<{ id: string; name: string; stageName: string } | null>(null);
  const [savingAgent,  setSavingAgent]  = useState(false);
  const [selectedForDetail, setSelectedForDetail] = useState<AgentStats | null>(null);

  const isIT = role === 'it';
  const confirmITAction = useCallback(() => {
    if (!isIT) return true;
    return confirm("Confirm to send this request for administrator approval?");
  }, [isIT]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/agents');
      if (res.ok) { const d = await res.json(); setAgents(d.agents ?? []); }
    } catch { /* show empty state */ }
    setLoading(false);
  }, []);

  function inspectAgent(a: AgentStats['agent']) {
    setAgentSession({ id: a.id, name: a.name, stageName: a.stageName ?? '' });
    // Use window.location to ensure a clean state/redirect
    const locale = window.location.pathname.split('/')[1] ?? 'th';
    window.location.href = `/${locale}/dashboard`;
  }

  useEffect(() => { load(); }, [load]);

  const filtered = agents.filter(a => {
    const nameMatch = a.agent.name.toLowerCase().includes(search.toLowerCase()) ||
      (a.agent.stageName ?? '').toLowerCase().includes(search.toLowerCase());
    if (!nameMatch) return false;
    if (statusFilter) return getCompletionStatus(a).status === statusFilter;
    return true;
  });

  async function saveAgentEdit() {
    if (!editingAgent) return;
    if (!confirmITAction()) return;
    setSavingAgent(true);
    setAgentErr('');
    const res = await fetch(`/api/admin/agents/${editingAgent.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editingAgent.name, stageName: editingAgent.stageName }),
    });
    if (res.ok) {
      setEditingAgent(null);
      await load();
    } else {
      const d = await res.json();
      setAgentErr(d.error ?? 'Failed to save');
    }
    setSavingAgent(false);
  }

  async function addAgent(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    if (!confirmITAction()) return;
    setAdding(true);
    setAgentErr('');
    const res = await fetch('/api/admin/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() }),
    });
    if (res.ok) {
      setNewName(''); setShowForm(false);
      await load();
    } else {
      const d = await res.json();
      setAgentErr(d.error ?? 'Failed to add agent');
    }
    setAdding(false);
  }

  async function toggleActive(id: string, active: boolean) {
    if (!confirmITAction()) return;
    await fetch(`/api/admin/agents/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !active }),
    });
    await load();
  }

  async function deleteAgent(id: string, name: string) {
    if (!confirm(t('agents.deleteConfirm', { name }))) return;
    if (!confirmITAction()) return;
    setAgentErr('');
    const res = await fetch(`/api/admin/agents/${id}`, { method: 'DELETE' });
    if (!res.ok) setAgentErr('Failed to delete agent.');
    else await load();
  }

  const ModuleCell = ({ stat }: { stat: AgentStats['quiz'][keyof AgentStats['quiz']] }) => {
    if (!stat) return (
      <div className="flex justify-center">
        <span className="text-muted-foreground/25 text-lg leading-none">–</span>
      </div>
    );
    return (
      <div className="flex flex-col items-center gap-1.5">
        <span className={`font-black text-sm ${scoreColor(stat.bestScore)}`}>{stat.bestScore}%</span>
        <div className="w-10 h-1.5 rounded-full overflow-hidden bg-muted/50">
          <div className={`h-full rounded-full ${scoreBg(stat.bestScore)}`} style={{ width: `${stat.bestScore}%` }} />
        </div>
        <div className="flex items-center gap-1">
          <div className={`w-1.5 h-1.5 rounded-full ${stat.passed ? 'bg-emerald-400' : 'bg-red-400'}`} />
          <span className={`text-[9px] font-bold ${stat.passed ? 'text-emerald-400' : 'text-red-400/70'}`}>
            {stat.passed ? t('agents.table.pass') : t('agents.table.fail')} · {stat.attempts}x
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {selectedForDetail && (
          <AgentDetailModal 
            stats={selectedForDetail} 
            onClose={() => setSelectedForDetail(null)} 
            onRefresh={load}
          />
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('agents.searchPlaceholder')}
              className="pl-9 pr-4 py-2.5 bg-secondary/40 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-52"
            />
          </div>
          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as CompletionStatus | '')}
              className="pl-8 pr-8 py-2.5 bg-secondary/40 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
            >
              <option value="">{t('agents.filterAll')}</option>
              <option value="cleared">{t('agents.statusCleared')}</option>
              <option value="needs-eval">{t('agents.statusNeedsEval')}</option>
              <option value="in-progress">{t('agents.statusInProgress')}</option>
              <option value="not-started">{t('agents.statusNotStarted')}</option>
            </select>
          </div>
        </div>
        {(role === 'admin' || role === 'it') && !readOnly && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowBulk(true)}
              className="flex items-center gap-2 bg-secondary text-foreground px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-secondary/80 transition-colors border border-border shadow-sm"
            >
              <Upload size={18} /> {t('agents.bulkImport')}
            </button>
            <button
              onClick={() => setShowForm(f => !f)}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
            >
              <Plus size={18} /> {t('agents.addAgent')}
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showBulk && (
          <BulkImportModal onClose={() => setShowBulk(false)} onSuccess={load} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showForm && (role === 'admin' || role === 'it') && (
          <motion.form
            onSubmit={addAgent}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-primary/5 border border-primary/20 rounded-2xl p-5 flex gap-3 items-center"
          >
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder={t('agents.addPlaceholder')}
              className="flex-1 bg-secondary/40 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground"
              required autoFocus
            />
            <button type="submit" disabled={adding}
              className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
            >
              {adding ? t('agents.adding') : t('agents.create')}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground px-3 py-2.5 text-sm">{t('agents.cancel')}</button>
          </motion.form>
        )}
      </AnimatePresence>

      {agentErr && (
        <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3">{agentErr}</p>
      )}

      {/* Edit Agent Modal */}
      <AnimatePresence>
        {editingAgent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={e => { if (e.target === e.currentTarget) setEditingAgent(null); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-lg text-foreground">{t('agents.editTitle')}</h3>
                <button onClick={() => setEditingAgent(null)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">{t('agents.fullName')}</label>
                  <input
                    value={editingAgent.name}
                    onChange={e => setEditingAgent(prev => prev ? { ...prev, name: e.target.value } : null)}
                    className="w-full bg-secondary/40 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                    placeholder={t('agents.fullName')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">{t('agents.stageName')} <span className="text-muted-foreground/60 font-normal">{t('agents.optional')}</span></label>
                  <input
                    value={editingAgent.stageName}
                    onChange={e => setEditingAgent(prev => prev ? { ...prev, stageName: e.target.value } : null)}
                    className="w-full bg-secondary/40 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                    placeholder={t('agents.stagePlaceholder')}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={saveAgentEdit}
                  disabled={savingAgent || !editingAgent.name.trim()}
                  className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 hover:bg-primary/90 transition-colors"
                >
                  {savingAgent ? t('agents.saving') : t('agents.saveChanges')}
                </button>
                <button onClick={() => setEditingAgent(null)} className="px-5 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                  {t('agents.cancel')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-separate border-spacing-y-2 px-2">
            <thead>
              <tr className="text-muted-foreground">
                <th className="text-left px-5 py-3 font-bold uppercase tracking-wider text-[10px] bg-secondary/40 rounded-l-xl">{t('agents.table.agent')}</th>
                <th className="text-center px-4 py-3 font-bold uppercase tracking-wider text-[10px] bg-secondary/40">{t('agents.table.foundation')}</th>
                <th className="text-center px-4 py-3 font-bold uppercase tracking-wider text-[10px] bg-secondary/40">{t('agents.table.product')}</th>
                <th className="text-center px-4 py-3 font-bold uppercase tracking-wider text-[10px] bg-secondary/40">{t('agents.table.process')}</th>
                <th className="text-center px-4 py-3 font-bold uppercase tracking-wider text-[10px] bg-secondary/40">{t('agents.table.payment')}</th>
                <th className="text-center px-4 py-3 font-bold uppercase tracking-wider text-[10px] bg-secondary/40">{t('agents.table.aiEval')}</th>
                <th className="text-center px-4 py-3 font-bold uppercase tracking-wider text-[10px] bg-secondary/40">{t('agents.table.overall')}</th>
                <th className="text-center px-4 py-3 font-bold uppercase tracking-wider text-[10px] bg-secondary/40">{t('agents.table.status')}</th>
                <th className="px-4 py-3 bg-secondary/40 rounded-r-xl" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="text-center py-16"><div className="flex flex-col items-center gap-3"><div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /><span className="text-sm text-muted-foreground animate-pulse">{t('agents.loading')}</span></div></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-12 text-muted-foreground bg-card/40 backdrop-blur-sm rounded-2xl">{t('agents.noAgents')}</td></tr>
              ) : filtered.map(a => {
                const { status } = getCompletionStatus(a);
                const leftBorder = {
                  cleared:       'border-l-emerald-500/50',
                  'needs-eval':  'border-l-amber-500/50',
                  'in-progress': 'border-l-blue-500/40',
                  'not-started': 'border-l-border/40',
                }[status];
                return (
                <tr key={a.agent.id} className="bg-card/60 backdrop-blur-md hover:bg-card hover:shadow-md transition-all group">
                  <td className={`px-4 py-4 rounded-l-2xl border-y border-l-2 border-y-border/50 group-hover:border-y-primary/20 group-hover:border-l-primary/40 ${leftBorder}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black uppercase shrink-0 bg-primary/10 text-primary border border-primary/20">
                        {a.agent.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <div className="font-semibold text-foreground text-sm truncate">{a.agent.name}</div>
                          {!readOnly && (
                            <button
                              onClick={() => setEditingAgent({ id: a.agent.id, name: a.agent.name, stageName: a.agent.stageName ?? '' })}
                              className="p-1 rounded-md text-muted-foreground/40 hover:text-primary hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                              title="Edit agent info"
                            >
                              <Pencil size={12} />
                            </button>
                          )}
                        </div>
                        {a.agent.stageName && (
                          <div className="text-xs text-primary/70 font-medium mt-0.5 truncate">&quot;{a.agent.stageName}&quot;</div>
                        )}
                        <div className="text-[10px] text-muted-foreground mt-0.5">{timeAgo(a.lastActive, t)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 border-y border-border/50 group-hover:border-y-primary/20"><ModuleCell stat={a.quiz.foundation} /></td>
                  <td className="px-4 py-4 border-y border-border/50 group-hover:border-y-primary/20"><ModuleCell stat={a.quiz.product} /></td>
                  <td className="px-4 py-4 border-y border-border/50 group-hover:border-y-primary/20"><ModuleCell stat={a.quiz.process} /></td>
                  <td className="px-4 py-4 border-y border-border/50 group-hover:border-y-primary/20"><ModuleCell stat={a.quiz.payment} /></td>
                  <td className="px-4 py-4 text-center border-y border-border/50 group-hover:border-y-primary/20">
                    {a.aiEval ? (
                      <div className="flex flex-col items-center gap-1.5">
                        <span className={`font-black text-sm ${scoreColor(a.aiEval.avgScore)}`}>{a.aiEval.avgScore}/100</span>
                        <div className="w-10 h-1.5 rounded-full overflow-hidden bg-muted/50">
                          <div className={`h-full rounded-full ${scoreBg(a.aiEval.avgScore)}`} style={{ width: `${a.aiEval.avgScore}%` }} />
                        </div>
                      </div>
                    ) : <span className="text-muted-foreground/25 text-lg leading-none">–</span>}
                  </td>
                  <td className="px-4 py-4 text-center border-y border-border/50 group-hover:border-y-primary/20">
                    <div className="flex flex-col items-center gap-1.5">
                      <span className={`font-black text-base tracking-tight ${scoreColor(a.overallScore)}`}>{a.overallScore}%</span>
                      <div className="w-14 h-1.5 rounded-full overflow-hidden bg-muted/50">
                        <div className={`h-full rounded-full ${scoreBg(a.overallScore)}`} style={{ width: `${a.overallScore}%` }} />
                      </div>
                      <BadgePill badge={a.badge} />
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center border-y border-border/50 group-hover:border-y-primary/20">
                    {(() => {
                      const cfg = {
                        cleared:       { pill: 'bg-emerald-500/15 text-emerald-400', label: t('agents.statusCleared') },
                        'needs-eval':  { pill: 'bg-amber-500/15 text-amber-400',     label: t('agents.statusNeedsEval') },
                        'in-progress': { pill: 'bg-blue-500/15 text-blue-400',       label: t('agents.statusInProgress') },
                        'not-started': { pill: 'bg-secondary text-muted-foreground', label: t('agents.statusNotStarted') },
                      }[status];
                      return (
                        <div className="flex flex-col items-center gap-1.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${cfg.pill}`}>
                            {cfg.label}
                          </span>
                          {!a.agent.active && (
                            <span className="text-[9px] font-bold text-red-400/70 uppercase tracking-wide">
                              {t('agents.inactive')}
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-4 rounded-r-2xl border-y border-r border-border/50 group-hover:border-primary/20">
                    <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => inspectAgent(a.agent)}
                        className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                        title={t('agents.inspect')}
                      >
                        <Eye size={16} />
                      </button>
                      <button onClick={() => setSelectedForDetail(a)}
                        className="text-[11px] font-bold text-primary hover:text-primary/80 transition-colors whitespace-nowrap px-3 py-1.5 bg-primary/10 rounded-lg">
                        {t('agents.viewDetails')}
                      </button>
                      {(role === 'admin' || role === 'it') && !readOnly && (
                        <button onClick={() => toggleActive(a.agent.id, a.agent.active)}
                          className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap px-2 py-1.5 bg-secondary/50 rounded-lg">
                          {a.agent.active ? t('agents.deactivate') : t('agents.reactivate')}
                        </button>
                      )}
                      {(role === 'admin' || role === 'it') && !readOnly && (
                        <button onClick={() => deleteAgent(a.agent.id, a.agent.name)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-500/10 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {agents.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(['elite','strong','developing','needs-work'] as const).map(b => {
            const count = agents.filter(a => a.badge === b).length;
            const pct   = Math.round((count / agents.length) * 100);
            const c = BADGE_CONFIG[b];
            const borderClass = {
              'elite':      'border-purple-500/30',
              'strong':     'border-blue-500/30',
              'developing': 'border-amber-500/30',
              'needs-work': 'border-red-500/30',
            }[b];
            return (
              <div key={b} className={`rounded-2xl p-5 ${c.bg} border ${borderClass}`}>
                <div className="flex items-end justify-between mb-2">
                  <p className={`text-3xl font-black leading-none ${c.text}`}>{count}</p>
                  <p className={`text-xs font-bold ${c.text} opacity-60`}>{pct}%</p>
                </div>
                <p className={`text-sm font-bold ${c.text}`}>{t(`badges.${b}`)}</p>
                <div className="mt-2.5 h-1.5 rounded-full overflow-hidden bg-black/10">
                  <div className={`h-full rounded-full ${c.dot}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
