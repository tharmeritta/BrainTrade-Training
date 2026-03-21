'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Users, Target, Award, Activity, TrendingUp, BookOpen, Zap, Loader2, CheckCircle2, Clock, AlertCircle, ShieldCheck, type LucideIcon } from 'lucide-react';
import type { AdminOverviewData } from '@/types';
import { KpiCard, DonutChart, ModuleBar, BadgePill } from './AdminComponents';
import { scoreColor, scoreBg, timeAgo } from './AdminHelpers';
import LiveFeed from './LiveFeed';
import { getCompletionStatus, type CompletionStatus } from '@/lib/completion';

export default function OverviewTab() {
  const t = useTranslations('admin');
  const [data,    setData]    = useState<AdminOverviewData | null>(null);
  const [feed,    setFeed]    = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive,  setIsLive]  = useState(false);
  
  const pollTimer = useRef<NodeJS.Timeout | null>(null);

  const load = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setIsLive(true);
    try {
      console.log('[Overview] Starting fetch...');
      const [ovRes, feedRes] = await Promise.all([
        fetch('/api/admin/overview').catch(e => {
          console.error('[Overview] /api/admin/overview fetch failed:', e);
          throw e;
        }),
        fetch('/api/admin/live-feed').catch(e => {
          console.error('[Overview] /api/admin/live-feed fetch failed:', e);
          throw e;
        })
      ]);
      
      console.log('[Overview] Fetch responses received:', ovRes.status, feedRes.status);

      if (ovRes.ok) {
        const ovData = await ovRes.json();
        setData(ovData);
      } else {
        console.warn('[Overview] /api/admin/overview returned non-ok status:', ovRes.status);
      }
      
      if (feedRes.ok) {
        const feedData = await feedRes.json();
        setFeed(feedData.feed || []);
      } else {
        console.warn('[Overview] /api/admin/live-feed returned non-ok status:', feedRes.status);
      }
    } catch (err) {
      console.error('Overview polling error details:', err);
    } finally {
      if (!isSilent) setLoading(false);
      setTimeout(() => setIsLive(false), 2000); // Pulse effect
    }
  }, []);

  useEffect(() => {
    load();
    // Start polling every 5 seconds
    pollTimer.current = setInterval(() => load(true), 5000);
    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, [load]);

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

  // Compute pipeline counts from the leaderboard (which has full AgentStats)
  const pipelineCounts = { 'not-started': 0, 'in-progress': 0, 'needs-eval': 0, 'cleared': 0 };
  for (const agent of data.leaderboard) {
    pipelineCounts[getCompletionStatus(agent).status]++;
  }

  const PIPELINE_STEPS: { status: CompletionStatus; label: string; icon: LucideIcon; color: string; bg: string; border: string }[] = [
    { status: 'not-started', label: t('overview.statusNotStarted'), icon: AlertCircle,  color: 'text-muted-foreground', bg: 'bg-secondary/40',    border: 'border-border' },
    { status: 'in-progress', label: t('overview.statusInProgress'), icon: Clock,        color: 'text-blue-400',         bg: 'bg-blue-500/10',     border: 'border-blue-500/20' },
    { status: 'needs-eval',  label: t('overview.statusNeedsEval'),  icon: CheckCircle2, color: 'text-amber-400',        bg: 'bg-amber-500/10',    border: 'border-amber-500/20' },
    { status: 'cleared',     label: t('overview.statusCleared'),    icon: ShieldCheck,  color: 'text-emerald-400',      bg: 'bg-emerald-500/10',  border: 'border-emerald-500/20' },
  ];

  // Roster: agents who have started (in-progress or beyond), sorted by status priority
  const STATUS_ORDER: Record<CompletionStatus, number> = { cleared: 0, 'needs-eval': 1, 'in-progress': 2, 'not-started': 3 };
  const rosterAgents = data.leaderboard
    .map(a => ({ ...a, completion: getCompletionStatus(a) }))
    .sort((a, b) => STATUS_ORDER[a.completion.status] - STATUS_ORDER[b.completion.status]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label={t('overview.totalAgents')} value={data.totalAgents} sub={t('overview.activeWeekly', { count: data.activeAgents })} icon={Users} themeColor="blue" />
        <KpiCard label={t('overview.quizPassRate')} value={`${data.overallPassRate}%`} sub={t('overview.allModules')} icon={Target} themeColor="blue" />
        <KpiCard label={t('overview.aiEvalAvg')} value={`${data.avgAiEvalScore}/100`} sub={t('overview.speechEval')} icon={Award} themeColor="purple" />
        <KpiCard label={t('overview.sessionsWeekly')} value={data.weekSessions} sub={t('overview.sessionsDesc')} icon={Activity} themeColor="orange" />
      </div>

      {/* ── Training Pipeline ─────────────────────────────────────── */}
      <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-5">
        <div>
          <h3 className="font-bold text-lg flex items-center gap-2">
            <ShieldCheck size={20} className="text-primary" /> {t('overview.pipeline')}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">{t('overview.pipelineDesc')}</p>
        </div>

        {/* Funnel counts */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {PIPELINE_STEPS.map((step, i) => {
            const Icon = step.icon;
            const count = pipelineCounts[step.status];
            return (
              <div key={step.status} className={`relative rounded-xl border p-4 ${step.bg} ${step.border}`}>
                {i < PIPELINE_STEPS.length - 1 && (
                  <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-secondary border border-border items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 10 10" className="text-muted-foreground/60 fill-current"><path d="M2 1l5 4-5 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                )}
                <Icon size={18} className={`mb-2 ${step.color}`} />
                <p className={`text-3xl font-black ${step.color}`}>{count}</p>
                <p className={`text-xs font-semibold mt-0.5 ${step.color}`}>{step.label}</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {data.totalAgents > 0 ? Math.round((count / data.totalAgents) * 100) : 0}% {t('overview.ofAgents')}
                </p>
              </div>
            );
          })}
        </div>

        {/* Graduation Roster */}
        <div>
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
                    <th className="text-center px-3 py-2.5">Quiz</th>
                    <th className="text-center px-3 py-2.5">AI Eval</th>
                    <th className="text-center px-3 py-2.5">Pitch</th>
                    <th className="text-center px-3 py-2.5">{t('overview.rosterEvalScore')}</th>
                    <th className="text-center px-3 py-2.5">{t('overview.rosterAction')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rosterAgents.map(a => {
                    const { status, quizComplete, pitchDone, latestEvalScore } = a.completion;
                    const statusCfg = {
                      cleared:       { pill: 'bg-emerald-500/15 text-emerald-400', label: t('overview.statusCleared') },
                      'needs-eval':  { pill: 'bg-amber-500/15 text-amber-400',     label: t('overview.statusNeedsEval') },
                      'in-progress': { pill: 'bg-blue-500/15 text-blue-400',       label: t('overview.statusInProgress') },
                      'not-started': { pill: 'bg-secondary text-muted-foreground', label: t('overview.statusNotStarted') },
                    }[status];
                    return (
                      <tr key={a.agent.id} className="hover:bg-secondary/20 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-foreground text-xs">{a.agent.name}</div>
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
                          {a.pitch
                            ? <span className={`text-xs font-bold ${pitchDone ? 'text-emerald-400' : 'text-amber-400'}`}>L{a.pitch.highestLevel}/3</span>
                            : <span className="text-muted-foreground/40 text-xs">–</span>}
                        </td>
                        <td className="px-3 py-3 text-center">
                          {latestEvalScore !== null
                            ? <span className={`text-sm font-black ${scoreColor(latestEvalScore)}`}>{latestEvalScore}/100</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-primary" /> {t('overview.trainingCompletion')}
            {isLive && <Loader2 size={14} className="animate-spin text-primary/40 ml-auto" />}
          </h3>
          <div className="space-y-7">

            {/* Learn — per topic */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={15} className="text-blue-400" />
                <span className="font-semibold text-sm text-foreground">{t('overview.learnCourses')}</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {t('overview.agentsCount', { done: data.moduleStats.find(m => m.moduleId === 'learn')?.passCount ?? 0, total: data.totalAgents })}
                </span>
              </div>
              <div className="space-y-2.5 pl-5 border-l-2 border-blue-400/20">
                {(['foundation', 'product', 'process', 'payment'] as const).map(topic => {
                  const count = data.leaderboard.filter(a => !!a.quiz[topic]).length;
                  const pct   = data.totalAgents > 0 ? Math.round(count / data.totalAgents * 100) : 0;
                  return (
                    <div key={topic} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="capitalize text-muted-foreground">{t(`modules.${topic}`)}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground/60">{count}/{data.totalAgents}</span>
                          <span className={`font-bold ${scoreColor(pct)}`}>{pct}%</span>
                        </div>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
                          className="h-full rounded-full bg-blue-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quiz — per topic pass rate */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Target size={15} className="text-amber-400" />
                <span className="font-semibold text-sm text-foreground">{t('overview.quiz')}</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {t('overview.passedAll', { done: data.moduleStats.find(m => m.moduleId === 'quiz')?.passCount ?? 0, total: data.totalAgents })}
                </span>
              </div>
              <div className="space-y-2.5 pl-5 border-l-2 border-amber-400/20">
                {(['foundation', 'product', 'process', 'payment'] as const).map(topic => {
                  const attempted = data.leaderboard.filter(a => !!a.quiz[topic]);
                  const passed    = attempted.filter(a => a.quiz[topic]?.passed).length;
                  const avgScore  = attempted.length > 0 ? Math.round(attempted.reduce((s, a) => s + (a.quiz[topic]?.bestScore ?? 0), 0) / attempted.length) : 0;
                  const pct       = data.totalAgents > 0 ? Math.round(passed / data.totalAgents * 100) : 0;
                  return (
                    <div key={topic} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="capitalize text-muted-foreground">{t(`modules.${topic}`)}</span>
                        <div className="flex items-center gap-3">
                          {avgScore > 0 && <span className={`${scoreColor(avgScore)}`}>{t('overview.avgScore', { score: avgScore })}</span>}
                          <span className={`font-bold ${scoreColor(pct)}`}>{t('overview.passCount', { count: passed, total: data.totalAgents })}</span>
                        </div>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
                          className={`h-full rounded-full ${scoreBg(pct)}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Eval */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap size={15} className="text-purple-400" />
                <span className="font-semibold text-sm text-foreground">{t('overview.aiEval')}</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {t('overview.startedCount', { done: data.moduleStats.find(m => m.moduleId === 'ai-eval')?.passCount ?? 0, total: data.totalAgents })}
                  {data.avgAiEvalScore > 0 && <span className={` ml-2 font-bold ${scoreColor(data.avgAiEvalScore)}`}>· {t('overview.avgScore', { score: data.avgAiEvalScore })}/100</span>}
                </span>
              </div>
              <div className="pl-5 border-l-2 border-purple-400/20">
                <ModuleBar label="" avgScore={data.moduleStats.find(m => m.moduleId === 'ai-eval')?.avgScore ?? 0}
                  passCount={data.moduleStats.find(m => m.moduleId === 'ai-eval')?.passCount ?? 0} totalAttempts={data.totalAgents} />
              </div>
            </div>

            {/* Pitch — per level */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={15} className="text-orange-400" />
                <span className="font-semibold text-sm text-foreground">{t('overview.pitchSim')}</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {t('overview.allLevels', { done: data.moduleStats.find(m => m.moduleId === 'pitch')?.passCount ?? 0, total: data.totalAgents })}
                </span>
              </div>
              <div className="space-y-2.5 pl-5 border-l-2 border-orange-400/20">
                {[1, 2, 3].map(level => {
                  const count = data.leaderboard.filter(a => a.pitch?.completedLevels?.includes(level)).length;
                  const pct   = data.totalAgents > 0 ? Math.round(count / data.totalAgents * 100) : 0;
                  return (
                    <div key={level} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{t('overview.level', { level })}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground/60">{count}/{data.totalAgents}</span>
                          <span className={`font-bold ${scoreColor(pct)}`}>{pct}%</span>
                        </div>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
                          className="h-full rounded-full bg-orange-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm flex flex-col items-center justify-center">
            <h3 className="font-bold text-lg mb-4 self-start">{t('overview.overallResult')}</h3>
            <DonutChart passed={data.passFail.passed} failed={data.passFail.failed} />
            <p className="text-xs text-muted-foreground mt-4 text-center">{t('overview.overallDesc')}</p>
          </div>
          
          <LiveFeed feed={feed} />
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
                  <span className="font-semibold text-foreground truncate">{agent.agent.name}</span>
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
