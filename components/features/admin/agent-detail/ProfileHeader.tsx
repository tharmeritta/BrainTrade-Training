'use client';

import { useTranslations } from 'next-intl';
import { X, Clock, GraduationCap, ShieldCheck, Loader2 } from 'lucide-react';
import type { AgentStats } from '@/types';
import { BadgePill } from '../ui/BadgePill';
import { scoreColor, timeAgo } from '../AdminHelpers';

interface ProfileHeaderProps {
  stats: AgentStats;
  onClose: () => void;
  onMasterPass: () => Promise<void>;
  isBulkLoading: boolean;
  readOnly?: boolean;
}

export default function ProfileHeader({ 
  stats, 
  onClose, 
  onMasterPass, 
  isBulkLoading, 
  readOnly 
}: ProfileHeaderProps) {
  const t = useTranslations('admin');

  return (
    <div className="px-8 py-8 bg-gradient-to-br from-secondary/50 to-secondary/20 border-b border-border relative shrink-0">
      <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground">
        <X size={20} />
      </button>
      
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-blue-500/20 shrink-0">
          {stats.agent.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1.5 flex-wrap">
            <h3 className="text-2xl font-black text-foreground tracking-tight">{stats.agent.name}</h3>
            <BadgePill badge={stats.badge} />
            <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold ${stats.agent.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
              {stats.agent.active ? t('agentDetail.active') : t('agentDetail.inactive')}
            </span>
            
            {/* Master Override Button */}
            {!readOnly && (
              <button 
                onClick={onMasterPass}
                disabled={isBulkLoading}
                className="flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-amber-500 text-white hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 ml-2"
              >
                {isBulkLoading ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                <span className="text-[11px] font-black uppercase tracking-tight">{t('agentDetail.quickPass') || "Quick Pass"}</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
            <div className="flex items-center gap-1.5"><Clock size={14} /> {t('agentDetail.lastActive')}: {timeAgo(stats.lastActive, t)}</div>
            <div className="flex items-center gap-1.5"><GraduationCap size={14} /> {t('agentDetail.overallScore')}: <span className={`font-bold ${scoreColor(stats.overallScore)}`}>{stats.overallScore}%</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
