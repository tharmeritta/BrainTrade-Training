'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, X, Pencil, Trash2 } from 'lucide-react';
import type { AgentStats } from '@/types';
import { BadgePill } from './AdminComponents';
import { scoreColor, timeAgo, BADGE_CONFIG } from './AdminHelpers';
import AgentDetailModal from './AgentDetailModal';

export default function AgentsTab({ role }: { role: 'admin' | 'manager' | 'trainer' }) {
  const [agents,       setAgents]       = useState<AgentStats[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [newName,      setNewName]      = useState('');
  const [adding,       setAdding]       = useState(false);
  const [showForm,     setShowForm]     = useState(false);
  const [agentErr,     setAgentErr]     = useState('');
  const [editingAgent, setEditingAgent] = useState<{ id: string; name: string; stageName: string } | null>(null);
  const [savingAgent,  setSavingAgent]  = useState(false);
  const [selectedForDetail, setSelectedForDetail] = useState<AgentStats | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/agents');
      if (res.ok) { const d = await res.json(); setAgents(d.agents ?? []); }
    } catch { /* show empty state */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = agents.filter(a =>
    a.agent.name.toLowerCase().includes(search.toLowerCase()) ||
    (a.agent.stageName ?? '').toLowerCase().includes(search.toLowerCase())
  );

  async function saveAgentEdit() {
    if (!editingAgent) return;
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
    await fetch(`/api/admin/agents/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !active }),
    });
    await load();
  }

  async function deleteAgent(id: string, name: string) {
    if (!confirm(`Permanently delete "${name}"? This cannot be undone.`)) return;
    setAgentErr('');
    const res = await fetch(`/api/admin/agents/${id}`, { method: 'DELETE' });
    if (!res.ok) setAgentErr('Failed to delete agent.');
    else await load();
  }

  const ModuleCell = ({ stat }: { stat: AgentStats['quiz'][keyof AgentStats['quiz']] }) => {
    if (!stat) return <span className="text-muted-foreground text-sm">–</span>;
    return (
      <div className="text-center">
        <span className={`font-bold text-sm ${scoreColor(stat.bestScore)}`}>{stat.bestScore}%</span>
        <span className="block text-[10px] text-muted-foreground">{stat.passed ? '✓ Pass' : '✗ Fail'} · {stat.attempts}x</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {selectedForDetail && (
          <AgentDetailModal stats={selectedForDetail} onClose={() => setSelectedForDetail(null)} />
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search agents..."
            className="pl-9 pr-4 py-2.5 bg-secondary/40 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-64"
          />
        </div>
        {role !== 'trainer' && (
          <button
            onClick={() => setShowForm(f => !f)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
          >
            <Plus size={18} /> Add Agent
          </button>
        )}
      </div>

      <AnimatePresence>
        {showForm && role !== 'trainer' && (
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
              placeholder="Agent full name..."
              className="flex-1 bg-secondary/40 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground"
              required autoFocus
            />
            <button type="submit" disabled={adding}
              className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
            >
              {adding ? 'Adding...' : 'Create'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground px-3 py-2.5 text-sm">Cancel</button>
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
                <h3 className="font-bold text-lg text-foreground">Edit Agent Info</h3>
                <button onClick={() => setEditingAgent(null)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Full Name</label>
                  <input
                    value={editingAgent.name}
                    onChange={e => setEditingAgent(prev => prev ? { ...prev, name: e.target.value } : null)}
                    className="w-full bg-secondary/40 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                    placeholder="Agent full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Stage Name <span className="text-muted-foreground/60 font-normal">(optional)</span></label>
                  <input
                    value={editingAgent.stageName}
                    onChange={e => setEditingAgent(prev => prev ? { ...prev, stageName: e.target.value } : null)}
                    className="w-full bg-secondary/40 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                    placeholder="e.g. Sales King, The Closer..."
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={saveAgentEdit}
                  disabled={savingAgent || !editingAgent.name.trim()}
                  className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 hover:bg-primary/90 transition-colors"
                >
                  {savingAgent ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={() => setEditingAgent(null)} className="px-5 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                  Cancel
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
                <th className="text-left px-5 py-3 font-bold uppercase tracking-wider text-[10px]">Agent</th>
                <th className="text-center px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Foundation</th>
                <th className="text-center px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Product</th>
                <th className="text-center px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Process</th>
                <th className="text-center px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Payment</th>
                <th className="text-center px-4 py-3 font-bold uppercase tracking-wider text-[10px]">AI Eval</th>
                <th className="text-center px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Pitch</th>
                <th className="text-center px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Overall</th>
                <th className="text-center px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="text-center py-16"><div className="flex flex-col items-center gap-3"><div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /><span className="text-sm text-muted-foreground animate-pulse">Loading agents...</span></div></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-12 text-muted-foreground bg-card/40 backdrop-blur-sm rounded-2xl">No agents found.</td></tr>
              ) : filtered.map(a => (
                <tr key={a.agent.id} className="bg-card/60 backdrop-blur-md hover:bg-card hover:shadow-md transition-all group">
                  <td className="px-5 py-4 rounded-l-2xl border-y border-l border-border/50 group-hover:border-primary/20">
                    <div className="font-semibold text-foreground">{a.agent.name}</div>
                    {a.agent.stageName && (
                      <div className="text-xs text-primary/70 font-medium mt-0.5">"{a.agent.stageName}"</div>
                    )}
                    <div className="text-[10px] text-muted-foreground mt-1">{timeAgo(a.lastActive)}</div>
                  </td>
                  <td className="px-4 py-4 border-y border-border/50 group-hover:border-y-primary/20"><ModuleCell stat={a.quiz.foundation} /></td>
                  <td className="px-4 py-4 border-y border-border/50 group-hover:border-y-primary/20"><ModuleCell stat={a.quiz.product} /></td>
                  <td className="px-4 py-4 border-y border-border/50 group-hover:border-y-primary/20"><ModuleCell stat={a.quiz.process} /></td>
                  <td className="px-4 py-4 border-y border-border/50 group-hover:border-y-primary/20"><ModuleCell stat={a.quiz.payment} /></td>
                  <td className="px-4 py-4 text-center border-y border-border/50 group-hover:border-y-primary/20">
                    {a.aiEval
                      ? <span className={`font-bold ${scoreColor(a.aiEval.avgScore)}`}>{a.aiEval.avgScore}/100</span>
                      : <span className="text-muted-foreground/40">–</span>}
                  </td>
                  <td className="px-4 py-4 text-center border-y border-border/50 group-hover:border-y-primary/20">
                    {a.pitch
                      ? <span className="font-bold text-orange-500">L{a.pitch.highestLevel}</span>
                      : <span className="text-muted-foreground/40">–</span>}
                  </td>
                  <td className="px-4 py-4 text-center border-y border-border/50 group-hover:border-y-primary/20">
                    <div className="flex flex-col items-center gap-1.5">
                      <span className={`font-black text-base tracking-tight ${scoreColor(a.overallScore)}`}>{a.overallScore}%</span>
                      <BadgePill badge={a.badge} />
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center border-y border-border/50 group-hover:border-y-primary/20">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${a.agent.active ? 'bg-blue-500/15 text-blue-400' : 'bg-red-500/15 text-red-400'}`}>
                      {a.agent.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-4 rounded-r-2xl border-y border-r border-border/50 group-hover:border-primary/20">
                    <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setSelectedForDetail(a)}
                        className="text-[11px] font-bold text-primary hover:text-primary/80 transition-colors whitespace-nowrap px-3 py-1.5 bg-primary/10 rounded-lg">
                        View Details
                      </button>
                      <button onClick={() => toggleActive(a.agent.id, a.agent.active)}
                        className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap px-2 py-1.5 bg-secondary/50 rounded-lg">
                        {a.agent.active ? 'Deactivate' : 'Reactivate'}
                      </button>
                      <button
                        onClick={() => setEditingAgent({ id: a.agent.id, name: a.agent.name, stageName: a.agent.stageName ?? '' })}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        title="Edit agent info"
                      >
                        <Pencil size={14} />
                      </button>
                      {role === 'admin' && (
                        <button onClick={() => deleteAgent(a.agent.id, a.agent.name)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-500/10 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {agents.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(['elite','strong','developing','needs-work'] as const).map(b => {
            const count = agents.filter(a => a.badge === b).length;
            const c = BADGE_CONFIG[b];
            return (
              <div key={b} className={`rounded-2xl p-5 ${c.bg} border border-transparent`}>
                <p className={`text-2xl font-black ${c.text}`}>{count}</p>
                <p className={`text-sm font-semibold ${c.text}`}>{c.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{Math.round((count / agents.length) * 100)}% of agents</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
