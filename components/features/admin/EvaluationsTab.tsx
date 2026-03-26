'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { ClipboardCheck, Users, Star, ShieldCheck, X } from 'lucide-react';
import { KpiCard } from './AdminComponents';
import { scoreColor, timeAgo } from './AdminHelpers';

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

export default function EvaluationsTab({ readOnly }: { readOnly?: boolean }) {
  const t = useTranslations('admin');
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
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="relative">
        <div className="w-10 h-10 border-4 border-primary/20 rounded-full" />
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin absolute inset-0" />
      </div>
      <p className="text-sm font-medium text-muted-foreground animate-pulse">{t('evaluations.loading')}</p>
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
        <KpiCard label={t('evaluations.totalEvals')} value={totalEvals}   sub={t('evaluations.byAll')}       icon={ClipboardCheck} themeColor="blue" />
        <KpiCard label={t('evaluations.activeEvaluators')} value={evMap.size}   sub={t('evaluations.submittedScores')}   icon={Users}          themeColor="blue" />
        <KpiCard label={t('evaluations.avgScoreGiven')}   value={globalAvg ? `${globalAvg}/100` : '—'} sub={t('evaluations.acrossAll')} icon={Star} themeColor="amber" />
      </div>

      {/* Evaluator performance cards */}
      {evaluatorSummaries.length > 0 && (
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <h3 className="font-bold text-base mb-4 flex items-center gap-2 text-foreground">
            <ShieldCheck size={17} className="text-primary" /> {t('evaluations.evaluatorPerf')}
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
                  {t('evaluations.evalCount', { count: ev.count })} · {timeAgo(ev.lastActive, t)}
                </div>
              </button>
            ))}
          </div>
          {filterEv && (
            <button
              onClick={() => setFilterEv('')}
              className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <X size={11} /> {t('evaluations.clearFilter')}
            </button>
          )}
        </div>
      )}

      {/* Evaluations table */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-base text-foreground flex items-center gap-2">
            <ClipboardCheck size={17} className="text-primary" />
            {filterEv ? t('evaluations.byEvaluator', { name: evMap.get(filterEv)?.name ?? '' }) : t('evaluations.allEvals')}
            <span className="text-xs font-normal text-muted-foreground ml-1">({filtered.length})</span>
          </h3>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <ClipboardCheck size={32} className="mx-auto opacity-20 mb-3" />
            <p className="text-sm">{t('evaluations.noEvals')}</p>
            <p className="text-xs mt-1">{t('evaluations.noEvalsDesc')}</p>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {filtered.map(ev => {
              const redFlagCount = ev.criteria?.redFlags
                ? Object.values(ev.criteria.redFlags).filter(Boolean).length
                : 0;
              return (
                <div key={ev.id} className="px-6 py-4 flex items-center gap-5 bg-card/60 backdrop-blur-md hover:bg-card hover:shadow-md border border-border/50 hover:border-primary/20 rounded-2xl transition-all group">
                  <div className="w-14 text-center shrink-0">
                    <span className={`text-xl tracking-tight font-black ${scoreColor(ev.totalScore)}`}>{ev.totalScore}</span>
                    <div className="text-[10px] uppercase font-bold text-muted-foreground mt-0.5">/100</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-foreground">{ev.agentName}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mx-1">{t('evaluations.evaluatedBy')}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-secondary text-foreground">{ev.evaluatorName}</span>
                      {redFlagCount > 0 && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-red-500/10 text-red-500 border border-red-500/20 uppercase tracking-wider">
                          {t('evaluations.redFlags', { count: redFlagCount })}
                        </span>
                      )}
                    </div>
                    {ev.comments && <p className="text-xs text-muted-foreground truncate mt-1.5">{ev.comments}</p>}
                  </div>
                  <div className="text-[10px] font-medium text-muted-foreground shrink-0 px-3 py-1.5 bg-secondary/30 rounded-lg">{timeAgo(ev.evaluatedAt, t)}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
