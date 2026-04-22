'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import type { AdminOverviewData, AgentStats } from '@/types';
import { LivePulse } from './AdminComponents';
import AgentDetailModal from './AgentDetailModal';

// Modular Components
import { KpiSection } from './overview/KpiSection';
import { TrainingWavesSection } from './overview/TrainingWavesSection';
import { GraduationRoster } from './overview/GraduationRoster';
import { CompletionGrid } from './overview/CompletionGrid';
import { LeaderboardTable } from './overview/LeaderboardTable';

export default function OverviewTab({ readOnly }: { readOnly?: boolean }) {
  const t = useTranslations('admin');
  const [data,    setData]    = useState<AdminOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedForDetail, setSelectedForDetail] = useState<AgentStats | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
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

      <KpiSection data={data} t={t} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <TrainingWavesSection 
            waves={data.trainingWaves || []} 
            leaderboard={data.leaderboard} 
          />
          <GraduationRoster 
            leaderboard={data.leaderboard} 
            totalAgents={data.totalAgents}
            onViewAgent={handleViewAgent}
            t={t}
          />
        </div>

        <div className="lg:col-span-1">
          <LivePulse agentIds={agentIds} agentNames={agentNames} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <CompletionGrid data={data} t={t} />
        </div>

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

      <LeaderboardTable 
        leaderboard={data.leaderboard} 
        onViewAgent={handleViewAgent} 
        t={t} 
      />
    </div>
  );
}
