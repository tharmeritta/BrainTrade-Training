'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { AgentStats } from '@/types';
import { BADGE_CONFIG } from '../AdminHelpers';

export function BadgePill({ badge }: { badge: AgentStats['badge'] }) {
  const t = useTranslations('admin');
  const c = BADGE_CONFIG[badge];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {t(`badges.${badge}`)}
    </span>
  );
}
