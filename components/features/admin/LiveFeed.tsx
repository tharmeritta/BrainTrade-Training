'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Activity, Zap, Target, TrendingUp, Clock, User } from 'lucide-react';

interface FeedItem {
  id: string;
  type: 'quiz' | 'ai-eval' | 'pitch';
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
      case 'quiz': return <Target size={14} className="text-amber-400" />;
      case 'ai-eval': return <Zap size={14} className="text-purple-400" />;
      case 'pitch': return <TrendingUp size={14} className="text-orange-400" />;
      default: return <Activity size={14} className="text-blue-400" />;
    }
  };

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    return `${Math.floor(m / 60)}h ago`;
  };

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm flex flex-col h-full">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-secondary/10">
        <h3 className="font-bold text-sm flex items-center gap-2">
          <Activity size={16} className="text-primary animate-pulse" /> Live Activity Feed
        </h3>
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-[10px] font-black text-emerald-500 uppercase tracking-wider">
          <div className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" /> Live
        </span>
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-border/50 scrollbar-hide max-h-[400px]">
        <AnimatePresence initial={false}>
          {feed.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="px-5 py-3 hover:bg-secondary/30 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="mt-1 p-1.5 rounded-lg bg-secondary/50 border border-border/50">
                  {getIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="text-xs font-bold text-foreground truncate flex items-center gap-1">
                      <User size={10} className="text-muted-foreground" /> {item.agentName}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 shrink-0">
                      <Clock size={10} /> {timeAgo(item.timestamp)}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mb-1.5">{item.details}</p>
                  
                  {item.score !== undefined && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${item.passed ? 'bg-emerald-400' : 'bg-red-400'}`}
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                      <span className={`text-[10px] font-bold ${item.passed ? 'text-emerald-500' : 'text-red-500'}`}>
                        {item.score}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          {feed.length === 0 && (
            <div className="py-12 text-center text-muted-foreground text-xs italic">
              Waiting for activity...
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
