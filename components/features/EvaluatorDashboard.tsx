'use client';

/**
 * EvaluatorDashboard — Sales Simulation evaluation interface.
 * Fully theme-aware (light/dark) and bilingual (TH/EN).
 *
 * Evaluation template:
 *  Section 1 – Agent Performance (4 items, each Y/N + Comment)
 *  Section 2 – QA Thoughts (free text)
 *  Section 3 – Red Flags (4 checkboxes; any checked = red flag, −25 pts each)
 *
 * Score = 100 − (redFlagCount × 25)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Users, ClipboardCheck, ChevronRight, Save, Check,
  Clock, Edit3, X, ChevronDown, Loader2, Star, BarChart3,
  Activity, TrendingUp, BookOpen, Target, ArrowLeft,
  CheckCircle2, Circle, Zap, AlertTriangle, MessageSquare, LogOut,
} from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';
import LangToggle  from '@/components/ui/LangToggle';
import type {
  Agent, AgentEvaluation, AgentStats,
  SalesCallCriteria, SalesCallPerformanceItem,
} from '@/types';

// ── Translations ───────────────────────────────────────────────────────────

const T = {
  th: {
    panelTitle: 'แผงผู้ประเมิน',
    roleLabel: '🎭 ผู้ประเมินการจำลองการขาย',
    searchPlaceholder: 'ค้นหาเอเจนต์...',
    noAgents: 'ไม่พบเอเจนต์',
    agentCount: (n: number) => `${n} เอเจนต์`,
    totalEvals: 'ประเมินทั้งหมด',
    todayEvals: 'วันนี้',
    avgScore: 'คะแนนเฉลี่ย',
    agentCoverage: 'เอเจนต์ที่ครอบคลุม',
    recentEvals: 'ประเมินล่าสุด',
    selectAgentHint: 'เลือกเอเจนต์จากรายการด้านซ้ายเพื่อเริ่มประเมิน',
    salesEvalSubtitle: 'การประเมินการจำลองการขาย',
    tabNew: '+ ประเมินใหม่',
    tabHistory: (n: number) => n > 0 ? `📋 ประวัติ (${n})` : '📋 ประวัติ',
    trainingPerf: 'ผลการฝึกอบรม',
    trainingScore: 'คะแนนฝึกอบรม',
    trainingProgress: 'ความคืบหน้า',
    quizDetail: 'รายละเอียด Quiz',
    noTrainingData: 'ยังไม่มีข้อมูลการฝึก',
    salesSimBadge: 'Sales Simulation — การจำลองแบบ Roleplay จริง',
    editBanner: 'กำลังแก้ไขการประเมินที่ผ่านมา',
    agentPerfHeader: 'ผลการแสดงของเอเจนต์',
    columnCategory: 'หมวดหมู่',
    columnInvolve: 'มีส่วนร่วม',
    columnComment: 'ความคิดเห็น',
    yLabel: 'ใช่',
    nLabel: 'ไม่',
    commentPlaceholder: 'ความคิดเห็น...',
    qaHeader: 'ความคิดเห็น QA',
    qaLabel: 'สาเหตุหลักที่เอเจนต์ลำบากหรือไม่บรรลุ EPA คืออะไร?',
    qaPlaceholder: 'อธิบายสาเหตุที่เอเจนต์ลำบากหรือไม่บรรลุ EPA...',
    redFlagHeader: 'Red Flags',
    redFlagNote: 'หากมีการกล่าวถึงเกณฑ์ใดก็ตาม จะนับเป็น Red Flag',
    redFlagNoteEn: 'Any of the following criteria mentioned counts as a Red Flag',
    scoreImpact: (n: number) => `ผลกระทบต่อคะแนน: 100 − (${n} × 25)`,
    generalRemarkLabel: 'บันทึกทั่วไป',
    generalRemarkPlaceholder: 'หมายเหตุการประเมินโดยรวม...',
    saveBtnNew: (score: number) => `บันทึกการประเมิน (${score}/100)`,
    saveBtnEdit: 'อัปเดตการประเมิน',
    saveBtnSuccess: 'บันทึกแล้ว',
    noHistory: 'ยังไม่มีการประเมินสำหรับเอเจนต์นี้',
    startFirst: 'เริ่มการประเมินแรก',
    editLabel: 'แก้ไข',
    salesSimLabel: 'Sales Simulation',
    agentPerfSection: 'ผลการแสดงของเอเจนต์',
    qaSection: 'ความคิดเห็น QA',
    redFlagsSection: 'Red Flags',
    passedLabel: 'ผ่าน',
    failedLabel: 'ไม่ผ่าน',
    aiEvalAvg: 'AI Eval เฉลี่ย',
    sessions: (n: number) => `${n} เซสชัน`,
    allAgentsOverview: 'ภาพรวมทีมทั้งหมด',
    moduleCompletion: 'อัตราผ่านโมดูล',
    agentsCompleted: (n: number, total: number) => `${n}/${total} เอเจนต์`,
    evaluate: 'เริ่มประเมิน',
    viewDetails: 'รายละเอียด',
    overallPerf: 'ผลงานโดยรวม',
    trainingTeamAvg: 'คะแนนเฉลี่ยทีม',
    agentsGrid: 'เอเจนต์ทั้งหมด',
    noStatsYet: 'ยังไม่มีข้อมูลการฝึก',
  },
  en: {
    panelTitle: 'Evaluator Panel',
    roleLabel: '🎭 Sales Simulation Evaluator',
    searchPlaceholder: 'Search agents...',
    noAgents: 'No agents found',
    agentCount: (n: number) => `${n} agent${n !== 1 ? 's' : ''}`,
    totalEvals: 'Total Evaluations',
    todayEvals: 'Today',
    avgScore: 'Avg Score',
    agentCoverage: 'Agent Coverage',
    recentEvals: 'Recent Evaluations',
    selectAgentHint: 'Select an agent from the list to start evaluating',
    salesEvalSubtitle: 'Sales Simulation Evaluation',
    tabNew: '+ New Evaluation',
    tabHistory: (n: number) => n > 0 ? `📋 History (${n})` : '📋 History',
    trainingPerf: 'Training Performance',
    trainingScore: 'Training Score',
    trainingProgress: 'Training Progress',
    quizDetail: 'Quiz Detail',
    noTrainingData: 'No training data yet',
    salesSimBadge: 'Sales Simulation — Real-world Roleplay',
    editBanner: 'Editing a past evaluation',
    agentPerfHeader: 'Agent Performance',
    columnCategory: 'Category',
    columnInvolve: 'Involve',
    columnComment: 'Comment',
    yLabel: 'Y',
    nLabel: 'N',
    commentPlaceholder: 'Comment...',
    qaHeader: 'QA Thoughts',
    qaLabel: 'What might be the main reasons that the agent struggled or did not achieve EPA?',
    qaPlaceholder: 'Describe why the agent struggled or did not achieve EPA...',
    redFlagHeader: 'Red Flags',
    redFlagNote: 'หากมีการกล่าวถึงเกณฑ์ใดก็ตาม จะนับเป็น Red Flag',
    redFlagNoteEn: 'Any of the following criteria mentioned counts as a Red Flag',
    scoreImpact: (n: number) => `Score impact: 100 − (${n} × 25)`,
    generalRemarkLabel: 'General Remark',
    generalRemarkPlaceholder: 'Overall evaluation notes...',
    saveBtnNew: (score: number) => `Save Evaluation (${score}/100)`,
    saveBtnEdit: 'Update Evaluation',
    saveBtnSuccess: 'Saved',
    noHistory: 'No evaluations yet for this agent',
    startFirst: 'Start the first evaluation',
    editLabel: 'Edit',
    salesSimLabel: 'Sales Simulation',
    agentPerfSection: 'Agent Performance',
    qaSection: 'QA Thoughts',
    redFlagsSection: 'Red Flags',
    passedLabel: 'Passed',
    failedLabel: 'Failed',
    aiEvalAvg: 'AI Eval avg',
    sessions: (n: number) => `${n} session${n !== 1 ? 's' : ''}`,
    allAgentsOverview: 'All Agents Overview',
    moduleCompletion: 'Module Completion Rate',
    agentsCompleted: (n: number, total: number) => `${n}/${total} agents`,
    evaluate: 'Evaluate',
    viewDetails: 'Details',
    overallPerf: 'Overall Performance',
    trainingTeamAvg: 'Team Avg Score',
    agentsGrid: 'All Agents',
    noStatsYet: 'No training data yet',
  },
} as const;

type Lang = 'th' | 'en';

// ── Evaluation template config ─────────────────────────────────────────────

const PERFORMANCE_ITEMS: {
  key: keyof SalesCallCriteria['performance'];
  labelEn: string;
  labelTh: string;
}[] = [
  { key: 'agentStruggle',         labelEn: "Agent's Struggle",        labelTh: 'การดิ้นรน / ความลำบาก' },
  { key: 'unhandledQuestions',    labelEn: 'Unhandled Questions',     labelTh: 'คำถามที่ตอบไม่ได้' },
  { key: 'toneOfVoice',           labelEn: 'Tone of Voice',           labelTh: 'น้ำเสียง' },
  { key: 'chemistryFriendliness', labelEn: 'Chemistry / Friendliness',labelTh: 'เคมี / ความเป็นมิตร' },
];

const RED_FLAG_ITEMS: {
  key: keyof SalesCallCriteria['redFlags'];
  labelEn: string;
  labelTh: string;
  guidelineEn: string;
  guidelineTh: string;
}[] = [
  {
    key: 'officeLocation',
    labelEn: 'Office Location',
    labelTh: 'ตำแหน่งที่ตั้งสำนักงาน',
    guidelineEn: 'Can tell office is in Bangkok. Cannot specify further.',
    guidelineTh: 'สามารถบอกได้ว่า HC มาจากบัลแกเรียหรือยุโรป / ออฟฟิศอยู่กทม',
  },
  {
    key: 'withdrawalAfterDeposit',
    labelEn: 'Withdrawal after Deposit',
    labelTh: 'การถอนเงินหลังจากการฝาก',
    guidelineEn: 'Client has full authority to control their own account.',
    guidelineTh: 'ลูกค้ามีอำนาจเต็มในการควบคุมบัญชีของตัวเองและสามารถทำอะไรกับบัญชีตามที่ต้องการ',
  },
  {
    key: 'exaggeratingProfit',
    labelEn: 'Exaggerating Profit',
    labelTh: 'การพูดเกินจริงเกี่ยวกับกำไร',
    guidelineEn: 'Give approximate numbers / historical data / probability only.',
    guidelineTh: 'ให้ตัวเลขประมาณการ / ให้ข้อมูลทางประวัติศาสตร์ / ให้ความน่าจะเป็น',
  },
  {
    key: 'actualCommission',
    labelEn: 'Actual Commission Amount',
    labelTh: 'การให้จำนวนค่านายหน้าแท้จริง',
    guidelineEn: 'Give approximate number / historical data / probability. Can tell depending on Mentor.',
    guidelineTh: 'ให้ตัวเลขประมาณการ / ให้ข้อมูลทางประวัติศาสตร์ / ให้ความน่าจะเป็น',
  },
];

const MODULE_ORDER = [
  { key: 'learn',   labelEn: 'Learn',   labelTh: 'เรียนรู้',     icon: BookOpen,   color: '#60A5FA' },
  { key: 'quiz',    labelEn: 'Quiz',    labelTh: 'แบบทดสอบ',    icon: Target,     color: '#FBBF24' },
  { key: 'ai-eval', labelEn: 'AI Eval', labelTh: 'AI ประเมิน', icon: Zap,        color: '#A78BFA' },
  { key: 'pitch',   labelEn: 'Pitch',   labelTh: 'พิช',          icon: TrendingUp, color: '#FB923C' },
] as const;

// ── Empty form state ───────────────────────────────────────────────────────

function emptyPerf(): SalesCallPerformanceItem {
  return { agentInvolve: false, comment: '', remark: '' };
}

function emptyCriteria(): SalesCallCriteria {
  return {
    performance: {
      agentStruggle:         emptyPerf(),
      unhandledQuestions:    emptyPerf(),
      toneOfVoice:           emptyPerf(),
      chemistryFriendliness: emptyPerf(),
    },
    qaThoughts: '',
    redFlags: {
      officeLocation:         false,
      withdrawalAfterDeposit: false,
      exaggeratingProfit:     false,
      actualCommission:       false,
    },
    generalRemark: '',
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────

function calcScore(criteria: SalesCallCriteria): number {
  const flagCount = Object.values(criteria.redFlags).filter(Boolean).length;
  return Math.max(0, 100 - flagCount * 25);
}

function scoreHex(n: number) {
  return n >= 70 ? '#60A5FA' : n >= 50 ? '#FBBF24' : '#F87171';
}

function timeAgo(iso: string, lang: Lang): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (lang === 'th') {
    if (m < 2)  return 'เมื่อกี้';
    if (m < 60) return `${m} นาทีที่แล้ว`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} ชั่วโมงที่แล้ว`;
    return `${Math.floor(h / 24)} วันที่แล้ว`;
  } else {
    if (m < 2)  return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  }
}

// ── ScoreRing ──────────────────────────────────────────────────────────────

function ScoreRing({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' }) {
  const dim  = size === 'sm' ? 56 : 72;
  const r    = size === 'sm' ? 20 : 28;
  const sw   = size === 'sm' ? 4  : 5;
  const fs   = size === 'sm' ? 13 : 16;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const clr  = scoreHex(score);
  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: dim, height: dim }}>
      <svg className="absolute inset-0" viewBox={`0 0 ${dim} ${dim}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={dim/2} cy={dim/2} r={r} fill="none" stroke="currentColor" className="text-muted-foreground/15" strokeWidth={sw} />
        <motion.circle
          cx={dim/2} cy={dim/2} r={r} fill="none" stroke={clr} strokeWidth={sw}
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ filter: `drop-shadow(0 0 4px ${clr}50)` }}
        />
      </svg>
      <span className="font-black" style={{ fontFamily: "'Syne', sans-serif", color: clr, fontSize: fs }}>
        {score}
      </span>
    </div>
  );
}

// ── ModuleSection ──────────────────────────────────────────────────────────

function ModuleSection({
  icon: Icon, color, title, completedCount, totalCount, children,
}: {
  icon: React.ElementType; color: string; title: string;
  completedCount: number; totalCount: number; children: React.ReactNode;
}) {
  const isComplete = completedCount >= totalCount;
  return (
    <div className="rounded-xl overflow-hidden border border-border">
      <div className="px-3 py-2 flex items-center gap-2 border-b border-border" style={{ background: `${color}08` }}>
        <div className="p-1 rounded-md" style={{ background: `${color}18` }}>
          <Icon size={10} style={{ color }} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-wider text-foreground" style={{ fontFamily: "'Syne', sans-serif" }}>
          {title}
        </span>
        <div className="ml-auto flex items-center gap-1">
          <span className="text-[10px] font-bold" style={{ color: isComplete ? '#60A5FA' : completedCount > 0 ? color : 'hsl(var(--muted-foreground) / 0.3)' }}>
            {completedCount}/{totalCount}
          </span>
          {isComplete
            ? <CheckCircle2 size={10} className="text-blue-500" />
            : <Circle size={10} className="text-muted-foreground/25" />
          }
        </div>
      </div>
      <div className="bg-card px-3 py-2.5 space-y-1.5">
        {children}
      </div>
    </div>
  );
}

// ── AgentPerformancePanel ──────────────────────────────────────────────────

function AgentPerformancePanel({
  stats, loading, lang,
}: { stats: AgentStats | null; loading: boolean; lang: Lang }) {
  const t = T[lang];

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <Loader2 size={22} className="animate-spin text-blue-500/50" />
    </div>
  );
  if (!stats) return (
    <div className="flex flex-col items-center justify-center h-48 gap-2 text-muted-foreground/40">
      <BarChart3 size={24} />
      <p className="text-xs">{t.noTrainingData}</p>
    </div>
  );

  const BADGE_STYLE: Record<string, { label: string; color: string; bg: string }> = {
    'elite':      { label: 'Elite',      color: '#A78BFA', bg: 'rgba(167,139,250,0.12)' },
    'strong':     { label: 'Strong',     color: '#60A5FA', bg: 'rgba(96,165,250,0.12)'  },
    'developing': { label: 'Developing', color: '#FBBF24', bg: 'rgba(251,191,36,0.12)'  },
    'needs-work': { label: 'Needs Help', color: '#F87171', bg: 'rgba(248,113,113,0.12)' },
  };
  const badge = BADGE_STYLE[stats.badge] ?? BADGE_STYLE['needs-work'];

  const quizTopics          = ['product', 'process', 'payment'] as const;
  const learnAccessed       = quizTopics.filter(m => !!stats.quiz[m]).length;
  const quizPassedCount     = quizTopics.filter(m => stats.quiz[m]?.passed).length;
  const completedPitchLevels = stats.pitch?.completedLevels ?? [];
  const completedEvalLevels  = stats.evalCompletedLevels ?? [];

  return (
    <div className="space-y-2.5">

      {/* Overall score */}
      <div className="bg-card border border-border rounded-xl p-3.5 flex items-center gap-3">
        <ScoreRing score={stats.overallScore} />
        <div className="flex-1 min-w-0">
          <div className="text-[10px] text-muted-foreground mb-1">{t.trainingScore}</div>
          <div className="text-xs font-bold px-2 py-0.5 rounded-full inline-block" style={{ background: badge.bg, color: badge.color }}>
            {badge.label}
          </div>
          {stats.lastActive && (
            <div className="flex items-center gap-1 mt-1.5">
              <Clock size={9} className="text-muted-foreground/50" />
              <span className="text-[10px] text-muted-foreground/50">{timeAgo(stats.lastActive, lang)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Module 1: Learn — Courses */}
      <ModuleSection icon={BookOpen} color="#60A5FA" title={lang === 'th' ? 'เรียนรู้ — คอร์ส' : 'Learn — Courses'} completedCount={learnAccessed} totalCount={3}>
        {quizTopics.map(m => {
          const accessed = !!stats.quiz[m];
          const passed   = stats.quiz[m]?.passed;
          return (
            <div key={m} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {accessed
                  ? <CheckCircle2 size={9} style={{ color: passed ? '#60A5FA' : '#FBBF24' }} />
                  : <Circle size={9} className="text-muted-foreground/25" />
                }
                <span className="text-[11px] capitalize text-foreground">{m}</span>
              </div>
              <span className="text-[10px] font-medium" style={{ color: accessed ? (passed ? '#60A5FA' : '#FBBF24') : 'hsl(var(--muted-foreground) / 0.3)' }}>
                {accessed
                  ? (lang === 'th' ? 'เข้าถึงแล้ว' : 'Accessed')
                  : (lang === 'th' ? 'ยังไม่เริ่ม' : 'Not started')}
              </span>
            </div>
          );
        })}
      </ModuleSection>

      {/* Module 2: Quiz */}
      <ModuleSection icon={Target} color="#FBBF24" title={lang === 'th' ? 'แบบทดสอบ' : 'Quiz'} completedCount={quizPassedCount} totalCount={3}>
        {quizTopics.map(m => {
          const qs = stats.quiz[m];
          return (
            <div key={m} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {qs?.passed
                  ? <CheckCircle2 size={9} className="text-blue-500" />
                  : qs
                    ? <AlertTriangle size={9} className="text-amber-400" />
                    : <Circle size={9} className="text-muted-foreground/25" />
                }
                <span className="text-[11px] capitalize text-foreground">{m}</span>
              </div>
              {qs ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold" style={{ color: qs.passed ? '#60A5FA' : '#F87171' }}>{qs.bestScore}%</span>
                  <span className="text-[9px] px-1 py-0.5 rounded font-medium" style={{ background: qs.passed ? 'rgba(96,165,250,0.1)' : 'rgba(248,113,113,0.1)', color: qs.passed ? '#60A5FA' : '#F87171' }}>
                    {qs.passed ? t.passedLabel : t.failedLabel}
                  </span>
                  <span className="text-[9px] text-muted-foreground/50">{qs.attempts}×</span>
                </div>
              ) : (
                <span className="text-[10px] text-muted-foreground/30">—</span>
              )}
            </div>
          );
        })}
      </ModuleSection>

      {/* Module 3: AI Eval */}
      <ModuleSection icon={Zap} color="#A78BFA" title={lang === 'th' ? 'AI ประเมิน' : 'AI Eval'} completedCount={completedEvalLevels.length} totalCount={4}>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">{t.aiEvalAvg}</span>
          {stats.aiEval
            ? <span className="text-[11px] font-bold" style={{ color: scoreHex(stats.aiEval.avgScore) }}>{stats.aiEval.avgScore}/100</span>
            : <span className="text-[10px] text-muted-foreground/30">—</span>
          }
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">{lang === 'th' ? 'เซสชัน' : 'Sessions'}</span>
          <span className="text-[11px] text-foreground">{stats.aiEval?.count ?? 0}</span>
        </div>
        <div className="flex items-center gap-1.5 pt-0.5">
          <span className="text-[10px] text-muted-foreground">{lang === 'th' ? 'ระดับ:' : 'Levels:'}</span>
          {[1, 2, 3, 4].map(l => {
            const done = completedEvalLevels.includes(l);
            return (
              <div key={l} className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-black"
                style={{
                  background: done ? 'rgba(167,139,250,0.15)' : 'hsl(var(--secondary))',
                  color: done ? '#A78BFA' : 'hsl(var(--muted-foreground) / 0.3)',
                  border: `1px solid ${done ? 'rgba(167,139,250,0.3)' : 'hsl(var(--border))'}`,
                }}
              >
                {done ? <Check size={7} /> : l}
              </div>
            );
          })}
        </div>
      </ModuleSection>

      {/* Module 4: Pitch Simulator */}
      <ModuleSection icon={TrendingUp} color="#FB923C" title={lang === 'th' ? 'พิช ซิมูเลเตอร์' : 'Pitch Simulator'} completedCount={completedPitchLevels.length} totalCount={3}>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">{lang === 'th' ? 'เซสชัน' : 'Sessions'}</span>
          <span className="text-[11px] text-foreground">{stats.pitch?.sessionCount ?? 0}</span>
        </div>
        <div className="flex items-center gap-1.5 pt-0.5">
          <span className="text-[10px] text-muted-foreground">{lang === 'th' ? 'ระดับ:' : 'Levels:'}</span>
          {[1, 2, 3].map(l => {
            const done = completedPitchLevels.includes(l);
            return (
              <div key={l} className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-black"
                style={{
                  background: done ? 'rgba(251,146,60,0.15)' : 'hsl(var(--secondary))',
                  color: done ? '#FB923C' : 'hsl(var(--muted-foreground) / 0.3)',
                  border: `1px solid ${done ? 'rgba(251,146,60,0.3)' : 'hsl(var(--border))'}`,
                }}
              >
                {done ? <Check size={7} /> : l}
              </div>
            );
          })}
        </div>
      </ModuleSection>

    </div>
  );
}

