'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Users, Award, Layers, BookOpen, Settings, Bot, CheckCircle2 } from 'lucide-react';
import { StatCounter } from '@/components/ui/StatCounter';
import { BrandedTitle } from '@/components/ui/BrandedTitle';
import { FADE_IN, STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/animations';
import { FloatingDecoration } from './FloatingDecoration';

const STATS_CONFIG = [
  { Icon: Users,  target: 100, suffix: '+', labelKey: 'agents' },
  { Icon: Award,  target: 89,  suffix: '%', labelKey: 'passed' },
  { Icon: Layers, target: 3,   suffix: '',  labelKey: 'modules' },
];

const MODULES = [
  { Icon: BookOpen,   labelKey: 'product', color: '#818CF8', bg: 'rgba(129,140,248,0.12)' },
  { Icon: Settings,   labelKey: 'process', color: '#22D3EE', bg: 'rgba(34,211,238,0.12)'  },
  { Icon: Bot,        labelKey: 'aiEval',   color: '#A78BFA', bg: 'rgba(167,139,250,0.12)' },
];

export const BrandingPanel = () => {
  const t = useTranslations();
  const tEntry = useTranslations('agentEntry');
  const trustPoints = tEntry.raw('trustPoints') as string[];

  return (
    <div className="relative hidden lg:flex flex-col justify-between flex-1 overflow-hidden px-12 py-12">
      <FloatingDecoration />
      
      <motion.div 
        variants={FADE_IN}
        className="relative z-10"
      >
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 backdrop-blur-sm">
          <div className="relative w-2 h-2">
            <div className="absolute inset-0 rounded-full animate-ping bg-brand-cyan/60" />
            <div className="relative w-2 h-2 rounded-full bg-brand-cyan shadow-[0_0_8px_rgba(0,180,216,0.6)]" />
          </div>
          <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-brand-cyan">{t('common.appName')}</span>
        </div>
      </motion.div>

      <div className="relative z-10 flex flex-col gap-10">
        <motion.div variants={FADE_IN}>
          <h1 className="text-5xl xl:text-6xl font-black leading-[1.1] tracking-tight text-[color:var(--hub-text)] mb-4"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.05))' }}
          >
            {tEntry.rich('title', {
              highlight: (chunks) => <BrandedTitle type="gradient">{chunks}</BrandedTitle>
            })}
          </h1>
          <p className="text-base leading-relaxed max-w-[380px] font-medium" style={{ color: 'var(--hub-muted)' }}>
            {tEntry('subtitle')}
          </p>
        </motion.div>

        <motion.div 
          variants={STAGGER_CONTAINER}
          className="flex gap-4"
        >
          {STATS_CONFIG.map((s, i) => (
            <motion.div 
              key={i} 
              variants={STAGGER_ITEM} 
              whileHover={{ 
                y: -8, 
                rotateZ: i % 2 === 0 ? 1 : -1,
                scale: 1.02,
                transition: { type: 'spring', stiffness: 400, damping: 15 } 
              }}
              className="group flex flex-col py-6 px-7 rounded-[28px] transition-all duration-300" 
              style={{ 
                background: 'var(--hub-card)', 
                border: '1px solid var(--hub-border)', 
                minWidth: 110, 
                boxShadow: '0 10px 30px -10px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(255,255,255,0.02)' 
              }}
            >
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4 bg-brand-cyan/10 group-hover:bg-brand-cyan/20 group-hover:scale-110 transition-all duration-300">
                <s.Icon size={18} className="text-brand-cyan" />
              </div>
              <div className="text-3xl font-black leading-none mb-1 text-[color:var(--hub-text)] tracking-tight">
                <StatCounter target={s.target} suffix={s.suffix} delay={400 + i * 120} />
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.15em] text-[color:var(--hub-muted)] opacity-70">{tEntry(s.labelKey)}</div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          variants={STAGGER_CONTAINER}
          className="flex flex-col gap-3.5"
        >
          {trustPoints.map((pt, i) => (
            <motion.div key={i} variants={STAGGER_ITEM} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full flex items-center justify-center bg-brand-cyan/10 shrink-0">
                <CheckCircle2 size={12} className="text-brand-cyan" />
              </div>
              <span className="text-sm font-medium text-[color:var(--hub-muted)]">{pt}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <motion.div 
        variants={FADE_IN}
        className="relative z-10"
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 opacity-60" style={{ color: 'var(--hub-text)' }}>{tEntry('allCourses')}</p>
        <motion.div 
          variants={STAGGER_CONTAINER}
          className="flex flex-wrap gap-2.5"
        >
          {MODULES.map((m, i) => (
            <motion.span 
              key={i} 
              variants={STAGGER_ITEM}
              whileHover={{ scale: 1.05, y: -2 }}
              className="flex items-center gap-2 text-[11px] px-4 py-2 rounded-full font-bold shadow-sm" 
              style={{ background: m.bg, border: `1px solid ${m.color}25`, color: m.color }}
            >
              <m.Icon size={12} />
              {tEntry(m.labelKey)}
            </motion.span>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};
