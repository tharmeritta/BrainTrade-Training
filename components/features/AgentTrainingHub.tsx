'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  CheckCircle2, XCircle, Lock, GraduationCap, ClipboardList, Mic, PlayCircle,
  Trophy, RotateCcw, ArrowRight, LogOut, Zap,
} from 'lucide-react';
import type { AgentStats } from '@/types';

const STEPS = [
  { id: 'learn'   as const, step: 1, label: 'เรียนรู้',  sublabel: 'Study',   desc: 'ผลิตภัณฑ์ · กระบวนการขาย', Icon: GraduationCap, color: '#818CF8', glow: 'rgba(129,140,248,0.18)' },
  { id: 'quiz'    as const, step: 2, label: 'Quiz',      sublabel: 'Test',    desc: 'ทดสอบความเข้าใจ 3 หัวข้อ',  Icon: ClipboardList, color: '#60A5FA', glow: 'rgba(96,165,250,0.15)'  },
  { id: 'ai-eval' as const, step: 3, label: 'AI Eval',   sublabel: 'Analyse', desc: 'วิเคราะห์สคริปต์ด้วย AI',   Icon: Mic,           color: '#F472B6', glow: 'rgba(244,114,182,0.15)' },
  { id: 'pitch'   as const, step: 4, label: 'Pitch',     sublabel: 'Sell',    desc: 'จำลองการขายกับ AI จริง',    Icon: PlayCircle,    color: '#FB923C', glow: 'rgba(251,146,60,0.15)'  },
] as const;

type StepId = typeof STEPS[number]['id'];

const BADGE = {
  elite:        { color: '#FBBF24', bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.3)',  label: 'Elite'      },
  strong:       { color: '#60A5FA', bg: 'rgba(96,165,250,0.10)',  border: 'rgba(96,165,250,0.3)',  label: 'Strong'     },
  developing:   { color: '#818CF8', bg: 'rgba(129,140,248,0.10)', border: 'rgba(129,140,248,0.3)', label: 'Developing' },
  'needs-work': { color: '#F87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.25)',label: 'Needs Work' },
} as const;

function scoreColor(n: number) { return n >= 70 ? '#60A5FA' : n >= 50 ? '#FBBF24' : '#F87171'; }

interface StepState { locked: boolean; passed: boolean; score?: number; }

function deriveSteps(stats: AgentStats | null): Record<StepId, StepState> {
  const anyQ = !!(stats?.quiz?.product?.passed || stats?.quiz?.process?.passed || stats?.quiz?.payment?.passed);
  const allQ = !!(stats?.quiz?.product?.passed && stats?.quiz?.process?.passed && stats?.quiz?.payment?.passed);
  const aiOk = (stats?.aiEval?.count ?? 0) > 0;
  const piOk = (stats?.pitch?.sessionCount ?? 0) > 0;
  const qs   = [stats?.quiz?.product?.bestScore, stats?.quiz?.process?.bestScore, stats?.quiz?.payment?.bestScore].filter((s): s is number => s !== undefined);
  const avgQ = qs.length ? Math.round(qs.reduce((a, b) => a + b, 0) / qs.length) : undefined;
  return {
    learn:     { locked: false,  passed: anyQ, score: stats?.quiz?.product?.bestScore },
    quiz:      { locked: false,  passed: allQ, score: avgQ },
    'ai-eval': { locked: !anyQ, passed: aiOk, score: stats?.aiEval ? Math.round(stats.aiEval.avgScore) : undefined },
    pitch:     { locked: !aiOk, passed: piOk, score: stats?.pitch ? (stats.pitch.highestLevel >= 3 ? 100 : stats.pitch.highestLevel * 33) : undefined },
  };
}

