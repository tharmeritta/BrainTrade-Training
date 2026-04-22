'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { 
  History, GraduationCap, Calendar, ChevronRight, 
  Search, Loader2, Users, Award, Target, Zap, Clock
} from 'lucide-react';
import type { TrainingPeriod, AgentStats } from '@/types';
import { KpiCard, BadgePill } from './AdminComponents';
import { scoreColor, scoreBg } from './AdminHelpers';
import AgentDetailModal from './AgentDetailModal';

export default function HistoryTab() {
  const t = useTranslations('admin');
  const [periods, setPeriods] = useState<TrainingPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);
  const [periodStats, setPeriodStats] = useState<AgentStats[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<AgentStats | null>(null);

  const loadPeriods = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/trainer/training-periods'); // Reusing existing list endpoint
      if (res.ok) {
        const data = await res.json();
        // Filter for inactive (archived) periods
        setPeriods(data.periods?.filter((p: TrainingPeriod) => !p.active) || []);
      }
    } catch (err) {
      console.error('History fetching error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPeriods();
  }, [loadPeriods]);

  const loadPeriodDetail = async (id: string) => {
    setLoadingStats(true);
    setSelectedPeriodId(id);
    try {
      const res = await fetch(`/api/admin/history?periodId=${id}`);
      if (res.ok) {
        const data = await res.json();
        setPeriodStats(data.stats || []);
      }
    } catch (err) {
      console.error('History detail error:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const filteredPeriods = periods.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.trainerName.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <Loader2 className="animate-spin text-primary" size={32} />
      <p className="text-sm text-muted-foreground animate-pulse">Loading archive...</p>
    </div>
  );

  const selectedPeriod = periods.find(p => p.id === selectedPeriodId);

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {selectedAgent && (
          <AgentDetailModal 
            stats={selectedAgent} 
            onClose={() => setSelectedAgent(null)} 
            readOnly={true}
          />
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2 text-foreground/80">
            <History className="text-primary" /> Training History
          </h2>
          <p className="text-sm text-muted-foreground">Review and audit completed training batches.</p>
        </div>
        {!selectedPeriodId && (
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search batches..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background border pl-9 pr-4 py-2 rounded-xl text-sm outline-none focus:ring-2 ring-primary/20"
            />
          </div>
        )}
        {selectedPeriodId && (
          <button 
            onClick={() => setSelectedPeriodId(null)}
            className="px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-sm font-bold transition-colors"
          >
            Back to List
          </button>
        )}
      </div>

      {!selectedPeriodId ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPeriods.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
              onClick={() => loadPeriodDetail(p.id)}
              className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <GraduationCap size={20} />
                </div>
                <div className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-secondary text-muted-foreground flex items-center gap-1">
                  <Clock size={10} /> Completed
                </div>
              </div>
              <h3 className="font-black text-lg text-foreground mb-1">{p.name}</h3>
              <div className="space-y-2 mt-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Users size={14} /> {p.agentIds.length} Agents Graduated
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar size={14} /> Started {new Date(p.startDate).toLocaleDateString()}
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between pt-4 border-t border-border/50">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Trainer: {p.trainerName}</span>
                <ChevronRight size={16} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
          {filteredPeriods.length === 0 && (
            <div className="col-span-full py-20 text-center space-y-3 opacity-40">
              <History size={48} className="mx-auto" />
              <p className="font-bold">No archived training batches found.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Detailed Batch View */}
          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-primary flex items-center gap-2">
                  {selectedPeriod?.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-3">
                  <span>Trainer: <b>{selectedPeriod?.trainerName}</b></span>
                  <span>|</span>
                  <span>Started: <b>{selectedPeriod?.startDate}</b></span>
                  <span>|</span>
                  <span>Archived: <b>{selectedPeriod?.completedAt ? new Date(selectedPeriod.completedAt).toLocaleDateString() : 'Unknown'}</b></span>
                </p>
              </div>
              <div className="flex items-center gap-4">
                 <div className="text-center">
                    <p className="text-[10px] font-black uppercase text-muted-foreground">Total Graduated</p>
                    <p className="text-2xl font-black text-foreground">{selectedPeriod?.agentIds.length}</p>
                 </div>
              </div>
            </div>
          </div>

          {loadingStats ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="animate-spin text-primary" size={24} />
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Analyzing historical data...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <KpiCard 
                   label="Avg Quiz Score" 
                   value={`${Math.round(periodStats.reduce((a, b) => a + (Object.values(b.quiz).reduce((s, q) => s + q.bestScore, 0) / (Object.keys(b.quiz).length || 1)), 0) / (periodStats.length || 1))}%`}
                   icon={Target}
                   themeColor="blue"
                 />
                 <KpiCard 
                   label="Avg AI Eval" 
                   value={`${Math.round(periodStats.reduce((a, b) => a + (b.aiEval?.avgScore || 0), 0) / (periodStats.length || 1))}%`}
                   icon={Zap}
                   themeColor="purple"
                 />
                 <KpiCard 
                   label="Graduation Rate" 
                   value={`${Math.round((periodStats.filter(s => s.overallScore >= 70).length / (periodStats.length || 1)) * 100)}%`}
                   icon={Award}
                   themeColor="amber"
                 />
              </div>

              <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-border bg-secondary/10">
                   <h4 className="font-bold text-sm uppercase tracking-wider text-foreground">Archived Leaderboard</h4>
                </div>
                <div className="divide-y divide-border">
                  {periodStats.sort((a, b) => b.overallScore - a.overallScore).map((agent, i) => (
                    <div
                      key={agent.agent.id}
                      className="px-6 py-4 flex items-center gap-4 hover:bg-secondary/30 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-black text-muted-foreground shrink-0">{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setSelectedAgent(agent)} className="font-bold text-foreground text-sm hover:text-primary transition-colors">{agent.agent.name}</button>
                          <BadgePill badge={agent.badge} />
                        </div>
                        <div className="flex gap-3 mt-1 text-[10px] text-muted-foreground font-medium">
                          <span>Overall: <b>{agent.overallScore}%</b></span>
                          <span>AI Eval: <b>{agent.aiEval?.avgScore ?? 0}%</b></span>
                          <span>Level: <b>{Math.max(...agent.evalCompletedLevels, 0)}</b></span>
                        </div>
                      </div>
                      <div className="w-24">
                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${scoreBg(agent.overallScore)}`} style={{ width: `${agent.overallScore}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
