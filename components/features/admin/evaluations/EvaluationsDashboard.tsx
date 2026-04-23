'use client';

import { useTranslations } from 'next-intl';
import { ClipboardCheck, Users, Star, ShieldCheck, X } from 'lucide-react';
import { KpiCard } from '../AdminComponents';
import { scoreColor, timeAgo } from '../AdminHelpers';
import EvalRow from './EvalRow';
import type { AdminEval } from './useEvaluationsData';

interface EvaluationsDashboardProps {
  evals: AdminEval[];
  evaluatorSummaries: any[];
  globalAvg: number;
  filterEv: string;
  setFilterEv: (id: string) => void;
  filteredEvals: AdminEval[];
  evMap: Map<string, any>;
  themeColor: 'blue' | 'amber';
  subLabel: string;
}

export default function EvaluationsDashboard({
  evaluatorSummaries,
  globalAvg,
  filterEv,
  setFilterEv,
  filteredEvals,
  evMap,
  themeColor,
  subLabel
}: EvaluationsDashboardProps) {
  const t = useTranslations('admin');

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard 
          label={t('evaluations.totalEvals')} 
          value={filteredEvals.length} 
          sub={subLabel} 
          icon={ClipboardCheck} 
          themeColor={themeColor} 
        />
        <KpiCard 
          label={t('evaluations.activeEvaluators')} 
          value={evaluatorSummaries.length} 
          sub="Actioning records" 
          icon={Users} 
          themeColor={themeColor} 
        />
        <KpiCard 
          label={t('evaluations.avgScoreGiven')} 
          value={globalAvg ? `${globalAvg}/100` : '—'} 
          sub="Current average" 
          icon={Star} 
          themeColor="amber" 
        />
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
            <span className="text-xs font-normal text-muted-foreground ml-1">({filteredEvals.length})</span>
          </h3>
        </div>

        {filteredEvals.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <ClipboardCheck size={32} className="mx-auto opacity-20 mb-3" />
            <p className="text-sm">{t('evaluations.noEvals')}</p>
            <p className="text-xs mt-1">{t('evaluations.noEvalsDesc')}</p>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {filteredEvals.map(ev => (
              <EvalRow key={ev.id} ev={ev} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
