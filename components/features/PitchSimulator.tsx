'use client';

import { useState, useRef, useEffect } from 'react';
import type { PitchMessage } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import {
  Send, User as UserIcon, Bot, ChevronLeft, Play, Sparkles,
  CheckCircle2, Trophy, ThumbsUp, TrendingUp, RotateCcw, Loader2,
  ArrowRight, LayoutDashboard, Lock, History,
} from 'lucide-react';

const SESSION_KEY = 'brainstrade_pitch_active';

interface SavedSession {
  agentId: string;
  sessionId: string;
  level: 1 | 2 | 3;
  messages: PitchMessage[];
  savedAt: number; // ms timestamp
}

const LEVEL_COLORS: Record<1 | 2 | 3, { accent: string; glow: string; bg: string; border: string; label: string }> = {
  1: { accent: '#34D399', glow: 'rgba(52,211,153,0.18)',  bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.3)',  label: 'Beginner'     },
  2: { accent: '#60A5FA', glow: 'rgba(96,165,250,0.18)',  bg: 'rgba(96,165,250,0.08)',  border: 'rgba(96,165,250,0.3)',  label: 'Standard'     },
  3: { accent: '#F472B6', glow: 'rgba(244,114,182,0.18)', bg: 'rgba(244,114,182,0.08)', border: 'rgba(244,114,182,0.3)', label: 'Advanced'     },
};

const LEVEL_LABELS: Record<1 | 2 | 3, { th: string; desc: string }> = {
  1: { th: 'เริ่มต้น',  desc: 'ลูกค้าชาวเวียดนาม ปานกลาง' },
  2: { th: 'มาตรฐาน', desc: 'ลูกค้าหลากหลาย สถานการณ์ซับซ้อน' },
  3: { th: 'ท้าทาย',  desc: 'ลูกค้าจิตวิทยาขั้นสูง ยากที่สุด' },
};

interface Evaluation {
  reason: string;
  strengths: string[];
  weaknesses: string[];
}

