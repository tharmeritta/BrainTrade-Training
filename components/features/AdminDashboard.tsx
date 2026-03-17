'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, FileSpreadsheet, LogOut,
  TrendingUp, Award, Target, Activity, Plus, Search,
  Download, ChevronDown, Zap, ShieldCheck, Eye, EyeOff, Pencil, Trash2, X, Check,
  ClipboardCheck, Star,
} from 'lucide-react';
import type { AdminOverviewData, AgentStats, StaffAccount } from '@/types';
import ThemeToggle from '@/components/ui/ThemeToggle';
import LangToggle  from '@/components/ui/LangToggle';

// ── Helpers ────────────────────────────────────────────────────────────────

const BADGE_CONFIG = {
  'elite':        { label: 'Elite',       bg: 'bg-purple-500/15', text: 'text-purple-400', dot: 'bg-purple-400' },
  'strong':       { label: 'Strong',      bg: 'bg-blue-500/15', text: 'text-blue-400', dot: 'bg-blue-400' },
  'developing':   { label: 'Developing',  bg: 'bg-amber-500/15',  text: 'text-amber-400',  dot: 'bg-amber-400'  },
  'needs-work':   { label: 'Needs Help',  bg: 'bg-red-500/15',    text: 'text-red-400',    dot: 'bg-red-400'    },
};

const MODULE_LABELS: Record<string, string> = { product: 'Product', process: 'Process', payment: 'Payment' };

function scoreColor(score: number | undefined) {
  if (!score) return 'text-muted-foreground';
  if (score >= 70) return 'text-blue-500';
  if (score >= 50) return 'text-amber-500';
  return 'text-red-500';
}
function scoreBg(score: number | undefined) {
  if (!score) return 'bg-secondary';
  if (score >= 70) return 'bg-blue-500';
  if (score >= 50) return 'bg-amber-400';
  return 'bg-red-400';
}

function timeAgo(iso: string | null) {
  if (!iso) return 'Never';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'Yesterday';
  return `${d}d ago`;
}

// ── Sub-components ─────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border border-border p-6 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground font-medium">{label}</p>
        <p className="text-3xl font-black text-foreground mt-0.5">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </div>
    </motion.div>
  );
}

function DonutChart({ passed, failed }: { passed: number; failed: number }) {
  const total = passed + failed;
  const pct = total > 0 ? Math.round((passed / total) * 100) : 0;
  const r = 40; const c = 2 * Math.PI * r;
  const dash = (c * pct) / 100;
  return (
    <div className="flex flex-col items-center justify-center">
      <svg width={110} height={110} viewBox="0 0 110 110">
        <circle cx={55} cy={55} r={r} fill="none" stroke="hsl(var(--border))" strokeWidth={14} />
        <circle cx={55} cy={55} r={r} fill="none" stroke="#3B82F6" strokeWidth={14}
          strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
          transform="rotate(-90 55 55)" />
        <text x={55} y={59} textAnchor="middle" fontSize={18} fontWeight={800} fill="hsl(var(--foreground))">{pct}%</text>
      </svg>
      <div className="flex gap-4 mt-2 text-xs font-medium">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />Passed ({passed})</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/40 inline-block" />Failed ({failed})</span>
      </div>
    </div>
  );
}

function ModuleBar({ label, avgScore, passCount, totalAttempts }: {
  label: string; avgScore: number; passCount: number; totalAttempts: number;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="font-semibold text-foreground">{label}</span>
        <span className={`font-bold ${scoreColor(avgScore)}`}>{avgScore}%</span>
      </div>
      <div className="h-3 bg-secondary rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${avgScore}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${scoreBg(avgScore)}`}
        />
      </div>
      <p className="text-xs text-muted-foreground">{passCount} of {totalAttempts} agents completed</p>
    </div>
  );
}

