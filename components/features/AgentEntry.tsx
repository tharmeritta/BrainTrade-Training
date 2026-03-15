'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Loader2, AlertCircle, Users, Award, Layers, User } from 'lucide-react';

interface AgentOption { id: string; name: string; }
interface AgentEntryProps { onAgentSelected: (id: string, name: string) => void; }

const STATS = [
  { Icon: Users,  value: '100+', label: 'เอเจนต์' },
  { Icon: Award,  value: '89%',  label: 'ผ่านการทดสอบ' },
  { Icon: Layers, value: '5',    label: 'โมดูล' },
];

const MODULES = [
  { emoji: '📚', label: 'ผลิตภัณฑ์' },
  { emoji: '⚙️', label: 'กระบวนการ' },
  { emoji: '💳', label: 'ชำระเงิน'  },
  { emoji: '🤖', label: 'AI Eval'   },
  { emoji: '🎯', label: 'Pitch'     },
];

const C = {
  bg:     '#070D1A',
  border: 'rgba(0,180,216,0.12)',
  cyan:   '#00B4D8',
  text:   '#E8F4FF',
  muted:  '#3D6080',
  dim:    '#1A3A55',
};

export default function AgentEntry({ onAgentSelected }: AgentEntryProps) {
  const [agents, setAgents]     = useState<AgentOption[]>([]);
  const [name, setName]         = useState('');
  const [loading, setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/agents')
      .then(r => r.json())
      .then(d => setAgents(d.agents ?? []))
      .catch(() => {/* fail silently — validate on submit */})
      .finally(() => setLoading(false));

    // auto-focus the input
    setTimeout(() => inputRef.current?.focus(), 400);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || submitting) return;
    setSubmitting(true);
    setError('');

    // Simulate a brief loading feel
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

  return (
    <div
      className="h-screen w-screen overflow-hidden flex"
      style={{ background: C.bg, fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute rounded-full"
          style={{ width: 500, height: 500, top: -120, left: -120,
            background: 'radial-gradient(circle, rgba(0,180,216,0.1) 0%, transparent 70%)' }}
          animate={{ x: [0, 40, 0], y: [0, 55, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', repeatType: 'mirror' }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{ width: 360, height: 360, bottom: -60, left: '42%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)' }}
          animate={{ x: [0, -30, 0], y: [0, -40, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', repeatType: 'mirror' }}
        />
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.022,
          backgroundImage: `linear-gradient(${C.cyan} 1px, transparent 1px), linear-gradient(90deg, ${C.cyan} 1px, transparent 1px)`,
          backgroundSize: '56px 56px',
        }} />
      </div>

      {/* LEFT — Branding */}
      <motion.div
        className="relative z-10 hidden lg:flex flex-col w-[56%] px-10 py-8"
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="shrink-0 mb-4">
          <span className="font-black text-base tracking-tight" style={{ color: C.text }}>BrainTrade</span>
          <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full font-medium tracking-widest uppercase"
            style={{ background: 'rgba(0,180,216,0.1)', border: `1px solid rgba(0,180,216,0.2)`, color: C.cyan }}>
            Training
          </span>
        </div>

        <div className="flex-1 flex flex-col justify-center min-h-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.65 }}
          >
            <p className="text-[10px] font-semibold tracking-[0.22em] uppercase mb-2" style={{ color: C.cyan }}>
              Sales Excellence Academy
            </p>
            <h1 className="font-black leading-[0.88] mb-3"
              style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3.2rem)', color: C.text }}>
              เสริมทักษะ
              <br />
              <span style={{
                background: `linear-gradient(90deg, ${C.cyan} 0%, #7C3AED 100%)`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>การขาย</span>
              <br />
              ของคุณ
            </h1>
            <p className="text-sm leading-relaxed max-w-[360px]" style={{ color: C.muted }}>
              โปรแกรมฝึกอบรมพัฒนาทักษะการขาย ผ่านการเรียนรู้แบบโต้ตอบและ AI ที่ชาญฉลาด
            </p>
          </motion.div>

          <motion.div className="flex gap-6 mt-5"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            {STATS.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(0,180,216,0.1)', border: '1px solid rgba(0,180,216,0.18)' }}>
                  <s.Icon size={13} style={{ color: C.cyan }} />
                </div>
                <div>
                  <div className="text-base font-black leading-none" style={{ color: C.text }}>{s.value}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: C.muted }}>{s.label}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div className="flex items-center gap-2 flex-wrap shrink-0"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
          <span className="text-[10px] mr-1" style={{ color: C.dim }}>โมดูล</span>
          {MODULES.map((m, i) => (
            <span key={i} className="flex items-center gap-1.5 text-[10px] px-2.5 py-0.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', color: C.muted }}>
              <span className="text-xs">{m.emoji}</span>{m.label}
            </span>
          ))}
        </motion.div>
      </motion.div>

      {/* RIGHT — Login card */}
      <motion.div
        className="relative z-10 flex-1 flex items-center justify-center px-5"
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="w-full max-w-[380px]" style={{
          background: 'rgba(10,20,36,0.92)',
          border: `1px solid ${C.border}`,
          borderRadius: 24,
          backdropFilter: 'blur(20px)',
          boxShadow: '0 24px 72px rgba(0,0,0,0.5)',
          padding: '32px',
        }}>
          {/* Icon */}
          <motion.div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
            style={{ background: 'rgba(0,180,216,0.1)', border: '1px solid rgba(0,180,216,0.2)' }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 20 }}
          >
            <User size={22} style={{ color: C.cyan }} />
          </motion.div>

          {/* Heading */}
          <div className="mb-6">
            <h2 className="text-xl font-black mb-1" style={{ color: C.text }}>ยินดีต้อนรับ</h2>
            <p className="text-xs leading-relaxed" style={{ color: C.muted }}>
              กรอกชื่อของคุณเพื่อเข้าสู่ระบบฝึกอบรม
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5"
                style={{ color: C.muted }}>ชื่อ-นามสกุล</label>
              <input
                ref={inputRef}
                type="text"
                value={name}
                onChange={e => { setName(e.target.value); setError(''); }}
                placeholder="กรอกชื่อของคุณ..."
                autoComplete="off"
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: error
                    ? '1px solid rgba(248,113,113,0.5)'
                    : '1px solid rgba(255,255,255,0.08)',
                  color: C.text,
                  opacity: loading ? 0.6 : 1,
                }}
                onFocus={e => {
                  if (!error) e.currentTarget.style.borderColor = `${C.cyan}50`;
                }}
                onBlur={e => {
                  if (!error) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                }}
              />
            </div>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
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
              disabled={!name.trim() || submitting || loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all"
              style={{
                background: name.trim() && !loading
                  ? `linear-gradient(135deg, ${C.cyan}, #0055F0)`
                  : 'rgba(255,255,255,0.04)',
                color: name.trim() && !loading ? '#fff' : C.dim,
                cursor: name.trim() && !loading ? 'pointer' : 'not-allowed',
                boxShadow: name.trim() && !loading ? `0 6px 20px rgba(0,180,216,0.22)` : 'none',
              }}
              whileHover={name.trim() && !loading ? { scale: 1.01 } : {}}
              whileTap={name.trim() && !loading ? { scale: 0.98 } : {}}
            >
              {submitting
                ? <Loader2 size={15} className="animate-spin" />
                : loading
                ? <><Loader2 size={13} className="animate-spin" /><span>กำลังโหลด...</span></>
                : <><span>เข้าสู่ระบบ</span><ArrowRight size={14} /></>}
            </motion.button>
          </form>

          {/* Footer */}
          <div className="mt-5 pt-4 flex items-center justify-between"
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <span className="text-[10px]" style={{ color: C.dim }}>
              ไม่พบชื่อ? ติดต่อผู้จัดการ
            </span>
            <a href="/login" className="text-[10px] transition-opacity hover:opacity-80"
              style={{ color: C.muted }}>
              Admin / Evaluator →
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
