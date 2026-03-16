'use client';

import { useState, useRef, useEffect } from 'react';
import type { PitchMessage } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import {
  Send, User as UserIcon, Bot, ChevronLeft, Play, Sparkles,
  CheckCircle2, Trophy, ThumbsUp, TrendingUp, RotateCcw, Loader2,
  ArrowRight, LayoutDashboard, Lock,
} from 'lucide-react';

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
  const [startError, setStartError] = useState('');
  const [chatError,  setChatError]  = useState('');
  const bottomRef   = useRef<HTMLDivElement>(null);
  const evalAbortRef = useRef(false);

  useEffect(() => {
    const id   = localStorage.getItem('brainstrade_agent_id');
    const name = localStorage.getItem('brainstrade_agent_name');
    setAgentId(id);
    setAgentName(name);

    // Seed from localStorage immediately (instant UX)
    const local = localStorage.getItem('brainstrade_completed_levels');
    const localSet: Set<number> = local ? new Set(JSON.parse(local)) : new Set();
    if (localSet.size > 0) setCompletedLevels(localSet);

    // Then fetch from server and merge (server is source of truth)
    if (id) {
      fetch(`/api/agent/progress?agentId=${id}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (!data) return;
          const merged = new Set([...localSet, ...(data.pitchCompletedLevels ?? [])]);
          setCompletedLevels(merged);
          localStorage.setItem('brainstrade_completed_levels', JSON.stringify([...merged]));
        })
        .catch(() => { /* silently keep localStorage data */ });
    }
  }, []);

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
    }).catch(() => { /* localStorage already updated — server sync best-effort */ });
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
        setClosedSale(true);
        setLoading(false);
        markLevelCompleted(level);
        // Fetch evaluation after a short delay so the sale message renders first
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
    } catch {
      setChatError('เกิดข้อผิดพลาดในการส่งข้อความ กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  }

  /* ── Level selector screen ── */
  if (!sessionId) {
    return (
      <div className="max-w-4xl mx-auto animate-in">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Pitch Simulator</h1>
            <p className="text-muted-foreground text-sm mt-1">ทดสอบทักษะการนำเสนอของคุณกับ AI</p>
          </div>
          {agentName && (
            <div className="text-xs text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-xl">
              Agent: <span className="font-bold text-foreground">{agentName}</span>
            </div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-[2rem] shadow-xl border border-border p-10 text-center relative"
        >
          <div className="relative z-10">
            <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Sparkles size={40} />
            </div>
            <h2 className="text-2xl font-bold mb-2">เลือกความยากเพื่อเริ่มเซสชัน</h2>
            <p className="mb-8 text-muted-foreground max-w-sm mx-auto">
              AI จะสมมติเป็นลูกค้าที่แตกต่างกันตามระดับความยากที่คุณเลือก
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-10">
              {([1, 2, 3] as const).map(l => {
                const locked    = isLocked(l);
                const completed = completedLevels.has(l);
                const selected  = level === l;
                return (
                  <button
                    key={l}
                    onClick={() => !locked && setLevel(l)}
                    disabled={locked}
                    className={`group relative px-8 py-4 rounded-2xl font-bold transition-all duration-300 border ${
                      locked
                        ? 'bg-secondary/30 text-muted-foreground/40 border-transparent cursor-not-allowed'
                        : selected
                        ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105'
                        : 'bg-secondary/50 text-muted-foreground border-transparent hover:border-primary/30 hover:bg-white'
                    }`}
                  >
                    {/* Status badge */}
                    {locked ? (
                      <span className="absolute -top-2 -right-2 w-6 h-6 bg-muted-foreground/20 rounded-full flex items-center justify-center">
                        <Lock size={12} className="text-muted-foreground/50" />
                      </span>
                    ) : completed ? (
                      <span className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                        <CheckCircle2 size={12} className="text-white" />
                      </span>
                    ) : null}

                    <span className="relative z-10 text-lg">Level {l}</span>
                    <span className="block text-[10px] opacity-60 font-medium">{LEVEL_LABELS[l].th}</span>
                    {selected && !locked && (
                      <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground whitespace-nowrap">
                        {LEVEL_LABELS[l].desc}
                      </p>
                    )}
                    {locked && (
                      <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground/50 whitespace-nowrap">
                        ต้องผ่าน Level {l - 1} ก่อน
                      </p>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={startSession}
              disabled={loading || isLocked(level)}
              className="group mt-4 flex items-center justify-center gap-2 bg-foreground text-background px-10 py-4 rounded-2xl font-bold text-lg hover:bg-primary hover:text-white transition-all duration-300 shadow-xl disabled:opacity-50"
            >
              <Play size={20} className="fill-current" />
              {loading ? 'กำลังเริ่ม...' : 'เริ่มการจำลอง'}
            </button>
            {startError && (
              <p className="mt-3 text-sm text-red-500">{startError}</p>
            )}
          </div>

          {/* Blobs in overflow-hidden wrapper so they don't clip button tooltips */}
          <div className="absolute inset-0 overflow-hidden rounded-[2rem] pointer-events-none">
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full translate-x-1/2 translate-y-1/2" />
          </div>
        </motion.div>
      </div>
    );
  }

  /* ── Chat screen ── */
  return (
    <div className="max-w-4xl mx-auto animate-in">
      <div className="bg-card rounded-[2rem] shadow-2xl border border-border flex flex-col overflow-hidden relative"
        style={{ height: closedSale ? 'auto' : 'min(700px, calc(100vh - 180px))', maxHeight: closedSale ? 'none' : 'min(700px, calc(100vh - 180px))' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-border/50 bg-white/80 dark:bg-card/80 backdrop-blur z-10 shrink-0">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
              closedSale ? 'bg-emerald-500/10 text-emerald-600' : 'bg-primary/10 text-primary'
            }`}>
              {closedSale ? <Trophy size={20} /> : `L${level}`}
            </div>
            <div>
              <span className="font-bold text-foreground">Pitch Session — {LEVEL_LABELS[level].th}</span>
              <p className="text-[10px] font-bold flex items-center gap-1 uppercase tracking-widest text-emerald-500">
                <span className={`w-1.5 h-1.5 rounded-full ${closedSale ? 'bg-emerald-500' : 'bg-emerald-500 animate-pulse'}`} />
                {closedSale ? 'Sale Closed ✓' : 'Live Simulation'}
              </p>
            </div>
          </div>
          <button
            onClick={() => { evalAbortRef.current = true; setSessionId(null); setMessages([]); setClosedSale(false); setEvaluation(null); setChatError(''); }}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors py-2 px-4 rounded-xl hover:bg-destructive/5"
          >
            <ChevronLeft size={16} />
            {closedSale ? 'กลับ' : 'จบการจำลอง'}
          </button>
        </div>

        {/* Messages */}
        <div className={`overflow-y-auto p-8 space-y-6 bg-slate-50/50 dark:bg-background/30 ${closedSale ? '' : 'flex-1'}`}>
          <AnimatePresence initial={false}>

            {/* System ready message */}
            <motion.div key="ready" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div className="max-w-[80%] rounded-2xl rounded-tl-none px-6 py-4 text-sm leading-relaxed shadow-sm bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
                <p className="font-semibold mb-1">ระบบพร้อมสำหรับการจำลองการขาย Level {level} แล้ว</p>
                <p className="text-xs opacity-75">กรุณาเริ่มทักทายลูกค้าได้เลย — AI จะตอบสนองในฐานะลูกค้าจริง</p>
              </div>
            </motion.div>

            {/* Conversation messages */}
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex items-start gap-4 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                  m.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-white dark:bg-card border border-border text-foreground'
                }`}>
                  {m.role === 'user' ? <UserIcon size={20} /> : <Bot size={20} />}
                </div>
                <div className={`max-w-[80%] rounded-2xl px-6 py-4 text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                    : 'bg-white dark:bg-card text-foreground rounded-tl-none border border-border'
                }`}>
                  {m.content}
                </div>
              </motion.div>
            ))}

            {/* Sale closed banner */}
            {closedSale && (
              <motion.div
                key="sale-closed"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="flex flex-col items-center py-6"
              >
                <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-4 rounded-2xl shadow-xl shadow-emerald-500/20">
                  <Trophy size={24} />
                  <div>
                    <p className="font-black text-lg tracking-tight">ปิดการขายสำเร็จ!</p>
                    <p className="text-xs opacity-80">ลูกค้ายืนยันการซื้อและชำระเงินแล้ว</p>
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
                className="flex items-center justify-center gap-3 py-4 text-muted-foreground"
              >
                <Loader2 size={18} className="animate-spin text-primary" />
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
                className="space-y-4"
              >
                {/* Why customer purchased */}
                <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-amber-500/10 text-amber-600 rounded-lg flex items-center justify-center shrink-0">
                      <Sparkles size={16} />
                    </div>
                    <h3 className="font-bold text-foreground">ทำไมลูกค้าถึงตัดสินใจซื้อ</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{evaluation.reason}</p>
                </div>

                {/* Strengths */}
                <div className="bg-white dark:bg-card border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-emerald-500/10 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                      <ThumbsUp size={16} />
                    </div>
                    <h3 className="font-bold text-emerald-700 dark:text-emerald-400">จุดแข็ง</h3>
                  </div>
                  <ul className="space-y-2">
                    {evaluation.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-foreground">
                        <span className="w-5 h-5 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                          {i + 1}
                        </span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="bg-white dark:bg-card border border-amber-200 dark:border-amber-800 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-amber-500/10 text-amber-600 rounded-lg flex items-center justify-center shrink-0">
                      <TrendingUp size={16} />
                    </div>
                    <h3 className="font-bold text-amber-700 dark:text-amber-400">สิ่งที่ควรพัฒนา</h3>
                  </div>
                  <ul className="space-y-2">
                    {evaluation.weaknesses.map((w, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-foreground">
                        <span className="w-5 h-5 bg-amber-500/10 text-amber-600 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                          {i + 1}
                        </span>
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Retry same level */}
                  <button
                    onClick={() => { evalAbortRef.current = true; setSessionId(null); setMessages([]); setClosedSale(false); setEvaluation(null); setChatError(''); }}
                    className="flex-1 flex items-center justify-center gap-2 bg-secondary/60 text-foreground hover:bg-secondary transition-all duration-200 px-6 py-4 rounded-2xl font-semibold"
                  >
                    <RotateCcw size={16} />
                    ลองอีกครั้ง Level {level}
                  </button>

                  {/* Next level or dashboard */}
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
                      className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 px-6 py-4 rounded-2xl font-bold shadow-lg shadow-primary/20"
                    >
                      Level {level + 1} — {LEVEL_LABELS[(level + 1) as 2 | 3].th}
                      <ArrowRight size={18} />
                    </button>
                  ) : (
                    <button
                      onClick={() => router.push(`/${locale}/dashboard`)}
                      className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-500 transition-all duration-200 px-6 py-4 rounded-2xl font-bold shadow-lg shadow-emerald-600/20"
                    >
                      <LayoutDashboard size={18} />
                      กลับไปหน้า Dashboard
                    </button>
                  )}
                </div>

                {/* Collapsible transcript */}
                <details className="rounded-2xl border border-border overflow-hidden">
                  <summary className="px-6 py-3 cursor-pointer text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors select-none">
                    บทสนทนาทั้งหมด ({messages.length} ข้อความ)
                  </summary>
                  <div className="border-t border-border max-h-64 overflow-y-auto px-6 py-4 space-y-3 bg-slate-50/50 dark:bg-background/30">
                    {messages.map((m, i) => (
                      <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] text-xs px-4 py-2 rounded-xl leading-relaxed whitespace-pre-wrap ${
                          m.role === 'user'
                            ? 'bg-primary/90 text-primary-foreground'
                            : 'bg-white dark:bg-card border border-border text-foreground'
                        }`}>
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-card border border-border flex items-center justify-center shrink-0">
                <Bot size={20} />
              </div>
              <div className="bg-white dark:bg-card border border-border rounded-2xl rounded-tl-none px-6 py-4 flex gap-1 items-center shadow-sm">
                <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input — hidden when sale is closed */}
        {!closedSale && (
          <div className="p-6 bg-white dark:bg-card border-t border-border z-10 shrink-0">
            {chatError && (
              <p className="text-xs text-red-500 text-center mb-3">{chatError}</p>
            )}
            <div className="relative flex items-center gap-3 bg-secondary/30 p-2 rounded-2xl border border-transparent focus-within:border-primary/20 focus-within:bg-white dark:focus-within:bg-card transition-all duration-200">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="พิมพ์ข้อความทักทายลูกค้าของคุณ..."
                className="flex-1 bg-transparent border-none focus:ring-0 px-4 py-3 text-sm placeholder:text-muted-foreground/50"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="bg-primary text-primary-foreground p-3 rounded-xl hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:scale-100 shadow-lg shadow-primary/20"
              >
                <Send size={20} />
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-3 text-center px-4">
              AI สวมบทบาทเป็นลูกค้าจริง — ฝึกทักษะการพิชชิ่งของคุณได้เลย
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
