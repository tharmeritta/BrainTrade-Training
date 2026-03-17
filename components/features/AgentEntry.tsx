'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Loader2, AlertCircle, Users, Award, Layers, User,
  BookOpen, Settings, CreditCard, Bot, Target, Zap,
} from 'lucide-react';

interface AgentOption { id: string; name: string; }
interface AgentEntryProps { onAgentSelected: (id: string, name: string) => void; }

const STATS_CONFIG = [
  { Icon: Users,  target: 100, suffix: '+', label: 'เอเจนต์' },
  { Icon: Award,  target: 89,  suffix: '%', label: 'ผ่านการทดสอบ' },
  { Icon: Layers, target: 5,   suffix: '',  label: 'โมดูล' },
];

const MODULES = [
  { Icon: BookOpen,   label: 'ผลิตภัณฑ์', color: '#818CF8', bg: 'rgba(129,140,248,0.1)' },
  { Icon: Settings,   label: 'กระบวนการ', color: '#22D3EE', bg: 'rgba(34,211,238,0.1)'  },
  { Icon: CreditCard, label: 'ชำระเงิน',  color: '#60A5FA', bg: 'rgba(96,165,250,0.1)'  },
  { Icon: Bot,        label: 'AI Eval',   color: '#A78BFA', bg: 'rgba(167,139,250,0.1)' },
  { Icon: Target,     label: 'Pitch',     color: '#F472B6', bg: 'rgba(244,114,182,0.1)' },
];

const CYAN = '#00B4D8';

