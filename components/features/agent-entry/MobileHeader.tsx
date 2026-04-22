'use client';

import { motion } from 'framer-motion';
import { BookOpen, Settings, Bot, LucideIcon } from 'lucide-react';
import { FADE_IN, STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/animations';

interface ModuleChip {
  Icon: LucideIcon;
  labelKey: string;
  color: string;
  bg: string;
}

const MODULES: ModuleChip[] = [
  { Icon: BookOpen,   labelKey: 'product', color: '#818CF8', bg: 'rgba(129,140,248,0.12)' },
  { Icon: Settings,   labelKey: 'process', color: '#22D3EE', bg: 'rgba(34,211,238,0.12)'  },
  { Icon: Bot,        labelKey: 'aiEval',   color: '#A78BFA', bg: 'rgba(167,139,250,0.12)' },
];

interface MobileHeaderProps {
  appName: string;
  titleHtml: string;
  t: (key: string) => string;
}

export function MobileHeader({ appName, titleHtml, t }: MobileHeaderProps) {
  return (
    <>
      {/* Mobile-only header */}
      <motion.div variants={FADE_IN} className="lg:hidden mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 mb-4">
          <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-brand-cyan" />
          <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-brand-cyan">{appName}</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--hub-text)' }}
          dangerouslySetInnerHTML={{ __html: titleHtml }}
        />
      </motion.div>

      {/* This part usually goes at the bottom of the container in the original file, 
          but we'll keep it as a logical unit for mobile branding */}
    </>
  );
}

export function MobileModuleChips({ t }: { t: (key: string) => string }) {
  return (
    <motion.div 
      variants={STAGGER_CONTAINER}
      className="lg:hidden flex flex-wrap gap-2.5 justify-center mt-8"
    >
      {MODULES.map((m, i) => (
        <motion.span 
          key={i} 
          variants={STAGGER_ITEM}
          className="flex items-center gap-2 text-[10px] font-bold px-3.5 py-1.5 rounded-full shadow-sm" 
          style={{ background: m.bg, border: `1px solid ${m.color}25`, color: m.color }}
        >
          <m.Icon size={12} />{t(m.labelKey)}
        </motion.span>
      ))}
    </motion.div>
  );
}
