'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { FileSpreadsheet, Download, Users, ChevronDown, Zap, Loader2, Eye, Table } from 'lucide-react';
import type { AgentStats } from '@/types';

export default function ReportsTab() {
  const t = useTranslations('admin');
  const [allStats,    setAllStats]    = useState<AgentStats[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [selected,    setSelected]    = useState('');
  const [exportingAll, setExportingAll] = useState(false);
  const [exportingOne, setExportingOne] = useState(false);
  const [exportErr,   setExportErr]   = useState('');
  const [showPreview, setShowPreview] = useState<'overall' | 'individual' | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/admin/agents')
      .then(r => r.json())
      .then(d => {
        setAllStats(d.agents ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
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
    } catch { setExportErr(t('reports.exportFailed')); }
    setLoading(false);
  }

  const selectedAgentStats = allStats.find(s => s.agent.id === selected);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Overall Report Card */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600">
                <FileSpreadsheet size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg">{t('reports.overallTitle')}</h3>
                <p className="text-xs text-muted-foreground">{t('reports.overallDesc')}</p>
              </div>
            </div>
            <div className="bg-secondary/20 rounded-xl p-4 text-[11px] text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground/70 uppercase tracking-wider mb-1">Color Legend</p>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Excellent (≥70%)</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Average (≥50%)</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> Critical (&lt;50%)</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPreview('overall')}
              className="flex-1 flex items-center justify-center gap-2 bg-secondary text-foreground px-4 py-3 rounded-xl font-bold text-sm hover:bg-secondary/80 transition-all border border-border"
            >
              <Eye size={16} /> Preview
            </button>
            <button
              onClick={() => download('/api/admin/export', `BrainTrade_All_${new Date().toISOString().slice(0,10)}.xlsx`, setExportingAll)}
              disabled={exportingAll || loading}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
              {exportingAll ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              {exportingAll ? t('reports.exporting') : t('reports.exportAll')}
            </button>
          </div>
        </div>

        {/* Individual Report Card */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600">
                <Users size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg">{t('reports.individualTitle')}</h3>
                <p className="text-xs text-muted-foreground">{t('reports.individualDesc')}</p>
              </div>
            </div>
            
            <div className="relative">
              <select
                value={selected}
                onChange={e => {
                  setSelected(e.target.value);
                  if (e.target.value) setShowPreview('individual');
                }}
                className="w-full appearance-none bg-secondary/40 border border-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 pr-10"
              >
                <option value="">{t('reports.selectAgent')}</option>
                {allStats.map(s => <option key={s.agent.id} value={s.agent.id}>{s.agent.name}</option>)}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPreview('individual')}
              disabled={!selected}
              className="flex-1 flex items-center justify-center gap-2 bg-secondary text-foreground px-4 py-3 rounded-xl font-bold text-sm hover:bg-secondary/80 transition-all border border-border disabled:opacity-50"
            >
              <Eye size={16} /> Preview
            </button>
            <button
              onClick={() => {
                if (!selected) return;
                const name = allStats.find(a => a.agent.id === selected)?.agent.name ?? selected;
                download(`/api/admin/export?agentId=${selected}`, `BrainTrade_${name}.xlsx`, setExportingOne);
              }}
              disabled={!selected || exportingOne || loading}
              className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-3 rounded-xl font-bold text-sm hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50"
            >
              {exportingOne ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              {exportingOne ? t('reports.exporting') : t('reports.export')}
            </button>
          </div>
        </div>
      </div>

      {exportErr && (
        <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3">{exportErr}</p>
      )}

      {/* Preview Section */}
      {showPreview === 'overall' && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="p-4 border-b border-border bg-secondary/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Table size={18} className="text-primary" />
              <h4 className="font-bold">Overall Performance Preview</h4>
            </div>
            <button onClick={() => setShowPreview(null)} className="text-xs font-bold text-muted-foreground hover:text-foreground">Close Preview</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-secondary/30 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border">
                  <th className="px-4 py-3">Agent Name</th>
                  <th className="px-4 py-3 text-center">Foundation</th>
                  <th className="px-4 py-3 text-center">Product</th>
                  <th className="px-4 py-3 text-center">Process</th>
                  <th className="px-4 py-3 text-center">AI Eval</th>
                  <th className="px-4 py-3 text-center">Overall</th>
                  <th className="px-4 py-3">Badge</th>
                </tr>
              </thead>
              <tbody className="divide-y border-border">
                {allStats.sort((a,b) => b.overallScore - a.overallScore).map(s => (
                  <tr key={s.agent.id} className="hover:bg-secondary/10 transition-colors">
                    <td className="px-4 py-3 font-bold">{s.agent.name}</td>
                    <td className={`px-4 py-3 text-center font-medium ${getScoreColor(s.quiz.foundation?.bestScore)}`}>{s.quiz.foundation?.bestScore ?? 'N/A'}{s.quiz.foundation?.bestScore ? '%' : ''}</td>
                    <td className={`px-4 py-3 text-center font-medium ${getScoreColor(s.quiz.product?.bestScore)}`}>{s.quiz.product?.bestScore ?? 'N/A'}{s.quiz.product?.bestScore ? '%' : ''}</td>
                    <td className={`px-4 py-3 text-center font-medium ${getScoreColor(s.quiz.process?.bestScore)}`}>{s.quiz.process?.bestScore ?? 'N/A'}{s.quiz.process?.bestScore ? '%' : ''}</td>
                    <td className={`px-4 py-3 text-center font-medium ${getScoreColor(s.aiEval?.avgScore)}`}>{s.aiEval?.avgScore ?? 'N/A'}{s.aiEval?.avgScore ? '%' : ''}</td>
                    <td className={`px-4 py-3 text-center font-black ${getScoreColor(s.overallScore)}`}>{s.overallScore}%</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${getBadgeStyles(s.badge)}`}>
                        {s.badge.replace('-', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showPreview === 'individual' && selectedAgentStats && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="p-4 border-b border-border bg-secondary/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-primary" />
              <h4 className="font-bold">Individual Report: {selectedAgentStats.agent.name}</h4>
            </div>
            <button onClick={() => setShowPreview(null)} className="text-xs font-bold text-muted-foreground hover:text-foreground">Close Preview</button>
          </div>
          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6 border-r border-border pr-8">
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Agent Profile</p>
                <div className="p-4 rounded-xl bg-secondary/20 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Overall Score</span>
                    <span className={`text-xl font-black ${getScoreColor(selectedAgentStats.overallScore)}`}>{selectedAgentStats.overallScore}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Performance</span>
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${getBadgeStyles(selectedAgentStats.badge)}`}>
                      {selectedAgentStats.badge.replace('-', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Last Active</span>
                    <span className="text-xs font-medium">{selectedAgentStats.lastActive ? new Date(selectedAgentStats.lastActive).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Human Evaluation</p>
                {selectedAgentStats.humanEvaluations && selectedAgentStats.humanEvaluations.length > 0 ? (
                  <div className="space-y-3">
                    {selectedAgentStats.humanEvaluations.slice(0, 2).map((h, i) => (
                      <div key={i} className="p-3 rounded-xl border border-border text-xs">
                        <div className="flex justify-between font-bold mb-1">
                          <span>{h.evaluatorName}</span>
                          <span className="text-primary">{h.totalScore}/100</span>
                        </div>
                        <p className="text-muted-foreground italic line-clamp-2">"{h.comments}"</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">No manual evaluations yet.</p>
                )}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Module Breakdown</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {(['foundation', 'product', 'process'] as const).map(m => (
                    <div key={m} className="p-4 rounded-xl border border-border space-y-2">
                      <p className="text-[10px] font-black uppercase text-muted-foreground">{m}</p>
                      <div className="flex items-end justify-between">
                        <span className={`text-2xl font-black ${getScoreColor(selectedAgentStats.quiz[m]?.bestScore)}`}>
                          {selectedAgentStats.quiz[m]?.bestScore ?? 0}%
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground">{selectedAgentStats.quiz[m]?.attempts ?? 0} Attempts</span>
                      </div>
                      <div className="w-full bg-secondary/40 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${getScoreBg(selectedAgentStats.quiz[m]?.bestScore)}`} 
                          style={{ width: `${selectedAgentStats.quiz[m]?.bestScore ?? 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">AI Roleplay</p>
                  <div className="p-4 rounded-xl border border-border flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-black text-primary">{selectedAgentStats.aiEval?.avgScore ?? 0}%</p>
                      <p className="text-xs text-muted-foreground">Average Grade</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{(selectedAgentStats.evalCompletedLevels ?? []).length}/4</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Levels Done</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-5 text-sm text-amber-400">
        <p className="font-semibold mb-1 flex items-center gap-2"><Zap size={16} /> {t('reports.notesTitle')}</p>
        <ul className="space-y-1 text-amber-400/80 list-disc list-inside">
          <li>{t('reports.notesColors')}</li>
          <li>{t('reports.notesFormula')}</li>
        </ul>
      </div>
    </div>
  );
}

function getScoreColor(score: number | undefined) {
  if (!score) return 'text-muted-foreground';
  if (score >= 70) return 'text-emerald-500';
  if (score >= 50) return 'text-amber-500';
  return 'text-red-500';
}

function getScoreBg(score: number | undefined) {
  if (!score) return 'bg-muted';
  if (score >= 70) return 'bg-emerald-500';
  if (score >= 50) return 'bg-amber-500';
  return 'bg-red-500';
}

function getBadgeStyles(badge: string) {
  switch (badge) {
    case 'elite':      return 'bg-emerald-500/10 text-emerald-500';
    case 'strong':     return 'bg-blue-500/10 text-blue-500';
    case 'developing': return 'bg-amber-500/10 text-amber-500';
    default:           return 'bg-red-500/10 text-red-500';
  }
}