export default function PitchSimulator() {
  const router   = useRouter();
  const pathname = usePathname();
  const locale   = pathname.split('/')[1] ?? 'th';

  const [level,      setLevel]      = useState<1 | 2 | 3>(1);
  const [sessionId,  setSessionId]  = useState<string | null>(null);
  const [messages,   setMessages]   = useState<PitchMessage[]>([]);
  const [input,      setInput]      = useState('');
  const [loading,    setLoading]    = useState(false);
  const [agentId,         setAgentId]         = useState<string | null>(null);
  const [agentName,       setAgentName]       = useState<string | null>(null);
  const [closedSale,      setClosedSale]      = useState(false);
  const [evaluation,      setEvaluation]      = useState<Evaluation | null>(null);
  const [evaluating,      setEvaluating]      = useState(false);
  const [completedLevels, setCompletedLevels] = useState<Set<number>>(new Set());
  const [startError,    setStartError]    = useState('');
  const [chatError,     setChatError]     = useState('');
  const [pendingResume, setPendingResume] = useState<SavedSession | null>(null);
  const bottomRef    = useRef<HTMLDivElement>(null);
  const evalAbortRef = useRef(false);

  useEffect(() => {
    const id   = localStorage.getItem('brainstrade_agent_id');
    const name = localStorage.getItem('brainstrade_agent_name');
    setAgentId(id);
    setAgentName(name);

    const local = localStorage.getItem('brainstrade_completed_levels');
    const localSet: Set<number> = local ? new Set(JSON.parse(local)) : new Set();
    if (localSet.size > 0) setCompletedLevels(localSet);

    // Check for an unfinished session — localStorage first (instant), server fallback (cross-device)
    let hasLocalSession = false;
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw && id) {
        const saved: SavedSession = JSON.parse(raw);
        const age = Date.now() - saved.savedAt;
        if (saved.agentId === id && saved.messages.length > 0 && age < 24 * 60 * 60 * 1000) {
          setPendingResume(saved);
          hasLocalSession = true;
        } else {
          localStorage.removeItem(SESSION_KEY);
        }
      }
    } catch {
      localStorage.removeItem(SESSION_KEY);
    }

    if (id) {
      fetch(`/api/agent/progress?agentId=${id}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (!data) return;
          const merged = new Set([...localSet, ...(data.pitchCompletedLevels ?? [])]);
          setCompletedLevels(merged);
          localStorage.setItem('brainstrade_completed_levels', JSON.stringify([...merged]));
        })
        .catch(() => {});

      // Server fallback — only needed if localStorage had nothing
      if (!hasLocalSession) {
        fetch(`/api/pitch/active?agentId=${id}`)
          .then(r => r.ok ? r.json() : null)
          .then(data => {
            const s = data?.session;
            if (s && s.messages?.length > 0) {
              const age = Date.now() - (s.savedAt ?? 0);
              if (age < 24 * 60 * 60 * 1000) {
                const saved: SavedSession = { agentId: id, sessionId: s.sessionId, level: s.level, messages: s.messages, savedAt: s.savedAt ?? Date.now() };
                setPendingResume(saved);
                // Repopulate localStorage from server
                localStorage.setItem(SESSION_KEY, JSON.stringify(saved));
              }
            }
          })
          .catch(() => {});
      }
    }
  }, []);

  function saveSession(sid: string, lvl: 1 | 2 | 3, msgs: PitchMessage[], id: string | null) {
    if (!id) return;
    const saved: SavedSession = { agentId: id, sessionId: sid, level: lvl, messages: msgs, savedAt: Date.now() };
    localStorage.setItem(SESSION_KEY, JSON.stringify(saved));
    // Mirror to server (fire-and-forget) so resume works across devices / cleared localStorage
    fetch('/api/pitch/active', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId: id, sessionId: sid, level: lvl, messages: msgs }),
    }).catch(() => {});
  }

  function clearSession(id?: string | null) {
    localStorage.removeItem(SESSION_KEY);
    const aid = id ?? agentId;
    if (aid) {
      fetch(`/api/pitch/active?agentId=${aid}`, { method: 'DELETE' }).catch(() => {});
    }
  }

  function resumeSession(saved: SavedSession) {
    setLevel(saved.level);
    setSessionId(saved.sessionId);
    setMessages(saved.messages);
    setClosedSale(false);
    setEvaluation(null);
    setChatError('');
    setPendingResume(null);
  }

  function syncToServer(completedSet: Set<number>, id: string | null, name: string | null) {
    if (!id) return;
    fetch('/api/agent/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: id,
        agentName: name ?? '',
        pitchCompletedLevels: [...completedSet],
      }),
    }).catch(() => {});
  }

  function markLevelCompleted(l: number) {
    setCompletedLevels(prev => {
      const next = new Set(prev);
      next.add(l);
      localStorage.setItem('brainstrade_completed_levels', JSON.stringify([...next]));
      syncToServer(next, agentId, agentName);
      return next;
    });
  }

  function isLocked(l: number) {
    if (l === 1) return false;
    return !completedLevels.has(l - 1);
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, evaluating, evaluation]);

  function abandonSession() {
    if (sessionId && messages.length > 0 && !closedSale) {
      // Fire-and-forget: compact + save the abandoned session without blocking the UI
      fetch('/api/pitch/abandon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, level, messages, agentId, agentName }),
      }).catch(() => {});
    }
    // Do NOT clear localStorage or server session — agent can resume later.
    // The resume banner will re-appear on next visit.
    evalAbortRef.current = true;
    setSessionId(null);
    setMessages([]);
    setClosedSale(false);
    setEvaluation(null);
    setChatError('');
  }

  async function startSession() {
    setLoading(true);
    setStartError('');
    evalAbortRef.current = false;
    try {
      const res = await fetch('/api/pitch/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level, agentId, agentName }),
      });
      if (!res.ok) throw new Error('Start failed');
      const data = await res.json();
      setSessionId(data.sessionId);
      setMessages([]);
      setClosedSale(false);
      setEvaluation(null);
      setEvaluating(false);
    } catch {
      setStartError('ไม่สามารถเริ่มเซสชันได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage() {
    if (!input.trim() || !sessionId || loading || closedSale) return;
    const userMsg: PitchMessage = { role: 'user', content: input, timestamp: new Date() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setChatError('');

    try {
      const res = await fetch('/api/pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, level, messages: newMessages }),
      });
      if (!res.ok) throw new Error('Send failed');
      const data = await res.json();
      const aiMsg: PitchMessage = { role: 'assistant', content: data.reply, timestamp: new Date() };
      const finalMessages = [...newMessages, aiMsg];
      setMessages(finalMessages);

      if (data.closedSale) {
        // Sale closed — no need to keep the session saved for resume
        clearSession();
        setClosedSale(true);
        setLoading(false);
        markLevelCompleted(level);
        setTimeout(async () => {
          if (evalAbortRef.current) return;
          setEvaluating(true);
          try {
            const evalRes = await fetch('/api/pitch/evaluate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ messages: finalMessages, level }),
            });
            const evalData = await evalRes.json();
            if (!evalAbortRef.current) setEvaluation(evalData);
          } finally {
            if (!evalAbortRef.current) setEvaluating(false);
          }
        }, 800);
        return;
      }
      // Persist the updated conversation so the agent can resume if they leave
      if (sessionId) saveSession(sessionId, level, finalMessages, agentId);
    } catch {
      setChatError('เกิดข้อผิดพลาดในการส่งข้อความ กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  }

  const lvlCfg = LEVEL_COLORS[level];

  /* ── Level selector screen ── */
  if (!sessionId) {
    return (
      <div
        className="min-h-screen relative"
        style={{
          background: 'var(--hub-bg)',
          fontFamily: "'DM Sans', system-ui, sans-serif",
        }}
      >
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div style={{
            position: 'absolute', width: 700, height: 700, top: -200, left: '50%', transform: 'translateX(-50%)',
            background: `radial-gradient(circle, ${lvlCfg.glow} 0%, transparent 60%)`,
            borderRadius: '50%',
            transition: 'background 0.5s',
          }} />
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.012,
            backgroundImage: `linear-gradient(var(--hub-grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--hub-grid-color) 1px, transparent 1px)`,
            backgroundSize: '56px 56px',
          }} />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-4 py-10">
          {/* Page header */}
          <motion.div
            className="mb-10"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] mb-1" style={{ color: 'var(--hub-muted)' }}>
                  Training Mission 04
                </p>
                <h1 className="text-3xl font-black tracking-tight mb-1" style={{ color: 'var(--hub-text)' }}>
                  Pitch Simulator
                </h1>
                <p className="text-sm" style={{ color: 'var(--hub-muted)' }}>
                  ทดสอบทักษะการนำเสนอของคุณกับ AI ลูกค้าจริง
                </p>
              </div>
              {agentName && (
                <div className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs"
                  style={{ background: 'var(--hub-card)', border: '1px solid var(--hub-border)', color: 'var(--hub-muted)' }}>
                  <UserIcon size={12} />
                  <span className="font-bold" style={{ color: 'var(--hub-text)' }}>{agentName}</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Resume banner */}
          <AnimatePresence>
            {pendingResume && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="mb-6 flex items-center gap-4 px-5 py-4 rounded-2xl"
                style={{
                  background: 'rgba(96,165,250,0.08)',
                  border: '1px solid rgba(96,165,250,0.3)',
                }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.25)' }}>
                  <History size={16} style={{ color: '#60A5FA' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold" style={{ color: 'var(--hub-text)' }}>
                    มีเซสชันที่ค้างอยู่
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--hub-muted)' }}>
                    Level {pendingResume.level} — {pendingResume.messages.length} ข้อความ
                    {' · '}บันทึกเมื่อ {new Date(pendingResume.savedAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => { clearSession(); setPendingResume(null); }}
                    className="text-xs px-3 py-2 rounded-xl font-semibold transition-colors"
                    style={{ color: 'var(--hub-muted)', border: '1px solid var(--hub-border)' }}
                  >
                    ทิ้ง
                  </button>
                  <motion.button
                    onClick={() => resumeSession(pendingResume)}
                    className="text-xs px-4 py-2 rounded-xl font-bold text-white transition-all"
                    style={{ background: '#60A5FA', boxShadow: '0 4px 14px rgba(96,165,250,0.35)' }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    กลับมาต่อ →
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Level cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {([1, 2, 3] as const).map((l, i) => {
              const locked    = isLocked(l);
              const completed = completedLevels.has(l);
              const selected  = level === l;
              const cfg       = LEVEL_COLORS[l];

              return (
                <motion.button
                  key={l}
                  onClick={() => !locked && setLevel(l)}
                  disabled={locked}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="relative text-left rounded-2xl p-5 transition-all duration-200 overflow-hidden"
                  style={{
                    background: locked ? 'var(--hub-locked-bg)' : selected ? cfg.bg : 'var(--hub-card)',
                    border: `1px solid ${locked ? 'var(--hub-dim-border)' : selected ? cfg.border : 'var(--hub-border)'}`,
                    opacity: locked ? 0.5 : 1,
                    boxShadow: selected && !locked ? `0 8px 32px ${cfg.glow}` : 'none',
                    cursor: locked ? 'not-allowed' : 'pointer',
                  }}
                  whileHover={!locked ? { y: -3, boxShadow: `0 12px 40px ${cfg.glow}` } : {}}
                  whileTap={!locked ? { scale: 0.98 } : {}}
                >
                  {/* Status badge */}
                  <div className="absolute top-3 right-3">
                    {locked ? (
                      <span className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ background: 'var(--hub-locked-icon)' }}>
                        <Lock size={11} style={{ color: 'var(--hub-dim)' }} />
                      </span>
                    ) : completed ? (
                      <span className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                        <CheckCircle2 size={13} style={{ color: cfg.accent }} />
                      </span>
                    ) : selected ? (
                      <span className="w-2 h-2 rounded-full animate-pulse"
                        style={{ background: cfg.accent }} />
                    ) : null}
                  </div>

                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{
                      background: locked ? 'var(--hub-locked-icon)' : `${cfg.accent}18`,
                      border: `1px solid ${locked ? 'var(--hub-dim-border)' : cfg.accent + '35'}`,
                    }}>
                    <Sparkles size={18} style={{ color: locked ? 'var(--hub-dim)' : cfg.accent }} />
                  </div>

                  {/* Text */}
                  <div className="mb-1 flex items-baseline gap-2">
                    <span className="text-base font-black" style={{ color: locked ? 'var(--hub-dim)' : 'var(--hub-text)' }}>
                      Level {l}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: locked ? 'var(--hub-dim)' : cfg.accent }}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold" style={{ color: locked ? 'var(--hub-dim)' : 'var(--hub-muted)' }}>
                    {LEVEL_LABELS[l].th}
                  </p>
                  <p className="text-[10px] mt-1" style={{ color: locked ? 'var(--hub-dim)' : 'var(--hub-muted)' }}>
                    {locked ? `ต้องผ่าน Level ${l - 1} ก่อน` : LEVEL_LABELS[l].desc}
                  </p>

                  {/* Selected indicator bar */}
                  {selected && !locked && (
                    <motion.div
                      layoutId="level-selected-bar"
                      className="absolute bottom-0 left-0 right-0 h-0.5"
                      style={{ background: cfg.accent }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Start button */}
          <motion.div
            className="flex flex-col items-center gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <motion.button
              onClick={startSession}
              disabled={loading || isLocked(level)}
              className="flex items-center gap-3 px-10 py-4 rounded-2xl font-black text-base disabled:opacity-50 transition-all"
              style={{
                background: `linear-gradient(135deg, ${lvlCfg.accent}, ${lvlCfg.accent}BB)`,
                color: '#fff',
                boxShadow: `0 8px 28px ${lvlCfg.glow}`,
              }}
              whileHover={{ scale: 1.03, boxShadow: `0 12px 40px ${lvlCfg.glow}` }}
              whileTap={{ scale: 0.97 }}
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Play size={20} className="fill-current" />}
              {loading ? 'กำลังเริ่ม...' : `เริ่ม Level ${level}`}
            </motion.button>
            {startError && (
              <p className="text-sm" style={{ color: '#F87171' }}>{startError}</p>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  /* ── Chat screen ── */
  const chatAccent = LEVEL_COLORS[level].accent;
  const chatGlow   = LEVEL_COLORS[level].glow;

  return (
    <div
      className="min-h-screen relative"
      style={{
        background: 'var(--hub-bg)',
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      {/* Subtle background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div style={{
          position: 'absolute', width: 500, height: 500, top: -100, right: -100,
          background: `radial-gradient(circle, ${chatGlow} 0%, transparent 70%)`,
          borderRadius: '50%',
        }} />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-6">
        {/* Chat card */}
        <motion.div
          className="rounded-3xl overflow-hidden flex flex-col"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: 'var(--hub-card)',
            border: `1px solid ${closedSale ? chatAccent + '40' : 'var(--hub-border)'}`,
            boxShadow: closedSale ? `0 8px 40px ${chatGlow}` : '0 4px 24px rgba(0,0,0,0.08)',
            height: closedSale ? 'auto' : 'min(700px, calc(100vh - 140px))',
            maxHeight: closedSale ? 'none' : 'min(700px, calc(100vh - 140px))',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 shrink-0"
            style={{
              borderBottom: `1px solid var(--hub-border)`,
              background: 'var(--hub-panel)',
            }}>
            <div className="flex items-center gap-3">
              {/* Level badge */}
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0"
                style={{
                  background: closedSale ? `${chatAccent}15` : `${chatAccent}12`,
                  border: `1px solid ${chatAccent}35`,
                  color: chatAccent,
                }}>
                {closedSale ? <Trophy size={18} /> : `L${level}`}
              </div>
              <div>
                <span className="font-bold text-sm" style={{ color: 'var(--hub-text)' }}>
                  Pitch Session — {LEVEL_LABELS[level].th}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full"
                    style={{
                      background: closedSale ? chatAccent : chatAccent,
                      animation: closedSale ? 'none' : 'pulse 1.5s infinite',
                    }} />
                  <span className="text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: chatAccent }}>
                    {closedSale ? 'Sale Closed ✓' : 'Live Simulation'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={abandonSession}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all"
              style={{
                color: 'var(--hub-muted)',
                border: '1px solid var(--hub-border)',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#F87171'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(248,113,113,0.4)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--hub-muted)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--hub-border)'; }}
            >
              <ChevronLeft size={14} />
              {closedSale ? 'กลับ' : 'จบการจำลอง'}
            </button>
          </div>

          {/* Messages */}
          <div
            className={`overflow-y-auto p-6 space-y-5 ${closedSale ? '' : 'flex-1'}`}
            style={{ background: 'var(--hub-bg)' }}
          >
            <AnimatePresence initial={false}>

              {/* System ready message */}
              <motion.div key="ready" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${chatAccent}15`, border: `1px solid ${chatAccent}35` }}>
                  <CheckCircle2 size={15} style={{ color: chatAccent }} />
                </div>
                <div className="max-w-[85%] rounded-2xl rounded-tl-none px-4 py-3 text-xs leading-relaxed"
                  style={{
                    background: `${chatAccent}08`,
                    border: `1px solid ${chatAccent}25`,
                    color: chatAccent,
                  }}>
                  <p className="font-bold mb-0.5">ระบบพร้อมสำหรับการจำลองการขาย Level {level} แล้ว</p>
                  <p style={{ opacity: 0.75 }}>กรุณาเริ่มทักทายลูกค้าได้เลย — AI จะตอบสนองในฐานะลูกค้าจริง</p>
                </div>
              </motion.div>

              {/* Conversation messages */}
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex items-end gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mb-0.5"
                    style={m.role === 'user'
                      ? { background: chatAccent, color: '#fff' }
                      : { background: 'var(--hub-card)', border: '1px solid var(--hub-border)', color: 'var(--hub-muted)' }
                    }>
                    {m.role === 'user' ? <UserIcon size={15} /> : <Bot size={15} />}
                  </div>
                  {/* Bubble */}
                  <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user' ? 'rounded-br-sm' : 'rounded-bl-sm'
                  }`}
                    style={m.role === 'user'
                      ? { background: chatAccent, color: '#fff' }
                      : { background: 'var(--hub-card)', border: '1px solid var(--hub-border)', color: 'var(--hub-text)' }
                    }>
                    {m.content}
                  </div>
                </motion.div>
              ))}

              {/* Sale closed banner */}
              {closedSale && (
                <motion.div
                  key="sale-closed"
                  initial={{ opacity: 0, scale: 0.88, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 16 }}
                  className="flex justify-center py-4"
                >
                  <div className="flex items-center gap-4 px-8 py-4 rounded-2xl"
                    style={{
                      background: `linear-gradient(135deg, ${chatAccent}22, ${chatAccent}0A)`,
                      border: `1px solid ${chatAccent}50`,
                      boxShadow: `0 8px 32px ${chatGlow}`,
                    }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${chatAccent}20`, border: `1px solid ${chatAccent}40` }}>
                      <Trophy size={20} style={{ color: chatAccent }} />
                    </div>
                    <div>
                      <p className="font-black text-base" style={{ color: 'var(--hub-text)' }}>ปิดการขายสำเร็จ!</p>
                      <p className="text-xs" style={{ color: 'var(--hub-muted)' }}>ลูกค้ายืนยันการซื้อและชำระเงินแล้ว</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Evaluating indicator */}
              {evaluating && (
                <motion.div
                  key="evaluating"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center gap-2 py-4"
                  style={{ color: 'var(--hub-muted)' }}
                >
                  <Loader2 size={16} className="animate-spin" style={{ color: chatAccent }} />
                  <span className="text-sm">กำลังวิเคราะห์การสนทนา...</span>
                </motion.div>
              )}

              {/* Evaluation result */}
              {evaluation && (
                <motion.div
                  key="evaluation"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-3"
                >
                  {/* Why customer purchased */}
                  <div className="rounded-2xl p-5"
                    style={{ background: 'var(--hub-card)', border: '1px solid var(--hub-border)' }}>
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.25)' }}>
                        <Sparkles size={15} style={{ color: '#FBBF24' }} />
                      </div>
                      <h3 className="font-bold text-sm" style={{ color: 'var(--hub-text)' }}>ทำไมลูกค้าถึงตัดสินใจซื้อ</h3>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--hub-muted)' }}>{evaluation.reason}</p>
                  </div>

                  {/* Strengths */}
                  <div className="rounded-2xl p-5"
                    style={{ background: 'var(--hub-card)', border: '1px solid rgba(96,165,250,0.25)' }}>
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.25)' }}>
                        <ThumbsUp size={15} style={{ color: '#60A5FA' }} />
                      </div>
                      <h3 className="font-bold text-sm" style={{ color: '#60A5FA' }}>จุดแข็ง</h3>
                    </div>
                    <ul className="space-y-2">
                      {evaluation.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--hub-text)' }}>
                          <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-black"
                            style={{ background: 'rgba(96,165,250,0.12)', color: '#60A5FA' }}>
                            {i + 1}
                          </span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div className="rounded-2xl p-5"
                    style={{ background: 'var(--hub-card)', border: '1px solid rgba(251,191,36,0.25)' }}>
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: 'rgba(251,191,36,0.10)', border: '1px solid rgba(251,191,36,0.25)' }}>
                        <TrendingUp size={15} style={{ color: '#FBBF24' }} />
                      </div>
                      <h3 className="font-bold text-sm" style={{ color: '#FBBF24' }}>สิ่งที่ควรพัฒนา</h3>
                    </div>
                    <ul className="space-y-2">
                      {evaluation.weaknesses.map((w, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--hub-text)' }}>
                          <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-black"
                            style={{ background: 'rgba(251,191,36,0.10)', color: '#FBBF24' }}>
                            {i + 1}
                          </span>
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-1">
                    <button
                      onClick={abandonSession}
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm transition-all"
                      style={{
                        background: 'var(--hub-progress-bg)',
                        border: '1px solid var(--hub-border)',
                        color: 'var(--hub-muted)',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--hub-text)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--hub-muted)'; }}
                    >
                      <RotateCcw size={15} />
                      ลองอีกครั้ง Level {level}
                    </button>

                    {level < 3 ? (
                      <button
                        onClick={() => {
                          evalAbortRef.current = true;
                          const next = (level + 1) as 2 | 3;
                          setLevel(next);
                          setSessionId(null);
                          setMessages([]);
                          setClosedSale(false);
                          setEvaluation(null);
                          setChatError('');
                        }}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all"
                        style={{
                          background: `linear-gradient(135deg, ${LEVEL_COLORS[(level + 1) as 2 | 3].accent}, ${LEVEL_COLORS[(level + 1) as 2 | 3].accent}BB)`,
                          color: '#fff',
                          boxShadow: `0 6px 20px ${LEVEL_COLORS[(level + 1) as 2 | 3].glow}`,
                        }}
                      >
                        Level {level + 1} — {LEVEL_LABELS[(level + 1) as 2 | 3].th}
                        <ArrowRight size={16} />
                      </button>
                    ) : (
                      <button
                        onClick={() => router.push(`/${locale}/dashboard`)}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all"
                        style={{
                          background: 'linear-gradient(135deg, #00B4D8, #0055F0)',
                          color: '#fff',
                          boxShadow: '0 6px 20px rgba(0,180,216,0.22)',
                        }}
                      >
                        <LayoutDashboard size={16} />
                        กลับไปหน้า Dashboard
                      </button>
                    )}
                  </div>

                  {/* Transcript */}
                  <details className="rounded-2xl overflow-hidden"
                    style={{ border: '1px solid var(--hub-border)' }}>
                    <summary className="px-5 py-3 cursor-pointer text-xs font-semibold transition-colors select-none"
                      style={{ color: 'var(--hub-muted)' }}>
                      บทสนทนาทั้งหมด ({messages.length} ข้อความ)
                    </summary>
                    <div className="border-t max-h-64 overflow-y-auto px-5 py-4 space-y-3"
                      style={{ borderColor: 'var(--hub-border)', background: 'var(--hub-bg)' }}>
                      {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className="max-w-[80%] text-xs px-3 py-2 rounded-xl leading-relaxed whitespace-pre-wrap"
                            style={m.role === 'user'
                              ? { background: chatAccent, color: '#fff' }
                              : { background: 'var(--hub-card)', border: '1px solid var(--hub-border)', color: 'var(--hub-text)' }
                            }>
                            {m.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                </motion.div>
              )}
            </AnimatePresence>

            {/* AI typing indicator */}
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-end gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'var(--hub-card)', border: '1px solid var(--hub-border)', color: 'var(--hub-muted)' }}>
                  <Bot size={15} />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1.5 items-center"
                  style={{ background: 'var(--hub-card)', border: '1px solid var(--hub-border)' }}>
                  {[0, 0.18, 0.36].map((delay, i) => (
                    <motion.div key={i}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: 'var(--hub-muted)' }}
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay }}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          {!closedSale && (
            <div className="p-4 shrink-0"
              style={{ borderTop: '1px solid var(--hub-border)', background: 'var(--hub-panel)' }}>
              {chatError && (
                <p className="text-xs text-center mb-2" style={{ color: '#F87171' }}>{chatError}</p>
              )}
              <div className="flex items-center gap-2 px-3 py-2 rounded-2xl"
                style={{
                  background: 'var(--hub-progress-bg)',
                  border: '1px solid var(--hub-border)',
                }}>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="พิมพ์ข้อความทักทายลูกค้าของคุณ..."
                  className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 px-2 py-2 text-sm"
                  style={{ color: 'var(--hub-text)' }}
                />
                <motion.button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
                  style={{
                    background: chatAccent,
                    color: '#fff',
                    boxShadow: `0 4px 12px ${chatGlow}`,
                  }}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.93 }}
                >
                  <Send size={16} />
                </motion.button>
              </div>
              <p className="text-[10px] text-center mt-2" style={{ color: 'var(--hub-dim)' }}>
                AI สวมบทบาทเป็นลูกค้าจริง — ฝึกทักษะการพิชชิ่งของคุณได้เลย
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
