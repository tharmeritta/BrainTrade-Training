'use client';

import { motion } from 'framer-motion';
import { Award } from 'lucide-react';
import type { AgentStats } from '@/types';
import { BadgePill } from '../AdminComponents';
import { scoreColor, scoreBg, timeAgo } from '../AdminHelpers';

interface LeaderboardTableProps {
  leaderboard: AgentStats[];
  onViewAgent: (agent: AgentStats) => void;
  t: (key: string, params?: any) => string;
}

export function LeaderboardTable({ leaderboard, onViewAgent, t }: LeaderboardTableProps) {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-border flex items-center justify-between">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Award size={20} className="text-amber-500" /> {t('overview.leaderboard')}
        </h3>
        <span className="text-xs text-muted-foreground">{t('overview.rankedCount', { count: leaderboard.length })}</span>
      </div>
      <div className="divide-y divide-border">
        {leaderboard.map((agent, i) => (
          <motion.div
            key={agent.agent.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="px-6 py-4 flex items-center gap-4 hover:bg-secondary/30 transition-colors"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${
              i === 0 ? 'bg-amber-400 text-white' :
              i === 1 ? 'bg-slate-300 text-slate-700' :
              i === 2 ? 'bg-amber-700 text-white' :
              'bg-secondary text-muted-foreground'
            }`}>{i + 1}</div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onViewAgent(agent)}
                  className="font-semibold text-foreground truncate hover:text-primary transition-colors"
                >
                  {agent.agent.name}
                </button>
                <BadgePill badge={agent.badge} />
              </div>
              <div className="flex gap-3 mt-1">
                {(['foundation', 'product', 'process', 'payment'] as const).map(m => (
                  <span key={m} className={`text-xs ${scoreColor(agent.quiz[m]?.bestScore)}`}>
                    {t(`modules.${m}`)} {agent.quiz[m]?.bestScore ? `${agent.quiz[m]!.bestScore}%` : '–'}
                  </span>
                ))}
              </div>
            </div>

            <div className="w-32 hidden sm:block">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">{t('overview.overall')}</span>
                <span className={`font-bold ${scoreColor(agent.overallScore)}`}>{agent.overallScore}%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${scoreBg(agent.overallScore)}`} style={{ width: `${agent.overallScore}%` }} />
              </div>
            </div>

            <span className="text-xs text-muted-foreground w-16 text-right hidden md:block">{timeAgo(agent.lastActive, t)}</span>
          </motion.div>
        ))}
        {leaderboard.length === 0 && (
          <div className="px-6 py-12 text-center text-muted-foreground text-sm">{t('overview.noLeaderboard')}</div>
        )}
      </div>
    </div>
  );
}
