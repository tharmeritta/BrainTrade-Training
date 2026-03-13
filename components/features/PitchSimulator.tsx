'use client';

import { useState, useRef, useEffect } from 'react';
import type { PitchMessage } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User as UserIcon, Bot, ChevronLeft, Play, Sparkles } from 'lucide-react';

export default function PitchSimulator({ userId }: { userId: string }) {
  const [level, setLevel] = useState<1 | 2 | 3>(1);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<PitchMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function startSession() {
    const res = await fetch('/api/pitch/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level }),
    });
    const data = await res.json();
    setSessionId(data.sessionId);
    setMessages([]);
  }

  async function sendMessage() {
    if (!input.trim() || !sessionId) return;
    const userMsg: PitchMessage = { role: 'user', content: input, timestamp: new Date() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, level, messages: newMessages }),
      });
      const data = await res.json();
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.reply, timestamp: new Date() },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto animate-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Pitch Simulator</h1>
          <p className="text-muted-foreground text-sm mt-1">ทดสอบทักษะการนำเสนอของคุณกับ AI</p>
        </div>
      </div>

      {!sessionId ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-[2rem] shadow-xl border border-border p-10 text-center relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Sparkles size={40} />
            </div>
            <h2 className="text-2xl font-bold mb-2">เลือกความยากเพื่อเริ่มเซสชัน</h2>
            <p className="mb-8 text-muted-foreground max-w-sm mx-auto">AI จะสมมติเป็นลูกค้าที่แตกต่างกันตามระดับความยากที่คุณเลือก</p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-10">
              {([1, 2, 3] as const).map(l => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`group relative px-8 py-4 rounded-2xl font-bold transition-all duration-300 border ${
                    level === l
                      ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105'
                      : 'bg-secondary/50 text-muted-foreground border-transparent hover:border-primary/30 hover:bg-white'
                  }`}
                >
                  <span className="relative z-10 text-lg">Level {l}</span>
                  {l === 1 && <span className="block text-[10px] opacity-60 font-medium">เริ่มต้น</span>}
                  {l === 2 && <span className="block text-[10px] opacity-60 font-medium">มาตรฐาน</span>}
                  {l === 3 && <span className="block text-[10px] opacity-60 font-medium">ท้าทาย</span>}
                </button>
              ))}
            </div>

            <button
              onClick={startSession}
              className="group flex items-center justify-center gap-2 bg-foreground text-background px-10 py-4 rounded-2xl font-bold text-lg hover:bg-primary hover:text-white transition-all duration-300 shadow-xl"
            >
              <Play size={20} className="fill-current" />
              เริ่มการจำลอง
            </button>
          </div>

          <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full translate-x-1/2 translate-y-1/2" />
        </motion.div>
      ) : (
        <div className="bg-card rounded-[2rem] shadow-2xl border border-border flex flex-col h-[700px] overflow-hidden relative">
          <div className="flex items-center justify-between px-8 py-5 border-b border-border/50 glass z-10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold">
                L{level}
              </div>
              <div>
                <span className="font-bold text-foreground">Pitch Session</span>
                <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1 uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Live Simulation
                </p>
              </div>
            </div>
            <button
              onClick={() => setSessionId(null)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors py-2 px-4 rounded-xl hover:bg-destructive/5"
            >
              <ChevronLeft size={16} />
              จบการจำลอง
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/50">
            <AnimatePresence initial={false}>
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex items-start gap-4 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                    m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-white border border-border text-foreground'
                  }`}>
                    {m.role === 'user' ? <UserIcon size={20} /> : <Bot size={20} />}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-2xl px-6 py-4 text-sm leading-relaxed shadow-sm ${
                      m.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-tr-none'
                        : 'bg-white text-foreground rounded-tl-none border border-border'
                    }`}
                  >
                    {m.content}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-border text-foreground flex items-center justify-center shrink-0">
                  <Bot size={20} />
                </div>
                <div className="bg-white border border-border rounded-2xl rounded-tl-none px-6 py-4 flex gap-1 items-center shadow-sm">
                  <div className="w-1.5 h-1.5 bg-muted-foreground/30 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-muted-foreground/30 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-muted-foreground/30 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </motion.div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="p-6 bg-white border-t border-border z-10">
            <div className="relative flex items-center gap-3 bg-secondary/30 p-2 rounded-2xl border border-transparent focus-within:border-primary/20 focus-within:bg-white transition-all duration-200">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="พิมพ์ข้อความของคุณ..."
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
              AI จะทำการสวมบทบาทเป็นลูกค้าตามที่ได้รับมอบหมาย เพื่อช่วยฝึกฝนการพิชชิ่งของคุณ
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
