'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Presentation, Sparkles, ExternalLink, Copy, Check, ShieldCheck,
  TrendingUp, Users, Award, Play, Bot, BrainCircuit, FileCheck, CheckCircle2,
  Zap, Lock, DollarSign, Clock, Layers, ArrowRight
} from 'lucide-react';
import { useLocale } from 'next-intl';
import Link from 'next/link';

interface IndustryPreset {
  id: string;
  name: { th: string; en: string };
  tagline: { th: string; en: string };
  badge: string;
  iconColor: string;
  stats: {
    agentsTrained: string;
    avgPassScore: string;
    coachingHoursSaved: string;
  };
  sampleScenario: {
    title: { th: string; en: string };
    persona: { th: string; en: string };
    verdict: string;
    score: number;
  };
}

const INDUSTRY_PRESETS: IndustryPreset[] = [
  {
    id: 'telesales',
    name: { th: 'B2B Telesales & Sales Coaching', en: 'B2B Telesales & Sales Coaching' },
    tagline: { th: 'ฝึกอบรมทีมขาย โต้ตอบสคริปต์ ปลดล็อกข้อโต้แย้ง และขอนัดหมายอย่างมืออาชีพ', en: 'Master price objection handling, gatekeeper bypass, and closing tactics with AI.' },
    badge: 'Sales & Revenue Growth',
    iconColor: 'from-amber-500/20 to-orange-500/20 text-amber-500 border-amber-500/30',
    stats: { agentsTrained: '240+', avgPassScore: '88%', coachingHoursSaved: '140 hrs/mo' },
    sampleScenario: {
      title: { th: '1. การรับมือคำปฏิเสธเรื่องราคาและเวลา', en: '1. Price Objection Handling & Value Reframe' },
      persona: { th: 'คุณพลอย (ลูกค้ามือใหม่ยุ่ง กังวลเรื่องราคาและเวลา)', en: 'Khun Ploy (Busy beginner, price-sensitive)' },
      verdict: 'passed',
      score: 92
    }
  },
  {
    id: 'trading',
    name: { th: 'Trading Academy & Investor Hub', en: 'Trading Academy & Investor Hub' },
    tagline: { th: 'ประเมินความรู้การเทรด หุ้น Forex การบริหารความเสี่ยง และการวิเคราะห์ตลาด', en: 'Assess trading risk management, technical analysis, and market strategies.' },
    badge: 'Trading & Financial Markets',
    iconColor: 'from-emerald-500/20 to-teal-500/20 text-emerald-500 border-emerald-500/30',
    stats: { agentsTrained: '500+', avgPassScore: '94%', coachingHoursSaved: '320 hrs/mo' },
    sampleScenario: {
      title: { th: '2. การตอบคำถามเชิงเทคนิคและการบริหารความเสี่ยง', en: '2. Technical Trading Risk & Compliance' },
      persona: { th: 'คุณสมชาย (นักลงทุนมืออาชีพ ถามเชิงเทคนิค)', en: 'Khun Somchai (Pro Investor asking Technicals)' },
      verdict: 'passed',
      score: 95
    }
  },
  {
    id: 'enterprise',
    name: { th: 'Enterprise HR & Compliance Training', en: 'Enterprise HR & Compliance Training' },
    tagline: { th: 'วัดผลพนักงานใหม่ นโยบายองค์กร ความปลอดภัยข้อมูล และการออกใบรับรองอัตโนมัติ', en: 'Onboard employees, enforce compliance policies, and issue automated certificates.' },
    badge: 'Corporate Onboarding',
    iconColor: 'from-blue-500/20 to-indigo-500/20 text-blue-500 border-blue-500/30',
    stats: { agentsTrained: '1,200+', avgPassScore: '91%', coachingHoursSaved: '650 hrs/mo' },
    sampleScenario: {
      title: { th: '3. การปฏิบัติตามกฎหมาย PDPA และการรักษาความปลอดภัย', en: '3. Enterprise Security & PDPA Compliance' },
      persona: { th: 'ฝ่ายตรวจสอบระบบภายนอก (External Compliance Auditor)', en: 'External Compliance Auditor' },
      verdict: 'passed',
      score: 89
    }
  }
];