// ── Score Ring ─────────────────────────────────────────────────────────────────
function ScoreRing({ score, color, size }: { score: number; color: string; size: number }) {
  const sw = 7, r = (size - sw) / 2, circ = 2 * Math.PI * r;
  const arc = (score / 100) * circ * 0.75;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke="var(--hub-ring-track)" strokeWidth={sw} strokeLinecap="round"
        strokeDasharray={`${circ * 0.75} ${circ * 0.25}`}
        transform={`rotate(135 ${size/2} ${size/2})`} />
      <motion.circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={sw} strokeLinecap="round"
        transform={`rotate(135 ${size/2} ${size/2})`}
        initial={{ strokeDasharray: `0 ${circ}` }}
        animate={{ strokeDasharray: `${arc} ${circ}` }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.4 }} />
    </svg>
  );
}

// ── Mission Card ───────────────────────────────────────────────────────────────
function MissionCard({ step, state, index, href }: {
  step: typeof STEPS[number]; state: StepState; index: number; href: string;
}) {
  const { Icon, color, glow, label, sublabel, desc, step: stepNum } = step;
  const { locked, passed, score } = state;
  const isNext    = !locked && !passed && score === undefined;
  const hasFailed = !locked && !passed && score !== undefined && score < 70;

  return (
    <motion.div
      className="group relative flex items-stretch rounded-2xl overflow-hidden"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.18 + index * 0.09, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: locked ? 'var(--hub-locked-bg)' : 'var(--hub-card)',
        border: `1px solid ${locked ? 'var(--hub-dim-border)' : passed ? color + '38' : hasFailed ? 'rgba(248,113,113,0.35)' : isNext ? color + '28' : 'var(--hub-border)'}`,
        opacity: locked ? 0.52 : 1,
        boxShadow: passed ? `0 4px 28px ${color}12` : hasFailed ? '0 4px 20px rgba(248,113,113,0.12)' : isNext ? `0 4px 20px ${glow}` : 'none',
        transition: 'box-shadow 0.2s, border-color 0.2s',
      }}
    >
      {/* Icon panel */}
      <div className="relative flex flex-col items-center justify-center w-[72px] shrink-0 gap-1.5 py-5"
        style={{
          background: locked
            ? 'var(--hub-locked-icon)'
            : passed ? `linear-gradient(160deg, ${color}28 0%, ${color}10 100%)`
            : hasFailed ? 'linear-gradient(160deg, rgba(248,113,113,0.20) 0%, rgba(248,113,113,0.07) 100%)'
            : isNext ? `linear-gradient(160deg, ${color}20 0%, ${color}08 100%)`
            : `linear-gradient(160deg, ${color}12 0%, ${color}04 100%)`,
          borderRight: `1px solid ${locked ? 'var(--hub-dim-border)' : hasFailed ? 'rgba(248,113,113,0.22)' : color + '18'}`,
        }}
      >
        <span className="text-[9px] font-black leading-none tracking-wider"
          style={{ color: locked ? 'var(--hub-dim)' : color + 'BB' }}>
          {stepNum < 10 ? `0${stepNum}` : stepNum}
        </span>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: locked ? 'rgba(0,0,0,0.06)' : `${color}1A`,
            border: `1px solid ${locked ? 'var(--hub-dim-border)' : color + '35'}`,
            boxShadow: !locked ? `0 4px 12px ${color}18` : 'none',
          }}>
          {passed
            ? <CheckCircle2 size={20} style={{ color }} />
            : locked ? <Lock size={15} style={{ color: 'var(--hub-dim)' }} />
            : hasFailed ? <XCircle size={20} style={{ color: '#F87171' }} />
            : <Icon size={20} style={{ color }} />
          }
        </div>
        <span className="text-[8px] font-semibold uppercase tracking-widest"
          style={{ color: locked ? 'var(--hub-dim)' : color + '88' }}>
          {sublabel}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 px-4 py-4 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-bold text-sm leading-tight"
            style={{ color: locked ? 'var(--hub-dim)' : 'var(--hub-text)' }}>
            {label}
          </span>
          {passed && (
            <span className="text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wide"
              style={{ background: `${color}18`, color, border: `1px solid ${color}35` }}>
              ✓ ผ่าน
            </span>
          )}
          {hasFailed && (
            <span className="text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wide flex items-center gap-1"
              style={{ background: 'rgba(248,113,113,0.12)', color: '#F87171', border: '1px solid rgba(248,113,113,0.3)' }}>
              ✕ ล้มเหลว
            </span>
          )}
          {isNext && (
            <span className="text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wide flex items-center gap-1"
              style={{ background: `${color}12`, color: color + 'BB' }}>
              <Zap size={8} /> ถัดไป
            </span>
          )}
        </div>
        <p className="text-xs mb-2" style={{ color: locked ? 'var(--hub-dim)' : 'var(--hub-muted)' }}>
          {desc}
        </p>
        {score !== undefined && !locked && (
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--hub-progress-bg)' }}>
              <motion.div className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ delay: 0.5 + index * 0.07, duration: 0.9, ease: 'easeOut' }}
                style={{ background: hasFailed
                  ? 'linear-gradient(90deg, rgba(248,113,113,0.6), #F87171)'
                  : `linear-gradient(90deg, ${color}70, ${color})` }} />
            </div>
            <span className="text-[11px] font-black shrink-0"
              style={{ color: hasFailed ? '#F87171' : scoreColor(score) }}>
              {score}%
            </span>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="shrink-0 flex items-center pr-4 pl-2">
        {locked ? (
          <div className="flex items-center gap-1.5 text-[10px] px-3 py-2 rounded-xl"
            style={{ color: 'var(--hub-dim)', background: 'var(--hub-locked-bg)', border: '1px solid var(--hub-dim-border)' }}>
            <Lock size={10} /> ล็อค
          </div>
        ) : (
          <Link href={href}
            className="flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl transition-all duration-150 whitespace-nowrap"
            style={{ background: `${color}18`, border: `1px solid ${color}45`, color }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${color}30`; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${color}18`; }}
          >
            {passed
              ? <><RotateCcw size={12} className="group-hover:rotate-180 transition-transform duration-500" />ทำซ้ำ</>
              : <>เริ่มเลย<ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" /></>
            }
          </Link>
        )}
      </div>
    </motion.div>
  );
}

