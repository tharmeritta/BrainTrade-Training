'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Users, Target, Award, Activity, TrendingUp, BookOpen, Zap, Loader2 } from 'lucide-react';
import type { AdminOverviewData } from '@/types';
import { KpiCard, DonutChart, ModuleBar, BadgePill } from './AdminComponents';
import { scoreColor, scoreBg, timeAgo } from './AdminHelpers';
import LiveFeed from './LiveFeed';

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
      const [ovRes, feedRes] = await Promise.all([
        fetch('/api/admin/overview'),
        fetch('/api/admin/live-feed')
      ]);
      
      if (ovRes.ok) {
        const ovData = await ovRes.json();
        setData(ovData);
      }
      
      if (feedRes.ok) {
        const feedData = await feedRes.json();
        setFeed(feedData.feed || []);
      }
    } catch (err) {
      console.error('Overview polling error:', err);
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

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label={t('overview.totalAgents')} value={data.totalAgents} sub={t('overview.activeWeekly', { count: data.activeAgents })} icon={Users} themeColor="blue" />
        <KpiCard label={t('overview.quizPassRate')} value={`${data.overallPassRate}%`} sub={t('overview.allModules')} icon={Target} themeColor="blue" />
        <KpiCard label={t('overview.aiEvalAvg')} value={`${data.avgAiEvalScore}/100`} sub={t('overview.speechEval')} icon={Award} themeColor="purple" />
        <KpiCard label={t('overview.sessionsWeekly')} value={data.weekSessions} sub={t('overview.sessionsDesc')} icon={Activity} themeColor="orange" />
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
