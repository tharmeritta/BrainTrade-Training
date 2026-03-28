'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { 
  FileSpreadsheet, Download, Users, ChevronDown, Zap, 
  Loader2, Eye, Table, BarChart3, Filter, X, ArrowUpDown
} from 'lucide-react';
import type { AgentStats } from '@/types';
import { BADGE_CONFIG, scoreColor, scoreBg } from './AdminHelpers';
import { fetchWithCache } from '@/lib/fetcher';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReportsTab({ readOnly }: { readOnly?: boolean }) {
  const t = useTranslations('admin');
  const [agents, setAgents] = useState<AgentStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [badgeFilter, setBadgeFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof AgentStats | 'name'>('overallScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchWithCache<AgentStats[]>('/api/admin/agents')
      .then(data => setAgents(data || []))
      .finally(() => setLoading(false));
  }, []);

  const filteredAgents = useMemo(() => {
    let result = agents.filter(a => {
      const matchSearch = a.agent.name.toLowerCase().includes(search.toLowerCase());
      const matchBadge  = badgeFilter === 'all' || a.badge === badgeFilter;
      return matchSearch && matchBadge;
    });

    result.sort((a, b) => {
      let valA: any = sortField === 'name' ? a.agent.name : (a as any)[sortField];
      let valB: any = sortField === 'name' ? b.agent.name : (b as any)[sortField];
      
      if (typeof valA === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

    return result;
  }, [agents, search, badgeFilter, sortField, sortOrder]);

  const stats = useMemo(() => {
    const total = agents.length;
    if (total === 0) return null;

    const badges = {
      elite:      agents.filter(a => a.badge === 'elite').length,
      strong:     agents.filter(a => a.badge === 'strong').length,
      developing: agents.filter(a => a.badge === 'developing').length,
      'needs-work': agents.filter(a => a.badge === 'needs-work').length,
    };

    return { total, badges };
  }, [agents]);

  const handleExport = () => {
    const headers = ['Agent Name', 'Badge', 'Overall Score', 'Foundation', 'Product', 'Process', 'Payment', 'AI Eval Avg'];
    const rows = filteredAgents.map(a => [
      a.agent.name,
      a.badge,
      a.overallScore,
      a.quiz.foundation?.bestScore ?? 0,
      a.quiz.product?.bestScore ?? 0,
      a.quiz.process?.bestScore ?? 0,
      a.quiz.payment?.bestScore ?? 0,
      a.aiEval?.avgScore ?? 0
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `braintrade_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleSort = (field: any) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <Loader2 className="animate-spin text-primary/40" size={32} />
      <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{t('reports.loading')}</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      {/* Header & Export */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <FileSpreadsheet className="text-emerald-500" /> {t('reports.title')}
          </h2>
          <p className="text-sm text-muted-foreground font-medium opacity-70">{t('reports.subtitle')}</p>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 text-white font-black text-sm shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Download size={16} /> {t('reports.exportCsv')}
        </button>
      </div>

      {/* Analytics Overview */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Badge Distribution Chart */}
          <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <BarChart3 size={16} className="text-blue-500" /> {t('reports.badgeDistribution')}
              </h3>
            </div>
            <div className="flex items-end gap-2 h-40 pt-4">
              {(['elite', 'strong', 'developing', 'needs-work'] as const).map(b => {
                const count = stats.badges[b];
                const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                const cfg = BADGE_CONFIG[b];
                return (
                  <div key={b} className="flex-1 flex flex-col items-center gap-2 group relative">
                    <div className="absolute -top-6 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-black text-foreground bg-secondary px-1.5 py-0.5 rounded shadow-sm">
                      {count} Agents
                    </div>
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(pct, 4)}%` }}
                      className={`w-full rounded-t-lg transition-all relative overflow-hidden`}
                      style={{ background: cfg.dot.includes('bg-') ? 'currentColor' : cfg.dot.replace('bg-', '') }}
                    >
                       <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                    <div className="text-[10px] font-bold text-muted-foreground text-center truncate w-full px-1">
                      {t(`badges.${b}`)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-4">
            <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Users size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500/60">Total Agents</p>
                <p className="text-3xl font-black text-foreground">{stats.total}</p>
              </div>
            </div>
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Zap size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/60">Elite & Strong</p>
                <p className="text-3xl font-black text-foreground">{stats.badges.elite + stats.badges.strong}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters & Table */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-secondary/10">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-xs">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={14} />
              <input 
                type="text" 
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t('reports.searchPlaceholder')}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-background border border-border text-xs outline-none focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-muted-foreground" />
              <select 
                value={badgeFilter}
                onChange={e => setBadgeFilter(e.target.value)}
                className="bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer"
              >
                <option value="all">All Badges</option>
                <option value="elite">Elite</option>
                <option value="strong">Strong</option>
                <option value="developing">Developing</option>
                <option value="needs-work">Needs Work</option>
              </select>
            </div>
          </div>
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            {filteredAgents.length} Agents Found
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/20 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                <th className="text-left px-6 py-4 cursor-pointer hover:text-foreground transition-colors" onClick={() => toggleSort('name')}>
                  <div className="flex items-center gap-1.5">Agent {sortField === 'name' && <ArrowUpDown size={10} />}</div>
                </th>
                <th className="text-center px-4 py-4 cursor-pointer hover:text-foreground transition-colors" onClick={() => toggleSort('badge')}>
                  <div className="flex items-center justify-center gap-1.5">Badge {sortField === 'badge' && <ArrowUpDown size={10} />}</div>
                </th>
                <th className="text-center px-4 py-4 cursor-pointer hover:text-foreground transition-colors" onClick={() => toggleSort('overallScore')}>
                  <div className="flex items-center justify-center gap-1.5">Overall {sortField === 'overallScore' && <ArrowUpDown size={10} />}</div>
                </th>
                <th className="text-center px-4 py-4">Quiz Avg</th>
                <th className="text-center px-4 py-4">AI Eval</th>
                <th className="text-center px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredAgents.map((a, i) => {
                const completion = getCompletionStatus(a);
                const quizScores = ['foundation', 'product', 'process', 'payment'].map(m => a.quiz[m as any]?.bestScore ?? 0);
                const avgQuiz = Math.round(quizScores.reduce((sum, s) => sum + s, 0) / 4);

                return (
                  <motion.tr 
                    key={a.agent.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-secondary/10 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-foreground">{a.agent.name}</div>
                      {a.agent.stageName && <div className="text-[10px] text-muted-foreground italic">&quot;{a.agent.stageName}&quot;</div>}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${BADGE_CONFIG[a.badge].bg} ${BADGE_CONFIG[a.badge].text}`}>
                        {t(`badges.${a.badge}`)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className={`text-sm font-black ${scoreColor(a.overallScore)}`}>{a.overallScore}%</div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="text-xs font-bold text-muted-foreground">{avgQuiz}%</div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className={`text-xs font-bold ${a.aiEval ? scoreColor(a.aiEval.avgScore) : 'text-muted-foreground/30'}`}>
                        {a.aiEval ? `${a.aiEval.avgScore}%` : '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${statusPill(completion.status)}`}>
                          {completion.status.replace('-', ' ')}
                       </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredAgents.length === 0 && (
          <div className="py-20 text-center text-muted-foreground/40 italic flex flex-col items-center gap-3">
            <Users size={40} className="opacity-20" />
            <p className="text-sm font-bold uppercase tracking-widest">No agents matching your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SearchIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function statusPill(status: string) {
  switch (status) {
    case 'cleared':     return 'bg-emerald-500/10 text-emerald-500';
    case 'needs-eval':  return 'bg-amber-500/10 text-amber-500';
    case 'in-progress': return 'bg-blue-500/10 text-blue-500';
    default:           return 'bg-secondary text-muted-foreground';
  }
}

function getCompletionStatus(stats: AgentStats) {
  const quizPassed = ['foundation', 'product', 'process', 'payment'].every(m => stats.quiz[m as any]?.passed);
  const aiPassed   = (stats.evalCompletedLevels ?? []).length > 0;
  const humanPassed = stats.humanEvaluations && stats.humanEvaluations.some(e => e.totalScore >= 70);

  if (humanPassed && quizPassed && aiPassed) return { status: 'cleared' };
  if (quizPassed && aiPassed) return { status: 'needs-eval' };
  
  const started = quizPassed || aiPassed || stats.learnedModules.length > 0;
  if (started) return { status: 'in-progress' };
  
  return { status: 'not-started' };
}