// ── Section Divider ─────────────────────────────────────────────────────────────
function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 w-full max-w-[260px] my-4">
      <div className="flex-1 h-px" style={{ background: 'var(--hub-border)' }} />
      <span className="text-[9px] font-black uppercase tracking-[0.22em] shrink-0"
        style={{ color: 'var(--hub-dim)' }}>
        {label}
      </span>
      <div className="flex-1 h-px" style={{ background: 'var(--hub-border)' }} />
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
interface Props { agentName: string; agentId: string; agentStageName?: string; stats: AgentStats | null; onLogout: () => void; }

export default function AgentTrainingHub({ agentName, agentStageName, stats, onLogout }: Props) {
  const pathname  = usePathname();
  const locale    = pathname.split('/')[1] ?? 'th';
  const derived   = deriveSteps(stats);

  const hrefs: Record<StepId, string> = {
    learn:     `/${locale}/learn/product`,
    quiz:      `/${locale}/quiz`,
    'ai-eval': `/${locale}/ai-eval`,
    pitch:     `/${locale}/pitch`,
  };

  const done        = STEPS.filter(s => derived[s.id].passed).length;
  const pct         = Math.round((done / STEPS.length) * 100);
  const badge       = stats?.badge ?? 'developing';
  const badgeCfg    = BADGE[badge];
  const score       = stats?.overallScore ?? 0;
  const ringColor   = scoreColor(score);
  const initials    = agentName.slice(0, 2).toUpperCase();
  const allDone     = done === STEPS.length;
  const currentStep = STEPS.find(s => !derived[s.id].passed && !derived[s.id].locked);

  return (
    <div
      className="w-full h-full flex flex-col lg:flex-row"
      style={{ background: 'var(--hub-bg)', fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      {/* Fixed background orbs */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <motion.div style={{
          position: 'absolute', width: 600, height: 600, top: -150, left: -150,
          background: `radial-gradient(circle, ${badgeCfg.color}08 0%, transparent 65%)`,
          borderRadius: '50%',
        }}
          animate={{ x: [0, 30, 0], y: [0, 40, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', repeatType: 'mirror' }}
        />
        <motion.div style={{
          position: 'absolute', width: 400, height: 400, bottom: 0, right: 0,
          background: `radial-gradient(circle, rgba(96,165,250,0.06) 0%, transparent 70%)`,
          borderRadius: '50%',
        }}
          animate={{ x: [0, -20, 0], y: [0, -30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', repeatType: 'mirror' }}
        />
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.012,
          backgroundImage: `linear-gradient(var(--hub-grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--hub-grid-color) 1px, transparent 1px)`,
          backgroundSize: '56px 56px',
        }} />
      </div>

      {/* ══ LEFT — Agent Profile ══ */}
      <motion.div
        className="relative z-10 flex flex-col items-center shrink-0
          w-full px-7 py-8
          border-b border-[color:var(--hub-border)]
          lg:w-[300px] lg:px-8 lg:py-10 lg:h-full lg:overflow-y-auto
          lg:border-b-0 lg:border-r"
        style={{ background: 'var(--hub-panel)' }}
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* ── Avatar + ring ── */}
        <div className="flex flex-col items-center w-full">
          <div className="relative mb-4">
            <div className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle, ${ringColor}20 30%, transparent 70%)`,
                transform: 'scale(1.5)', filter: 'blur(12px)',
              }} />
            <ScoreRing score={score} color={ringColor} size={116} />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
              <span className="text-2xl font-black leading-none" style={{ color: 'var(--hub-text)' }}>{initials}</span>
              <span className="text-sm font-black" style={{ color: ringColor }}>{score}%</span>
            </div>
          </div>

          {/* Name */}
          <motion.h2
            className="text-lg font-black text-center leading-snug mb-0.5"
            style={{ color: 'var(--hub-text)' }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            {agentName}
          </motion.h2>
          {agentStageName && (
            <motion.p
              className="text-xs font-semibold text-center mb-1"
              style={{ color: ringColor, opacity: 0.85 }}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 0.85, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              "{agentStageName}"
            </motion.p>
          )}

          {/* Status pill */}
          <div className="mb-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{
              background: allDone ? 'rgba(251,191,36,0.08)' : currentStep ? `${currentStep.color}10` : 'var(--hub-locked-bg)',
              border: `1px solid ${allDone ? 'rgba(251,191,36,0.25)' : currentStep ? currentStep.color + '30' : 'var(--hub-dim-border)'}`,
            }}>
            {allDone ? (
              <><CheckCircle2 size={10} style={{ color: '#FBBF24' }} />
                <span className="text-[10px] font-black" style={{ color: '#FBBF24' }}>ผ่านครบทุกโมดูลแล้ว</span></>
            ) : currentStep ? (
              <><currentStep.Icon size={10} style={{ color: currentStep.color }} />
                <span className="text-[10px] font-medium" style={{ color: 'var(--hub-dim)' }}>กำลัง</span>
                <span className="text-[10px] font-black" style={{ color: currentStep.color }}>{currentStep.label}</span>
                <span className="text-[9px] font-medium" style={{ color: 'var(--hub-dim)' }}>· ขั้นที่ {currentStep.step}</span></>
            ) : (
              <span className="text-[10px] font-medium" style={{ color: 'var(--hub-dim)' }}>เริ่มต้นการฝึก</span>
            )}
          </div>

          {/* Badge */}
          <motion.span
            className="text-[11px] px-3.5 py-1.5 rounded-full font-black tracking-wide"
            style={{ background: badgeCfg.bg, border: `1px solid ${badgeCfg.border}`, color: badgeCfg.color }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 20 }}
          >
            ★ {badgeCfg.label}
          </motion.span>
        </div>

        {/* ── Progress ── */}
        <SectionDivider label="ความคืบหน้า" />

        <motion.div
          className="w-full max-w-[260px]"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: 'var(--hub-muted)' }}>
              โมดูลที่ผ่าน
            </span>
            <span className="text-[11px] font-black" style={{ color: 'var(--hub-text)' }}>{pct}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden mb-4" style={{ background: 'var(--hub-progress-bg)' }}>
            <motion.div className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ delay: 0.55, duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              style={{ background: 'linear-gradient(90deg, #818CF8, #60A5FA, #F472B6)' }} />
          </div>

          {/* Step dots */}
          <div className="flex gap-2.5">
            {STEPS.map(s => {
              const st = derived[s.id];
              return (
                <div key={s.id} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center"
                    style={{
                      background: st.passed ? `${s.color}20` : st.locked ? 'var(--hub-locked-bg)' : `${s.color}10`,
                      border: `1px solid ${st.passed ? s.color + '55' : st.locked ? 'var(--hub-dim-border)' : s.color + '25'}`,
                      boxShadow: st.passed ? `0 2px 8px ${s.color}22` : 'none',
                    }}>
                    {st.passed
                      ? <CheckCircle2 size={13} style={{ color: s.color }} />
                      : st.locked ? <Lock size={10} style={{ color: 'var(--hub-dim)' }} />
                      : <s.Icon size={12} style={{ color: s.color }} />
                    }
                  </div>
                  <span className="text-[8px] font-semibold text-center leading-tight"
                    style={{ color: st.locked ? 'var(--hub-dim)' : st.passed ? s.color + 'CC' : 'var(--hub-muted)' }}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>

          {allDone && (
            <motion.div className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-2xl w-full justify-center"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22, delay: 0.7 }}
              style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.22)' }}>
              <Trophy size={14} style={{ color: '#FBBF24' }} />
              <span className="text-[11px] font-black" style={{ color: '#FBBF24' }}>ผ่านหมดแล้ว! 🎉</span>
            </motion.div>
          )}
        </motion.div>

        {/* ── Logout — pinned to bottom on desktop via mt-auto ── */}
        <div className="mt-auto w-full pt-6 flex justify-center">
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-medium transition-all
              text-[color:var(--hub-muted)] border border-[color:var(--hub-border)]
              hover:text-red-500 hover:border-red-300 hover:bg-red-50
              dark:hover:border-red-500/30 dark:hover:bg-red-500/10"
          >
            <LogOut size={12} />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </motion.div>

      {/* ══ RIGHT — Training Modules ══ */}
      <div className="relative z-10 flex-1 flex flex-col lg:overflow-y-auto">

        {/* Header */}
        <motion.div
          className="shrink-0 px-5 py-4 lg:px-6"
          style={{ borderBottom: '1px solid var(--hub-border)', background: 'var(--hub-panel)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-3">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.28em] mb-0.5" style={{ color: 'var(--hub-dim)' }}>
                Training Modules
              </p>
              <h2 className="text-base font-black leading-none" style={{ color: 'var(--hub-text)' }}>
                โมดูลการฝึกอบรม
              </h2>
            </div>
            <div className="flex-1 h-px ml-1" style={{ background: 'var(--hub-border)' }} />
            <span className="text-xs font-bold px-2.5 py-1 rounded-full shrink-0"
              style={{ background: 'var(--hub-card)', border: '1px solid var(--hub-border)', color: 'var(--hub-muted)' }}>
              {done} / {STEPS.length} ผ่านแล้ว
            </span>
          </div>
        </motion.div>

        {/* Mission cards */}
        <div className="px-4 py-5 lg:px-6">
          <div className="flex flex-col gap-3 pb-6">
            {STEPS.map((step, i) => (
              <MissionCard
                key={step.id}
                step={step}
                state={derived[step.id]}
                index={i}
                href={hrefs[step.id]}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