export default function ShowcaseTab() {
  const locale = useLocale();
  const isTh = locale === 'th';
  const [selectedPreset, setSelectedPreset] = useState<IndustryPreset>(INDUSTRY_PRESETS[0]);
  const [teamSize, setTeamSize] = useState<number>(25);
  const [copied, setCopied] = useState(false);
  const [demoPlaying, setDemoPlaying] = useState(false);

  const demoUrl = typeof window !== 'undefined' ? `${window.location.origin}/${locale}/demo` : `/${locale}/demo`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(demoUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // ROI Calculations
  const hoursSavedPerMonth = teamSize * 8; // 8 hrs/mo per employee
  const annualSavingsUSD = Math.round(teamSize * 1450); // ~$1,450/year value per employee

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/15 via-purple-500/10 to-emerald-500/15 border border-primary/20 p-8 shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-primary/20 text-primary border border-primary/30">
              <Presentation size={14} />
              <span>{isTh ? 'Client Sales & Showcase Suite' : 'Client Sales & Showcase Suite'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              {isTh ? 'แพลตฟอร์มนำเสนอโชว์เคสสำหรับลูกค้า & ผู้มีอำนาจตัดสินใจ' : 'Interactive Showcase & Client Demo Suite'}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {isTh 
                ? 'เครื่องมือสาธิตประสิทธิภาพระบบฝึกอบรม AI สำหรับผู้บริหารและลูกค้าภายนอก สามารถเปลี่ยนโหมดตามกลุ่มอุตสาหกรรม คำนวณ ROI และสร้างลิงก์ Demo เพื่อนำเสนอได้ทันที'
                : 'Demonstrate live AI call evaluations, knowledge quizzes, real-time analytics, and automated PDF certificates to prospective enterprise clients.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
            <button
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-secondary/80 hover:bg-secondary text-foreground text-xs font-black border border-border transition-all active:scale-95 shadow-sm"
            >
              {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
              <span>{copied ? (isTh ? 'คัดลอกลิงก์แล้ว!' : 'Link Copied!') : (isTh ? 'คัดลอกลิงก์ Demo' : 'Copy Client Demo Link')}</span>
            </button>

            <Link
              href={`/${locale}/demo`}
              target="_blank"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground text-xs font-black shadow-lg shadow-primary/25 hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all"
            >
              <ExternalLink size={16} />
              <span>{isTh ? 'เปิดหน้า Showcase (Client Hub)' : 'Open Standalone Client Hub'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Industry Preset Selector */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-foreground flex items-center gap-2">
              <Layers className="text-primary" size={20} />
              <span>{isTh ? 'เลือกกลุ่มอุตสาหกรรมเป้าหมาย (Client Presets)' : 'Select Target Client Industry Preset'}</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              {isTh ? 'คลิกเลือกเพื่อปรับแต่งรูปแบบการนำเสนอ ข้อมูลตัวอย่าง และตัวชี้วัดความสำเร็จ' : 'Tailor the showcase metrics and AI scenario previews for specific client vertical markets.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {INDUSTRY_PRESETS.map((preset) => {
            const active = selectedPreset.id === preset.id;
            return (
              <motion.button
                key={preset.id}
                onClick={() => setSelectedPreset(preset)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`p-6 rounded-3xl border text-left transition-all relative overflow-hidden ${
                  active 
                    ? 'bg-card border-primary ring-2 ring-primary/30 shadow-xl'
                    : 'bg-card/40 border-border/60 hover:border-primary/40 hover:bg-card/70'
                }`}
              >
                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${preset.iconColor} border flex items-center justify-center mb-4 font-black`}>
                  <Bot size={20} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border mb-2 inline-block">
                  {preset.badge}
                </span>
                <h4 className="font-black text-base text-foreground mb-1 leading-snug">
                  {isTh ? preset.name.th : preset.name.en}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {isTh ? preset.tagline.th : preset.tagline.en}
                </p>

                <div className="mt-4 pt-4 border-t border-border/40 grid grid-cols-3 gap-2 text-center text-[10px]">
                  <div>
                    <span className="block text-muted-foreground font-semibold">{isTh ? 'ผู้เรียน' : 'Trained'}</span>
                    <span className="font-black text-foreground">{preset.stats.agentsTrained}</span>
                  </div>
                  <div>
                    <span className="block text-muted-foreground font-semibold">{isTh ? 'คะแนนเฉลี่ย' : 'Avg Pass'}</span>
                    <span className="font-black text-emerald-400">{preset.stats.avgPassScore}</span>
                  </div>
                  <div>
                    <span className="block text-muted-foreground font-semibold">{isTh ? 'เวลาที่ลดลง' : 'Saved'}</span>
                    <span className="font-black text-primary">{preset.stats.coachingHoursSaved}</span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Preset Live Demo Preview Card */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-border/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black">
              <Sparkles size={20} />
            </div>
            <div>
              <h4 className="text-base font-black text-foreground">
                {isTh ? selectedPreset.name.th : selectedPreset.name.en} — {isTh ? 'การประเมินการทำงานจริง' : 'Live Interactive Preview'}
              </h4>
              <p className="text-xs text-muted-foreground">
                {isTh ? 'แสดงตัวอย่างจำลองบทสนทนา AI และการประเมินผลแบบ Real-time' : 'Simulated real-time AI conversation and scoring feedback.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setDemoPlaying(!demoPlaying)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-black hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
          >
            <Play size={14} className={demoPlaying ? 'animate-pulse' : ''} />
            <span>{demoPlaying ? (isTh ? 'กำลังเล่นสาธิต...' : 'Simulating AI Evaluation...') : (isTh ? 'ทดลองทดสอบระบบ AI' : 'Trigger Interactive AI Demo')}</span>
          </button>
        </div>

        {/* Live Simulation Visualizer */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-secondary/40 border border-border/60 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
              <span className="flex items-center gap-1.5 text-foreground font-black">
                <Bot size={16} className="text-primary" /> {isTh ? selectedPreset.sampleScenario.title.th : selectedPreset.sampleScenario.title.en}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase">
                {selectedPreset.sampleScenario.verdict}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-card border border-border/50 text-foreground leading-relaxed">
                <span className="font-black text-primary block mb-1">🎭 {isTh ? 'บทบาทลูกค้า AI' : 'AI Customer Persona'}:</span>
                {isTh ? selectedPreset.sampleScenario.persona.th : selectedPreset.sampleScenario.persona.en}
              </div>

              <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 text-foreground leading-relaxed">
                <span className="font-black text-primary block mb-1">💬 {isTh ? 'ตัวอย่างคำตอบพนักงาน (Agent Response)' : 'Sample Agent Response'}:</span>
                {isTh 
                  ? '"สวัสดีค่ะคุณพลอย เข้าใจมากๆ เลยค่ะเรื่องเวลาและค่าใช้จ่าย จุดเด่นของ BrainTrade คือมีโค้ช 1:1 คอยปรับตารางเรียนตามเวลาที่สะดวก และมีระบบ AI ช่วยทำการบ้านให้อัตโนมัติค่ะ ขออนุญาตขอนัดสาธิตสั้นๆ 15 นาทีไหมคะ?"'
                  : '"Hello Khun Ploy! I completely understand your time and budget concerns. BrainTrade offers 1:1 coaching flexible to your schedule and AI automation. May I book a quick 15-min demo?"'}
              </div>
            </div>
          </div>

          <div className="bg-secondary/40 border border-border/60 rounded-2xl p-5 flex flex-col justify-between space-y-4">
            <div>
              <h5 className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                <BrainCircuit size={16} className="text-purple-400" />
                <span>{isTh ? 'ผลการวิเคราะห์ทางปัญญา (Semantic Audit Metrics)' : 'Semantic AI Audit Metrics'}</span>
              </h5>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-card p-3 rounded-xl border border-border/50">
                  <span className="text-[10px] text-muted-foreground font-bold block">{isTh ? 'สร้างความเป็นกันเอง (Rapport)' : 'Rapport Building'}</span>
                  <span className="text-lg font-black text-emerald-400">95 / 100</span>
                </div>
                <div className="bg-card p-3 rounded-xl border border-border/50">
                  <span className="text-[10px] text-muted-foreground font-bold block">{isTh ? 'ขจัดข้อโต้แย้ง (Objection)' : 'Objection Handling'}</span>
                  <span className="text-lg font-black text-emerald-400">90 / 100</span>
                </div>
                <div className="bg-card p-3 rounded-xl border border-border/50">
                  <span className="text-[10px] text-muted-foreground font-bold block">{isTh ? 'ความน่าเชื่อถือ (Credibility)' : 'Credibility & ROI'}</span>
                  <span className="text-lg font-black text-emerald-400">92 / 100</span>
                </div>
                <div className="bg-card p-3 rounded-xl border border-border/50">
                  <span className="text-[10px] text-muted-foreground font-bold block">{isTh ? 'การเสนอปิดนัดหมาย (Closing)' : 'Closing & Demo Lock'}</span>
                  <span className="text-lg font-black text-emerald-400">90 / 100</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 size={16} /> {isTh ? 'ผลสรุปคะแนนรวม:' : 'Overall Score Passed:'}
              </span>
              <span className="text-sm font-black text-emerald-400">{selectedPreset.sampleScenario.score}% (Target: 70%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive ROI & Impact Calculator */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-border/50 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-black">
            <TrendingUp size={20} />
          </div>
          <div>
            <h4 className="text-base font-black text-foreground">
              {isTh ? 'เครื่องคำนวณผลตอบแทนการลงทุน (Client ROI & Impact Calculator)' : 'Client ROI & Impact Calculator'}
            </h4>
            <p className="text-xs text-muted-foreground">
              {isTh ? 'ประเมินมูลค่าความคุ้มค่าและเวลาที่ประหยัดได้สำหรับองค์กรลูกค้า' : 'Estimate team productivity gains, hours saved, and training cost reductions.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-5 bg-secondary/30 p-5 rounded-2xl border border-border/50">
            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-muted-foreground">{isTh ? 'จำนวนพนักงาน / ผู้เรียน:' : 'Team Size (Agents):'}</span>
                <span className="text-foreground font-black text-sm">{teamSize} {isTh ? 'คน' : 'Agents'}</span>
              </div>
              <input
                type="range"
                min="5"
                max="250"
                step="5"
                value={teamSize}
                onChange={(e) => setTeamSize(parseInt(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            <div className="p-4 bg-card rounded-xl border border-border/60 space-y-2 text-xs">
              <span className="text-muted-foreground font-semibold block">{isTh ? 'ประโยชน์หลักที่องค์กรได้รับ:' : 'Core Enterprise Value Delivered:'}</span>
              <ul className="space-y-1.5 text-foreground font-medium">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>{isTh ? 'ประหยัดเวลาโค้ช 1:1 ได้กว่า 80%' : 'Cuts manual 1:1 coaching time by 80%'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>{isTh ? 'ประเมินผลด้วย AI ไร้อคติ 24/7' : '24/7 unbiased AI evaluation feedback'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>{isTh ? 'ออกใบรับรองสถาบันอัตโนมัติ' : 'Automated verified completion certificates'}</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-6 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-primary mb-3">
                <Clock size={24} />
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/20">Monthly</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground font-bold block mb-1">
                  {isTh ? 'เวลาฝึกอบรมที่ประหยัดได้ต่อเดือน' : 'Coaching Hours Saved / Month'}
                </span>
                <span className="text-3xl font-black text-foreground tracking-tight">
                  {hoursSavedPerMonth.toLocaleString()} <span className="text-sm text-primary font-bold">{isTh ? 'ชั่วโมง' : 'hrs'}</span>
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 p-6 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-emerald-400 mb-3">
                <DollarSign size={24} />
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20">Annual Impact</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground font-bold block mb-1">
                  {isTh ? 'มูลค่าความประหยัดโดยประมาณต่อปี' : 'Estimated Annual Value Created'}
                </span>
                <span className="text-3xl font-black text-foreground tracking-tight">
                  ${annualSavingsUSD.toLocaleString()} <span className="text-sm text-emerald-400 font-bold">USD</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Enterprise Feature Audit Checklist */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
        <h4 className="text-base font-black text-foreground flex items-center gap-2">
          <ShieldCheck className="text-primary" size={20} />
          <span>{isTh ? 'ขีดความสามารถหลักของแพลตฟอร์ม (Enterprise Core Capabilities)' : 'Enterprise Core Capabilities Checklist'}</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          {[
            { title: isTh ? 'ระบบประเมิน AI ภาษาไทย/อังกฤษ' : 'Bilingual AI Call Simulator', desc: 'Gemini 2.5 Flash / OpenAI GPT-4o' },
            { title: isTh ? 'ระบบตรวจข้อสอบอัตโนมัติ' : 'Interactive Knowledge Quizzes', desc: 'Prerequisite locks & score rings' },
            { title: isTh ? 'การวิเคราะห์ HR Analytics & Heatmap' : 'HR Skill Heatmap & Telemetry', desc: 'Cohort score matrices & analytics' },
            { title: isTh ? 'การออกใบรับรอง PDF อัตโนมัติ' : 'PDF Certificate Generator', desc: 'Canvas render & custom presets' },
            { title: isTh ? 'โหมดนำเสนอสไลด์ & Drawing' : 'Real-time Presentation Sync', desc: 'Canvas drawing & live slide control' },
            { title: isTh ? 'โหมด Offline Resilience' : 'Offline Retry & Local Cache', desc: 'Zero data loss during network drop' },
          ].map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-secondary/30 border border-border/50 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                <CheckCircle2 size={16} />
              </div>
              <div>
                <h5 className="font-black text-foreground">{item.title}</h5>
                <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
