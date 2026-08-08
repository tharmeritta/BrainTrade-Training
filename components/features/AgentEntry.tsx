'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Lock } from 'lucide-react';

import { BackgroundEffects } from '@/components/ui/BackgroundEffects';
import { FADE_IN, STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/animations';

// Sub-components
import { BrandingPanel } from './agent-entry/BrandingPanel';
import { ReturningUserBanner } from './agent-entry/ReturningUserBanner';
import { EntryAvatar } from './agent-entry/EntryAvatar';
import { LoginForm } from './agent-entry/LoginForm';
import { MobileHeader, MobileModuleChips } from './agent-entry/MobileHeader';
import { useAgentEntry } from './agent-entry/useAgentEntry';

const CYAN = '#00B4D8';
const PURPLE = '#7C3AED';

interface AgentEntryProps {
  onAgentSelected: (id: string, name: string, stageName: string) => void;
}

/**
 * Normalizes a name by trimming and collapsing multiple spaces.
 */
function normalizeName(n: string) {
  return n.trim().replace(/\s+/g, ' ');
}

function getInitials(n: string) {
  const parts = normalizeName(n).split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function AgentEntry({ onAgentSelected }: AgentEntryProps) {
  const t = useTranslations('agentEntry');
  const tCommon = useTranslations('common');
  
  const {
    name, setName, loading, submitting, error, setError,
    returning, handleClearReturning, inputFocused, setInputFocused,
    loginPrompt, closeLoginPrompt, features, inputRef,
    handleSubmit, handleMockupLogin, locale
  } = useAgentEntry(onAgentSelected);

  const initials = name.trim().length >= 2 ? getInitials(name) : null;

  return (
    <motion.div 
      initial="initial"
      animate="animate"
      variants={STAGGER_CONTAINER}
      className="relative w-full h-full overflow-hidden flex" 
      style={{ background: 'var(--hub-bg)', fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      <BackgroundEffects />

      <BrandingPanel />

      <div className="relative flex items-center justify-center w-full lg:w-[460px] xl:w-[500px] shrink-0 px-6 py-10 overflow-y-auto z-10">
        <div className="relative w-full max-w-[400px]">
          
          <MobileHeader 
            appName={tCommon('appName')} 
            t={t} 
          />

          <motion.div variants={FADE_IN}>
            <Link href={`/${locale}`}
              className="group inline-flex items-center gap-2 text-xs font-bold mb-6 transition-all hover:translate-x-[-4px]"
              style={{ color: 'var(--hub-muted)' }}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/10 group-hover:bg-brand-cyan/10 group-hover:border-brand-cyan/20 transition-all">
                <ArrowLeft size={14} className="group-hover:text-brand-cyan transition-colors" />
              </div>
              {t('back')}
            </Link>
          </motion.div>

          <motion.div
            variants={FADE_IN}
            className="relative group"
            style={{ 
              background: `linear-gradient(135deg, rgba(0,180,216,0.3), rgba(124,58,237,0.2), rgba(0,180,216,0.1))`, 
              borderRadius: 36, 
              padding: 1, 
              boxShadow: `0 40px 80px -20px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05), inset 0 0 20px rgba(255,255,255,0.02)`
            }}
          >
            {/* Animated border glow */}
            <motion.div 
              className="absolute -inset-[1px] rounded-[36px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
              style={{ 
                background: `linear-gradient(45deg, ${CYAN}33, ${PURPLE}33, ${CYAN}33)`,
                filter: 'blur(4px)',
                willChange: 'opacity'
              }}
            />

            <div style={{ background: 'var(--entry-card-bg)', borderRadius: 31, backdropFilter: 'blur(16px)', overflow: 'hidden', position: 'relative' }}>
              <motion.div 
                className="absolute top-0 left-0 right-0 h-[3px] z-20"
                animate={{ opacity: [0.7, 1, 0.7] }}
                style={{ 
                  backgroundImage: `linear-gradient(90deg, ${CYAN}, ${PURPLE}, ${CYAN})`,
                  backgroundSize: '200% 100%',
                  willChange: 'opacity'
                }}
                transition={{ opacity: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
              />

              <div style={{ padding: '36px 32px' }}>
                <AnimatePresence>
                  {loginPrompt && (
                    <motion.div
                      key="login-prompt"
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="mb-6"
                    >
                      <div className="flex items-start gap-3.5 px-4 py-3.5 rounded-2xl" style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.35)', boxShadow: '0 4px 15px rgba(124,58,237,0.1)' }}>
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-sm" style={{ background: 'rgba(124,58,237,0.2)' }}>
                          <Lock size={14} style={{ color: '#A78BFA' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold mb-0.5 tracking-tight" style={{ color: '#C4B5FD' }}>{t('loginRequiredTitle')}</p>
                          <p className="text-[11px] leading-relaxed font-medium" style={{ color: 'rgba(196,181,253,0.75)' }}>{t('loginRequiredDesc')}</p>
                        </div>
                        <button onClick={closeLoginPrompt} className="text-xs shrink-0 mt-0.5 opacity-40 hover:opacity-100 transition-opacity p-1" style={{ color: '#A78BFA' }}>✕</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {returning && (
                    <ReturningUserBanner
                      user={returning}
                      onContinue={() => onAgentSelected(returning.id, returning.name, returning.stageName)}
                      onClear={handleClearReturning}
                    />
                  )}
                </AnimatePresence>

                <motion.div variants={STAGGER_CONTAINER} className="flex items-center gap-5 mb-10">
                  <EntryAvatar initials={initials} />
                  <motion.div variants={STAGGER_ITEM}>
                    <h2 className="text-2xl font-black leading-tight tracking-tight text-[color:var(--hub-text)]">{t('welcome')}</h2>
                    <p className="text-sm font-bold opacity-60" style={{ color: 'var(--hub-muted)' }}>{t('loginDesc')}</p>
                  </motion.div>
                </motion.div>

                <LoginForm 
                  name={name} setName={setName} 
                  error={error} setError={setError}
                  loading={loading} submitting={submitting}
                  inputFocused={inputFocused} setInputFocused={setInputFocused}
                  inputRef={inputRef} handleSubmit={handleSubmit} t={t}
                />

                <motion.div variants={STAGGER_ITEM} className="mt-8 pt-6 flex items-center justify-between" style={{ borderTop: '1px solid var(--hub-border)' }}>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-bold opacity-60" style={{ color: 'var(--hub-text)' }}>{t('nameNotFound')}</span>
                    {features.allowMockupMode && (
                      <button 
                        type="button"
                        onClick={handleMockupLogin}
                        className="text-[11px] font-black text-brand-cyan hover:brightness-125 transition-all text-left uppercase tracking-wider"
                      >
                        {t('mockupBtn')}
                      </button>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          <MobileModuleChips t={t} />
        </div>
      </div>
    </motion.div>
  );
}
