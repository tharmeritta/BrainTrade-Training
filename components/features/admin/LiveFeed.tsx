'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Activity, Zap, Target, Clock, User } from 'lucide-react';

interface FeedItem {
  id: string;
  type: 'quiz' | 'ai-eval' | 'learning';
  agentId: string;
  agentName: string;
  timestamp: string;
  details: string;
  score?: number;
  level?: number;
  passed?: boolean;
}

export default function LiveFeed({ feed }: { feed: FeedItem[] }) {
  const t = useTranslations('admin');

  const getIcon = (type: string) => {
    switch (type) {
      case 'quiz': return <Target size={12} className="text-amber-400" />;
      case 'ai-eval': return <Zap size={12} className="text-purple-400" />;
      case 'learning': return <Activity size={12} className="text-emerald-400" />;
      default: return <Activity size={12} className="text-blue-400" />;
    }
  };

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'now';
    if (m < 60) return `${m}m`;
    return `${Math.floor(m / 60)}h`;
  };

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-secondary/10">
        <h3 className="font-bold text-xs flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
          <Activity size={14} className="text-primary animate-pulse" /> Live Activity
        </h3>
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-[9px] font-black text-emerald-500 uppercase tracking-wider">
          <div className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" /> Live
        </span>
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-border/30 scrollbar-hide max-h-[450px]">
        <AnimatePresence initial={false}>
          {feed.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="px-4 py-2 hover:bg-secondary/20 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="shrink-0 p-1 rounded-md bg-secondary/50 border border-border/40">
                  {getIcon(item.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] leading-tight truncate">
                      <span className="font-bold text-foreground">{item.agentName}</span>
                      <span className="text-muted-foreground mx-1">•</span>
                      <span className="text-muted-foreground">{item.details}</span>
                    </p>
                    <span className="text-[10px] text-muted-foreground font-medium shrink-0">
                      {timeAgo(item.timestamp)}
                    </span>
                  </div>

                  {item.score !== undefined && (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-0.5 bg-secondary/50 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${item.passed ? 'bg-emerald-400' : 'bg-red-400'}`}
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                      <span className={`text-[9px] font-black tabular-nums ${item.passed ? 'text-emerald-500' : 'text-red-500'}`}>
                        {item.score}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          {feed.length === 0 && (
            <div className="py-12 text-center text-muted-foreground text-[10px] italic">
              Waiting for activity...
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

