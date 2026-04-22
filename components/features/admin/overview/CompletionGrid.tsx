'use client';

import { motion } from 'framer-motion';
import { TrendingUp, BookOpen, Target, Zap, Award } from 'lucide-react';
import type { AdminOverviewData } from '@/types';
import { scoreColor, scoreBg } from '../AdminHelpers';

interface CompletionGridProps {
  data: AdminOverviewData;
  t: (key: string, params?: any) => string;
}

export function CompletionGrid({ data, t }: CompletionGridProps) {
  return (
    <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
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
            {(['product', 'kyc', 'website'] as const).map(topic => {
              const count = data.leaderboard.filter(a => (a.learnedModules ?? []).includes(topic)).length;
              const pct   = data.totalAgents > 0 ? Math.round(count / data.totalAgents * 100) : 0;
              return (
                <div key={topic} className="space-y-1">
                  <div className="flex justify-between text-[10px] font-medium">
                    <span className="capitalize text-muted-foreground">{t(`modules.${topic === 'kyc' ? 'process' : topic === 'website' ? 'foundation' : topic}`)}</span>
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
  );
}
