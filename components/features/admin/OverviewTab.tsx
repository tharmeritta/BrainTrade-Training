'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, Target, Award, Activity, TrendingUp, BookOpen, Zap } from 'lucide-react';
import type { AdminOverviewData } from '@/types';
import { KpiCard, DonutChart, ModuleBar, BadgePill } from './AdminComponents';
import { scoreColor, scoreBg, timeAgo, MODULE_LABELS } from './AdminHelpers';

export default function OverviewTab() {
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
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="relative">
        <div className="w-10 h-10 border-4 border-primary/20 rounded-full" />
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin absolute inset-0" />
      </div>
      <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading overview...</p>
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
        <KpiCard label="Total Agents"    value={data.totalAgents}     sub={`${data.activeAgents} active this week`} icon={Users}     themeColor="blue" />
        <KpiCard label="Quiz Pass Rate"  value={`${data.overallPassRate}%`}  sub="across all modules"             icon={Target}    themeColor="blue" />
        <KpiCard label="AI Eval Avg"     value={`${data.avgAiEvalScore}/100`} sub="speech evaluation"              icon={Award}     themeColor="purple" />
        <KpiCard label="Sessions / Week" value={data.weekSessions}    sub="quizzes + evals + pitches"           icon={Activity}  themeColor="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-primary" /> Training Completion
          </h3>
          <div className="space-y-7">

            {/* Learn — per topic */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={15} className="text-blue-400" />
                <span className="font-semibold text-sm text-foreground">Learn — Courses</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {data.moduleStats.find(m => m.moduleId === 'learn')?.passCount ?? 0} / {data.totalAgents} agents
                </span>
              </div>
              <div className="space-y-2.5 pl-5 border-l-2 border-blue-400/20">
                {(['product', 'process', 'payment'] as const).map(topic => {
                  const count = data.leaderboard.filter(a => !!a.quiz[topic]).length;
                  const pct   = data.totalAgents > 0 ? Math.round(count / data.totalAgents * 100) : 0;
                  return (
                    <div key={topic} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="capitalize text-muted-foreground">{topic}</span>
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
                <span className="font-semibold text-sm text-foreground">Quiz</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {data.moduleStats.find(m => m.moduleId === 'quiz')?.passCount ?? 0} / {data.totalAgents} passed all
                </span>
              </div>
              <div className="space-y-2.5 pl-5 border-l-2 border-amber-400/20">
                {(['product', 'process', 'payment'] as const).map(topic => {
                  const attempted = data.leaderboard.filter(a => !!a.quiz[topic]);
                  const passed    = attempted.filter(a => a.quiz[topic]?.passed).length;
                  const avgScore  = attempted.length > 0 ? Math.round(attempted.reduce((s, a) => s + (a.quiz[topic]?.bestScore ?? 0), 0) / attempted.length) : 0;
                  const pct       = data.totalAgents > 0 ? Math.round(passed / data.totalAgents * 100) : 0;
                  return (
                    <div key={topic} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="capitalize text-muted-foreground">{topic}</span>
                        <div className="flex items-center gap-3">
                          {avgScore > 0 && <span className={`${scoreColor(avgScore)}`}>avg {avgScore}%</span>}
                          <span className={`font-bold ${scoreColor(pct)}`}>{passed}/{data.totalAgents} pass</span>
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
                <span className="font-semibold text-sm text-foreground">AI Eval</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {data.moduleStats.find(m => m.moduleId === 'ai-eval')?.passCount ?? 0} / {data.totalAgents} started
                  {data.avgAiEvalScore > 0 && <span className={` ml-2 font-bold ${scoreColor(data.avgAiEvalScore)}`}>· avg {data.avgAiEvalScore}/100</span>}
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
                <span className="font-semibold text-sm text-foreground">Pitch Simulator</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {data.moduleStats.find(m => m.moduleId === 'pitch')?.passCount ?? 0} / {data.totalAgents} all levels
                </span>
              </div>
              <div className="space-y-2.5 pl-5 border-l-2 border-orange-400/20">
                {[1, 2, 3].map(level => {
                  const count = data.leaderboard.filter(a => a.pitch?.completedLevels?.includes(level)).length;
                  const pct   = data.totalAgents > 0 ? Math.round(count / data.totalAgents * 100) : 0;
                  return (
                    <div key={level} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Level {level}</span>
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
