'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Radio, User } from 'lucide-react';
import type { CourseLang } from '@/lib/courses';

interface PresentationHeaderProps {
  t: (key: string) => string;
  locale: string;
  router: any;
  title: string;
  isControlledByOthers: boolean;
  session: any;
  user: any;
  agentName: string | null;
  lang: CourseLang;
  onLangChange: (next: CourseLang) => void;
}

export function PresentationHeader({
  t, locale, router, title,
  isControlledByOthers, session, user, agentName,
  lang, onLangChange
}: PresentationHeaderProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-2 px-3 py-2.5 sm:px-4 sm:py-3 pt-[max(0.625rem,env(safe-area-inset-top))] pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))]">
      {/* Left: back + breadcrumb + title */}
      <div className="pointer-events-auto flex min-w-0 items-center gap-2">
        <button
          onClick={() => router.push(`/${locale}/learn`)}
          className="flex h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl transition-colors hover:bg-black/8 dark:hover:bg-white/8 active:scale-95"
          aria-label={t('back')}
        >
          <ArrowLeft size={20} />
        </button>
        <div className="min-w-0 max-w-[150px] xs:max-w-[200px] sm:max-w-xs md:max-w-md">
          <div className="flex items-center gap-1.5 opacity-50">
            <BookOpen size={10} />
            <span className="truncate text-[9px] font-bold uppercase tracking-widest">
              {t('productKnowledge')}
            </span>
          </div>
          <h1 className="truncate text-xs font-bold leading-tight sm:text-sm">{title}</h1>
        </div>
      </div>

      {/* Right: agent pill + lang switcher */}
      <div className="pointer-events-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
        {isControlledByOthers && session?.active && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-1.5 sm:gap-2 rounded-xl bg-red-500 px-2.5 py-1.5 text-[10px] font-black uppercase text-white shadow-lg"
          >
            <Radio size={12} className="animate-pulse" />
            <span className="truncate max-w-[90px] sm:max-w-none">LIVE: {session.trainerName}</span>
          </motion.div>
        )}

        {(user?.name || agentName) && (
          <div className="hidden items-center gap-1.5 rounded-xl border border-black/5 bg-black/5 px-2.5 py-1.5 dark:border-white/5 dark:bg-white/5 sm:flex">
            <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <User size={11} />
            </div>
            <span className="text-xs font-black truncate max-w-[120px]">{user?.name || agentName}</span>
          </div>
        )}

        <div className="flex gap-0.5 rounded-xl border border-black/5 bg-black/5 p-1 dark:border-white/5 dark:bg-white/5">
          {(['th', 'en'] as const).map((l) => (
            <button
              key={l}
              onClick={() => onLangChange(l)}
              className={`min-h-[36px] min-w-[36px] sm:min-h-[32px] sm:min-w-[32px] flex items-center justify-center rounded-lg px-2.5 py-1 text-xs font-bold transition-all active:scale-95 ${
                lang === l
                  ? 'bg-background text-primary shadow-sm shadow-black/5'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label={`Switch language to ${l.toUpperCase()}`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
