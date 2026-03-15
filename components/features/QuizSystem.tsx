'use client';

import { useState, useEffect } from 'react';
import AgentPicker from '@/components/ui/AgentPicker';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ChevronRight, HelpCircle, Trophy } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  options: string[];
  correct: string;
}

// Placeholder questions — replace with real quiz data per module
const PLACEHOLDER_QUESTIONS: Question[] = [
  {
    id: 'q1',
    text: 'ข้อใดคือขั้นตอนแรกในการขาย?',
    options: ['ปิดการขาย', 'สร้างความสัมพันธ์', 'นำเสนอสินค้า', 'ติดตามผล'],
    correct: 'สร้างความสัมพันธ์',
  },
  {
    id: 'q2',
    text: 'Painpoint คืออะไร?',
    options: ['ราคาสินค้า', 'ปัญหาของลูกค้า', 'กำไรของบริษัท', 'ขั้นตอนการชำระเงิน'],
    correct: 'ปัญหาของลูกค้า',
  },
];

export default function QuizSystem({ moduleId }: { moduleId: string }) {
  const [answers,    setAnswers]    = useState<Record<string, string>>({});
  const [result,     setResult]     = useState<{ passed: boolean; score: number; total: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [agentId,    setAgentId]    = useState<string | null>(null);
  const [agentName,  setAgentName]  = useState<string | null>(null);

  useEffect(() => {
    setAgentId(localStorage.getItem('brainstrade_agent_id'));
    setAgentName(localStorage.getItem('brainstrade_agent_name'));
  }, []);

  async function handleSubmit() {
    setSubmitting(true);
    const score = PLACEHOLDER_QUESTIONS.filter(q => answers[q.id] === q.correct).length;

    const res = await fetch('/api/quiz/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        moduleId, score,
        totalQuestions: PLACEHOLDER_QUESTIONS.length,
        answers, agentId, agentName,
      }),
    });
    const data = await res.json();
    setResult({ passed: data.passed, score: data.score, total: data.totalQuestions });
    setSubmitting(false);
  }

  if (result) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl mx-auto bg-card rounded-[2.5rem] shadow-2xl border border-border p-12 text-center relative overflow-hidden"
      >
        <div className="relative z-10">
          <div className={`w-24 h-24 rounded-3xl mx-auto mb-6 flex items-center justify-center ${
            result.passed ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'
          }`}>
            {result.passed ? <Trophy size={48} /> : <XCircle size={48} />}
          </div>
          
          <h2 className={`text-4xl font-black mb-2 ${result.passed ? 'text-emerald-600' : 'text-red-500'}`}>
            {result.passed ? 'ยินดีด้วย! คุณผ่านแล้ว' : 'พยายามอีกครั้งนะ'}
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            คุณทำคะแนนได้ <span className="font-bold text-foreground">{result.score}</span> จากทั้งหมด {result.total} ข้อ
          </p>
          
          <button
            onClick={() => { setResult(null); setAnswers({}); }}
            className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
          >
            ทำแบบทดสอบใหม่
          </button>
        </div>
        
        {/* Decorative background circle */}
        <div className={`absolute -top-24 -right-24 w-64 h-64 blur-3xl rounded-full opacity-20 ${
          result.passed ? 'bg-emerald-400' : 'bg-red-400'
        }`} />
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-in">
      <AgentPicker onSelected={(id, name) => { setAgentId(id); setAgentName(name); }} />
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 text-primary rounded-lg">
            <HelpCircle size={20} />
          </div>
          <span className="text-sm font-bold text-primary uppercase tracking-widest">Knowledge Check</span>
        </div>
        <h1 className="text-3xl font-extrabold text-foreground">แบบทดสอบ: {moduleId === 'product' ? 'ข้อมูลผลิตภัณฑ์' : moduleId}</h1>
        <p className="text-muted-foreground mt-2">กรุณาเลือกคำตอบที่ถูกต้องที่สุดในแต่ละข้อ</p>
      </header>

      <div className="space-y-6">
        {PLACEHOLDER_QUESTIONS.map((q, i) => (
          <motion.div 
            key={q.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card rounded-[2rem] shadow-sm border border-border p-8 hover:shadow-md transition-shadow"
          >
            <div className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary text-muted-foreground flex items-center justify-center font-bold text-sm">
                {i + 1}
              </span>
              <div className="flex-1">
                <p className="text-lg font-bold text-foreground mb-6 leading-tight">{q.text}</p>
                <div className="grid gap-3">
                  {q.options.map(opt => {
                    const isSelected = answers[q.id] === opt;
                    return (
                      <label 
                        key={opt} 
                        className={`group relative flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                          isSelected 
                            ? 'border-primary bg-primary/5' 
                            : 'border-secondary hover:border-primary/20 hover:bg-secondary/30'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name={q.id}
                            value={opt}
                            checked={isSelected}
                            onChange={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                            className="w-4 h-4 text-primary border-muted-foreground/30 focus:ring-primary/20 transition-all"
                          />
                          <span className={`text-sm font-medium transition-colors ${isSelected ? 'text-primary' : 'text-foreground/70'}`}>
                            {opt}
                          </span>
                        </div>
                        {isSelected && <CheckCircle2 size={18} className="text-primary animate-in" />}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        
        <div className="pt-6">
          <button
            onClick={handleSubmit}
            disabled={submitting || Object.keys(answers).length < PLACEHOLDER_QUESTIONS.length}
            className="group w-full bg-foreground text-background py-5 rounded-[1.5rem] font-bold text-lg hover:bg-primary hover:text-white transition-all duration-300 disabled:opacity-20 flex items-center justify-center gap-2 shadow-xl"
          >
            {submitting ? (
              <div className="w-6 h-6 border-2 border-background/30 border-t-background rounded-full animate-spin" />
            ) : (
              <>
                ส่งคำตอบ
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
          <p className="text-center text-xs text-muted-foreground mt-4">
            กรุณาตอบคำถามให้ครบทุกข้อเพื่อส่งผลคะแนน
          </p>
        </div>
      </div>
    </div>
  );
}
