'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Send, Sparkles, CheckCircle2, AlertCircle, BarChart3, TrendingUp } from 'lucide-react';

interface EvalResult {
  score: number;
  strengths: string[];
  improvements: string[];
  overall: string;
}

export default function AiEvaluation({ userId }: { userId: string }) {
  const [text, setText] = useState('');
  const [result, setResult] = useState<EvalResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function evaluate() {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/ai-eval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputText: text }),
      });
      if (!res.ok) throw new Error('Evaluation failed');
      const data = await res.json();
      setResult(data);
    } catch {
      setError('Failed to evaluate. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto animate-in space-y-10">
      <header>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 text-primary rounded-lg">
            <Mic size={20} />
          </div>
          <span className="text-sm font-bold text-primary uppercase tracking-widest">AI Intelligence</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Speech Evaluation</h1>
        <p className="text-muted-foreground mt-2 text-lg">วิเคราะห์และรับคำแนะนำสำหรับการนำเสนอของคุณแบบเรียลไทม์</p>
      </header>

      <div className="bg-card rounded-[2.5rem] shadow-xl border border-border p-8 md:p-10 relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={18} className="text-primary" />
            <h2 className="font-bold text-xl">ใส่สคริปต์การขายของคุณ</h2>
          </div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="วางหรือพิมพ์สคริปต์การขายของคุณที่นี่..."
            rows={8}
            className="w-full bg-secondary/30 border-transparent rounded-[1.5rem] px-6 py-5 text-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all resize-none placeholder:text-muted-foreground/40 shadow-inner"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              แนะนำให้ใส่ข้อความอย่างน้อย 50 คำเพื่อผลลัพธ์ที่แม่นยำ
            </p>
            <button
              onClick={evaluate}
              disabled={loading || text.trim().length < 10}
              className="group relative flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-bold text-lg hover:scale-[1.05] active:scale-[0.95] transition-all duration-300 disabled:opacity-20 shadow-lg shadow-primary/25"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={18} />
                  เริ่มการวิเคราะห์
                </>
              )}
            </button>
          </div>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-center gap-2 text-destructive bg-destructive/5 p-4 rounded-xl"
            >
              <AlertCircle size={18} />
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}
        </div>
        
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
      </div>

      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-card rounded-[2.5rem] shadow-lg border border-border p-10 flex flex-col justify-center">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-black text-foreground">ผลการประเมิน</h3>
                  <div className="p-3 bg-secondary rounded-2xl text-primary">
                    <BarChart3 size={24} />
                  </div>
                </div>
                <p className="text-lg leading-relaxed text-muted-foreground italic">
                  &ldquo;{result.overall}&rdquo;
                </p>
              </div>

              <div className="bg-primary text-primary-foreground rounded-[2.5rem] shadow-xl p-10 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                <div className="relative z-10">
                  <TrendingUp size={32} className="mb-4 opacity-60" />
                  <span className="text-sm font-bold uppercase tracking-widest opacity-70">Total Score</span>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-7xl font-black tracking-tighter">{result.score}</span>
                    <span className="text-xl opacity-40">/100</span>
                  </div>
                </div>
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2 transition-transform group-hover:scale-150 duration-700" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 blur-2xl rounded-full -translate-x-1/2 translate-y-1/2 transition-transform group-hover:scale-150 duration-700" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-[2rem] p-8">
                <div className="flex items-center gap-2 mb-6 text-emerald-700">
                  <CheckCircle2 size={24} />
                  <h3 className="font-bold text-xl">จุดแข็งของคุณ</h3>
                </div>
                <ul className="space-y-4">
                  {result.strengths.map((s, i) => (
                    <motion.li 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + (i * 0.1) }}
                      className="flex items-start gap-3 text-emerald-900/80 leading-snug"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                      {s}
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div className="bg-orange-50/50 border border-orange-100 rounded-[2rem] p-8">
                <div className="flex items-center gap-2 mb-6 text-orange-700">
                  <TrendingUp size={24} />
                  <h3 className="font-bold text-xl">จุดที่ควรปรับปรุง</h3>
                </div>
                <ul className="space-y-4">
                  {result.improvements.map((s, i) => (
                    <motion.li 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + (i * 0.1) }}
                      className="flex items-start gap-3 text-orange-900/80 leading-snug"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0" />
                      {s}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