function getInitials(n: string) {
  const parts = n.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function StatCounter({ target, suffix, delay }: { target: number; suffix: string; delay: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      const start = Date.now();
      const duration = 1400;
      const tick = () => {
        const p = Math.min((Date.now() - start) / duration, 1);
        setCount(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(t);
  }, [target, delay]);
  return <>{count}{suffix}</>;
}

export default function AgentEntry({ onAgentSelected }: AgentEntryProps) {
  const [agents, setAgents]             = useState<AgentOption[]>([]);
  const [name, setName]                 = useState('');
  const [loading, setLoading]           = useState(true);
  const [submitting, setSubmitting]     = useState(false);
  const [error, setError]               = useState('');
  const [returning, setReturning]       = useState<{ id: string; name: string } | null>(null);
  const [inputFocused, setInputFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedId   = localStorage.getItem('brainstrade_agent_id');
    const savedName = localStorage.getItem('brainstrade_agent_name');
    if (savedId && savedName) setReturning({ id: savedId, name: savedName });

    fetch('/api/agents')
      .then(r => r.json())
      .then(d => setAgents(d.agents ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));

    setTimeout(() => inputRef.current?.focus(), 400);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || submitting) return;
    setSubmitting(true);
    setError('');
    await new Promise(r => setTimeout(r, 350));
    const match = agents.find(
      a => a.name.trim().toLowerCase() === name.trim().toLowerCase()
    );
    if (!match) {
      setError('ไม่พบชื่อนี้ในระบบ กรุณาตรวจสอบและลองใหม่อีกครั้ง');
      setSubmitting(false);
      return;
    }
    localStorage.setItem('brainstrade_agent_id', match.id);
    localStorage.setItem('brainstrade_agent_name', match.name);
    onAgentSelected(match.id, match.name);
  }

  const canSubmit  = !!name.trim() && !loading;
  const initials   = name.trim().length >= 2 ? getInitials(name) : null;
  const floatLabel = inputFocused || !!name.trim();

  return (
    <div
      className="relative w-full h-full overflow-y-auto flex flex-col items-center justify-center px-4 py-10"
      style={{ background: 'var(--hub-bg)', fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute rounded-full"
          style={{ width: 600, height: 600, top: -150, left: -150,
            background: 'radial-gradient(circle, rgba(0,180,216,0.08) 0%, transparent 70%)' }}
          animate={{ x: [0, 40, 0], y: [0, 55, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', repeatType: 'mirror' }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{ width: 400, height: 400, bottom: -80, right: -80,
            background: 'radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%)' }}
          animate={{ x: [0, -30, 0], y: [0, -40, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', repeatType: 'mirror' }}
        />
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.012,
          backgroundImage: `linear-gradient(var(--hub-grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--hub-grid-color) 1px, transparent 1px)`,
          backgroundSize: '56px 56px',
        }} />
      </div>

      {/* Hero text */}
      <motion.div
        className="relative z-10 text-center mb-7 max-w-[480px]"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
      >
        <p className="text-[10px] font-semibold tracking-[0.22em] uppercase mb-2" style={{ color: CYAN }}>
          Sales Excellence Academy
        </p>
        <h1 className="font-black leading-tight mb-2" style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', color: 'var(--hub-text)' }}>
          เสริมทักษะ{' '}
          <span style={{
            background: `linear-gradient(90deg, ${CYAN} 0%, #7C3AED 100%)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>การขาย</span>
          {' '}ของคุณ
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--hub-muted)' }}>
          โปรแกรมฝึกอบรมพัฒนาทักษะการขาย ผ่านการเรียนรู้แบบโต้ตอบและ AI ที่ชาญฉลาด
        </p>
      </motion.div>

      {/* Stats row */}
      <motion.div
        className="relative z-10 flex gap-3 mb-7"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.45 }}
      >
        {STATS_CONFIG.map((s, i) => (
          <div
            key={i}
            className="flex flex-col items-center py-3 px-5 rounded-2xl text-center"
            style={{
              background: 'var(--hub-card)',
              border: '1px solid var(--hub-border)',
              minWidth: 84,
            }}
          >
            <div className="text-xl font-black leading-none mb-1" style={{ color: 'var(--hub-text)' }}>
              <StatCounter target={s.target} suffix={s.suffix} delay={250 + i * 130} />
            </div>
            <div className="w-5 h-5 rounded-md flex items-center justify-center mb-0.5"
              style={{ background: 'rgba(0,180,216,0.1)' }}>
              <s.Icon size={10} style={{ color: CYAN }} />
            </div>
            <div className="text-[10px]" style={{ color: 'var(--hub-muted)' }}>{s.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Login card — gradient border wrapper */}
      <motion.div
        className="relative z-10 w-full max-w-[400px]"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div style={{
          background: `linear-gradient(135deg, rgba(0,180,216,0.4), rgba(124,58,237,0.3), rgba(0,180,216,0.2))`,
          borderRadius: 25,
          padding: 1,
          boxShadow: '0 20px 60px rgba(0,0,0,0.12), 0 0 40px rgba(0,180,216,0.06)',
        }}>
          <div style={{
            background: 'var(--entry-card-bg)',
            borderRadius: 24,
            backdropFilter: 'blur(20px)',
            overflow: 'hidden',
          }}>
            {/* Top accent strip */}
            <div style={{
              height: 3,
              background: `linear-gradient(90deg, ${CYAN} 0%, #7C3AED 50%, ${CYAN} 100%)`,
            }} />

            <div style={{ padding: '24px 28px 28px' }}>

              {/* Returning user banner */}
              <AnimatePresence>
                {returning && (
                  <motion.div
                    key="returning"
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="rounded-2xl p-3.5" style={{
                      background: 'rgba(0,180,216,0.06)',
                      border: '1px solid rgba(0,180,216,0.18)',
                    }}>
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-black"
                          style={{ background: `linear-gradient(135deg, ${CYAN}, #7C3AED)`, color: '#fff' }}
                        >
                          {getInitials(returning.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: CYAN }}>
                            ยินดีต้อนรับกลับมา
                          </div>
                          <div className="text-sm font-bold truncate" style={{ color: 'var(--hub-text)' }}>
                            {returning.name}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <motion.button
                          onClick={() => onAgentSelected(returning.id, returning.name)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold"
                          style={{
                            background: `linear-gradient(135deg, ${CYAN}, #0055F0)`,
                            color: '#fff',
                            boxShadow: `0 4px 12px rgba(0,180,216,0.25)`,
                          }}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <Zap size={11} />
                          ดำเนินการต่อ
                        </motion.button>
                        <button
                          onClick={() => setReturning(null)}
                          className="px-3 py-2 rounded-xl text-xs font-medium transition-opacity hover:opacity-70"
                          style={{
                            background: 'var(--entry-input-bg)',
                            color: 'var(--hub-muted)',
                            border: '1px solid var(--hub-border)',
                          }}
                        >
                          เปลี่ยน
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <div className="flex-1 h-px" style={{ background: 'var(--hub-border)' }} />
                      <span className="text-[9px] font-medium uppercase tracking-widest" style={{ color: 'var(--hub-dim)' }}>
                        หรือเข้าสู่ระบบใหม่
                      </span>
                      <div className="flex-1 h-px" style={{ background: 'var(--hub-border)' }} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Avatar / initials */}
              <div className="flex items-center gap-3 mb-5">
                <motion.div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-black shrink-0 overflow-hidden"
                  style={{
                    background: initials ? `linear-gradient(135deg, ${CYAN}, #7C3AED)` : 'rgba(0,180,216,0.1)',
                    border: '1px solid rgba(0,180,216,0.2)',
                    transition: 'background 0.3s',
                  }}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.25, type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <AnimatePresence mode="wait">
                    {initials ? (
                      <motion.span key="initials" style={{ color: '#fff' }}
                        initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.12 }}>
                        {initials}
                      </motion.span>
                    ) : (
                      <motion.div key="icon"
                        initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.12 }}>
                        <User size={20} style={{ color: CYAN }} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
                <div>
                  <h2 className="text-base font-black leading-tight" style={{ color: 'var(--hub-text)' }}>ยินดีต้อนรับ</h2>
                  <p className="text-xs" style={{ color: 'var(--hub-muted)' }}>กรอกชื่อเพื่อเข้าสู่ระบบฝึกอบรม</p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">

                {/* Floating label input */}
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={name}
                    onChange={e => { setName(e.target.value); setError(''); }}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    autoComplete="off"
                    disabled={loading}
                    className="w-full px-4 rounded-xl text-sm outline-none transition-all"
                    style={{
                      paddingTop: floatLabel ? 20 : 13,
                      paddingBottom: 12,
                      background: 'var(--entry-input-bg)',
                      border: error
                        ? '1px solid rgba(248,113,113,0.5)'
                        : inputFocused ? `1px solid ${CYAN}60`
                        : '1px solid var(--hub-border)',
                      color: 'var(--hub-text)',
                      opacity: loading ? 0.6 : 1,
                      boxShadow: inputFocused && !error ? `0 0 0 3px rgba(0,180,216,0.08)` : 'none',
                    }}
                  />
                  <motion.label
                    animate={{ top: floatLabel ? 7 : 13, fontSize: floatLabel ? '10px' : '14px' }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-4 font-medium pointer-events-none"
                    style={{ color: floatLabel ? CYAN : 'var(--hub-muted)', lineHeight: 1 }}
                  >
                    ชื่อ-นามสกุล
                  </motion.label>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}
                      className="flex items-start gap-2 px-3 py-2.5 rounded-xl"
                      style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}
                    >
                      <AlertCircle size={14} className="shrink-0 mt-0.5" style={{ color: '#F87171' }} />
                      <span className="text-xs leading-relaxed" style={{ color: '#F87171' }}>{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={!canSubmit || submitting}
                  className="group w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm"
                  style={{
                    background: canSubmit ? `linear-gradient(135deg, ${CYAN}, #0055F0)` : 'var(--hub-locked-bg)',
                    color: canSubmit ? '#fff' : 'var(--hub-dim)',
                    cursor: canSubmit ? 'pointer' : 'not-allowed',
                    boxShadow: canSubmit ? `0 6px 20px rgba(0,180,216,0.22)` : 'none',
                  }}
                  whileHover={canSubmit ? { scale: 1.01 } : {}}
                  whileTap={canSubmit ? { scale: 0.98 } : {}}
                >
                  {submitting
                    ? <Loader2 size={15} className="animate-spin" />
                    : loading
                    ? <><Loader2 size={13} className="animate-spin" /><span>กำลังโหลด...</span></>
                    : <>
                        <span>เข้าสู่ระบบ</span>
                        <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
                      </>}
                </motion.button>
              </form>

              {/* Footer */}
              <div className="mt-4 pt-4 flex items-center justify-between"
                style={{ borderTop: '1px solid var(--hub-border)' }}>
                <span className="text-[10px]" style={{ color: 'var(--hub-dim)' }}>
                  ไม่พบชื่อ? ติดต่อผู้จัดการ
                </span>
                <a href="/login" className="text-[10px] transition-opacity hover:opacity-80"
                  style={{ color: 'var(--hub-muted)' }}>
                  Admin / Evaluator →
                </a>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Module chips */}
      <motion.div
        className="relative z-10 flex items-center gap-2 flex-wrap justify-center mt-6"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
      >
        <span className="text-[10px] mr-1" style={{ color: 'var(--hub-dim)' }}>หลักสูตร</span>
        {MODULES.map((m, i) => (
          <motion.span
            key={i}
            className="flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full"
            style={{ background: m.bg, border: `1px solid ${m.color}25`, color: m.color }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.38 + i * 0.05 }}
          >
            <m.Icon size={10} />
            {m.label}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}
