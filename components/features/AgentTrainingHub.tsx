'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  CheckCircle2, Lock, GraduationCap, ClipboardList, Mic, PlayCircle,
  Trophy, RotateCcw, ArrowRight, LogOut, TrendingUp,
} from 'lucide-react';
import type { AgentStats } from '@/types';

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  bg:     '#070D1A',
  panel:  '#0B1624',
  card:   '#0E1D30',
  border: 'rgba(255,255,255,0.07)',
  cyan:   '#00B4D8',
  text:   '#E8F4FF',
  sub:    '#5A7A9A',
  dim:    '#1E3550',
};

// ── 4 steps matching the NavBar exactly ──────────────────────────────────────
const NAV_STEPS = [
  {
    id:    'learn',
    labelTh: 'เรียนรู้',
    descTh:  'ทบทวนความรู้ผลิตภัณฑ์และกระบวนการขาย',
    Icon:  GraduationCap,
    color: '#818CF8',
    glow:  'rgba(129,140,248,0.12)',
  },
  {
    id:    'quiz',
    labelTh: 'Quiz',
    descTh:  'ทดสอบความเข้าใจจากทั้ง 3 หัวข้อ',
    Icon:  ClipboardList,
    color: '#34D399',
    glow:  'rgba(52,211,153,0.12)',
  },
  {
    id:    'ai-eval',
    labelTh: 'AI Eval',
    descTh:  'วิเคราะห์สคริปต์การขายด้วย AI',
    Icon:  Mic,
    color: '#F472B6',
    glow:  'rgba(244,114,182,0.12)',
  },
  {
    id:    'pitch',
    labelTh: 'Pitch',
    descTh:  'จำลองการขายกับ AI ในสถานการณ์จริง',
    Icon:  PlayCircle,
    color: '#FB923C',
    glow:  'rgba(251,146,60,0.12)',
  },
] as const;

type StepId = typeof NAV_STEPS[number]['id'];

const BADGE_STYLES = {
  elite:        { bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.3)',  text: '#FBB024', label: '⭐ Elite'      },
  strong:       { bg: 'rgba(52,211,153,0.1)',   border: 'rgba(52,211,153,0.35)', text: '#34D399', label: '💪 Strong'     },
  developing:   { bg: 'rgba(96,165,250,0.1)',   border: 'rgba(96,165,250,0.3)',  text: '#60A5FA', label: '📈 Developing' },
  'needs-work': { bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.28)',text: '#F87171', label: '🔧 Needs Work' },
} as const;

function scoreColor(n: number) {
  return n >= 70 ? '#34D399' : n >= 50 ? '#FBBF24' : '#F87171';
}

// ── Derive step states from AgentStats ────────────────────────────────────────
interface StepState {
  locked:    boolean;
  passed:    boolean;
  bestScore: number | undefined;
}

function deriveSteps(stats: AgentStats | null): Record<StepId, StepState> {
  const anyQuizPassed = !!(
    stats?.quiz?.product?.passed ||
    stats?.quiz?.process?.passed ||
    stats?.quiz?.payment?.passed
  );
  const allQuizPassed = !!(
    stats?.quiz?.product?.passed &&
    stats?.quiz?.process?.passed &&
    stats?.quiz?.payment?.passed
  );
  const aiEvalDone = (stats?.aiEval?.count ?? 0) > 0;
  const pitchDone  = (stats?.pitch?.sessionCount ?? 0) > 0;

  // Best quiz score = average of all attempted quiz best scores
  const quizScores = [
    stats?.quiz?.product?.bestScore,
    stats?.quiz?.process?.bestScore,
    stats?.quiz?.payment?.bestScore,
  ].filter((s): s is number => s !== undefined);
  const avgQuizScore = quizScores.length
    ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length)
    : undefined;

  return {
    learn: {
      locked:    false,
      passed:    anyQuizPassed,       // proven they studied when they pass a quiz
      bestScore: stats?.quiz?.product?.bestScore,
    },
    quiz: {
      locked:    false,               // always accessible
      passed:    allQuizPassed,       // all 3 modules passed
      bestScore: avgQuizScore,
    },
    'ai-eval': {
      locked:    !anyQuizPassed,      // need at least 1 quiz pass
      passed:    aiEvalDone,
      bestScore: stats?.aiEval ? Math.round(stats.aiEval.avgScore) : undefined,
    },
    pitch: {
      locked:    !aiEvalDone,
      passed:    pitchDone,
      bestScore: stats?.pitch ? Math.min(100, stats.pitch.highestLevel * 33) : undefined,
    },
  };
}

