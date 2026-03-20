'use client';

import React from 'react';
import { User as UserIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ActiveAgentUIProps {
  agentName: string | null;
}

export const ActiveAgentUI: React.FC<ActiveAgentUIProps> = ({ agentName }) => {
  const t = useTranslations('aiEval');

  if (!agentName) return null;

  return (
    <div className="flex items-center gap-4 px-6 py-3 rounded-[24px] bg-white/50 dark:bg-white/5 backdrop-blur-md border border-black/5 dark:border-white/10 shadow-xl shadow-black/5 self-start md:self-auto">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
        <UserIcon size={18} />
      </div>
      <div>
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">
          {t('activeAgent')}
        </p>
        <p className="font-black text-base">{agentName}</p>
      </div>
    </div>
  );
};
