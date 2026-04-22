'use client';

import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';
import type { AdminOverviewData, AgentStats } from '@/types';

interface TrainingWavesSectionProps {
  waves: NonNullable<AdminOverviewData['trainingWaves']>;
  leaderboard: AgentStats[];
}

export function TrainingWavesSection({ waves, leaderboard }: TrainingWavesSectionProps) {
  if (!waves || waves.length === 0) return null;

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-5">
      <div>
        <h3 className="font-bold text-lg flex items-center gap-2">
          <GraduationCap size={20} className="text-amber-500" /> Training Wave Progress
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">Real-time status of active training batches</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {waves.map(wave => {
          const waveAgents = leaderboard.filter(a => wave.agentIds.includes(a.agent.id));
          const evaluatedCount = waveAgents.filter(a => (a.humanEvaluations?.length ?? 0) > 0).length;
          const progressPct = Math.round((evaluatedCount / wave.agentIds.length) * 100);

          return (
            <div key={wave.id} className="p-4 rounded-xl border border-border bg-secondary/20 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-sm text-foreground">{wave.name}</p>
                  <p className="text-[10px] text-muted-foreground">Trainer: {wave.trainerName}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase">Active</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-muted-foreground">Evaluations: {evaluatedCount}/{wave.agentIds.length}</span>
                  <span className="text-primary">{progressPct}%</span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${progressPct}%` }} 
                    className="h-full bg-amber-500 rounded-full" 
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
