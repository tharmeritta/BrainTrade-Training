'use client';

import { ShieldCheck } from 'lucide-react';
import type { AgentStats } from '@/types';
import { StatusPipeline } from '../AdminComponents';
import { scoreColor } from '../AdminHelpers';
import { getCompletionStatus, type CompletionStatus } from '@/lib/completion';

interface GraduationRosterProps {
  leaderboard: AgentStats[];
  totalAgents: number;
  onViewAgent: (agent: AgentStats) => void;
  t: (key: string, params?: any) => string;
}

const STATUS_ORDER: Record<CompletionStatus, number> = { cleared: 0, 'needs-eval': 1, 'in-progress': 2, 'not-started': 3 };

export function GraduationRoster({ leaderboard, totalAgents, onViewAgent, t }: GraduationRosterProps) {
  const rosterAgents = leaderboard
    .map(a => ({ ...a, completion: getCompletionStatus(a) }))
    .sort((a, b) => STATUS_ORDER[a.completion.status] - STATUS_ORDER[b.completion.status]);

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-5">
      <div>
        <h3 className="font-bold text-lg flex items-center gap-2">
          <ShieldCheck size={20} className="text-primary" /> {t('overview.pipeline')}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">{t('overview.pipelineDesc')}</p>
      </div>

      <StatusPipeline stats={leaderboard} totalCount={totalAgents} />

      <div className="pt-4">
        <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          {t('overview.graduationRoster')}
          <span className="text-xs font-normal text-muted-foreground">({rosterAgents.length})</span>
        </h4>
        {rosterAgents.length === 0 ? (
          <p className="text-xs text-muted-foreground italic py-4 text-center">{t('overview.noRosterData')}</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                  <th className="text-left px-4 py-2.5">{t('overview.rosterAgent')}</th>
                  <th className="text-center px-3 py-2.5">{t('overview.rosterTraining')}</th>
                  <th className="text-center px-3 py-2.5">{t('overview.indicatorQuiz')}</th>
                  <th className="text-center px-3 py-2.5">{t('overview.indicatorAi')}</th>
                  <th className="text-center px-3 py-2.5">{t('overview.rosterEvalScore')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rosterAgents.slice(0, 10).map(a => {
                  const { status, quizComplete } = a.completion;
                  const statusCfg = {
                    cleared:       { pill: 'bg-emerald-500/15 text-emerald-400', label: t('overview.statusCleared') },
                    'needs-eval':  { pill: 'bg-amber-500/15 text-amber-400',     label: t('overview.statusNeedsEval') },
                    'in-progress': { pill: 'bg-blue-500/15 text-blue-400',       label: t('overview.statusInProgress') },
                    'not-started': { pill: 'bg-secondary text-muted-foreground', label: t('overview.statusNotStarted') },
                  }[status];
                  return (
                    <tr key={a.agent.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3">
                        <button 
                          onClick={() => onViewAgent(a)}
                          className="font-semibold text-foreground text-xs hover:text-primary transition-colors text-left"
                        >
                          {a.agent.name}
                        </button>
                        {a.agent.stageName && <div className="text-[10px] text-primary/60">&quot;{a.agent.stageName}&quot;</div>}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusCfg.pill}`}>
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className={`text-sm font-bold ${quizComplete ? 'text-emerald-400' : 'text-red-400'}`}>
                          {quizComplete ? '✓' : '✗'}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        {a.aiEval
                          ? <span className={`text-xs font-bold ${scoreColor(a.aiEval.avgScore)}`}>{a.aiEval.avgScore}%</span>
                          : <span className="text-muted-foreground/40 text-xs">–</span>}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {status === 'cleared' && (
                          <span className="text-[10px] text-emerald-400 font-semibold">✓ {t('overview.actionCleared')}</span>
                        )}
                        {status === 'needs-eval' && (
                          <span className="text-[10px] text-amber-400 font-semibold">{t('overview.actionNeedsEval')}</span>
                        )}
                        {status === 'in-progress' && (
                          <span className="text-[10px] text-muted-foreground">{t('overview.actionInProgress')}</span>
                        )}
                        {status === 'not-started' && (
                          <span className="text-[10px] text-muted-foreground/40">{t('overview.actionNotStarted')}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
