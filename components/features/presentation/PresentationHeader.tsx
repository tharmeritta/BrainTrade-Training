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
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-2 px-3 py-2.5 sm:px-4 sm:py-3">
      {/* Left: back + breadcrumb + title */}
      <div className="pointer-events-auto flex min-w-0 items-center gap-2">
        <button
          onClick={() => router.push(`/${locale}/learn`)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors hover:bg-black/8 dark:hover:bg-white/8"
          aria-label={t('back')}
        >
          <ArrowLeft size={18} />
        </button>
        <div className="min-w-0">
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
      <div className="pointer-events-auto flex shrink-0 items-center gap-2">
        {isControlledByOthers && session?.active && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 rounded-xl bg-red-500 px-3 py-1.5 text-[10px] font-black uppercase text-white shadow-lg"
          >
            <Radio size={12} className="animate-pulse" />
            <span>LIVE: {session.trainerName}</span>
          </motion.div>
        )}

        {(user?.name || agentName) && (
          <div className="hidden items-center gap-1.5 rounded-xl border border-black/5 bg-black/5 px-2.5 py-1.5 dark:border-white/5 dark:bg-white/5 sm:flex">
            <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <User size={11} />
            </div>
            <span className="text-xs font-black">{user?.name || agentName}</span>
          </div>
        )}

        <div className="flex gap-0.5 rounded-xl border border-black/5 bg-black/5 p-1 dark:border-white/5 dark:bg-white/5">
          {(['th', 'en'] as const).map((l) => (
            <button
              key={l}
              onClick={() => onLangChange(l)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                lang === l
                  ? 'bg-background text-primary shadow-sm shadow-black/5'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
