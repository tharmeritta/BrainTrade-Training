'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Activity, Users as UsersIcon, Clock } from 'lucide-react';
import { useAgentPresence } from '@/lib/presence';

export function LivePulse({ agentIds, agentNames }: { agentIds: string[], agentNames: Record<string, string> }) {
  const t = useTranslations('admin');
  const presence = useAgentPresence(agentIds);
  
  const activeCount = Object.values(presence).filter(p => p.status === 'focused').length;
  const awayCount   = Object.values(presence).filter(p => p.status === 'away').length;

  return (
    <div className="bg-card rounded-2xl border border-border p-5 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black text-sm flex items-center gap-2 uppercase tracking-widest text-foreground/80">
          <Activity size={16} className="text-emerald-400 animate-pulse" /> {t('overview.livePulse')}
        </h3>
        <div className="flex gap-3">
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> {activeCount}
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> {awayCount}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar min-h-[200px] max-h-[300px]">
        {agentIds.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-30 gap-2">
            <UsersIcon size={24} />
            <p className="text-[10px] font-bold uppercase tracking-widest">{t('overview.noActiveAgents')}</p>
          </div>
        ) : (
          agentIds.map(id => {
            const p = presence[id];
            if (!p || p.status === 'offline') return null;

            return (
              <motion.div 
                key={id} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-2.5 rounded-xl bg-secondary/30 border border-border/40"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${p.status === 'focused' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-amber-400'}`} />
                  <span className="text-xs font-bold text-foreground truncate">{agentNames[id] || id}</span>
                </div>
                <span className={`text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-md ${p.status === 'focused' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-400'}`}>
                  {p.status}
                </span>
              </motion.div>
            );
          })
        )}
        {Object.values(presence).every(p => p.status === 'offline') && agentIds.length > 0 && (
          <div className="h-full flex flex-col items-center justify-center py-10 opacity-30 gap-2">
            <Clock size={24} />
            <p className="text-[10px] font-bold uppercase tracking-widest text-center">{t('overview.allAgentsOffline')}</p>
          </div>
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t border-border/40 flex justify-between items-center text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
        <span>Total Tracked</span>
        <span>{agentIds.length}</span>
      </div>
    </div>
  );
}
