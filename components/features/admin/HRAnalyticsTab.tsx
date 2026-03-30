'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { 
  Users, Calendar, CheckCircle2, XCircle, Clock, 
  ArrowRight, Filter, Download, Search, Info, TrendingUp,
  Activity, GraduationCap, ShieldAlert
} from 'lucide-react';

import { GlassCard } from '@/components/ui/GlassCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AgentStats, TrainingPeriod } from '@/types';
import { deriveSteps, scoreColor } from '@/lib/training';
import { STEPS } from '@/constants/training';
import { FADE_IN, STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/animations';

export default function HRAnalyticsTab({ readOnly }: { readOnly?: boolean }) {
  const t = useTranslations('admin');
  const th = useTranslations('admin.hranalytics');
  const [agents, setAgents] = useState<AgentStats[]>([]);
  const [periods, setPeriods] = useState<TrainingPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');

  useEffect(() => {
    async function fetchData() {
      try {
        const [aRes, pRes] = await Promise.all([
          fetch('/api/admin/agents'),
          fetch('/api/trainer/training-periods')
        ]);
        if (aRes.ok && pRes.ok) {
          const aData = await aRes.json();
          const pData = await pRes.json();
          setAgents(aData.agents || []);
          setPeriods(pData || []);
        }
      } catch (err) {
        console.error('Failed to fetch HR data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredAgents = useMemo(() => {
    return agents.filter(a => {
      const matchesSearch = a.agent.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          a.agent.stageName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPeriod = selectedPeriod === 'all' || a.agent.id === selectedPeriod; // Simplified for now
      return matchesSearch;
    });
  }, [agents, searchTerm, selectedPeriod]);

  // Aggregate stats
  const stats = useMemo(() => {
    const total = filteredAgents.length;
    const completed = filteredAgents.filter(a => deriveSteps(a)['ai-eval'].passed).length;
    const avgScore = total > 0 ? filteredAgents.reduce((acc, curr) => acc + curr.overallScore, 0) / total : 0;
    const atRisk = filteredAgents.filter(a => a.overallScore < 50).length;

    return { total, completed, avgScore, atRisk };
  }, [filteredAgents]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 rounded-3xl bg-muted/50" />)}
        </div>
        <div className="h-[500px] rounded-3xl bg-muted/50" />
      </div>
    );
  }

  return (
    <motion.div 
      variants={STAGGER_CONTAINER}
      initial="initial"
      animate="animate"
      className="space-y-8"
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title={th('totalActive')} 
          value={stats.total} 
          icon={Users} 
          color="blue" 
          trend={th('batchTrend', { trend: '+12%' })}
        />
        <KPICard 
          title={th('completion')} 
          value={`${Math.round((stats.completed / (stats.total || 1)) * 100)}%`} 
          icon={GraduationCap} 
          color="emerald" 
          trend={th('agentsFinished', { count: 8 })}
        />
        <KPICard 
          title={th('avgScore')} 
          value={`${Math.round(stats.avgScore)}%`} 
          icon={TrendingUp} 
          color="purple" 
          trend={th('stableTarget')}
        />
        <KPICard 
          title={th('atRisk')} 
          value={stats.atRisk} 
          icon={ShieldAlert} 
          color="red" 
          trend={th('hrReview')}
        />
      </div>

      {/* Main Matrix Section */}
      <GlassCard className="p-0 border-border/40 overflow-hidden">
        <div className="p-6 border-b border-border/40 bg-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-foreground flex items-center gap-2">
              <Activity size={20} className="text-primary" />
              {th('matrixTitle')}
            </h3>
            <p className="text-xs text-muted-foreground font-medium">{th('matrixDesc')}</p>
          </div>

          <div className="flex items-center gap-3">
             <div className="relative group">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
               <input 
                 type="text"
                 placeholder={th('searchPlaceholder')}
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="pl-10 pr-4 py-2 bg-background/50 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-full md:w-64 transition-all"
               />
             </div>
             <button 
               onClick={exportToCSV}
               className="p-2.5 rounded-xl border border-border/60 bg-background/50 text-muted-foreground hover:text-foreground transition-all"
               title="Export to CSV"
             >
               <Download size={18} />
             </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/10 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border/40">
                <th className="px-6 py-4">{th('agentInfo')}</th>
                <th className="px-6 py-4 text-center">{th('stepLearn')}</th>
                <th className="px-6 py-4 text-center">{th('stepQuiz')}</th>
                <th className="px-6 py-4 text-center">{th('stepAi')}</th>
                <th className="px-6 py-4 text-center">{th('humanEval')}</th>
                <th className="px-6 py-4">{th('finalResult')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {filteredAgents.map((agent) => {
                const steps = deriveSteps(agent);
                const humanEval = agent.humanEvaluations?.[0];
                const isPassed = steps['ai-eval'].passed && (humanEval?.totalScore ?? 0) >= 70;

                return (
                  <motion.tr 
                    variants={STAGGER_ITEM}
                    key={agent.agent.id} 
                    className="hover:bg-muted/5 transition-colors group"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary uppercase shadow-sm">
                          {agent.agent.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-foreground group-hover:text-primary transition-colors">{agent.agent.name}</p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">{agent.agent.stageName || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    
                    {/* Progress Heatmap Cells */}
                    <ProgressCell passed={steps.learn.passed} score={steps.learn.score} color="#3B82F6" />
                    <ProgressCell passed={steps.quiz.passed} score={steps.quiz.score} color="#F59E0B" />
                    <ProgressCell passed={steps['ai-eval'].passed} score={steps['ai-eval'].score} color="#8B5CF6" />
                    <td className="px-6 py-5 text-center">
                      {humanEval ? (
                        <div className="inline-flex flex-col items-center">
                          <span className="text-sm font-black" style={{ color: scoreColor(humanEval.totalScore) }}>
                            {humanEval.totalScore}%
                          </span>
                          <span className="text-[9px] font-bold text-muted-foreground uppercase">By {humanEval.evaluatorName}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground/30 font-black italic">{th('statusPending')}</span>
                      )}
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        {isPassed ? (
                          <div className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase flex items-center gap-1.5">
                            <CheckCircle2 size={12} /> {th('statusPassed')}
                          </div>
                        ) : (
                          <div className="px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase flex items-center gap-1.5">
                            <Clock size={12} /> {th('statusInProgress')}
                          </div>
                        )}
                        <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
                           <ArrowRight size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </motion.div>
  );

  function exportToCSV() {
    const headers = [th('agentInfo'), 'Stage Name', 'Learn %', 'Quiz %', 'AI Eval %', 'Human Eval %', 'Status'];
    const rows = filteredAgents.map(a => {
      const steps = deriveSteps(a);
      const humanEval = a.humanEvaluations?.[0];
      const isPassed = steps['ai-eval'].passed && (humanEval?.totalScore ?? 0) >= 70;
      
      return [
        `"${a.agent.name}"`,
        `"${a.agent.stageName || 'N/A'}"`,
        steps.learn.score || 0,
        steps.quiz.score || 0,
        steps['ai-eval'].score || 0,
        humanEval?.totalScore || 0,
        isPassed ? th('statusPassed') : th('statusInProgress')
      ];
    });

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `HR_Batch_Progress_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

function KPICard({ title, value, icon: Icon, color, trend }: any) {
  const colorMap: any = {
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    red: 'text-red-500 bg-red-500/10 border-red-500/20',
  };

  return (
    <GlassCard className="p-6 border-border/40 hover:shadow-xl hover:shadow-primary/5 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-2xl ${colorMap[color]}`}>
          <Icon size={24} />
        </div>
        <div className="text-[10px] font-black uppercase text-muted-foreground bg-muted/20 px-2 py-1 rounded-md">
          {trend}
        </div>
      </div>
      <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">{title}</h4>
      <p className="text-3xl font-black text-foreground tracking-tighter">{value}</p>
    </GlassCard>
  );
}

function ProgressCell({ passed, score, color }: { passed: boolean; score?: number; color: string }) {
  return (
    <td className="px-6 py-5">
      <div className="flex flex-col items-center gap-1.5">
        <div className="w-full max-w-[80px] h-2 rounded-full bg-muted overflow-hidden border border-white/5 p-0.5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${score || 0}%` }}
            className="h-full rounded-full"
            style={{ 
              background: passed ? color : `${color}40`,
              boxShadow: passed ? `0 0 10px ${color}40` : 'none'
            }}
          />
        </div>
        <div className="flex items-center gap-1.5">
          {passed ? (
             <CheckCircle2 size={12} style={{ color }} />
          ) : (
             <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: color }} />
          )}
          <span className="text-[10px] font-black" style={{ color: passed ? color : 'inherit', opacity: passed ? 1 : 0.4 }}>
            {score !== undefined ? `${score}%` : '---'}
          </span>
        </div>
      </div>
    </td>
  );
}
