'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Presentation, Sparkles, CheckCircle2, Play, Bot, BrainCircuit,
  Award, TrendingUp, ShieldCheck, ArrowRight, BookOpen, Layers, Check, Copy
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import LangToggle from '@/components/ui/LangToggle';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { CertificateModal } from '@/components/features/agent-training/CertificateModal';

export default function StandaloneClientDemoPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const isTh = locale === 'th';

  const [activeTab, setActiveTab] = useState<'ai' | 'quiz' | 'certificate' | 'roi'>('ai');
  const [certOpen, setCertOpen] = useState(false);

  // Simulated AI response
  const [agentInput, setAgentInput] = useState('');
  const [evalResult, setEvalResult] = useState<{ score: number; passed: boolean; feedback: string } | null>(null);
  const [evaluating, setEvaluating] = useState(false);

  // Quiz state
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const handleSimulateAiEval = () => {
    if (!agentInput.trim()) return;
    setEvaluating(true);
    setTimeout(() => {
      setEvaluating(false);
      setEvalResult({
        score: 92,
        passed: true,
        feedback: isTh 
          ? 'ตอบโต้ข้อโต้แย้งได้ยอดเยี่ยมมาก! มีการอธิบายคุณค่าของระบบ AI และโค้ช 1:1 พร้อมเสนอนัดหมายอย่างเป็นธรรมชาติ'
          : 'Excellent objection handling! Great reframe of 1:1 coaching value and natural closing.'
      });
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 pb-16">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-card/70 backdrop-blur-md border-b border-border/50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-primary-foreground font-black text-lg shadow-md shadow-primary/20">
            BT
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-foreground flex items-center gap-2">
              BrainTrade Training Showcase
              <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                Interactive Client Hub
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-0.5 p-1 bg-muted/50 border border-border/50 rounded-full">
            <LangToggle />
            <ThemeToggle />
          </div>
          <Link
            href={`/${locale}/admin`}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-black shadow-md shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            <span>{isTh ? 'เข้าสู่หน้าผู้ดูแลระบบ' : 'Admin Control Panel'}</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-12 pb-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Sparkles size={14} />
          <span>{isTh ? 'ระบบประเมินพนักงานและฝึกอบรม AI ล้ำสมัย' : 'Next-Gen AI Employee Training Engine'}</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight max-w-4xl mx-auto leading-tight">
          {isTh 
            ? 'ทดลองใช้งานระบบฝึกอบรมและประเมินผลด้วย AI แบบสองภาษา' 
            : 'Experience AI-Powered Sales Coaching & Interactive Training'}
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          {isTh 
            ? 'ยกระดับทีมขายและพนักงานองค์กรด้วยสถานการณ์จำลอง AI สมจริง ตรวจข้อสอบอัตโนมัติ ออกใบรับรอง PDF และวิเคราะห์ผล HR Analytics แบบ Real-time'
            : 'Elevate staff performance with real-time AI conversation audits, automated quizzes, PDF certificates, and deep telemetry.'}
        </p>

        {/* Demo Tabs */}
        <div className="pt-6 flex flex-wrap justify-center gap-2">
          {[
            { id: 'ai', label: isTh ? '🤖 1. AI Call Evaluator' : '🤖 1. AI Call Evaluator', icon: Bot },
            { id: 'quiz', label: isTh ? '📚 2. Knowledge Quiz Engine' : '📚 2. Knowledge Quiz Engine', icon: BookOpen },
            { id: 'certificate', label: isTh ? '🏆 3. PDF Certificate Exporter' : '🏆 3. PDF Certificate Exporter', icon: Award },
            { id: 'roi', label: isTh ? '📈 4. HR Analytics & ROI' : '📈 4. HR Analytics & ROI', icon: TrendingUp },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105'
                  : 'bg-card hover:bg-secondary border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Main Interactive Demo Container */}
      <main className="max-w-5xl mx-auto px-6">
        <AnimatePresence mode="wait">
          {/* TAB 1: AI CALL EVALUATOR DEMO */}
          {activeTab === 'ai' && (
            <motion.div
              key="ai-tab"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-border/50 pb-4 flex-wrap gap-2">
                <div>
                  <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                    <Bot className="text-primary" size={20} />
                    <span>{isTh ? 'ทดลองพิมพ์ตอบบทสนทนากับลูกค้า AI' : 'Live Interactive AI Call Evaluation'}</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isTh ? 'ลูกค้า AI: คุณพลอย (พนักงานออฟฟิศที่ลังเลเรื่องงบและเวลา)' : 'AI Customer: Khun Ploy (Hesitant office worker)'}
                  </p>
                </div>
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-black rounded-full">
                  Level 1 Scenario
                </span>
              </div>

              <div className="bg-secondary/40 border border-border/60 rounded-2xl p-5 space-y-3">
                <span className="text-xs font-black text-primary uppercase tracking-wider block">
                  💬 {isTh ? 'คำพูดของลูกค้า AI:' : 'AI Customer prompt:'}
                </span>
                <p className="text-sm font-semibold text-foreground italic leading-relaxed">
                  {isTh 
                    ? '"สนใจเรียนเทรดนะคะ แต่กังวลว่าคอร์สจะแพงเกินไปไหม แล้วคนทำงานประจำอย่างผมจะมีเวลาเรียนเหรอคะ?"'
                    : '"I am interested in learning to trade, but I am worried the course is too expensive and that I won\'t have enough time alongside my job."'
                  }
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-wider text-muted-foreground block">
                  {isTh ? 'พิมพ์บทพูดพนักงานขาย (หรือกดปุ่มเพื่อใช้ข้อความตัวอย่าง):' : 'Enter Your Sales Response (or use sample):'}
                </label>

                <textarea
                  value={agentInput}
                  onChange={(e) => setAgentInput(e.target.value)}
                  placeholder={isTh 
                    ? 'เช่น: เข้าใจเลยครับเรื่องเวลาและงบ จุดเด่นคอร์สเราคือมีโค้ช 1:1 ปรับตามเวลาสะดวก ขอนัด 15 นาทีเพื่อแสดงตัวเลขจริง...'
                    : 'e.g. Completely understand your budget and time concerns! Our 1:1 coach adjusts to your schedule...'}
                  rows={3}
                  className="w-full bg-secondary/30 border border-border/80 focus:border-primary rounded-2xl p-4 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all"
                />

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => setAgentInput(isTh 
                      ? 'เข้าใจมากๆ เลยครับเรื่องเวลาและงบประมาณ จุดเด่นคอร์ส BrainTrade คือมีโค้ชส่วนตัว 1:1 ปรับตารางเรียนตามเวลาที่คุณสะดวก และมี AI ช่วยวิเคราะห์ตลาดอัตโนมัติ ขออนุญาตจัดนัดหมายสาธิตสั้นๆ 15 นาทีให้ดูตัวเลขจริงไหมครับ?'
                      : 'Completely understand your time and budget concerns! BrainTrade offers 1:1 personal coaching flexible to your schedule and AI market analysis. May I book a quick 15-minute demo to present the actual figures?'
                    )}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    ✨ {isTh ? 'ใส่คำตอบแนะนำอัตโนมัติ' : 'Auto-fill Recommended Answer'}
                  </button>

                  <button
                    onClick={handleSimulateAiEval}
                    disabled={!agentInput.trim() || evaluating}
                    className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground text-xs font-black shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    {evaluating ? <Sparkles size={14} className="animate-spin" /> : <BrainCircuit size={14} />}
                    <span>{evaluating ? (isTh ? 'กำลังประเมินด้วย AI...' : 'Analyzing with AI...') : (isTh ? 'ส่งบทพูดให้ AI ประเมิน' : 'Evaluate Response with AI')}</span>
                  </button>
                </div>
              </div>

              {/* Evaluation Results Callout */}
              {evalResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-emerald-400 text-sm flex items-center gap-2">
                      <CheckCircle2 size={18} />
                      {isTh ? 'ผลการประเมิน: ผ่านเกณฑ์ (PASSED 🎉)' : 'Verdict: PASSED 🎉'}
                    </span>
                    <span className="text-base font-black text-emerald-400">
                      Score: {evalResult.score}% (Target: 70%)
                    </span>
                  </div>
                  <p className="text-xs text-foreground font-medium leading-relaxed">
                    {evalResult.feedback}
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* TAB 2: KNOWLEDGE QUIZ ENGINE */}
          {activeTab === 'quiz' && (
            <motion.div
              key="quiz-tab"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                  <BookOpen className="text-primary" size={20} />
                  <span>{isTh ? 'ตัวอย่างควิซทดสอบความรู้ (Module Assessment)' : 'Interactive Module Quiz Engine'}</span>
                </h3>
                <span className="text-xs font-bold text-muted-foreground">Pass Score: 70%</span>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-secondary/40 border border-border/60">
                  <span className="text-xs font-bold text-primary block mb-1">Question 1 of 5:</span>
                  <p className="text-sm font-semibold text-foreground">
                    {isTh 
                      ? 'เมื่อลูกค้าแจ้งว่า "ราคาสูงกว่าคู่แข่ง 30%" พนักงานควรปฏิบัติอย่างไรเพื่อรักษาภาพลักษณ์และโอกาสการขาย?'
                      : 'When a prospect says "Your service is 30% more expensive than competitors," what is the best response?'
                    }
                  </p>
                </div>

                <div className="space-y-2 text-xs font-semibold">
                  {[
                    { id: 'A', text: isTh ? 'อธิบายคุณค่า ROI ของระบบ 1:1 โค้ช และขอนัดหมาย 15 นาทีเพื่อแสดงตัวเลขจริง' : 'Refrain price into ROI value & 1:1 coaching benefit, then request a 15-min demo.' },
                    { id: 'B', text: isTh ? 'เสนอส่วนลดทันที 20% หากลูกค้าตกลงสมัครวันนี้' : 'Offer an immediate 20% discount if they sign today.' },
                    { id: 'C', text: isTh ? 'แจ้งว่าคู่แข่งคุณภาพต่ำกว่า และไม่มีมาตรฐาน' : 'Claim competitors offer poor quality and low standards.' },
                  ].map(opt => {
                    const isSelected = selectedAnswer === opt.id;
                    const isCorrect = opt.id === 'A';
                    return (
                      <button
                        key={opt.id}
                        onClick={() => { setSelectedAnswer(opt.id); setQuizSubmitted(true); }}
                        className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                          quizSubmitted && isCorrect 
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold'
                            : isSelected ? 'bg-primary/10 border-primary text-primary' : 'bg-card hover:bg-secondary/60 border-border/60'
                        }`}
                      >
                        <span className="w-6 h-6 rounded-lg bg-secondary flex items-center justify-center shrink-0 font-black">{opt.id}</span>
                        <span>{opt.text}</span>
                      </button>
                    );
                  })}
                </div>

                {quizSubmitted && (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 font-bold">
                    ✅ {isTh ? 'ถูกต้อง! การเชื่อมโยงเรื่องราคาไปสู่ ROI ช่วยปิดการขายได้โดยไม่ต้องลดราคา' : 'Correct! Reframing price into ROI value builds credibility without unapproved discounts.'}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 3: PDF CERTIFICATE EXPORTER */}
          {activeTab === 'certificate' && (
            <motion.div
              key="cert-tab"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-6"
            >
              <div className="w-16 h-16 rounded-3xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                <Award size={32} />
              </div>

              <div>
                <h3 className="text-xl font-black text-foreground">
                  {isTh ? 'การออกใบรับรองผ่านการฝึกอบรมอัตโนมัติ (Automated PDF Certificate Exporter)' : 'Automated Verified PDF Certificate System'}
                </h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1 leading-relaxed">
                  {isTh 
                    ? 'เมื่อผู้เรียนทำคะแนนผ่านทุกหมวด ระบบจะสร้างใบรับรองความสำเร็จรูปแบบ PDF คุณภาพสูง พร้อมลายเซ็นและตราประทับองค์กร'
                    : 'Upon completing required modules, learners receive an instant, high-resolution verified PDF certificate with official signature seals.'}
                </p>
              </div>

              <button
                onClick={() => setCertOpen(true)}
                className="px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground text-xs font-black shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2"
              >
                <Award size={16} />
                <span>{isTh ? 'ทดลองเปิดดูใบรับรองตัวอย่าง' : 'Open Sample Certificate Preview'}</span>
              </button>

              <CertificateModal
                isOpen={certOpen}
                onClose={() => setCertOpen(false)}
                agentName="John Doe (Client Preview)"
                score={94}
                completedAt={new Date().toLocaleDateString()}
              />
            </motion.div>
          )}

          {/* TAB 4: HR ANALYTICS & ROI */}
          {activeTab === 'roi' && (
            <motion.div
              key="roi-tab"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                  <TrendingUp className="text-emerald-400" size={20} />
                  <span>{isTh ? 'แดชบอร์ดสรุปผลการวิเคราะห์ HR Analytics & ROI' : 'Executive HR Analytics & Telemetry Matrix'}</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="p-5 rounded-2xl bg-secondary/30 border border-border/60">
                  <span className="text-xs text-muted-foreground font-bold uppercase block mb-1">Pass Rate Improvement</span>
                  <span className="text-3xl font-black text-emerald-400">+34%</span>
                </div>
                <div className="p-5 rounded-2xl bg-secondary/30 border border-border/60">
                  <span className="text-xs text-muted-foreground font-bold uppercase block mb-1">Time to Competency</span>
                  <span className="text-3xl font-black text-primary">3.2 Days</span>
                </div>
                <div className="p-5 rounded-2xl bg-secondary/30 border border-border/60">
                  <span className="text-xs text-muted-foreground font-bold uppercase block mb-1">Avg AI Coaching Score</span>
                  <span className="text-3xl font-black text-purple-400">89.4 / 100</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
