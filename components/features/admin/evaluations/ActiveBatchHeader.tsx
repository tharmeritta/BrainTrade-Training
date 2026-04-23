'use client';

import { Target } from 'lucide-react';
import type { TrainingPeriod } from '@/types';

interface ActiveBatchHeaderProps {
  activePeriods: TrainingPeriod[];
  selectedPeriodId: string;
  onSelectPeriod: (id: string) => void;
}

export default function ActiveBatchHeader({
  activePeriods,
  selectedPeriodId,
  onSelectPeriod
}: ActiveBatchHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/40 border border-border/50 p-5 rounded-2xl backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
          <Target size={24} />
        </div>
        <div>
          <h2 className="text-base font-black text-foreground uppercase tracking-tight">Active Batch Operations</h2>
          <div className="flex items-center gap-2 mt-0.5">
             <span className="relative flex h-2 w-2">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
             </span>
             <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
               Monitoring {activePeriods.length} Live {activePeriods.length === 1 ? 'Batch' : 'Batches'}
             </p>
          </div>
        </div>
      </div>

      {activePeriods.length > 1 && (
        <select 
          value={selectedPeriodId} 
          onChange={(e) => onSelectPeriod(e.target.value)}
          className="bg-secondary/50 border border-border/50 rounded-xl px-4 py-2 text-xs font-bold outline-none ring-1 ring-border focus:ring-primary/40 transition-all cursor-pointer min-w-[200px]"
        >
          <option value="">Show All Active</option>
          {activePeriods.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      )}
      
      {activePeriods.length === 1 && (
        <div className="bg-primary/5 border border-primary/20 px-4 py-2 rounded-xl">
           <span className="text-[10px] font-black text-primary uppercase tracking-widest block leading-none">Selected Batch</span>
           <span className="text-xs font-bold text-foreground">{activePeriods[0].name}</span>
        </div>
      )}
    </div>
  );
}
