'use client';

import { Users, Target, Award, Activity } from 'lucide-react';
import { KpiCard } from '../ui/Metrics';
import type { AdminOverviewData } from '@/types';

interface KpiSectionProps {
  data: AdminOverviewData;
  t: (key: string, params?: any) => string;
}

export function KpiSection({ data, t }: KpiSectionProps) {
  return (
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
  );
}
