'use client';

import { motion } from 'framer-motion';
import { Archive, Search, ChevronDown } from 'lucide-react';
import type { TrainingPeriod } from '@/types';

interface ArchiveSelectionGridProps {
  inactivePeriods: TrainingPeriod[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onSelectPeriod: (id: string) => void;
}

export default function ArchiveSelectionGrid({ 
  inactivePeriods, 
  searchTerm, 
  setSearchTerm, 
  onSelectPeriod 
}: ArchiveSelectionGridProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
         <div>
            <h3 className="text-lg font-black text-foreground">Select a Batch to Review</h3>
            <p className="text-xs text-muted-foreground">Browse historical evaluation data by batch.</p>
         </div>
         <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
            <input 
              type="text"
              placeholder="Search archive..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-secondary/30 border border-border/50 rounded-xl pl-9 pr-4 py-2 text-xs font-bold outline-none focus:ring-2 ring-amber-500/20 w-full transition-all"
            />
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
         {inactivePeriods.map(p => (
           <motion.div
             key={p.id}
             whileHover={{ y: -4 }}
             onClick={() => onSelectPeriod(p.id)}
             className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-amber-500/30 transition-all cursor-pointer group"
           >
             <div className="flex items-start justify-between mb-4">
               <div className="p-2.5 rounded-xl bg-amber-500/5 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                 <Archive size={20} />
               </div>
               <div className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                 Archived
               </div>
             </div>
             <h3 className="font-black text-base text-foreground mb-1">{p.name}</h3>
             <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{p.trainerName}</p>
             <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  {new Date(p.completedAt || p.startDate).toLocaleDateString()}
                </span>
                <ChevronDown size={14} className="text-muted-foreground -rotate-90" />
             </div>
           </motion.div>
         ))}
         {inactivePeriods.length === 0 && (
           <div className="col-span-full py-20 text-center opacity-30">
              <Archive size={48} className="mx-auto mb-3" />
              <p className="font-black uppercase tracking-widest">No archived batches found</p>
           </div>
         )}
      </div>
    </div>
  );
}
