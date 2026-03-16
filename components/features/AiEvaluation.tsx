'use client';

import { useState, useRef, useEffect } from 'react';
import type { PitchMessage } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, User as UserIcon, Bot, ChevronLeft, Play, Sparkles,
  CheckCircle2, Trophy, RotateCcw, Loader2, ArrowRight,
  Lock, BookOpen, AlertTriangle, ChevronRight, History,
} from 'lucide-react';

const LEVEL_LABELS: Record<1 | 2 | 3 | 4, { th: string; desc: string; examples: string[] }> = {
  1: {
    th: 'ปฏิเสธทั่วไป',
    desc: 'ลูกค้าปฏิเสธแบบพื้นฐาน',
    examples: ['ไม่สนใจ', 'ยังไม่ว่าง', 'ขอคิดดูก่อน', 'มีใช้อยู่แล้ว'],
  },
  2: {
    th: 'สงสัยสินค้า',
    desc: 'ลูกค้าตั้งคำถามและไม่แน่ใจ',
    examples: ['มันดีจริงไหม', 'มีหลักฐานอะไร', 'กลัวไม่คุ้ม', 'กลัวโดนหลอก'],
  },
  3: {
    th: 'ต่อรอง/เปรียบเทียบ',
    desc: 'ลูกค้าต่อรองราคาและเปรียบเทียบ',
    examples: ['แพงไป', 'ที่อื่นถูกกว่า', 'ขอส่วนลดได้ไหม', 'ถ้าไม่ลดก็ไม่เอา'],
  },
  4: {
    th: 'ทดสอบภาวะกดดัน',
    desc: 'ลูกค้าไม่ไว้ใจ ทดสอบและกดดัน',
    examples: ['ไม่ไว้ใจเทเลเซลล์', 'โดนหลอกมาก่อน', 'ถามรายละเอียดลึก', 'พยายามกดดันเซลล์'],
  },
};

const CRITERIA = [
  'การสร้างความสัมพันธ์',
  'การรับมือข้อโต้แย้ง',
  'ความน่าเชื่อถือ',
  'การปิดการขาย',
  'ความเป็นธรรมชาติแบบคนไทย',
];

type Step = 'intro' | 'select' | 'chat';