// ── EvalForm ───────────────────────────────────────────────────────────────

function EvalForm({
  criteria, onChange, lang,
}: {
  criteria: SalesCallCriteria;
  onChange: (c: SalesCallCriteria) => void;
  lang: Lang;
}) {
  const t = T[lang];

  function setPerf(key: keyof SalesCallCriteria['performance'], field: keyof SalesCallPerformanceItem, val: unknown) {
    onChange({ ...criteria, performance: { ...criteria.performance, [key]: { ...criteria.performance[key], [field]: val } } });
  }
  function setRedFlag(key: keyof SalesCallCriteria['redFlags'], val: boolean) {
    onChange({ ...criteria, redFlags: { ...criteria.redFlags, [key]: val } });
  }
  const redFlagCount = Object.values(criteria.redFlags).filter(Boolean).length;

  return (
    <div className="space-y-5">

      {/* ─ Section 1: Agent Performance ─ */}
      <div className="rounded-2xl overflow-hidden border border-border">
        <div className="px-4 py-3 bg-blue-500/[0.07] border-b border-border">
          <span className="text-xs font-black text-foreground uppercase tracking-wider">{t.agentPerfHeader}</span>
        </div>
        {/* Table header */}
        <div className="grid px-4 py-2 text-[9px] font-bold text-muted-foreground uppercase tracking-wider bg-secondary/20 border-b border-border"
          style={{ gridTemplateColumns: '1fr 64px 1fr' }}>
          <span>{t.columnCategory}</span>
          <span className="text-center">{t.columnInvolve}</span>
          <span>{t.columnComment}</span>
        </div>
        {/* Rows */}
        {PERFORMANCE_ITEMS.map((item, i) => {
          const perf = criteria.performance[item.key];
          const label = lang === 'th' ? item.labelTh : item.labelEn;
          const subLabel = lang === 'th' ? item.labelEn : item.labelTh;
          return (
            <div key={item.key}
              className={`grid px-4 py-3 gap-3 items-start ${i < PERFORMANCE_ITEMS.length - 1 ? 'border-b border-border' : ''} ${i % 2 === 0 ? 'bg-card' : 'bg-secondary/20'}`}
              style={{ gridTemplateColumns: '1fr 64px 1fr' }}
            >
              {/* Category */}
              <div>
                <div className="text-xs font-semibold text-foreground">{label}</div>
                <div className="text-[10px] text-muted-foreground/60 mt-0.5">{subLabel}</div>
              </div>
              {/* Y/N toggle */}
              <div className="flex flex-col items-center gap-1 pt-0.5">
                <button
                  onClick={() => setPerf(item.key, 'agentInvolve', !perf.agentInvolve)}
                  className="w-9 h-5 rounded-full relative transition-all shrink-0"
                  style={{
                    background: perf.agentInvolve ? 'rgba(96,165,250,0.3)' : undefined,
                    border: `1px solid ${perf.agentInvolve ? 'rgba(96,165,250,0.6)' : 'hsl(var(--border))'}`,
                    backgroundColor: perf.agentInvolve ? undefined : 'hsl(var(--secondary))',
                  }}
                >
                  <motion.span
                    animate={{ x: perf.agentInvolve ? 16 : 2 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="absolute top-0.5 w-3.5 h-3.5 rounded-full"
                    style={{ background: perf.agentInvolve ? '#60A5FA' : 'hsl(var(--muted-foreground) / 0.4)' }}
                  />
                </button>
                <span className="text-[9px] text-muted-foreground font-bold">
                  {perf.agentInvolve ? t.yLabel : t.nLabel}
                </span>
              </div>
              {/* Comment */}
              <textarea
                value={perf.comment}
                onChange={e => setPerf(item.key, 'comment', e.target.value)}
                placeholder={t.commentPlaceholder}
                rows={2}
                className="w-full px-2.5 py-2 rounded-lg text-[11px] text-foreground outline-none resize-none transition-colors placeholder:text-muted-foreground/40 bg-secondary/40 border border-border focus:border-blue-500/40"
              />
            </div>
          );
        })}
      </div>

      {/* ─ Section 2: QA Thoughts ─ */}
      <div className="rounded-2xl overflow-hidden border border-border">
        <div className="px-4 py-3 bg-blue-500/[0.07] border-b border-border">
          <span className="text-xs font-black text-foreground uppercase tracking-wider">{t.qaHeader}</span>
        </div>
        <div className="p-4 bg-card">
          <label className="block text-[10px] text-muted-foreground mb-2">{t.qaLabel}</label>
          <textarea
            value={criteria.qaThoughts}
            onChange={e => onChange({ ...criteria, qaThoughts: e.target.value })}
            placeholder={t.qaPlaceholder}
            rows={4}
            className="w-full px-3 py-2.5 rounded-xl text-xs text-foreground outline-none resize-none transition-colors placeholder:text-muted-foreground/40 bg-secondary/40 border border-border focus:border-blue-500/40"
          />
        </div>
      </div>

      {/* ─ Section 3: Red Flags ─ */}
      <div className={`rounded-2xl overflow-hidden border transition-colors ${redFlagCount > 0 ? 'border-red-500/35' : 'border-border'}`}>
        {/* Header */}
        <div className={`px-4 py-3 flex items-center justify-between border-b border-border ${redFlagCount > 0 ? 'bg-red-500/10' : 'bg-red-500/5'}`}>
          <div className="flex items-center gap-2">
            <AlertTriangle size={13} className="text-red-400" />
            <span className="text-xs font-black text-foreground uppercase tracking-wider">{t.redFlagHeader}</span>
            <span className="text-[10px] text-muted-foreground">— {lang === 'th' ? 'มีใดๆ = red flag' : 'any checked = red flag'}</span>
          </div>
          {redFlagCount > 0 && (
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40">
              {redFlagCount} FLAG{redFlagCount > 1 ? 'S' : ''}
            </span>
          )}
        </div>
        {/* Reference note */}
        <div className="px-4 py-2 text-[10px] text-muted-foreground bg-secondary/10 border-b border-border">
          {t.redFlagNote} · {t.redFlagNoteEn}
        </div>
        {/* Items */}
        <div>
          {RED_FLAG_ITEMS.map((item, i) => {
            const checked = criteria.redFlags[item.key];
            return (
              <div key={item.key}
                className={`px-4 py-3 ${checked ? 'bg-red-500/5' : i % 2 === 0 ? 'bg-card' : 'bg-secondary/20'} ${i < RED_FLAG_ITEMS.length - 1 ? 'border-b border-border' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => setRedFlag(item.key, !checked)}
                    className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 transition-all border ${checked ? 'bg-red-500/30 border-red-500/70' : 'bg-secondary border-border'}`}
                  >
                    {checked && <X size={9} className="text-red-400" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-semibold ${checked ? 'text-red-400' : 'text-foreground'}`}>
                        {lang === 'th' ? item.labelTh : item.labelEn}
                      </span>
                      <span className="text-[10px] text-muted-foreground/60">
                        / {lang === 'th' ? item.labelEn : item.labelTh}
                      </span>
                      {checked && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500/15 text-red-400">RED FLAG</span>
                      )}
                    </div>
                    <div className="text-[10px] text-muted-foreground/60 mt-0.5">
                      {lang === 'th' ? item.guidelineTh : item.guidelineEn}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {/* Score preview */}
        <div className="px-4 py-3 flex items-center justify-between bg-card border-t border-border">
          <span className="text-[10px] text-muted-foreground">{t.scoreImpact(redFlagCount)}</span>
          <span className="text-sm font-black" style={{ fontFamily: "'Syne', sans-serif", color: scoreHex(calcScore(criteria)) }}>
            {calcScore(criteria)}/100
          </span>
        </div>
      </div>

      {/* ─ General Remark ─ */}
      <div>
        <label className="block text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-wider">
          {t.generalRemarkLabel}
        </label>
        <textarea
          value={criteria.generalRemark}
          onChange={e => onChange({ ...criteria, generalRemark: e.target.value })}
          placeholder={t.generalRemarkPlaceholder}
          rows={3}
          className="w-full px-4 py-3 rounded-xl text-sm text-foreground outline-none resize-none transition-colors placeholder:text-muted-foreground/40 bg-secondary/40 border border-border focus:border-blue-500/40"
        />
      </div>
    </div>
  );
}

// ── EvalHistoryCard ────────────────────────────────────────────────────────

function EvalHistoryCard({
  ev, onEdit, lang,
}: { ev: AgentEvaluation; onEdit: (ev: AgentEvaluation) => void; lang: Lang }) {
  const [expanded, setExpanded] = useState(false);
  const t = T[lang];
  const c = ev.criteria as SalesCallCriteria;
  const redFlagCount = c?.redFlags ? Object.values(c.redFlags).filter(Boolean).length : 0;

  return (
    <div className="rounded-2xl overflow-hidden bg-card border border-border">
      <button
        className="w-full flex items-center gap-4 px-4 py-3.5 text-left hover:bg-secondary/30 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <ScoreRing score={ev.totalScore} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="text-xs font-bold text-foreground" style={{ fontFamily: "'Syne', sans-serif" }}>
              {t.salesSimLabel}
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
              {ev.evaluatorName}
            </span>
            {redFlagCount > 0 && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500/15 text-red-400">
                {redFlagCount} 🚩
              </span>
            )}
          </div>
          {c?.generalRemark && (
            <p className="text-[11px] text-muted-foreground truncate">{c.generalRemark}</p>
          )}
          <div className="flex items-center gap-1 mt-1">
            <Clock size={9} className="text-muted-foreground/40" />
            <span className="text-[9px] text-muted-foreground/40">{timeAgo(ev.evaluatedAt, lang)}</span>
          </div>
        </div>
        <ChevronDown size={12} className={`text-muted-foreground shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-border">
              {c?.performance && (
                <div className="pt-3 space-y-2">
                  <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{t.agentPerfSection}</div>
                  {PERFORMANCE_ITEMS.map(item => {
                    const p = c.performance[item.key];
                    if (!p?.comment && !p?.agentInvolve) return null;
                    return (
                      <div key={item.key} className="flex items-start gap-2">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 mt-0.5 ${p.agentInvolve ? 'bg-blue-500/10 text-blue-500' : 'bg-secondary text-muted-foreground'}`}>
                          {p.agentInvolve ? t.yLabel : t.nLabel}
                        </span>
                        <div>
                          <div className="text-[10px] text-muted-foreground">{lang === 'th' ? item.labelTh : item.labelEn}</div>
                          {p.comment && <div className="text-[11px] text-foreground mt-0.5">{p.comment}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {c?.qaThoughts && (
                <div className="rounded-xl p-2.5 bg-secondary/30">
                  <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{t.qaSection}</div>
                  <p className="text-[11px] text-foreground whitespace-pre-wrap">{c.qaThoughts}</p>
                </div>
              )}
              {redFlagCount > 0 && (
                <div className="rounded-xl p-2.5 bg-red-500/5 border border-red-500/15">
                  <div className="text-[9px] font-bold text-red-500/70 uppercase tracking-wider mb-1.5">
                    {redFlagCount} {t.redFlagsSection}
                  </div>
                  {RED_FLAG_ITEMS.filter(item => c.redFlags[item.key]).map(item => (
                    <div key={item.key} className="flex items-center gap-1.5 text-[11px] text-red-400/80 mb-1">
                      <X size={9} className="text-red-400" />
                      {lang === 'th' ? item.labelTh : item.labelEn}
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => onEdit(ev)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <Edit3 size={11} /> {t.editLabel}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── AgentOverviewCard ──────────────────────────────────────────────────────

function AgentOverviewCard({
  stats, evaluatedByMe, lang, onEvaluate,
}: {
  stats: AgentStats;
  evaluatedByMe: boolean;
  lang: Lang;
  onEvaluate: (agent: Agent) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const t = T[lang];

  const BADGE_STYLE: Record<string, { label: string; color: string; bg: string }> = {
    'elite':      { label: 'Elite',      color: '#A78BFA', bg: 'rgba(167,139,250,0.12)' },
    'strong':     { label: 'Strong',     color: '#60A5FA', bg: 'rgba(96,165,250,0.12)'  },
    'developing': { label: 'Developing', color: '#FBBF24', bg: 'rgba(251,191,36,0.12)'  },
    'needs-work': { label: 'Needs Help', color: '#F87171', bg: 'rgba(248,113,113,0.12)' },
  };
  const badge = BADGE_STYLE[stats.badge] ?? BADGE_STYLE['needs-work'];

  function moduleScore(key: string): number {
    if (key === 'learn')   return Object.keys(stats.quiz).length > 0 ? 100 : 0;
    if (key === 'quiz')    return Math.round((['product','process','payment'] as const).filter(m => stats.quiz[m]?.passed).length / 3 * 100);
    if (key === 'ai-eval') return stats.aiEval ? Math.min(100, Math.round(stats.aiEval.count / 4 * 100)) : 0;
    if (key === 'pitch')   return Math.round((stats.pitch?.completedLevels?.length ?? 0) / 3 * 100);
    return 0;
  }

  return (
    <motion.div
      layout
      className="bg-card/60 backdrop-blur-md border border-white/10 dark:border-white/5 rounded-2xl overflow-hidden hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      {/* Card header */}
      <div className="p-4 flex items-start gap-3">
        <ScoreRing score={stats.overallScore} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-black text-foreground truncate" style={{ fontFamily: "'Syne', sans-serif" }}>
              {stats.agent.name}
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: badge.bg, color: badge.color }}>
              {badge.label}
            </span>
            {evaluatedByMe && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                ✓ {lang === 'th' ? 'ประเมินแล้ว' : 'Evaluated'}
              </span>
            )}
          </div>
          {/* Mini module bars */}
          <div className="flex gap-1.5 mt-2">
            {MODULE_ORDER.map(mod => {
              const pct = moduleScore(mod.key);
              return (
                <div key={mod.key} className="flex-1">
                  <div className="h-1 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: pct === 100 ? '#60A5FA' : mod.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Actions row */}
      <div className="px-4 pb-3 flex items-center gap-2">
        <button
          onClick={() => onEvaluate(stats.agent)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] relative z-10"
        >
          <ClipboardCheck size={12} />
          {t.evaluate}
        </button>
        <button
          onClick={() => setExpanded(v => !v)}
          className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
            expanded ? 'bg-secondary border-border text-foreground' : 'border-border text-muted-foreground hover:text-foreground hover:bg-secondary/50'
          }`}
        >
          {t.viewDetails}
          <ChevronDown size={11} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-border space-y-3">

              {/* Courses — confirm all topics accessed */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <BookOpen size={9} style={{ color: '#60A5FA' }} />
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                    {lang === 'th' ? 'คอร์ส' : 'Courses'}
                  </span>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {(['product', 'process', 'payment'] as const).map(m => {
                    const accessed = !!stats.quiz[m];
                    const passed   = stats.quiz[m]?.passed;
                    return (
                      <div key={m} className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-medium"
                        style={{
                          background: accessed ? (passed ? 'rgba(96,165,250,0.1)' : 'rgba(251,191,36,0.1)') : 'hsl(var(--secondary))',
                          color: accessed ? (passed ? '#60A5FA' : '#FBBF24') : 'hsl(var(--muted-foreground) / 0.4)',
                          border: `1px solid ${accessed ? (passed ? 'rgba(96,165,250,0.25)' : 'rgba(251,191,36,0.25)') : 'transparent'}`,
                        }}>
                        {accessed ? <CheckCircle2 size={7} /> : <Circle size={7} />}
                        <span className="capitalize ml-0.5">{m}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quiz per topic */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Target size={9} style={{ color: '#FBBF24' }} />
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                    {lang === 'th' ? 'แบบทดสอบ' : 'Quiz'}
                  </span>
                </div>
                {(['product', 'process', 'payment'] as const).map(m => {
                  const qs = stats.quiz[m];
                  return (
                    <div key={m} className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1.5">
                        {qs?.passed ? <CheckCircle2 size={8} className="text-blue-500" />
                          : qs ? <AlertTriangle size={8} className="text-amber-400" />
                          : <Circle size={8} className="text-muted-foreground/25" />
                        }
                        <span className="text-[10px] text-muted-foreground capitalize">{m}</span>
                      </div>
                      {qs ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold" style={{ color: qs.passed ? '#60A5FA' : '#F87171' }}>{qs.bestScore}%</span>
                          <span className="text-[8px] px-1 py-0.5 rounded" style={{ background: qs.passed ? 'rgba(96,165,250,0.1)' : 'rgba(248,113,113,0.1)', color: qs.passed ? '#60A5FA' : '#F87171' }}>
                            {qs.passed ? t.passedLabel : t.failedLabel}
                          </span>
                          <span className="text-[9px] text-muted-foreground/50">{qs.attempts}×</span>
                        </div>
                      ) : <span className="text-[10px] text-muted-foreground/30">—</span>}
                    </div>
                  );
                })}
              </div>

              {/* AI Eval + Pitch side by side */}
              <div className="flex gap-2">
                <div className="flex-1 rounded-lg p-2 bg-secondary/30">
                  <div className="flex items-center gap-1 mb-1.5">
                    <Zap size={9} style={{ color: '#A78BFA' }} />
                    <span className="text-[9px] font-bold text-muted-foreground uppercase">AI Eval</span>
                  </div>
                  {stats.aiEval ? (
                    <span className="text-[11px] font-bold" style={{ color: scoreHex(stats.aiEval.avgScore) }}>
                      {stats.aiEval.avgScore}/100
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground/40">—</span>
                  )}
                  {stats.aiEval && <span className="text-[9px] text-muted-foreground/50 ml-1">{t.sessions(stats.aiEval.count)}</span>}
                  <div className="flex gap-0.5 mt-1.5">
                    {[1, 2, 3, 4].map(l => {
                      const done = (stats.evalCompletedLevels ?? []).includes(l);
                      return (
                        <div key={l} className="w-4 h-4 rounded text-[8px] flex items-center justify-center font-bold"
                          style={{
                            background: done ? 'rgba(167,139,250,0.2)' : 'hsl(var(--secondary))',
                            color: done ? '#A78BFA' : 'hsl(var(--muted-foreground) / 0.3)',
                          }}>
                          {done ? '✓' : l}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="flex-1 rounded-lg p-2 bg-secondary/30">
                  <div className="flex items-center gap-1 mb-1.5">
                    <TrendingUp size={9} style={{ color: '#FB923C' }} />
                    <span className="text-[9px] font-bold text-muted-foreground uppercase">Pitch</span>
                  </div>
                  {stats.pitch ? (
                    <span className="text-[11px] text-muted-foreground">
                      {lang === 'th' ? 'เซสชัน: ' : 'Sessions: '}
                      <span className="font-bold text-foreground">{stats.pitch.sessionCount}</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground/40">—</span>
                  )}
                  <div className="flex gap-0.5 mt-1.5">
                    {[1, 2, 3].map(l => {
                      const done = (stats.pitch?.completedLevels ?? []).includes(l);
                      return (
                        <div key={l} className="w-4 h-4 rounded text-[8px] flex items-center justify-center font-bold"
                          style={{
                            background: done ? 'rgba(251,146,60,0.2)' : 'hsl(var(--secondary))',
                            color: done ? '#FB923C' : 'hsl(var(--muted-foreground) / 0.3)',
                          }}>
                          {done ? '✓' : l}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Overview panel ─────────────────────────────────────────────────────────

function OverviewPanel({
  myEvals, agents, allAgentStats, lang, onEvaluate,
}: {
  myEvals: AgentEvaluation[];
  agents: Agent[];
  allAgentStats: AgentStats[];
  lang: Lang;
  onEvaluate: (agent: Agent) => void;
}) {
  const t = T[lang];
  const totalEvals   = myEvals.length;
  const avgScore     = myEvals.length > 0 ? Math.round(myEvals.reduce((s, e) => s + e.totalScore, 0) / myEvals.length) : 0;
  const today        = new Date().toDateString();
  const todayEvals   = myEvals.filter(e => new Date(e.evaluatedAt).toDateString() === today).length;
  const evaluatedIds = new Set(myEvals.map(e => e.agentId));
  const recent       = myEvals.slice(0, 5);

  // Aggregate module completion rates
  const totalAgents = allAgentStats.length;
  function moduleCompletionRate(key: string): number {
    if (totalAgents === 0) return 0;
    let count = 0;
    for (const s of allAgentStats) {
      if (key === 'learn'   && Object.keys(s.quiz).length > 0) count++;
      if (key === 'quiz'    && (['product','process','payment'] as const).every(m => s.quiz[m]?.passed)) count++;
      if (key === 'ai-eval' && s.aiEval && s.aiEval.count >= 4) count++;
      if (key === 'pitch'   && (s.pitch?.completedLevels?.length ?? 0) >= 3) count++;
    }
    return Math.round(count / totalAgents * 100);
  }

  const teamAvg = allAgentStats.length > 0
    ? Math.round(allAgentStats.reduce((s, a) => s + a.overallScore, 0) / allAgentStats.length)
    : 0;

  return (
    <div className="p-6 space-y-6">
      {/* My evaluator KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: t.totalEvals,     value: totalEvals,                          icon: ClipboardCheck, color: '#A78BFA' },
          { label: t.todayEvals,     value: todayEvals,                          icon: Activity,       color: '#60A5FA' },
          { label: t.avgScore,       value: avgScore ? `${avgScore}/100` : '—', icon: Star,           color: '#FBBF24' },
          { label: t.trainingTeamAvg,value: teamAvg  ? `${teamAvg}/100`  : '—', icon: Users,          color: '#A78BFA' },
        ].map(k => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="bg-card/60 backdrop-blur-md border border-white/10 dark:border-white/5 rounded-2xl p-4 flex flex-col gap-2 relative overflow-hidden group hover:border-white/20 dark:hover:border-white/10 transition-colors shadow-sm">
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none" style={{ background: k.color, transform: 'translate(30%, -30%)' }} />
              <div className="p-2 rounded-xl w-fit" style={{ background: `${k.color}15` }}>
                <Icon size={16} style={{ color: k.color }} />
              </div>
              <div className="text-2xl font-black text-foreground mt-1" style={{ fontFamily: "'Syne', sans-serif" }}>{k.value}</div>
              <div className="text-[11px] font-medium text-muted-foreground">{k.label}</div>
            </div>
          );
        })}
      </div>

      {/* Module completion rates — per topic/level breakdown */}
      {totalAgents > 0 && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-5">{t.moduleCompletion}</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            {/* Learn: per topic */}
            <div>
              <div className="flex items-center gap-1.5 mb-3">
                <div className="p-1 rounded-md" style={{ background: '#60A5FA18' }}>
                  <BookOpen size={11} style={{ color: '#60A5FA' }} />
                </div>
                <span className="text-xs font-semibold text-foreground">{lang === 'th' ? 'เรียนรู้' : 'Learn'}</span>
                <span className="text-[10px] text-muted-foreground/50 ml-auto">
                  {t.agentsCompleted(Math.round(moduleCompletionRate('learn') / 100 * totalAgents), totalAgents)}
                </span>
              </div>
              <div className="space-y-2 pl-3 border-l-2 border-blue-400/20">
                {(['product', 'process', 'payment'] as const).map(m => {
                  const count = allAgentStats.filter(s => !!s.quiz[m]).length;
                  const pct   = Math.round(count / totalAgents * 100);
                  return (
                    <div key={m}>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="capitalize text-muted-foreground">{m}</span>
                        <span className="font-bold" style={{ color: pct > 0 ? '#60A5FA' : undefined }}>{count}/{totalAgents}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                        <motion.div className="h-full rounded-full" style={{ background: '#60A5FA' }}
                          initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quiz: per topic pass rate */}
            <div>
              <div className="flex items-center gap-1.5 mb-3">
                <div className="p-1 rounded-md" style={{ background: '#FBBF2418' }}>
                  <Target size={11} style={{ color: '#FBBF24' }} />
                </div>
                <span className="text-xs font-semibold text-foreground">{lang === 'th' ? 'แบบทดสอบ' : 'Quiz'}</span>
                <span className="text-[10px] text-muted-foreground/50 ml-auto">
                  {t.agentsCompleted(Math.round(moduleCompletionRate('quiz') / 100 * totalAgents), totalAgents)}
                </span>
              </div>
              <div className="space-y-2 pl-3 border-l-2 border-amber-400/20">
                {(['product', 'process', 'payment'] as const).map(m => {
                  const passCount = allAgentStats.filter(s => s.quiz[m]?.passed).length;
                  const attempted = allAgentStats.filter(s => s.quiz[m]);
                  const avgScore  = attempted.length > 0 ? Math.round(attempted.reduce((s, a) => s + (a.quiz[m]?.bestScore ?? 0), 0) / attempted.length) : 0;
                  const pct = Math.round(passCount / totalAgents * 100);
                  return (
                    <div key={m}>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="capitalize text-muted-foreground">{m}</span>
                        <div className="flex items-center gap-2">
                          {avgScore > 0 && <span className="text-[10px] text-muted-foreground/60">avg {avgScore}%</span>}
                          <span className="font-bold" style={{ color: pct > 0 ? '#FBBF24' : undefined }}>
                            {passCount}/{totalAgents} {lang === 'th' ? 'ผ่าน' : 'pass'}
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                        <motion.div className="h-full rounded-full" style={{ background: '#FBBF24' }}
                          initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Eval: per level */}
            <div>
              <div className="flex items-center gap-1.5 mb-3">
                <div className="p-1 rounded-md" style={{ background: '#A78BFA18' }}>
                  <Zap size={11} style={{ color: '#A78BFA' }} />
                </div>
                <span className="text-xs font-semibold text-foreground">{lang === 'th' ? 'AI ประเมิน' : 'AI Eval'}</span>
                <span className="text-[10px] text-muted-foreground/50 ml-auto">
                  {t.agentsCompleted(Math.round(moduleCompletionRate('ai-eval') / 100 * totalAgents), totalAgents)}
                </span>
              </div>
              <div className="space-y-2 pl-3 border-l-2 border-purple-400/20">
                {[1, 2, 3, 4].map(level => {
                  const count = allAgentStats.filter(s => s.evalCompletedLevels?.includes(level)).length;
                  const pct   = Math.round(count / totalAgents * 100);
                  return (
                    <div key={level}>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-muted-foreground">{lang === 'th' ? `ระดับ ${level}` : `Level ${level}`}</span>
                        <span className="font-bold" style={{ color: pct > 0 ? '#A78BFA' : undefined }}>{count}/{totalAgents}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                        <motion.div className="h-full rounded-full" style={{ background: '#A78BFA' }}
                          initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pitch: per level */}
            <div>
              <div className="flex items-center gap-1.5 mb-3">
                <div className="p-1 rounded-md" style={{ background: '#FB923C18' }}>
                  <TrendingUp size={11} style={{ color: '#FB923C' }} />
                </div>
                <span className="text-xs font-semibold text-foreground">{lang === 'th' ? 'พิช' : 'Pitch'}</span>
                <span className="text-[10px] text-muted-foreground/50 ml-auto">
                  {t.agentsCompleted(Math.round(moduleCompletionRate('pitch') / 100 * totalAgents), totalAgents)}
                </span>
              </div>
              <div className="space-y-2 pl-3 border-l-2 border-orange-400/20">
                {[1, 2, 3].map(level => {
                  const count = allAgentStats.filter(s => s.pitch?.completedLevels?.includes(level)).length;
                  const pct   = Math.round(count / totalAgents * 100);
                  return (
                    <div key={level}>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-muted-foreground">{lang === 'th' ? `ระดับ ${level}` : `Level ${level}`}</span>
                        <span className="font-bold" style={{ color: pct > 0 ? '#FB923C' : undefined }}>{count}/{totalAgents}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                        <motion.div className="h-full rounded-full" style={{ background: '#FB923C' }}
                          initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* All agents grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t.agentsGrid}</div>
          <span className="text-[10px] text-muted-foreground/60">{t.agentCount(allAgentStats.length)}</span>
        </div>
        {allAgentStats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground/40">
            <Users size={28} />
            <p className="text-sm">{t.noStatsYet}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {allAgentStats.map(s => (
              <AgentOverviewCard
                key={s.agent.id}
                stats={s}
                evaluatedByMe={evaluatedIds.has(s.agent.id)}
                lang={lang}
                onEvaluate={onEvaluate}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recent evaluations */}
      {recent.length > 0 && (
        <div>
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">{t.recentEvals}</div>
          <div className="space-y-2">
            {recent.map(ev => {
              const agentName = agents.find(a => a.id === ev.agentId)?.name ?? ev.agentName;
              const c = ev.criteria as SalesCallCriteria;
              const flags = c?.redFlags ? Object.values(c.redFlags).filter(Boolean).length : 0;
              return (
                <div key={ev.id} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/30 border border-border">
                  <ScoreRing score={ev.totalScore} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground truncate">{agentName}</span>
                      {flags > 0 && (
                        <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-red-500/15 text-red-400">{flags}🚩</span>
                      )}
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate">{c?.generalRemark || c?.qaThoughts || '—'}</div>
                  </div>
                  <div className="text-[10px] text-muted-foreground/50 shrink-0">{timeAgo(ev.evaluatedAt, lang)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {totalEvals === 0 && allAgentStats.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground/40">
          <MessageSquare size={32} />
          <p className="text-sm">{t.selectAgentHint}</p>
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

interface EvaluatorDashboardProps {
  evaluatorId: string;
  evaluatorName: string;
  passwordChanged: boolean;
}

function logout() {
  fetch('/api/auth/session', { method: 'DELETE' });
  window.location.replace('/login');
}

function ChangePasswordModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSave() {
    if (newPassword.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setNewPassword('');
        }, 1500);
      } else {
        const d = await res.json();
        setError(d.error || 'Failed to change password');
      }
    } catch {
      setError('Network error');
    }
    setSaving(false);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-card border border-border rounded-3xl p-8 w-full max-w-sm shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
            
            <h3 className="font-black text-xl text-foreground mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>Change Password</h3>
            <p className="text-sm text-muted-foreground mb-6">Update your login credentials</p>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">New Password</label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full bg-secondary/40 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                  placeholder="Enter new password"
                  autoFocus
                />
              </div>

              {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
              {success && <p className="text-xs text-emerald-500 font-medium">Password updated successfully!</p>}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving || success || !newPassword}
                  className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  {saving ? 'Updating...' : success ? 'Updated!' : 'Update Password'}
                </button>
                <button 
                  onClick={onClose}
                  className="px-6 py-3 rounded-xl text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function EvaluatorDashboard({ evaluatorId, evaluatorName, passwordChanged }: EvaluatorDashboardProps) {
  const pathname = usePathname();
  const lang     = (pathname.split('/')[1] === 'en' ? 'en' : 'th') as Lang;
  const t        = T[lang];

  const [isPwModalOpen, setIsPwModalOpen] = useState(!passwordChanged);

  useEffect(() => {
    if (!passwordChanged) setIsPwModalOpen(true);
  }, [passwordChanged]);

  const [agents, setAgents]               = useState<Agent[]>([]);
  const [agentSearch, setAgentSearch]     = useState('');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [tab, setTab]                     = useState<'new' | 'history'>('new');

  const [agentStats, setAgentStats]       = useState<AgentStats | null>(null);
  const [loadingStats, setLoadingStats]   = useState(false);
  const [allAgentStats, setAllAgentStats] = useState<AgentStats[]>([]);

  const [myEvals, setMyEvals]             = useState<AgentEvaluation[]>([]);
  const [agentEvals, setAgentEvals]       = useState<AgentEvaluation[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [criteria, setCriteria]           = useState<SalesCallCriteria>(emptyCriteria());
  const [saving, setSaving]               = useState(false);
  const [saveSuccess, setSaveSuccess]     = useState(false);
  const [editingEval, setEditingEval]     = useState<AgentEvaluation | null>(null);

  useEffect(() => {
    fetch('/api/agents').then(r => r.json()).then(d => setAgents(d.agents ?? [])).catch(() => {});
    fetch(`/api/evaluator/evaluations?evaluatorId=${evaluatorId}`)
      .then(r => r.json()).then(d => setMyEvals(d.evaluations ?? [])).catch(() => {});
    fetch('/api/evaluator/all-agent-stats')
      .then(r => r.json()).then(d => setAllAgentStats(d.stats ?? [])).catch(() => {});
  }, [evaluatorId]);

  const fetchAgentHistory = useCallback(async (agentId: string) => {
    setLoadingHistory(true);
    try {
      const d = await fetch(`/api/evaluator/evaluations?agentId=${agentId}`).then(r => r.json());
      setAgentEvals(d.evaluations ?? []);
    } catch { setAgentEvals([]); } finally { setLoadingHistory(false); }
  }, []);

  const fetchAgentStats = useCallback(async (agentId: string) => {
    setLoadingStats(true);
    try {
      const d = await fetch(`/api/evaluator/agent-stats?agentId=${agentId}`).then(r => r.json());
      setAgentStats(d.stats ?? null);
    } catch { setAgentStats(null); } finally { setLoadingStats(false); }
  }, []);

  useEffect(() => {
    if (selectedAgent && tab === 'history') fetchAgentHistory(selectedAgent.id);
  }, [selectedAgent, tab, fetchAgentHistory]);

  function handleSelectAgent(agent: Agent) {
    setSelectedAgent(agent);
    setTab('new');
    setCriteria(emptyCriteria());
    setSaveSuccess(false);
    setEditingEval(null);
    fetchAgentStats(agent.id);
  }

  function handleEditEval(ev: AgentEvaluation) {
    setEditingEval(ev);
    setCriteria((ev.criteria as SalesCallCriteria) ?? emptyCriteria());
    setTab('new');
  }

  function resetForm() {
    setCriteria(emptyCriteria());
    setSaveSuccess(false);
    setEditingEval(null);
  }

  async function handleSave() {
    if (!selectedAgent) return;
    setSaving(true);
    const totalScore = calcScore(criteria);
    try {
      const body = {
        agentId: selectedAgent.id, agentName: selectedAgent.name,
        evaluatorId, evaluatorName,
        criteria, totalScore,
        comments: criteria.generalRemark || criteria.qaThoughts,
        sessionNotes: '',
        sessionType: 'roleplay',
      };
      if (editingEval) {
        await fetch(`/api/evaluator/evaluations/${editingEval.id}`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        });
      } else {
        const data = await fetch('/api/evaluator/evaluations', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        }).then(r => r.json());
        if (data.evaluation) setMyEvals(prev => [data.evaluation, ...prev]);
      }
      setSaveSuccess(true);
      setTimeout(() => { resetForm(); fetchAgentHistory(selectedAgent.id); }, 1400);
    } catch { /* silent */ } finally { setSaving(false); }
  }

  const totalScore     = calcScore(criteria);
  const filteredAgents = agents.filter(a => a.name.toLowerCase().includes(agentSearch.toLowerCase()));
  const evaluatedIds   = new Set(myEvals.map(e => e.agentId));

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Change Password Modal */}
      <ChangePasswordModal isOpen={isPwModalOpen} onClose={() => setIsPwModalOpen(false)} />

      {/* Ambient background glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 dark:bg-blue-500/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 dark:bg-purple-500/20 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      {/* ── Header ── */}
      <div className="px-5 py-3.5 flex items-center gap-3 shrink-0 bg-card/60 backdrop-blur-xl border-b border-white/10 dark:border-white/5 shadow-sm z-10 relative">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <ClipboardCheck size={16} className="text-white" />
        </div>
        <span className="font-black text-lg bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70" style={{ fontFamily: "'Syne', sans-serif" }}>{t.panelTitle}</span>
        
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 ml-1">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
            {evaluatorName}
          </span>
          <button 
            onClick={() => setIsPwModalOpen(true)}
            className="p-1 rounded-lg hover:bg-blue-500/10 text-blue-500/60 hover:text-blue-500 transition-colors"
            title="Change Password"
          >
            <Zap size={12} />
          </button>
        </div>

        <span className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-secondary/80 border border-white/5 text-muted-foreground hidden sm:block">
          {t.roleLabel}
        </span>

        {/* Controls */}
        <div className="ml-auto flex items-center gap-2">
          <LangToggle />
          <ThemeToggle />
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
            title="Sign out"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left: Agent sidebar */}
        <div className="w-60 xl:w-64 shrink-0 flex flex-col bg-card/40 backdrop-blur-md border-r border-white/10 dark:border-white/5 relative z-10">
          <div className="p-3">
            <div className="relative">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 pointer-events-none" />
              <input
                type="text" value={agentSearch} onChange={e => setAgentSearch(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-8 pr-3 py-2 rounded-xl text-xs text-foreground outline-none placeholder:text-muted-foreground/40 bg-secondary/40 border border-border"
              />
            </div>
          </div>
          <div className="px-4 pb-1">
            <span className="text-[9px] text-muted-foreground uppercase tracking-wider">{t.agentCount(filteredAgents.length)}</span>
          </div>
          <div className="flex-1 overflow-y-auto px-2 space-y-0.5 pb-2">
            {filteredAgents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-24 gap-2 text-muted-foreground/40">
                <Users size={18} /><span className="text-[11px]">{t.noAgents}</span>
              </div>
            ) : filteredAgents.map((agent, i) => {
              const isSelected = selectedAgent?.id === agent.id;
              const hasEval    = evaluatedIds.has(agent.id);
              return (
                <motion.button
                  key={agent.id}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.025 }}
                  onClick={() => handleSelectAgent(agent)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all border ${
                    isSelected
                      ? 'bg-blue-500/10 border-blue-500/25'
                      : 'hover:bg-secondary/50 border-transparent'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${isSelected ? 'bg-blue-500/20 text-blue-500' : 'bg-secondary text-muted-foreground'}`}
                    style={{ fontFamily: "'Syne', sans-serif" }}>
                    {agent.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className={`text-xs font-medium truncate flex-1 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}`}>
                    {agent.name}
                  </span>
                  {hasEval && <CheckCircle2 size={11} className="text-blue-500/70 shrink-0" />}
                  {isSelected && <ChevronRight size={11} className="text-blue-500 shrink-0" />}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Right: Main area */}
        <div className="flex-1 overflow-y-auto relative z-10">
          {!selectedAgent ? (
            <OverviewPanel myEvals={myEvals} agents={agents} allAgentStats={allAgentStats} lang={lang} onEvaluate={handleSelectAgent} />
          ) : (
            <div className="h-full flex flex-col">
              {/* Agent bar */}
              <div className="px-5 py-3 flex items-center gap-3 shrink-0 bg-card/60 backdrop-blur-md border-b border-white/10 dark:border-white/5">
                <button onClick={() => setSelectedAgent(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft size={15} />
                </button>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0 bg-blue-500/10 border border-blue-500/25 text-blue-500" style={{ fontFamily: "'Syne', sans-serif" }}>
                  {selectedAgent.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-base font-black text-foreground" style={{ fontFamily: "'Syne', sans-serif" }}>{selectedAgent.name}</h2>
                  <p className="text-[10px] text-muted-foreground">{t.salesEvalSubtitle}</p>
                </div>
                {/* Tabs */}
                <div className="ml-auto flex gap-1 p-1 rounded-xl bg-secondary/60 border border-border">
                  {(['new', 'history'] as const).map(tabId => (
                    <button key={tabId} onClick={() => setTab(tabId)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${tab === tabId ? 'bg-card text-foreground shadow-sm border border-border' : 'text-muted-foreground hover:text-foreground'}`}
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                      {tabId === 'new' ? t.tabNew : t.tabHistory(agentEvals.length)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab content */}
              <AnimatePresence mode="wait">
                {tab === 'new' ? (
                  <motion.div key="new" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex overflow-hidden">
                    {/* Stats panel */}
                    <div className="w-72 xl:w-80 shrink-0 overflow-y-auto p-5 bg-card border-r border-border">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">{t.trainingPerf}</div>
                      <AgentPerformancePanel stats={agentStats} loading={loadingStats} lang={lang} />
                    </div>
                    {/* Eval form */}
                    <div className="flex-1 overflow-y-auto p-5">
                      <div className="max-w-2xl mx-auto space-y-5">
                        {/* Session badge */}
                        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-blue-500/[0.06] border border-blue-500/15">
                          <Activity size={14} className="text-blue-500" />
                          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">{t.salesSimBadge}</span>
                        </div>
                        {/* Edit banner */}
                        {editingEval && (
                          <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs">
                            <div className="flex items-center gap-2"><Edit3 size={12} /> {t.editBanner}</div>
                            <button onClick={resetForm}><X size={13} className="opacity-60 hover:opacity-100 transition-opacity" /></button>
                          </div>
                        )}
                        <EvalForm criteria={criteria} onChange={setCriteria} lang={lang} />
                        {/* Save button */}
                        <motion.button
                          onClick={handleSave} disabled={saving || saveSuccess}
                          className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all ${
                            saveSuccess
                              ? 'bg-blue-500/15 text-blue-500 border border-blue-500/40 shadow-none'
                              : 'bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 relative z-10'
                          }`}
                          style={{ fontFamily: "'Syne', sans-serif" }}
                          whileHover={!saving && !saveSuccess ? { scale: 1.02 } : {}}
                          whileTap={!saving && !saveSuccess ? { scale: 0.99 } : {}}
                        >
                          {saving ? <Loader2 size={16} className="animate-spin" />
                            : saveSuccess ? <><Check size={16} /> {t.saveBtnSuccess}</>
                            : <><Save size={15} /> {editingEval ? t.saveBtnEdit : t.saveBtnNew(totalScore)}</>}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 p-6">
                    <div className="max-w-2xl mx-auto space-y-3">
                      {loadingHistory ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 size={22} className="animate-spin text-blue-500/50" />
                        </div>
                      ) : agentEvals.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-14 gap-3 text-muted-foreground/40">
                          <ClipboardCheck size={32} />
                          <p className="text-sm">{t.noHistory}</p>
                          <button onClick={() => setTab('new')} className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2">
                            {t.startFirst}
                          </button>
                        </div>
                      ) : agentEvals.map(ev => (
                        <EvalHistoryCard key={ev.id} ev={ev} onEdit={handleEditEval} lang={lang} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