// ── Module Card ───────────────────────────────────────────────────────────────
function StepCard({
  step, state, index, href,
}: {
  step: typeof NAV_STEPS[number];
  state: StepState;
  index: number;
  href: string;
}) {
  const { Icon, color, glow, labelTh, descTh } = step;
  const { locked, passed, bestScore } = state;
  const isActive = !locked && !passed;

  return (
    <motion.div
      className="relative flex-1 flex flex-col rounded-2xl overflow-hidden"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={locked
        ? { x: [-3, 3, -3, 0], transition: { duration: 0.3 } }
        : { y: -2, transition: { duration: 0.15 } }
      }
      style={{
        background: locked ? 'rgba(255,255,255,0.02)' : T.card,
        border: passed
          ? '1px solid rgba(52,211,153,0.25)'
          : locked
          ? `1px solid ${T.dim}50`
          : `1px solid ${color}28`,
        boxShadow: passed ? `0 0 20px rgba(52,211,153,0.06)` : isActive ? `0 0 20px ${glow}` : 'none',
        cursor: locked ? 'not-allowed' : 'default',
        opacity: locked ? 0.45 : 1,
        filter: locked ? 'grayscale(0.5)' : 'none',
        padding: '14px',
      }}
    >
      {/* Corner glow */}
      {!locked && (
        <div className="absolute top-0 right-0 w-20 h-20 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${glow}, transparent 70%)`, transform: 'translate(40%,-40%)' }} />
      )}

      {/* Icon + step row */}
      <div className="flex items-center gap-2 mb-2 shrink-0">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{
            background: locked ? 'rgba(255,255,255,0.03)' : glow,
            border: `1px solid ${locked ? 'rgba(255,255,255,0.05)' : color + '28'}`,
          }}>
          <Icon size={16} style={{ color: locked ? T.dim : color }} />
        </div>
        <span className="text-[9px] font-bold tracking-widest uppercase"
          style={{ color: locked ? T.dim : `${color}90` }}>
          STEP {index + 1}
        </span>
      </div>

      {/* Title + desc */}
      <div className="mb-auto">
        <h3 className="font-bold text-sm leading-tight mb-1"
          style={{ color: locked ? T.dim : T.text }}>
          {labelTh}
        </h3>
        <p className="text-[10px] leading-relaxed" style={{ color: locked ? T.dim : T.sub }}>
          {descTh}
        </p>
      </div>

      {/* Score bar */}
      {bestScore !== undefined && (
        <div className="mt-2 mb-2 shrink-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px]" style={{ color: T.sub }}>คะแนน</span>
            <span className="text-xs font-black" style={{ color: scoreColor(bestScore) }}>
              {bestScore}%
            </span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${bestScore}%` }}
              transition={{ delay: 0.4 + index * 0.08, duration: 0.9, ease: 'easeOut' }}
              style={{ background: `linear-gradient(90deg, ${color}80, ${color})` }}
            />
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="mt-2 shrink-0">
        {locked ? (
          <div className="flex items-center gap-1.5 text-[10px]" style={{ color: T.dim }}>
            <Lock size={10} /> <span>ล็อค</span>
          </div>
        ) : (
          <Link href={href}
            className="flex items-center justify-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg transition-all"
            style={{
              background: passed ? 'rgba(52,211,153,0.1)' : `${color}18`,
              border: `1px solid ${passed ? 'rgba(52,211,153,0.25)' : color + '30'}`,
              color: passed ? '#34D399' : color,
            }}>
            {passed
              ? <><RotateCcw size={9} /> ทำซ้ำ</>
              : <>เริ่ม <ArrowRight size={9} /></>}
          </Link>
        )}
      </div>

      {/* Passed badge */}
      {passed && (
        <div className="absolute top-2 right-2 flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full"
          style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)', color: '#34D399' }}>
          <CheckCircle2 size={8} /> ผ่าน
        </div>
      )}
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
interface Props { agentName: string; agentId: string; stats: AgentStats | null; onLogout: () => void; }

export default function AgentTrainingHub({ agentName, agentId, stats, onLogout }: Props) {
  const pathname = usePathname();
  const locale   = pathname.split('/')[1] ?? 'th';
  const steps    = deriveSteps(stats);

  const hrefs: Record<StepId, string> = {
    learn:     `/${locale}/learn/product`,
    quiz:      `/${locale}/quiz`,
    'ai-eval': `/${locale}/ai-eval`,
    pitch:     `/${locale}/pitch`,
  };

  const done       = NAV_STEPS.filter(s => steps[s.id].passed).length;
  const pct        = Math.round((done / NAV_STEPS.length) * 100);
  const badge      = stats?.badge ?? 'developing';
  const badgeStyle = BADGE_STYLES[badge];
  const initials   = agentName.slice(0, 2).toUpperCase();
  const allDone    = done === NAV_STEPS.length;

  return (
    <div
      className="w-full overflow-hidden flex flex-col"
      style={{ height: 'calc(100vh - 72px)', background: T.bg, fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div style={{
          position: 'absolute', width: 600, height: 600, top: -200, left: -200,
          background: `radial-gradient(circle, rgba(0,180,216,0.06) 0%, transparent 70%)`,
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.018,
          backgroundImage: `linear-gradient(${T.cyan} 1px, transparent 1px), linear-gradient(90deg, ${T.cyan} 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />
      </div>

      {/* AGENT INFO STRIP */}
      <motion.div
        className="relative z-10 flex items-center gap-3 px-5 py-2.5 shrink-0"
        style={{ borderBottom: `1px solid ${T.border}`, background: `${T.panel}99` }}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Agent identity */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black"
            style={{ background: `rgba(0,180,216,0.15)`, border: `1px solid rgba(0,180,216,0.25)`, color: T.cyan }}>
            {initials}
          </div>
          <div>
            <div className="text-sm font-bold leading-tight" style={{ color: T.text }}>{agentName}</div>
            <div className="text-[9px]" style={{ color: T.sub }}>
              ผลการฝึกจะถูกบันทึกภายใต้ชื่อ <span style={{ color: T.cyan }}>{agentName}</span>
            </div>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
            style={{ background: badgeStyle.bg, border: `1px solid ${badgeStyle.border}`, color: badgeStyle.text }}>
            {badgeStyle.label}
          </span>
        </div>

        {/* Progress bar */}
        <div className="flex-1 flex items-center gap-3 min-w-0 px-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <TrendingUp size={10} style={{ color: T.cyan }} />
                <span className="text-[10px]" style={{ color: T.sub }}>ความคืบหน้า</span>
              </div>
              <span className="text-[10px] font-bold" style={{ color: T.sub }}>{done}/{NAV_STEPS.length}</span>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ delay: 0.3, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                style={{ background: `linear-gradient(90deg, ${T.cyan}, #7C3AED)` }}
              />
            </div>
          </div>
          {stats?.overallScore !== undefined && (
            <div className="shrink-0 text-right">
              <div className="text-sm font-black leading-none"
                style={{
                  background: `linear-gradient(90deg, ${T.cyan}, #7C3AED)`,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                {Math.round(stats.overallScore)}%
              </div>
              <div className="text-[9px]" style={{ color: T.sub }}>รวม</div>
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-all shrink-0"
          style={{ color: T.sub, border: `1px solid ${T.border}` }}
          onMouseEnter={e => { e.currentTarget.style.color = '#F87171'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = T.sub; e.currentTarget.style.borderColor = T.border; }}
        >
          <LogOut size={12} />
          <span className="hidden sm:inline">ออกจากระบบ</span>
        </button>
      </motion.div>

      {/* 4-COLUMN STEP CARDS */}
      <div className="relative z-10 flex-1 min-h-0 p-4 flex flex-col">
        {/* Section label */}
        <div className="flex items-center gap-2 mb-2.5 shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: T.sub }}>
            เส้นทางการเรียน
          </span>
          <div className="flex-1 h-px" style={{ background: T.border }} />
          <span className="text-[10px]" style={{ color: T.dim }}>{done} / {NAV_STEPS.length} สำเร็จ</span>
        </div>

        <div className="flex gap-3 flex-1 min-h-0">
          {NAV_STEPS.map((step, i) => (
            <StepCard
              key={step.id}
              step={step}
              state={steps[step.id]}
              index={i}
              href={hrefs[step.id]}
            />
          ))}
        </div>

        {/* All-done banner */}
        {allDone && (
          <motion.div
            className="shrink-0 mt-3 flex items-center justify-center gap-3 py-2.5 rounded-2xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)' }}
          >
            <Trophy size={16} style={{ color: '#FBB024' }} />
            <span className="text-sm font-bold" style={{ color: '#FBB024' }}>
              ยินดีด้วย! ผ่านการฝึกอบรมทั้งหมดเรียบร้อยแล้ว 🎉
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
