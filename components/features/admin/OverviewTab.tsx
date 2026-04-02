'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Users, Target, Award, Activity, TrendingUp, BookOpen, Zap, Loader2, CheckCircle2, Clock, AlertCircle, ShieldCheck, type LucideIcon } from 'lucide-react';
import type { AdminOverviewData, AgentStats } from '@/types';
import { KpiCard, DonutChart, ModuleBar, BadgePill, StatusPipeline, LivePulse } from './AdminComponents';
import { scoreColor, scoreBg, timeAgo } from './AdminHelpers';
import { getCompletionStatus, type CompletionStatus } from '@/lib/completion';
import { fetchWithCache } from '@/lib/fetcher';
import AgentDetailModal from './AgentDetailModal';

export default function OverviewTab({ readOnly }: { readOnly?: boolean }) {
  const t = useTranslations('admin');
  const [data,    setData]    = useState<AdminOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedForDetail, setSelectedForDetail] = useState<AgentStats | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Use noCache to ensure overrides are reflected
      const res = await fetch('/api/admin/overview');
      if (res.ok) {
        const ovData = await res.json();
        setData(ovData);
      }
    } catch (err) {
      console.error('Overview fetching error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleViewAgent = (agent: AgentStats) => {
    setSelectedForDetail(agent);
  };

  if (loading && !data) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="relative">
        <div className="w-10 h-10 border-4 border-primary/20 rounded-full" />
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin absolute inset-0" />
      </div>
      <p className="text-sm font-medium text-muted-foreground animate-pulse">{t('overview.loading')}</p>
    </div>
  );

  if (!data) return (
    <div className="text-center py-20 text-muted-foreground">
      <p className="text-lg font-semibold mb-2">{t('overview.noDataTitle')}</p>
      <p className="text-sm">{t('overview.noDataDesc')}</p>
    </div>
  );

  // Roster: agents who have started (in-progress or beyond), sorted by status priority
  const STATUS_ORDER: Record<CompletionStatus, number> = { cleared: 0, 'needs-eval': 1, 'in-progress': 2, 'not-started': 3 };
  const rosterAgents = data.leaderboard
    .map(a => ({ ...a, completion: getCompletionStatus(a) }))
    .sort((a, b) => STATUS_ORDER[a.completion.status] - STATUS_ORDER[b.completion.status]);

  // Extract agent mapping for LivePulse
  const agentIds = data.leaderboard.map(a => a.agent.id);
  const agentNames: Record<string, string> = {};
  data.leaderboard.forEach(a => agentNames[a.agent.id] = a.agent.name);

  return (
    <div className="space-y-8">
      <AnimatePresence>
        {selectedForDetail && (
          <AgentDetailModal 
            stats={selectedForDetail} 
            onClose={() => setSelectedForDetail(null)} 
            onRefresh={load}
          />
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          label={t('overview.totalAgents')} 
          value={data.totalAgents} 
          sub={t('overview.activeWeekly', { count: data.activeAgents })} 
          icon={Users} 
          themeColor="blue" 
          trend={{ value: 12, isUp: true }}
        />
        <KpiCard 
          label={t('overview.quizPassRate')} 
          value={`${data.overallPassRate}%`} 
          sub={t('overview.allModules')} 
          icon={Target} 
          themeColor="blue" 
          trend={{ value: 5, isUp: true }}
        />
        <KpiCard 
          label={t('overview.aiEvalAvg')} 
          value={`${data.avgAiEvalScore}/100`} 
          sub={t('overview.speechEval')} 
          icon={Award} 
          themeColor="purple" 
          trend={{ value: 2, isUp: false }}
        />
        <KpiCard 
          label={t('overview.sessionsWeekly')} 
          value={data.weekSessions} 
          sub={t('overview.sessionsDesc')} 
          icon={Activity} 
          themeColor="orange" 
          trend={{ value: 8, isUp: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          {/* ── Training Pipeline ─────────────────────────────────────── */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-5 h-full">
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2">
                <ShieldCheck size={20} className="text-primary" /> {t('overview.pipeline')}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">{t('overview.pipelineDesc')}</p>
            </div>

            <StatusPipeline stats={data.leaderboard} totalCount={data.totalAgents} />

            {/* Graduation Roster */}
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
                                onClick={() => handleViewAgent(a)}
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
        </div>

        {/* ── Live Pulse (1/4 width) ─────────────────────────────── */}
        <div className="lg:col-span-1">
          <LivePulse agentIds={agentIds} agentNames={agentNames} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* ── Training Completion Grid (3/4 width) ─────────────────── */}
        <div className="lg:col-span-3 bg-card rounded-2xl border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-base flex items-center gap-2">
              <TrendingUp size={18} className="text-primary" /> {t('overview.trainingCompletion')}
            </h3>
            <div className="flex items-center gap-4 text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">
              <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-blue-400" /> {t('overview.indicatorLearn')}</span>
              <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-amber-400" /> {t('overview.indicatorQuiz')}</span>
              <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-purple-400" /> {t('overview.indicatorAi')}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Learn Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                <BookOpen size={14} className="text-blue-400" />
                <span className="font-bold text-xs uppercase tracking-wider">{t('overview.learnCourses')}</span>
                <span className="ml-auto text-[10px] font-bold text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                  {data.moduleStats.find(m => m.moduleId === 'learn')?.passCount ?? 0}/{data.totalAgents}
                </span>
              </div>
              <div className="space-y-3">
                {(['foundation', 'product', 'process', 'payment'] as const).map(topic => {
                  const count = data.leaderboard.filter(a => (a.learnedModules ?? []).includes(topic)).length;
                  const pct   = data.totalAgents > 0 ? Math.round(count / data.totalAgents * 100) : 0;
                  return (
                    <div key={topic} className="space-y-1">
                      <div className="flex justify-between text-[10px] font-medium">
                        <span className="capitalize text-muted-foreground">{t(`modules.${topic}`)}</span>
                        <span className={`font-bold ${scoreColor(pct)}`}>{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
                          className="h-full rounded-full bg-blue-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quiz Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                <Target size={14} className="text-amber-400" />
                <span className="font-bold text-xs uppercase tracking-wider">{t('overview.indicatorQuiz')}</span>
                <span className="ml-auto text-[10px] font-bold text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                  {data.moduleStats.find(m => m.moduleId === 'quiz')?.passCount ?? 0}/{data.totalAgents}
                </span>
              </div>
              <div className="space-y-3">
                {(['foundation', 'product', 'process', 'payment'] as const).map(topic => {
                  const attempted = data.leaderboard.filter(a => !!a.quiz[topic]);
                  const passed    = attempted.filter(a => a.quiz[topic]?.passed).length;
                  const pct       = data.totalAgents > 0 ? Math.round(passed / data.totalAgents * 100) : 0;
                  return (
                    <div key={topic} className="space-y-1">
                      <div className="flex justify-between text-[10px] font-medium">
                        <span className="capitalize text-muted-foreground">{t(`modules.${topic}`)}</span>
                        <span className={`font-bold ${scoreColor(pct)}`}>{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
                          className={`h-full rounded-full ${scoreBg(pct)}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Eval & Overall Summary Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                <Zap size={14} className="text-purple-400" />
                <span className="font-bold text-xs uppercase tracking-wider">{t('overview.indicatorAi')}</span>
                <span className="ml-auto text-[10px] font-bold text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                  {data.moduleStats.find(m => m.moduleId === 'ai-eval')?.passCount ?? 0}/{data.totalAgents}
                </span>
              </div>
              
              <div className="bg-secondary/20 rounded-xl p-3 border border-border/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">{t('overview.avgScoreLabel')}</span>
                  <span className={`text-sm font-black ${scoreColor(data.avgAiEvalScore)}`}>{data.avgAiEvalScore}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${data.avgAiEvalScore}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full ${scoreBg(data.avgAiEvalScore)}`} />
                </div>
                <div className="pt-2 mt-2 border-t border-border/30">
                   <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-muted-foreground uppercase tracking-tighter">{t('overview.overallResult')}</span>
                      <span className="font-black text-blue-500">{t('overview.passPct', { pct: Math.round((data.passFail.passed / data.totalAgents) * 100) })}</span>
                   </div>
                   <div className="flex gap-1 mt-1.5">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full ${i < (data.passFail.passed / data.totalAgents) * 10 ? 'bg-blue-500' : 'bg-secondary'}`} />
                      ))}
                   </div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-lg border border-blue-500/10 bg-blue-500/5">
                 <Award size={14} className="text-blue-500 shrink-0" />
                 <p className="text-[9px] leading-tight text-blue-700/70 font-medium">
                    {t('overview.readyForLive', { count: data.passFail.passed })}
                 </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Secondary leaderboard / small stats Column ── */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
              <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-4">{t('overview.topPerformers')}</h3>
              <div className="space-y-3">
                {data.leaderboard.slice(0, 3).map((a, i) => (
                  <div key={a.agent.id} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${i === 0 ? 'bg-amber-400 text-white' : 'bg-secondary text-muted-foreground'}`}>{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate text-foreground">{a.agent.name}</p>
                      <p className="text-[10px] text-muted-foreground">{a.overallScore}% {t('overview.overall')}</p>
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Award size={20} className="text-amber-500" /> {t('overview.leaderboard')}
          </h3>
          <span className="text-xs text-muted-foreground">{t('overview.rankedCount', { count: data.leaderboard.length })}</span>
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
                  <button 
                    onClick={() => handleViewAgent(agent)}
                    className="font-semibold text-foreground truncate hover:text-primary transition-colors"
                  >
                    {agent.agent.name}
                  </button>
                  <BadgePill badge={agent.badge} />
                </div>
                <div className="flex gap-3 mt-1">
                  {(['foundation', 'product', 'process', 'payment'] as const).map(m => (
                    <span key={m} className={`text-xs ${scoreColor(agent.quiz[m]?.bestScore)}`}>
                      {t(`modules.${m}`)} {agent.quiz[m]?.bestScore ? `${agent.quiz[m]!.bestScore}%` : '–'}
                    </span>
                  ))}
                </div>
              </div>

              <div className="w-32 hidden sm:block">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{t('overview.overall')}</span>
                  <span className={`font-bold ${scoreColor(agent.overallScore)}`}>{agent.overallScore}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${scoreBg(agent.overallScore)}`} style={{ width: `${agent.overallScore}%` }} />
                </div>
              </div>

              <span className="text-xs text-muted-foreground w-16 text-right hidden md:block">{timeAgo(agent.lastActive, t)}</span>
            </motion.div>
          ))}
          {data.leaderboard.length === 0 && (
            <div className="px-6 py-12 text-center text-muted-foreground text-sm">{t('overview.noLeaderboard')}</div>
          )}
        </div>
      </div>
    </div>
  );
}
