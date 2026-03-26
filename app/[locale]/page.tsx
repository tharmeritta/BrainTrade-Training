'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Users, ShieldCheck, ArrowRight, BookOpen, Bot, GraduationCap } from 'lucide-react';
import { BackgroundEffects } from '@/components/ui/BackgroundEffects';
import LangToggle from '@/components/ui/LangToggle';
import { FADE_IN, STAGGER_CONTAINER, STAGGER_ITEM, EASE } from '@/lib/animations';

const CYAN = '#00B4D8';
const PURPLE = '#7C3AED';

export default function LandingPage() {
  const t = useTranslations('landing');
  const params = useParams();
  const locale = params.locale as string;

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden flex flex-col" style={{ background: 'var(--hub-bg)', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <BackgroundEffects />
      
      {/* Header with Lang Toggle */}
      <header className="relative z-20 flex items-center justify-between px-6 py-4 lg:px-12">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-sm shadow-lg"
            style={{ background: `linear-gradient(135deg, ${CYAN}, ${PURPLE})` }}>B</div>
          <span className="text-sm font-black tracking-tight" style={{ color: 'var(--hub-text)' }}>BrainTrade</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="p-1 rounded-xl glass border-white/10">
            <LangToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10">
        <motion.div 
          variants={STAGGER_CONTAINER}
          initial="initial"
          animate="animate"
          className="w-full max-w-4xl text-center mb-16"
        >
          <motion.div variants={FADE_IN} className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 backdrop-blur-sm mb-6">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-brand-cyan" />
            <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-brand-cyan">Sales Excellence Academy</span>
          </motion.div>

          <motion.h1 
            variants={FADE_IN}
            className="text-4xl md:text-6xl font-black leading-[1.1] tracking-tight text-[color:var(--hub-text)] mb-6"
            dangerouslySetInnerHTML={{ __html: t.raw('title') }}
          />
          
          <motion.p 
            variants={FADE_IN}
            className="text-base md:text-xl font-medium max-w-2xl mx-auto opacity-80" 
            style={{ color: 'var(--hub-muted)' }}
          >
            {t('subtitle')}
          </motion.p>
        </motion.div>

        <motion.div 
          variants={STAGGER_CONTAINER}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl"
        >
          {/* Agent Entry Card */}
          <motion.div variants={STAGGER_ITEM}>
            <Link href={`/${locale}/dashboard`} className="group block h-full">
              <div 
                className="h-full p-8 rounded-[32px] transition-all duration-500 relative overflow-hidden flex flex-col items-start text-left"
                style={{ 
                  background: 'var(--hub-card)', 
                  border: '1px solid var(--hub-border)',
                  boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)'
                }}
              >
                {/* Hover Glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(circle at 50% 0%, ${CYAN}15, transparent 70%)` }} />
                
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-brand-cyan/10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Users size={28} className="text-brand-cyan" />
                </div>
                
                <h2 className="text-2xl font-black mb-3 group-hover:text-brand-cyan transition-colors" style={{ color: 'var(--hub-text)' }}>
                  {t('agentTitle')}
                </h2>
                
                <p className="text-sm font-medium mb-8 opacity-70 flex-1" style={{ color: 'var(--hub-muted)' }}>
                  {t('agentDesc')}
                </p>
                
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-brand-cyan">
                  {t('agentBtn')}
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </div>

                {/* Decorative icons at bottom */}
                <div className="absolute bottom-4 right-8 flex gap-3 opacity-10 grayscale group-hover:grayscale-0 group-hover:opacity-30 transition-all duration-500">
                  <BookOpen size={20} />
                  <Bot size={20} />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Staff Login Card */}
          <motion.div variants={STAGGER_ITEM}>
            <Link href={`/${locale}/login`} className="group block h-full">
              <div 
                className="h-full p-8 rounded-[32px] transition-all duration-500 relative overflow-hidden flex flex-col items-start text-left"
                style={{ 
                  background: 'var(--hub-card)', 
                  border: '1px solid var(--hub-border)',
                  boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)'
                }}
              >
                {/* Hover Glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(circle at 50% 0%, ${PURPLE}15, transparent 70%)` }} />

                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-purple-500/10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <ShieldCheck size={28} className="text-purple-400" />
                </div>
                
                <h2 className="text-2xl font-black mb-3 group-hover:text-purple-400 transition-colors" style={{ color: 'var(--hub-text)' }}>
                  {t('staffTitle')}
                </h2>
                
                <p className="text-sm font-medium mb-8 opacity-70 flex-1" style={{ color: 'var(--hub-muted)' }}>
                  {t('staffDesc')}
                </p>
                
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-purple-400">
                  {t('staffBtn')}
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </div>

                {/* Decorative icons at bottom */}
                <div className="absolute bottom-4 right-8 flex gap-3 opacity-10 grayscale group-hover:grayscale-0 group-hover:opacity-30 transition-all duration-500">
                  <GraduationCap size={20} />
                </div>
              </div>
            </Link>
          </motion.div>
        </motion.div>
      </main>

      <footer className="relative z-10 p-8 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40" style={{ color: 'var(--hub-text)' }}>
          {t('footer')}
        </p>
      </footer>
    </div>
  );
}
