'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { User as UserIcon, Bot } from 'lucide-react';
import { TRANSITION } from '@/lib/animations';
import type { PitchMessage } from '@/types';

export const MessageBubble = memo(({ m, i }: { m: PitchMessage; i: number }) => {
  const isUser = m.role === 'user';
  const timeStr = m.timestamp
    ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...TRANSITION.base, delay: Math.min(i * 0.02, 0.15) }}
      className={`flex items-end gap-2.5 mt-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border ${
        isUser
          ? 'bg-primary text-primary-foreground border-primary/20'
          : 'bg-white dark:bg-card border-black/5 dark:border-white/10 text-foreground'
      }`}>
        {isUser ? <UserIcon size={13} /> : <Bot size={13} />}
      </div>
      <div className={`flex flex-col gap-1 max-w-[78%] sm:max-w-[68%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap font-medium rounded-2xl border ${
          isUser
            ? 'bg-primary text-primary-foreground border-primary/10'
            : 'bg-white dark:bg-card text-foreground border-black/5 dark:border-white/10'
        }`}>
          {m.content}
        </div>
        {timeStr && (
          <span className="text-[10px] text-muted-foreground/35 font-medium px-1">{timeStr}</span>
        )}
      </div>
    </motion.div>
  );
});

MessageBubble.displayName = 'MessageBubble';