export default function AiEvaluation() {
  const [step,           setStep]           = useState<Step>('intro');
  const [level,          setLevel]          = useState<1 | 2 | 3 | 4>(1);
  const [sessionId,      setSessionId]      = useState<string | null>(null);
  const [messages,       setMessages]       = useState<PitchMessage[]>([]);
  const [input,          setInput]          = useState('');
  const [loading,        setLoading]        = useState(false);
  const [agentId,        setAgentId]        = useState<string | null>(null);
  const [agentName,      setAgentName]      = useState<string | null>(null);
  const [passed,          setPassed]          = useState(false);
  const [completedLevels, setCompletedLevels] = useState<Set<number>>(new Set());
  const [savedLevel,      setSavedLevel]      = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const AIEV_SESSION_KEY = 'brainstrade_aiev_active';

  useEffect(() => {
    const id   = localStorage.getItem('brainstrade_agent_id');
    const name = localStorage.getItem('brainstrade_agent_name');
    setAgentId(id);
    setAgentName(name);

    // Seed from localStorage immediately (instant UX)
    const localComp  = localStorage.getItem('brainstrade_eval_completed_levels');
    const localSaved = localStorage.getItem('brainstrade_eval_saved_level');
    const localSet: Set<number> = localComp ? new Set(JSON.parse(localComp)) : new Set();
    if (localSet.size > 0) setCompletedLevels(localSet);
    if (localSaved) {
      const n = parseInt(localSaved, 10);
      if (!localSet.has(n)) setSavedLevel(n);
    }

    // Check localStorage for an active session to restore
    let hasLocalSession = false;
    try {
      const raw = localStorage.getItem(AIEV_SESSION_KEY);
      if (raw && id) {
        const saved = JSON.parse(raw);
        const age = Date.now() - (saved.savedAt ?? 0);
        if (saved.agentId === id && saved.messages?.length > 0 && age < 24 * 60 * 60 * 1000) {
          setSessionId(saved.sessionId);
          setLevel(saved.level);
          setMessages(saved.messages);
          setStep('chat');
          hasLocalSession = true;
        } else {
          localStorage.removeItem(AIEV_SESSION_KEY);
        }
      }
    } catch {
      localStorage.removeItem(AIEV_SESSION_KEY);
    }

    // Then fetch from server and merge (server is source of truth)
    if (id) {
      fetch(`/api/agent/progress?agentId=${id}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (!data) return;
          const serverComp: number[] = data.evalCompletedLevels ?? [];
          const merged = new Set([...localSet, ...serverComp]);
          setCompletedLevels(merged);
          localStorage.setItem('brainstrade_eval_completed_levels', JSON.stringify([...merged]));

          // Server saved level wins unless local has a more recent one
          const serverSaved: number | null = data.evalSavedLevel ?? null;
          if (serverSaved && !merged.has(serverSaved)) {
            setSavedLevel(serverSaved);
            localStorage.setItem('brainstrade_eval_saved_level', String(serverSaved));
          }
        })
        .catch(() => { /* silently keep localStorage data */ });

      // Server session fallback — only if localStorage had nothing
      if (!hasLocalSession) {
        fetch(`/api/ai-eval/active?agentId=${id}`)
          .then(r => r.ok ? r.json() : null)
          .then(data => {
            const s = data?.session;
            if (s && s.messages?.length > 0) {
              const age = Date.now() - (s.savedAt ?? 0);
              if (age < 24 * 60 * 60 * 1000) {
                setSessionId(s.sessionId);
                setLevel(s.level);
                setMessages(s.messages);
                setStep('chat');
                // Repopulate localStorage from server
                localStorage.setItem(AIEV_SESSION_KEY, JSON.stringify({
                  agentId: id, sessionId: s.sessionId, level: s.level,
                  messages: s.messages, savedAt: s.savedAt ?? Date.now(),
                }));
              }
            }
          })
          .catch(() => {});
      }
    }
  }, []);

  // The level the agent was last working on (started but not completed)
  const inProgressLevel = savedLevel && !completedLevels.has(savedLevel) ? savedLevel as 1|2|3|4 : null;

  function syncToServer(patch: {
    evalCompletedLevels?: number[];
    evalSavedLevel?: number | null;
  }) {
    if (!agentId) return;
    fetch('/api/agent/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId, agentName: agentName ?? '', ...patch }),
    }).catch(() => { /* localStorage already updated — server sync best-effort */ });
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  function markLevelCompleted(l: number) {
    setCompletedLevels(prev => {
      const next = new Set(prev);
      next.add(l);
      localStorage.setItem('brainstrade_eval_completed_levels', JSON.stringify([...next]));
      syncToServer({ evalCompletedLevels: [...next], evalSavedLevel: null });
      return next;
    });
    // Clear the saved in-progress level now that it's done
    localStorage.removeItem('brainstrade_eval_saved_level');
    setSavedLevel(null);
  }

  function isLocked(l: number) {
    if (l === 1) return false;
    return !completedLevels.has(l - 1);
  }

  async function startSession(overrideLevel?: 1 | 2 | 3 | 4) {
    const activeLevel = overrideLevel ?? level;
    if (overrideLevel) setLevel(overrideLevel);
    setLoading(true);
    try {
      const res = await fetch('/api/ai-eval/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: activeLevel, agentId, agentName }),
      });
      const data = await res.json();
      setSessionId(data.sessionId);
      setMessages([]);
      setPassed(false);
      // Save progress so agent can resume later
      localStorage.setItem('brainstrade_eval_saved_level', String(activeLevel));
      setSavedLevel(activeLevel);
      syncToServer({ evalSavedLevel: activeLevel });
      setStep('chat');
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage() {
    if (!input.trim() || !sessionId || loading || passed) return;
    const userMsg: PitchMessage = { role: 'user', content: input, timestamp: new Date() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai-eval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, level, messages: newMessages, agentId, agentName }),
      });
      const data = await res.json();
      const aiMsg: PitchMessage = { role: 'assistant', content: data.reply, timestamp: new Date() };
      const finalMessages = [...newMessages, aiMsg];
      setMessages(finalMessages);

      if (data.passed) {
        setPassed(true);
        markLevelCompleted(level);
        // Clear active session — no longer needed after passing
        localStorage.removeItem(AIEV_SESSION_KEY);
        if (agentId) fetch(`/api/ai-eval/active?agentId=${agentId}`, { method: 'DELETE' }).catch(() => {});
      } else if (sessionId && agentId) {
        // Persist conversation so agent can resume
        const snap = { agentId, sessionId, level, messages: finalMessages, savedAt: Date.now() };
        localStorage.setItem(AIEV_SESSION_KEY, JSON.stringify(snap));
        fetch('/api/ai-eval/active', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agentId, sessionId, level, messages: finalMessages }),
        }).catch(() => {});
      }
    } finally {
      setLoading(false);
    }
  }

  function resetToSelect(clearHistory = false) {
    if (clearHistory) {
      localStorage.removeItem(AIEV_SESSION_KEY);
      if (agentId) fetch(`/api/ai-eval/active?agentId=${agentId}`, { method: 'DELETE' }).catch(() => {});
    }
    setSessionId(null);
    setMessages([]);
    setPassed(false);
    setStep('select');
  }

  /* ── Step 1: Intro / Instructions ── */
  if (step === 'intro') {
    return (
      <div className="max-w-4xl mx-auto animate-in">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-primary/10 text-primary rounded-xl">
            <BookOpen size={22} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">AI Evaluation</h1>
            <p className="text-muted-foreground text-sm mt-0.5">ฝึกทักษะเทเลเซลล์กับ AI ลูกค้าจำลอง</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-[2rem] shadow-xl border border-border overflow-hidden"
        >
          {/* Header banner */}
          <div className="bg-gradient-to-r from-primary to-primary/70 px-10 py-8 text-primary-foreground">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles size={24} />
              <h2 className="text-2xl font-black">คำแนะนำก่อนเริ่มการฝึก</h2>
            </div>
            <p className="opacity-80 text-sm leading-relaxed max-w-2xl">
              AI จะสวมบทบาทเป็น <strong>ลูกค้าคนไทย</strong> และทดสอบทักษะการขายของคุณผ่านบทสนทนาสด
              คุณต้องรับมือกับข้อโต้แย้งเหมือนกำลังขายจริง ๆ
            </p>
          </div>

          <div className="p-10 space-y-8">
            {/* How it works */}
            <div>
              <h3 className="font-bold text-foreground text-lg mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-black">1</span>
                รูปแบบการฝึก
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {([1, 2, 3, 4] as const).map(l => (
                  <div key={l} className="bg-secondary/30 rounded-2xl p-4 border border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full">Level {l}</span>
                      <span className="font-bold text-sm text-foreground">{LEVEL_LABELS[l].th}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{LEVEL_LABELS[l].desc}</p>
                    <div className="flex flex-wrap gap-1">
                      {LEVEL_LABELS[l].examples.slice(0, 2).map((ex, i) => (
                        <span key={i} className="text-[10px] bg-background border border-border/60 text-muted-foreground px-2 py-0.5 rounded-full">
                          "{ex}"
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scoring */}
            <div>
              <h3 className="font-bold text-foreground text-lg mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-black">2</span>
                เกณฑ์การประเมิน (คะแนน 1–10 ต่อด้าน)
              </h3>
              <div className="flex flex-wrap gap-2">
                {CRITERIA.map((c, i) => (
                  <span key={i} className="bg-secondary/50 border border-border text-foreground text-xs font-medium px-3 py-1.5 rounded-xl">
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Pass/Fail rule */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2 text-blue-700 dark:text-blue-400">
                  <CheckCircle2 size={18} />
                  <span className="font-bold">ผ่าน (คะแนนรวม ≥ 7)</span>
                </div>
                <p className="text-xs text-blue-800/70 dark:text-blue-300/70 leading-relaxed">
                  เลื่อนไปยัง Level ถัดไปได้ทันที
                </p>
              </div>
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2 text-red-700 dark:text-red-400">
                  <AlertTriangle size={18} />
                  <span className="font-bold">ไม่ผ่าน (คะแนนรวม &lt; 7)</span>
                </div>
                <p className="text-xs text-red-800/70 dark:text-red-300/70 leading-relaxed">
                  AI จะอธิบายข้อผิดพลาดและให้ลองใหม่
                </p>
              </div>
            </div>

            {/* Level lock notice */}
            <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-5">
              <Lock size={18} className="text-amber-600 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-800 dark:text-amber-300">
                <strong>ระบบล็อก Level:</strong> คุณต้องผ่าน Level ก่อนหน้าก่อนถึงจะปลดล็อก Level ถัดไปได้
              </p>
            </div>

            {/* Resume banner — shown if agent has in-progress level */}
            {inProgressLevel && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-700 rounded-2xl p-5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                    <History size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-amber-800 dark:text-amber-300 text-sm">
                      คุณค้างอยู่ที่ Level {inProgressLevel} — {LEVEL_LABELS[inProgressLevel].th}
                    </p>
                    <p className="text-xs text-amber-700/70 dark:text-amber-400/70 mt-0.5">
                      ระบบบันทึก progress ไว้แล้ว — ดำเนินการต่อได้ทันที
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { setLevel(inProgressLevel); setStep('select'); }}
                  className="shrink-0 flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm"
                >
                  ดำเนินการต่อ
                  <ArrowRight size={16} />
                </button>
              </motion.div>
            )}

            <button
              onClick={() => setStep('select')}
              className="w-full flex items-center justify-center gap-3 bg-foreground text-background hover:bg-primary hover:text-white transition-all duration-300 py-5 rounded-2xl font-black text-lg shadow-xl"
            >
              {inProgressLevel ? 'ดูภาพรวม Level ทั้งหมด' : 'เข้าใจแล้ว — เริ่มการฝึก'}
              <ChevronRight size={22} />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ── Step 2: Level selector ── */
  if (step === 'select') {
    return (
      <div className="max-w-4xl mx-auto animate-in">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">AI Evaluation</h1>
            <p className="text-muted-foreground text-sm mt-1">เลือก Level เพื่อเริ่มการฝึก</p>
          </div>
          <div className="flex items-center gap-3">
            {agentName && (
              <div className="text-xs text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-xl">
                Agent: <span className="font-bold text-foreground">{agentName}</span>
              </div>
            )}
            <button
              onClick={() => setStep('intro')}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-secondary/50 transition-colors"
            >
              <BookOpen size={14} />
              ดูคำแนะนำ
            </button>
          </div>
        </div>

        {/* Resume strip */}
        {inProgressLevel && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-700 rounded-2xl px-6 py-4 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <History size={18} className="text-amber-600 shrink-0" />
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                ระบบจำ progress ของคุณไว้แล้ว — ค้างอยู่ที่{' '}
                <span className="font-black">Level {inProgressLevel} ({LEVEL_LABELS[inProgressLevel].th})</span>
              </p>
            </div>
            <button
              onClick={() => startSession(inProgressLevel)}
              disabled={loading}
              className="shrink-0 flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm"
            >
              <Play size={14} className="fill-current" />
              เริ่มต่อเลย
            </button>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-[2rem] shadow-xl border border-border p-10 text-center relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Sparkles size={40} />
            </div>
            <h2 className="text-2xl font-bold mb-2">เลือกระดับความยาก</h2>
            <p className="mb-8 text-muted-foreground max-w-sm mx-auto">
              AI จะจำลองลูกค้าที่แตกต่างกันตาม Level ที่คุณเลือก
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-10">
              {([1, 2, 3, 4] as const).map(l => {
                const locked    = isLocked(l);
                const completed = completedLevels.has(l);
                const selected  = level === l;
                return (
                  <button
                    key={l}
                    onClick={() => !locked && setLevel(l)}
                    disabled={locked}
                    className={`group relative px-7 py-4 rounded-2xl font-bold transition-all duration-300 border ${
                      locked
                        ? 'bg-secondary/30 text-muted-foreground/40 border-transparent cursor-not-allowed'
                        : selected
                        ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105'
                        : 'bg-secondary/50 text-muted-foreground border-transparent hover:border-primary/30 hover:bg-white'
                    }`}
                  >
                    {locked ? (
                      <span className="absolute -top-2 -right-2 w-6 h-6 bg-muted-foreground/20 rounded-full flex items-center justify-center">
                        <Lock size={12} className="text-muted-foreground/50" />
                      </span>
                    ) : completed ? (
                      <span className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-sm">
                        <CheckCircle2 size={12} className="text-white" />
                      </span>
                    ) : null}

                    <span className="relative z-10 text-base">Level {l}</span>
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
              onClick={() => startSession()}
              disabled={loading || isLocked(level)}
              className="group mt-4 flex items-center justify-center gap-2 bg-foreground text-background px-10 py-4 rounded-2xl font-bold text-lg hover:bg-primary hover:text-white transition-all duration-300 shadow-xl disabled:opacity-50 mx-auto"
            >
              <Play size={20} className="fill-current" />
              {loading ? 'กำลังเริ่ม...' : 'เริ่มการจำลอง'}
            </button>
          </div>

          <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full translate-x-1/2 translate-y-1/2" />
        </motion.div>
      </div>
    );
  }

  /* ── Step 3: Chat ── */
  return (
    <div className="max-w-4xl mx-auto animate-in">
      <div className="bg-card rounded-[2rem] shadow-2xl border border-border flex flex-col overflow-hidden relative"
        style={{ height: passed ? 'auto' : '700px', maxHeight: passed ? 'none' : '700px' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-border/50 bg-white/80 dark:bg-card/80 backdrop-blur z-10 shrink-0">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
              passed ? 'bg-blue-500/10 text-blue-600' : 'bg-primary/10 text-primary'
            }`}>
              {passed ? <Trophy size={20} /> : `L${level}`}
            </div>
            <div>
              <span className="font-bold text-foreground">AI Evaluation — {LEVEL_LABELS[level].th}</span>
              <p className={`text-[10px] font-bold flex items-center gap-1 uppercase tracking-widest ${
                passed ? 'text-blue-500' : 'text-primary'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${passed ? 'bg-blue-500' : 'bg-primary animate-pulse'}`} />
                {passed ? 'ผ่านแล้ว ✓' : 'Live Simulation'}
              </p>
            </div>
          </div>
          <button
            onClick={() => resetToSelect(passed)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors py-2 px-4 rounded-xl hover:bg-destructive/5"
          >
            <ChevronLeft size={16} />
            {passed ? 'กลับ' : 'จบการจำลอง'}
          </button>
        </div>

        {/* Messages */}
        <div className={`overflow-y-auto p-8 space-y-6 bg-slate-50/50 dark:bg-background/30 ${passed ? '' : 'flex-1'}`}>
          <AnimatePresence initial={false}>

            {/* System ready message */}
            <motion.div key="ready" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div className="max-w-[80%] rounded-2xl rounded-tl-none px-6 py-4 text-sm leading-relaxed shadow-sm bg-primary/5 border border-primary/20 text-primary">
                <p className="font-semibold mb-1">ระบบพร้อมสำหรับการฝึก Level {level} — {LEVEL_LABELS[level].th}</p>
                <p className="text-xs opacity-75">AI จะเริ่มสถานการณ์ก่อน — รอรับบทพูดของลูกค้าและตอบโต้เหมือนกำลังขายจริง</p>
              </div>
            </motion.div>

            {/* Conversation */}
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

            {/* Passed banner */}
            {passed && (
              <motion.div
                key="passed"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="flex flex-col items-center py-6"
              >
                <div className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-blue-500 text-white px-8 py-4 rounded-2xl shadow-xl shadow-blue-500/20">
                  <Trophy size={24} />
                  <div>
                    <p className="font-black text-lg tracking-tight">ผ่าน Level {level} แล้ว!</p>
                    <p className="text-xs opacity-80">คะแนนรวมผ่านเกณฑ์ — พร้อมไปต่อ Level ถัดไป</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Action buttons after passing */}
            {passed && (
              <motion.div
                key="actions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row gap-3 pt-2"
              >
                <button
                  onClick={() => resetToSelect(true)}
                  className="flex-1 flex items-center justify-center gap-2 bg-secondary/60 text-foreground hover:bg-secondary transition-all duration-200 px-6 py-4 rounded-2xl font-semibold"
                >
                  <RotateCcw size={16} />
                  ลองอีกครั้ง Level {level}
                </button>

                {level < 4 ? (
                  <button
                    onClick={() => {
                      const next = (level + 1) as 2 | 3 | 4;
                      setLevel(next);
                      resetToSelect(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 px-6 py-4 rounded-2xl font-bold shadow-lg shadow-primary/20"
                  >
                    Level {level + 1} — {LEVEL_LABELS[(level + 1) as 2 | 3 | 4].th}
                    <ArrowRight size={18} />
                  </button>
                ) : (
                  <div className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-500 text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-blue-500/20">
                    <Trophy size={18} />
                    คุณผ่านการทดสอบระดับมืออาชีพแล้ว!
                  </div>
                )}
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
                <Loader2 size={16} className="animate-spin text-primary mr-2" />
                <span className="text-xs text-muted-foreground">AI กำลังตอบ...</span>
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        {!passed && (
          <div className="p-6 bg-white dark:bg-card border-t border-border z-10 shrink-0">
            <div className="relative flex items-center gap-3 bg-secondary/30 p-2 rounded-2xl border border-transparent focus-within:border-primary/20 focus-within:bg-white dark:focus-within:bg-card transition-all duration-200">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="ตอบโต้ลูกค้าเหมือนกำลังขายจริง..."
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
              AI สวมบทเป็นลูกค้าไทย — ตอบโต้ข้อโต้แย้งและพยายามปิดการขาย
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