function BadgePill({ badge }: { badge: AgentStats['badge'] }) {
  const c = BADGE_CONFIG[badge];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

// ── Overview Tab ────────────────────────────────────────────────────────────

function OverviewTab() {
  const [data,    setData]    = useState<AdminOverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/overview');
      if (res.ok) setData(await res.json());
    } catch { /* show empty state */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (!data) return (
    <div className="text-center py-20 text-muted-foreground">
      <p className="text-lg font-semibold mb-2">No data yet</p>
      <p className="text-sm">Add agents in the Agents tab, then have them complete training to see analytics.</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Agents"    value={data.totalAgents}     sub={`${data.activeAgents} active this week`} icon={Users}     color="bg-blue-500" />
        <KpiCard label="Quiz Pass Rate"  value={`${data.overallPassRate}%`}  sub="across all modules"             icon={Target}    color="bg-blue-500" />
        <KpiCard label="AI Eval Avg"     value={`${data.avgAiEvalScore}/100`} sub="speech evaluation"              icon={Award}     color="bg-purple-500" />
        <KpiCard label="Sessions / Week" value={data.weekSessions}    sub="quizzes + evals + pitches"           icon={Activity}  color="bg-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-primary" /> Training Completion
          </h3>
          <div className="space-y-6">
            {data.moduleStats.map(m => (
              <ModuleBar key={m.moduleId} label={m.label} avgScore={m.avgScore} passCount={m.passCount} totalAttempts={m.totalAttempts} />
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm flex flex-col items-center justify-center">
          <h3 className="font-bold text-lg mb-4 self-start">Overall Result</h3>
          <DonutChart passed={data.passFail.passed} failed={data.passFail.failed} />
          <p className="text-xs text-muted-foreground mt-4 text-center">Quiz pass / fail across all agents and modules</p>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Award size={20} className="text-amber-500" /> Agent Leaderboard
          </h3>
          <span className="text-xs text-muted-foreground">{data.leaderboard.length} agents ranked</span>
        </div>
        <div className="divide-y divide-border">
          {data.leaderboard.map((agent, i) => (
            <motion.div
              key={agent.agent.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="px-6 py-4 flex items-center gap-4 hover:bg-secondary/30 transition-colors"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${
                i === 0 ? 'bg-amber-400 text-white' :
                i === 1 ? 'bg-slate-300 text-slate-700' :
                i === 2 ? 'bg-amber-700 text-white' :
                'bg-secondary text-muted-foreground'
              }`}>{i + 1}</div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground truncate">{agent.agent.name}</span>
                  <BadgePill badge={agent.badge} />
                </div>
                <div className="flex gap-3 mt-1">
                  {(['product','process','payment'] as const).map(m => (
                    <span key={m} className={`text-xs ${scoreColor(agent.quiz[m]?.bestScore)}`}>
                      {MODULE_LABELS[m]} {agent.quiz[m]?.bestScore ? `${agent.quiz[m]!.bestScore}%` : '–'}
                    </span>
                  ))}
                </div>
              </div>

              <div className="w-32 hidden sm:block">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Overall</span>
                  <span className={`font-bold ${scoreColor(agent.overallScore)}`}>{agent.overallScore}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${scoreBg(agent.overallScore)}`} style={{ width: `${agent.overallScore}%` }} />
                </div>
              </div>

              <span className="text-xs text-muted-foreground w-16 text-right hidden md:block">{timeAgo(agent.lastActive)}</span>
            </motion.div>
          ))}
          {data.leaderboard.length === 0 && (
            <div className="px-6 py-12 text-center text-muted-foreground text-sm">No agent data yet. Add agents and have them complete training.</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Agents Tab ──────────────────────────────────────────────────────────────

function AgentsTab({ role }: { role: 'admin' | 'manager' }) {
  const [agents,   setAgents]   = useState<AgentStats[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [newName,  setNewName]  = useState('');
  const [adding,   setAdding]   = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [agentErr, setAgentErr] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/agents');
      if (res.ok) { const d = await res.json(); setAgents(d.agents ?? []); }
    } catch { /* show empty state */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = agents.filter(a => a.agent.name.toLowerCase().includes(search.toLowerCase()));

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
        <button
          onClick={() => setShowForm(f => !f)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
        >
          <Plus size={18} /> Add Agent
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
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

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary/50 border-b border-border">
                <th className="text-left px-6 py-4 font-semibold text-muted-foreground">Agent</th>
                <th className="text-center px-4 py-4 font-semibold text-muted-foreground">Product</th>
                <th className="text-center px-4 py-4 font-semibold text-muted-foreground">Process</th>
                <th className="text-center px-4 py-4 font-semibold text-muted-foreground">Payment</th>
                <th className="text-center px-4 py-4 font-semibold text-muted-foreground">AI Eval</th>
                <th className="text-center px-4 py-4 font-semibold text-muted-foreground">Pitch</th>
                <th className="text-center px-4 py-4 font-semibold text-muted-foreground">Overall</th>
                <th className="text-center px-4 py-4 font-semibold text-muted-foreground">Status</th>
                <th className="px-4 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={9} className="text-center py-12 text-muted-foreground">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-muted-foreground">No agents found.</td></tr>
              ) : filtered.map(a => (
                <tr key={a.agent.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-foreground">{a.agent.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{timeAgo(a.lastActive)}</div>
                  </td>
                  <td className="px-4 py-4"><ModuleCell stat={a.quiz.product} /></td>
                  <td className="px-4 py-4"><ModuleCell stat={a.quiz.process} /></td>
                  <td className="px-4 py-4"><ModuleCell stat={a.quiz.payment} /></td>
                  <td className="px-4 py-4 text-center">
                    {a.aiEval
                      ? <span className={`font-bold ${scoreColor(a.aiEval.avgScore)}`}>{a.aiEval.avgScore}/100</span>
                      : <span className="text-muted-foreground">–</span>}
                  </td>
                  <td className="px-4 py-4 text-center">
                    {a.pitch
                      ? <span className="font-bold text-indigo-600">L{a.pitch.highestLevel}</span>
                      : <span className="text-muted-foreground">–</span>}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className={`font-black text-base ${scoreColor(a.overallScore)}`}>{a.overallScore}%</span>
                      <BadgePill badge={a.badge} />
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${a.agent.active ? 'bg-blue-500/15 text-blue-400' : 'bg-red-500/15 text-red-400'}`}>
                      {a.agent.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleActive(a.agent.id, a.agent.active)}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
                        {a.agent.active ? 'Deactivate' : 'Reactivate'}
                      </button>
                      {role === 'admin' && (
                        <button onClick={() => deleteAgent(a.agent.id, a.agent.name)}
                          className="p-1 rounded text-muted-foreground hover:text-red-600 hover:bg-red-500/10 transition-colors">
                          <Trash2 size={13} />
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

// ── Reports Tab ─────────────────────────────────────────────────────────────

function ReportsTab() {
  const [agents,      setAgents]      = useState<{ id: string; name: string }[]>([]);
  const [selected,    setSelected]    = useState('');
  const [exportingAll, setExportingAll] = useState(false);
  const [exportingOne, setExportingOne] = useState(false);
  const [exportErr,   setExportErr]   = useState('');

  useEffect(() => {
    fetch('/api/admin/agents')
      .then(r => r.json())
      .then(d => setAgents((d.agents ?? []).map((a: AgentStats) => ({ id: a.agent.id, name: a.agent.name }))))
      .catch(() => {});
  }, []);

  async function download(url: string, filename: string, setLoading: (v: boolean) => void) {
    setLoading(true);
    setExportErr('');
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch { setExportErr('Export failed. Please try again.'); }
    setLoading(false);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-card rounded-2xl border border-border p-8 shadow-sm space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <FileSpreadsheet size={20} className="text-blue-600" /> Overall Report
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              All agents · module scores · pass/fail · AI eval · pitch level · performance badge.<br />
              Color-coded: 🟢 ≥70% · 🟡 50–69% · 🔴 &lt;50%
            </p>
          </div>
          <button
            onClick={() => download('/api/admin/export', `BrainTrade_All_${new Date().toISOString().slice(0,10)}.xlsx`, setExportingAll)}
            disabled={exportingAll}
            className="flex items-center gap-2 bg-blue-500 text-white px-5 py-3 rounded-xl font-semibold text-sm hover:bg-blue-600 transition-colors shadow-md disabled:opacity-50 whitespace-nowrap"
          >
            <Download size={16} /> {exportingAll ? 'Exporting...' : 'Export All'}
          </button>
        </div>

        <div className="border-t border-border" />

        <div>
          <h3 className="font-bold text-lg flex items-center gap-2 mb-3">
            <Users size={20} className="text-blue-600" /> Individual Report
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Per-agent breakdown: each module attempt, AI eval history, pitch sessions.
          </p>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <select
                value={selected}
                onChange={e => setSelected(e.target.value)}
                className="w-full appearance-none bg-secondary/40 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 pr-10"
              >
                <option value="">Select agent...</option>
                {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
            <button
              onClick={() => {
                if (!selected) return;
                const name = agents.find(a => a.id === selected)?.name ?? selected;
                download(`/api/admin/export?agentId=${selected}`, `BrainTrade_${name}.xlsx`, setExportingOne);
              }}
              disabled={!selected || exportingOne}
              className="flex items-center gap-2 bg-blue-500 text-white px-5 py-3 rounded-xl font-semibold text-sm hover:bg-blue-600 transition-colors shadow-md disabled:opacity-50"
            >
              <Download size={16} /> {exportingOne ? 'Exporting...' : 'Export'}
            </button>
          </div>
        </div>
      </div>

      {exportErr && (
        <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3">{exportErr}</p>
      )}

      <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-5 text-sm text-amber-400">
        <p className="font-semibold mb-1 flex items-center gap-2"><Zap size={16} /> Excel Report Notes</p>
        <ul className="space-y-1 text-amber-400/80 list-disc list-inside">
          <li>Scores ≥ 70% highlighted green, 50–69% amber, &lt;50% red</li>
          <li>Overall score = Quiz 40% + AI Eval 30% + Pitch 20% + Eval Avg 10%</li>
        </ul>
      </div>
    </div>
  );
}

// ── Staff Accounts Tab (admin only) ─────────────────────────────────────────

interface EditState {
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'manager' | 'evaluator';
}

function StaffTab() {
  const [staff,    setStaff]    = useState<StaffAccount[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState<EditState | null>(null);
  const [saving,   setSaving]   = useState(false);
  const [showPw,   setShowPw]   = useState<Record<string, boolean>>({});
  const [staffErr, setStaffErr] = useState('');

  // New account form state
  const [newUser, setNewUser] = useState({ username: '', password: '', name: '', role: 'manager' as 'manager' | 'evaluator' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/staff');
      if (res.ok) { const d = await res.json(); setStaff(d.staff ?? []); }
    } catch { /* empty */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function createStaff(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStaffErr('');
    const res = await fetch('/api/admin/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    });
    if (res.ok) {
      setNewUser({ username: '', password: '', name: '', role: 'manager' });
      setShowForm(false);
      await load();
    } else {
      const d = await res.json();
      setStaffErr(d.error ?? 'Failed to create account');
    }
    setSaving(false);
  }

  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    setStaffErr('');
    const res = await fetch(`/api/admin/staff/${editing.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: editing.username,
        password: editing.password,
        name: editing.name,
        role: editing.role,
      }),
    });
    if (res.ok) {
      setEditing(null);
      await load();
    } else {
      const d = await res.json();
      setStaffErr(d.error ?? 'Failed to save');
    }
    setSaving(false);
  }

  async function toggleStaffActive(id: string, active: boolean) {
    await fetch(`/api/admin/staff/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !active }),
    });
    await load();
  }

  async function deleteStaff(id: string, name: string) {
    if (!confirm(`Delete account "${name}"? This cannot be undone.`)) return;
    await fetch(`/api/admin/staff/${id}`, { method: 'DELETE' });
    await load();
  }

  const ROLE_COLORS: Record<string, string> = {
    manager:   'bg-blue-500/15 text-blue-400',
    evaluator: 'bg-violet-500/15 text-violet-400',
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <ShieldCheck size={20} className="text-blue-600" /> Staff Accounts
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">Manage Manager and Evaluator credentials</p>
        </div>
        <button
          onClick={() => setShowForm(f => !f)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
        >
          <Plus size={16} /> Add Account
        </button>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            onSubmit={createStaff}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-primary/5 border border-primary/20 rounded-2xl p-5 space-y-4"
          >
            <p className="font-semibold text-sm text-foreground">New Staff Account</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground font-medium block mb-1">Display Name</label>
                <input value={newUser.name} onChange={e => setNewUser(v => ({ ...v, name: e.target.value }))}
                  placeholder="e.g. Sarah Manager" required
                  className="w-full bg-secondary/40 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium block mb-1">Role</label>
                <select value={newUser.role} onChange={e => setNewUser(v => ({ ...v, role: e.target.value as 'manager' | 'evaluator' }))}
                  className="w-full bg-secondary/40 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="manager">Manager</option>
                  <option value="evaluator">Evaluator</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium block mb-1">Username</label>
                <input value={newUser.username} onChange={e => setNewUser(v => ({ ...v, username: e.target.value }))}
                  placeholder="login username" required
                  className="w-full bg-secondary/40 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium block mb-1">Password</label>
                <input value={newUser.password} onChange={e => setNewUser(v => ({ ...v, password: e.target.value }))}
                  placeholder="password" required type="text"
                  className="w-full bg-secondary/40 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={saving}
                className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50">
                {saving ? 'Creating...' : 'Create Account'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="text-muted-foreground hover:text-foreground px-4 py-2.5 text-sm">Cancel</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {staffErr && (
        <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3">{staffErr}</p>
      )}

      {/* Staff table */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Loading...</div>
        ) : staff.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No staff accounts yet. Click "Add Account" to create one.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary/50 border-b border-border">
                <th className="text-left px-6 py-4 font-semibold text-muted-foreground">Name</th>
                <th className="text-left px-4 py-4 font-semibold text-muted-foreground">Username</th>
                <th className="text-left px-4 py-4 font-semibold text-muted-foreground">Password</th>
                <th className="text-center px-4 py-4 font-semibold text-muted-foreground">Role</th>
                <th className="text-center px-4 py-4 font-semibold text-muted-foreground">Status</th>
                <th className="px-4 py-4 text-right" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {staff.map(s => (
                <tr key={s.id} className="hover:bg-secondary/20 transition-colors">
                  {editing?.id === s.id ? (
                    // Edit row
                    <>
                      <td className="px-6 py-3">
                        <input value={editing.name} onChange={e => setEditing(v => v && ({ ...v, name: e.target.value }))}
                          className="w-full bg-secondary/40 border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                      </td>
                      <td className="px-4 py-3">
                        <input value={editing.username} onChange={e => setEditing(v => v && ({ ...v, username: e.target.value }))}
                          className="w-full bg-secondary/40 border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                      </td>
                      <td className="px-4 py-3">
                        <input value={editing.password} onChange={e => setEditing(v => v && ({ ...v, password: e.target.value }))}
                          className="w-full bg-secondary/40 border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <select value={editing.role} onChange={e => setEditing(v => v && ({ ...v, role: e.target.value as 'manager' | 'evaluator' }))}
                          className="bg-secondary/40 border border-border rounded-lg px-2 py-1.5 text-xs focus:outline-none">
                          <option value="manager">Manager</option>
                          <option value="evaluator">Evaluator</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${s.active ? 'bg-blue-500/15 text-blue-400' : 'bg-red-500/15 text-red-400'}`}>
                          {s.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={saveEdit} disabled={saving}
                            className="p-1.5 rounded-lg bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 transition-colors disabled:opacity-50">
                            <Check size={14} />
                          </button>
                          <button onClick={() => setEditing(null)}
                            className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:bg-secondary/80 transition-colors">
                            <X size={14} />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    // View row
                    <>
                      <td className="px-6 py-4 font-semibold text-foreground">{s.name}</td>
                      <td className="px-4 py-4 font-mono text-sm text-foreground">{s.username}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-foreground">
                            {showPw[s.id] ? s.password : '••••••••'}
                          </span>
                          <button onClick={() => setShowPw(v => ({ ...v, [s.id]: !v[s.id] }))}
                            className="text-muted-foreground hover:text-foreground transition-colors">
                            {showPw[s.id] ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${ROLE_COLORS[s.role]}`}>
                          {s.role}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => toggleStaffActive(s.id, s.active)}
                          className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                            s.active
                              ? 'bg-blue-500/15 text-blue-400 hover:bg-red-500/15 hover:text-red-400'
                              : 'bg-red-500/15 text-red-400 hover:bg-blue-500/15 hover:text-blue-400'
                          }`}
                        >
                          {s.active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditing({ id: s.id, username: s.username, password: s.password, name: s.name, role: s.role })}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-blue-600 hover:bg-blue-500/10 transition-colors">
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => deleteStaff(s.id, s.name)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-500/10 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-blue-500/10 border border-blue-500/25 rounded-2xl p-5 text-sm text-blue-400">
        <p className="font-semibold mb-1 flex items-center gap-2"><ShieldCheck size={16} /> About Staff Accounts</p>
        <ul className="space-y-1 text-blue-400/80 list-disc list-inside">
          <li>Manager — full admin visibility, cannot delete records</li>
          <li>Evaluator — accesses the Evaluator panel to score agents</li>
          <li>Admin credentials are managed via environment variables</li>
        </ul>
      </div>
    </div>
  );
}

// ── Evaluations Tab ─────────────────────────────────────────────────────────

interface AdminEval {
  id: string;
  agentId: string;
  agentName: string;
  evaluatorId: string;
  evaluatorName: string;
  criteria?: { redFlags?: Record<string, boolean> };
  totalScore: number;
  comments: string;
  evaluatedAt: string;
}

function EvaluationsTab() {
  const [evals,   setEvals]   = useState<AdminEval[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterEv, setFilterEv] = useState('');

  useEffect(() => {
    fetch('/api/admin/evaluations')
      .then(r => r.json())
      .then(d => setEvals(d.evaluations ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  // Per-evaluator summary
  const evMap = new Map<string, { name: string; count: number; totalScore: number; last: string }>();
  for (const e of evals) {
    const ex = evMap.get(e.evaluatorId) ?? { name: e.evaluatorName, count: 0, totalScore: 0, last: '' };
    ex.count++;
    ex.totalScore += e.totalScore;
    if (!ex.last || e.evaluatedAt > ex.last) ex.last = e.evaluatedAt;
    evMap.set(e.evaluatorId, ex);
  }
  const evaluatorSummaries = Array.from(evMap.entries()).map(([id, v]) => ({
    id, name: v.name, count: v.count,
    avgScore: Math.round(v.totalScore / v.count),
    lastActive: v.last,
  })).sort((a, b) => b.count - a.count);

  const filtered = filterEv
    ? evals.filter(e => e.evaluatorId === filterEv)
    : evals;

  const totalEvals = evals.length;
  const globalAvg  = evals.length > 0
    ? Math.round(evals.reduce((s, e) => s + e.totalScore, 0) / evals.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <KpiCard label="Total Evaluations" value={totalEvals}   sub="by all evaluators"       icon={ClipboardCheck} color="bg-blue-500" />
        <KpiCard label="Active Evaluators" value={evMap.size}   sub="have submitted scores"   icon={Users}          color="bg-blue-500" />
        <KpiCard label="Avg Score Given"   value={globalAvg ? `${globalAvg}/100` : '—'} sub="across all evaluations" icon={Star} color="bg-amber-500" />
      </div>

      {/* Evaluator performance cards */}
      {evaluatorSummaries.length > 0 && (
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <h3 className="font-bold text-base mb-4 flex items-center gap-2 text-foreground">
            <ShieldCheck size={17} className="text-primary" /> Evaluator Performance
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {evaluatorSummaries.map(ev => (
              <button
                key={ev.id}
                onClick={() => setFilterEv(filterEv === ev.id ? '' : ev.id)}
                className={`text-left p-4 rounded-xl border transition-all ${
                  filterEv === ev.id
                    ? 'border-primary/40 bg-primary/5'
                    : 'border-border hover:border-border/80 bg-secondary/30'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black"
                    style={{ background: 'rgba(96,165,250,0.1)', color: '#60A5FA' }}
                  >
                    {ev.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className={`text-sm font-black ${scoreColor(ev.avgScore)}`}>
                    {ev.avgScore}/100
                  </span>
                </div>
                <div className="text-sm font-semibold text-foreground truncate">{ev.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {ev.count} evaluation{ev.count !== 1 ? 's' : ''} · {timeAgo(ev.lastActive)}
                </div>
              </button>
            ))}
          </div>
          {filterEv && (
            <button
              onClick={() => setFilterEv('')}
              className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <X size={11} /> Clear filter
            </button>
          )}
        </div>
      )}

      {/* Evaluations table */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-base text-foreground flex items-center gap-2">
            <ClipboardCheck size={17} className="text-primary" />
            {filterEv ? `Evaluations by ${evMap.get(filterEv)?.name ?? ''}` : 'All Evaluations'}
            <span className="text-xs font-normal text-muted-foreground ml-1">({filtered.length})</span>
          </h3>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <ClipboardCheck size={32} className="mx-auto opacity-20 mb-3" />
            <p className="text-sm">No evaluations yet</p>
            <p className="text-xs mt-1">Evaluators can submit scores from the Evaluator Panel</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map(ev => {
              const redFlagCount = ev.criteria?.redFlags
                ? Object.values(ev.criteria.redFlags).filter(Boolean).length
                : 0;
              return (
                <div key={ev.id} className="px-6 py-4 flex items-center gap-4 hover:bg-secondary/20 transition-colors">
                  <div className="w-12 text-center shrink-0">
                    <span className={`text-sm font-black ${scoreColor(ev.totalScore)}`}>{ev.totalScore}</span>
                    <div className="text-[9px] text-muted-foreground">/100</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-foreground">{ev.agentName}</span>
                      <span className="text-xs text-muted-foreground">by</span>
                      <span className="text-xs font-medium text-foreground">{ev.evaluatorName}</span>
                      {redFlagCount > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                          {redFlagCount} 🚩 red flag{redFlagCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    {ev.comments && <p className="text-xs text-muted-foreground truncate mt-0.5">{ev.comments}</p>}
                  </div>
                  <div className="text-xs text-muted-foreground shrink-0">{timeAgo(ev.evaluatedAt)}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main AdminDashboard ─────────────────────────────────────────────────────

type Tab = 'overview' | 'agents' | 'reports' | 'staff' | 'evaluations';

function logout() {
  fetch('/api/auth/session', { method: 'DELETE' });
  window.location.replace('/login');
}

export default function AdminDashboard({ role }: { role: 'admin' | 'manager' }) {
  const [tab, setTab] = useState<Tab>('overview');

  const TABS: { id: Tab; label: string; icon: React.ElementType; adminOnly?: boolean }[] = [
    { id: 'overview',    label: 'Overview',       icon: LayoutDashboard },
    { id: 'agents',      label: 'Agents',         icon: Users },
    { id: 'evaluations', label: 'Evaluations',    icon: ClipboardCheck },
    { id: 'reports',     label: 'Reports',        icon: FileSpreadsheet },
    { id: 'staff',       label: 'Staff Accounts', icon: ShieldCheck, adminOnly: true },
  ];

  const visibleTabs = TABS.filter(t => !t.adminOnly || role === 'admin');

  return (
    <div className="min-h-screen bg-background">
      {/* Top header */}
      <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-foreground tracking-tight">BrainTrade Training Platform</h1>
          <p className="text-xs text-muted-foreground">
            {role === 'admin' ? 'Admin' : 'Manager'} Control Panel · {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <LangToggle />
          <ThemeToggle />

          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${role === 'admin' ? 'bg-purple-500/15 text-purple-400' : 'bg-blue-500/15 text-blue-400'}`}>
            {role === 'admin' ? 'Admin' : 'Manager'}
          </span>
          <button onClick={logout}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors border border-border px-3 py-2 rounded-xl hover:border-destructive/30"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="bg-card border-b border-border px-6">
        <div className="flex gap-1">
          {visibleTabs.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold border-b-2 transition-all ${
                  tab === t.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon size={16} /> {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {tab === 'overview'    && <OverviewTab />}
            {tab === 'agents'      && <AgentsTab role={role} />}
            {tab === 'evaluations' && <EvaluationsTab />}
            {tab === 'reports'     && <ReportsTab />}
            {tab === 'staff'       && role === 'admin' && <StaffTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
