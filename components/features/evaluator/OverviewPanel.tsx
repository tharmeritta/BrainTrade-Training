'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { 
  ClipboardCheck, Activity, Star, Users, AlertCircle, ClipboardCheck as ClipboardCheckIcon,
  Check 
} from 'lucide-react';

import { ScoreRing } from '@/components/ui/ScoreRing';
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/animations';
import { getCompletionStatus } from '@/lib/completion';
import { BADGE_CONFIG } from '@/components/features/admin/AdminHelpers';
import { StatusPipeline } from '@/components/features/admin/ui/Pipeline';
import { 
  STATUS_CFG, STATUS_ORDER, timeAgo 
} from '@/lib/evaluator-helpers';
import type { 
  Agent, AgentEvaluation, AgentStats 
} from '@/types';

interface OverviewPanelProps {
  myEvals: AgentEvaluation[];
  agents: Agent[];
  allAgentStats: AgentStats[];
  onEvaluate: (agent: Agent) => void;
}

export const OverviewPanel = ({
  myEvals, agents, allAgentStats, onEvaluate,
}: OverviewPanelProps) => {
  const t      = useTranslations('evaluator');
  const adminT = useTranslations('admin');
  const evaluatedIds = new Set(myEvals.map(e => e.agentId));
  const recent       = myEvals.slice(0, 5);

  // Priority queue — agents who need evaluation
  const needsEvalStats = allAgentStats.filter(s => getCompletionStatus(s).status === 'needs-eval');

  const stats = [
    { label: t('totalEvals'),       value: myEvals.length,           icon: ClipboardCheck, color: '#A78BFA' },
    { label: t('todayEvals'),        value: myEvals.filter(e => new Date(e.evaluatedAt).toDateString() === new Date().toDateString()).length, icon: Activity, color: '#60A5FA' },
    { label: t('avgScore'),          value: myEvals.length > 0 ? `${Math.round(myEvals.reduce((s, e) => s + e.totalScore, 0) / myEvals.length)}/100` : '—', icon: Star, color: '#FBBF24' },
    { label: t('trainingTeamAvg'),   value: allAgentStats.length > 0 ? `${Math.round(allAgentStats.reduce((s, a) => s + a.overallScore, 0) / allAgentStats.length)}/100` : '—', icon: Users, color: '#10B981' },
  ];

  return (
    <motion.div variants={STAGGER_CONTAINER} initial="initial" animate="animate" className="space-y-8">

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((k, i) => (
          <motion.div key={i} variants={STAGGER_ITEM} className="bg-card/60 backdrop-blur-md border border-border rounded-2xl p-5 shadow-sm hover:border-primary/20 transition-colors">
            <div className="p-2 rounded-xl w-fit mb-3" style={{ background: `${k.color}15` }}>
              <k.icon size={16} style={{ color: k.color }} />
            </div>
            <div className="text-2xl font-black text-foreground">{k.value}</div>
            <div className="text-xs font-medium text-muted-foreground mt-0.5">{k.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Priority Queue: Needs Evaluation */}
      {needsEvalStats.length > 0 && (
        <motion.div variants={STAGGER_ITEM}>
          <div className="bg-amber-500/5 border border-amber-500/25 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-amber-500/15 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-500/15">
                  <AlertCircle size={15} className="text-amber-400" />
                </div>
                <div>
                  <div className="text-sm font-black text-foreground">{t('needsEvaluation')}</div>
                  <div className="text-xs text-muted-foreground">{t('needsEvalDesc', { count: needsEvalStats.length })}</div>
                </div>
              </div>
              <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                {t('pendingCaps')}
              </span>
            </div>
            <div className="p-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
              {needsEvalStats.map(s => (
                <motion.div key={s.agent.id} variants={STAGGER_ITEM}
                  className="flex items-center gap-3 p-3 rounded-xl bg-card/60 border border-amber-500/15 hover:border-amber-500/30 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-sm font-black text-amber-500 shrink-0">
                    {s.agent.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-foreground truncate">{s.agent.name}</div>
                    <div className="text-xs text-muted-foreground">{t('scoreLabel')} {s.overallScore}%</div>
                  </div>
                  <button
                    onClick={() => onEvaluate(s.agent)}
                    className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/15 text-amber-500 hover:bg-amber-500/25 border border-amber-500/30 transition-all"
                  >
                    {t('evaluate')}
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Mini pipeline summary */}
      <motion.div variants={STAGGER_ITEM}>
        <StatusPipeline stats={allAgentStats} />
      </motion.div>

      {/* All Agents grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('agentsGrid')}</div>
          <span className="text-xs text-muted-foreground/60">{t('agentCount', { count: allAgentStats.length })}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {allAgentStats
            .map(s => ({ ...s, completion: getCompletionStatus(s) }))
            .sort((a, b) => STATUS_ORDER[a.completion.status] - STATUS_ORDER[b.completion.status])
            .map(s => {
              const cfg = STATUS_CFG[s.completion.status];
              return (
                <motion.div key={s.agent.id} variants={STAGGER_ITEM}
                  className="bg-card/60 backdrop-blur-md border border-border rounded-2xl overflow-hidden hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300">
                  <div className="p-4 flex items-start gap-3">
                    <ScoreRing score={s.overallScore} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-black text-foreground truncate">{s.agent.name}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${BADGE_CONFIG[s.badge].bg} ${BADGE_CONFIG[s.badge].text}`}>
                          {adminT(`badges.${s.badge}`)}
                        </span>
                      </div>
                      <div className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {t(s.completion.status === 'not-started' ? 'statusNotStarted' : s.completion.status === 'in-progress' ? 'statusInProgress' : s.completion.status === 'needs-eval' ? 'statusNeedsEval' : 'statusCleared')}
                        {evaluatedIds.has(s.agent.id) && <span className="ml-1 opacity-60">· {t('evaluatedLabel')}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="px-4 pb-4">
                    <button
                      onClick={() => onEvaluate(s.agent)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <ClipboardCheckIcon size={12} /> {t('evaluate')}
                    </button>
                  </div>
                </motion.div>
              );
            })
          }
        </div>
      </div>

      {/* Recent Evaluations */}
      {recent.length > 0 && (
        <div className="space-y-4">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('recentEvals')}</div>
          <div className="space-y-2">
            {recent.map(ev => (
              <motion.div key={ev.id} variants={STAGGER_ITEM}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/20 border border-border hover:bg-secondary/30 transition-colors">
                <ScoreRing score={ev.totalScore} size="sm" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-foreground truncate block">{agents.find(a => a.id === ev.agentId)?.name ?? ev.agentName}</span>
                  <div className="text-xs text-muted-foreground truncate">{ev.comments || '—'}</div>
                </div>
                <div className="text-xs text-muted-foreground/50 shrink-0">{timeAgo(ev.evaluatedAt, t)}</div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
