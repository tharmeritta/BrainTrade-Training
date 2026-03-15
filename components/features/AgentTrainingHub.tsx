'use client';

/**
 * AgentTrainingHub — Single-screen training dashboard.
 * h-screen overflow-hidden, no scrolling.
 */

import { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  CheckCircle2, Lock, BookOpen, Settings, CreditCard, Mic, Target,
  Trophy, RotateCcw, ArrowRight, LogOut, TrendingUp,
} from 'lucide-react';
import type { AgentStats, TrainingModule } from '@/types';

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

const META = {
  product:   { Icon: BookOpen,   color: '#818CF8', glow: 'rgba(129,140,248,0.12)' },
  process:   { Icon: Settings,   color: '#34D399', glow: 'rgba(52,211,153,0.12)'  },
  payment:   { Icon: CreditCard, color: '#60A5FA', glow: 'rgba(96,165,250,0.12)'  },
  'ai-eval': { Icon: Mic,        color: '#F472B6', glow: 'rgba(244,114,182,0.12)' },
  pitch:     { Icon: Target,     color: '#FB923C', glow: 'rgba(251,146,60,0.12)'  },
} as const;

const BADGE_STYLES = {
  elite:        { bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.3)',  text: '#FBB024', label: '⭐ Elite'       },
  strong:       { bg: 'rgba(52,211,153,0.1)',   border: 'rgba(52,211,153,0.35)', text: '#34D399', label: '💪 Strong'      },
  developing:   { bg: 'rgba(96,165,250,0.1)',   border: 'rgba(96,165,250,0.3)',  text: '#60A5FA', label: '📈 Developing'  },
  'needs-work': { bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.28)',text: '#F87171', label: '🔧 Needs Work'  },
} as const;

function scoreColor(n: number) {
  return n >= 70 ? '#34D399' : n >= 50 ? '#FBBF24' : '#F87171';
}

function deriveModules(stats: AgentStats | null, locale: string): TrainingModule[] {
  const pp = stats?.quiz?.product?.passed  ?? false;
  const rp = stats?.quiz?.process?.passed  ?? false;
  const ap = stats?.quiz?.payment?.passed  ?? false;
  const ae = (stats?.aiEval?.count         ?? 0) > 0;

  return [
    {
      id: 'product', titleTh: 'ผลิตภัณฑ์', descriptionTh: 'ความรู้สินค้าและบริการ',
      href: `/${locale}/quiz/product`, learnHref: `/${locale}/learn/product`,
      status: 'available', bestScore: stats?.quiz?.product?.bestScore,
      attempts: stats?.quiz?.product?.attempts, passed: pp,
    },
    {
      id: 'process', titleTh: 'กระบวนการ', descriptionTh: 'ขั้นตอนการขายครบวงจร',
      href: `/${locale}/quiz/process`, learnHref: `/${locale}/learn/process`,
      status: pp ? 'available' : 'locked', bestScore: stats?.quiz?.process?.bestScore,
      attempts: stats?.quiz?.process?.attempts, passed: rp, requiresModuleId: 'product',
    },
    {
      id: 'payment', titleTh: 'ชำระเงิน', descriptionTh: 'ช่องทางและเงื่อนไขการชำระ',
      href: `/${locale}/quiz/payment`, learnHref: `/${locale}/learn/payment`,
      status: rp ? 'available' : 'locked', bestScore: stats?.quiz?.payment?.bestScore,
      attempts: stats?.quiz?.payment?.attempts, passed: ap, requiresModuleId: 'process',
    },
    {
      id: 'ai-eval', titleTh: 'AI ประเมิน', descriptionTh: 'วิเคราะห์สคริปต์ด้วย AI',
      href: `/${locale}/ai-eval`, status: ap ? 'available' : 'locked',
      bestScore: stats?.aiEval ? Math.round(stats.aiEval.avgScore) : undefined,
      passed: ae, requiresModuleId: 'payment',
    },
    {
      id: 'pitch', titleTh: 'ฝึกพิช', descriptionTh: 'จำลองการขายกับ AI',
      href: `/${locale}/pitch`, status: ae ? 'available' : 'locked',
      bestScore: stats?.pitch ? stats.pitch.highestLevel * 33 : undefined,
      passed: (stats?.pitch?.sessionCount ?? 0) > 0, requiresModuleId: 'ai-eval',
    },
  ] as TrainingModule[];
}

function ModuleCard({ module, index }: { module: TrainingModule; index: number }) {
  const meta = META[module.id as keyof typeof META];
  const { Icon, color, glow } = meta;
  const isLocked    = module.status === 'locked';
  const isCompleted = module.passed === true;
  const isActive    = !isLocked && !isCompleted;

  return (
    <motion.div
      className="relative flex-1 flex flex-col rounded-2xl overflow-hidden"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={isLocked
        ? { x: [-3, 3, -3, 0], transition: { duration: 0.3 } }
        : { y: -2, transition: { duration: 0.15 } }
      }
      style={{
        background: isLocked ? 'rgba(255,255,255,0.02)' : T.card,
        border: isCompleted
          ? '1px solid rgba(52,211,153,0.25)'
          : isLocked
          ? `1px solid ${T.dim}50`
          : `1px solid ${color}28`,
        boxShadow: isCompleted ? `0 0 20px rgba(52,211,153,0.06)` : isActive ? `0 0 20px ${glow}` : 'none',
        cursor: isLocked ? 'not-allowed' : 'default',
        opacity: isLocked ? 0.45 : 1,
        filter: isLocked ? 'grayscale(0.5)' : 'none',
        padding: '14px',
      }}
    >
      {/* Corner glow */}
      {!isLocked && (
        <div className="absolute top-0 right-0 w-20 h-20 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${glow}, transparent 70%)`, transform: 'translate(40%, -40%)' }} />
      )}

      {/* Step + icon row */}
      <div className="flex items-center gap-2 mb-2 shrink-0">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{
            background: isLocked ? 'rgba(255,255,255,0.03)' : glow,
            border: `1px solid ${isLocked ? 'rgba(255,255,255,0.05)' : color + '28'}`,
          }}>
          <Icon size={16} style={{ color: isLocked ? T.dim : color }} />
        </div>
        <span className="text-[9px] font-bold tracking-widest uppercase"
          style={{ color: isLocked ? T.dim : `${color}80` }}>
          STEP {index + 1}
        </span>
      </div>

      {/* Title + desc */}
      <div className="mb-auto">
        <h3 className="font-bold text-sm leading-tight mb-1"
          style={{ color: isLocked ? T.dim : T.text }}>
          {module.titleTh}
        </h3>
        <p className="text-[10px] leading-relaxed" style={{ color: isLocked ? T.dim : T.sub }}>
          {module.descriptionTh}
        </p>
      </div>

      {/* Score bar */}
      {module.bestScore !== undefined && (
        <div className="mt-2 mb-2 shrink-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px]" style={{ color: T.sub }}>คะแนน</span>
            <span className="text-xs font-black" style={{ color: scoreColor(module.bestScore) }}>
              {module.bestScore}%
            </span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${module.bestScore}%` }}
              transition={{ delay: 0.4 + index * 0.08, duration: 0.9, ease: 'easeOut' }}
              style={{ background: `linear-gradient(90deg, ${color}80, ${color})` }}
            />
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="mt-2 shrink-0">
        {isLocked ? (
          <div className="flex items-center gap-1.5 text-[10px]" style={{ color: T.dim }}>
            <Lock size={10} />
            <span>ล็อค</span>
          </div>
        ) : (
          <div className="flex gap-1.5">
            {module.learnHref && (
              <Link href={module.learnHref}
                className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg transition-colors"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: T.sub }}>
                <BookOpen size={9} /> เรียน
              </Link>
            )}
            <Link href={module.href}
              className="flex-1 flex items-center justify-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg transition-all"
              style={{
                background: isCompleted ? 'rgba(52,211,153,0.1)' : `${color}18`,
                border: `1px solid ${isCompleted ? 'rgba(52,211,153,0.25)' : color + '30'}`,
                color: isCompleted ? '#34D399' : color,
              }}>
              {isCompleted
                ? <><RotateCcw size={9} /> ทำซ้ำ</>
                : <>เริ่ม <ArrowRight size={9} /></>}
            </Link>
          </div>
        )}
      </div>

      {/* Completed badge */}
      {isCompleted && (
        <div className="absolute top-2 right-2 flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full"
          style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)', color: '#34D399' }}>
          <CheckCircle2 size={8} /> ผ่าน
        </div>
      )}
    </motion.div>
  );
}

interface Props { agentName: string; agentId: string; stats: AgentStats | null; onLogout: () => void; }

export default function AgentTrainingHub({ agentName, agentId, stats, onLogout }: Props) {
  const pathname = usePathname();
  const locale   = pathname.split('/')[1] ?? 'th';
  const modules  = useMemo(() => deriveModules(stats, locale), [stats, locale]);

  const done       = modules.filter(m => m.passed).length;
  const pct        = Math.round((done / modules.length) * 100);
  const badge      = stats?.badge ?? 'developing';
  const badgeStyle = BADGE_STYLES[badge];
  const initials   = agentName.slice(0, 2).toUpperCase();
  const allDone    = done === modules.length;

  return (
    <div
      className="h-screen w-screen overflow-hidden flex flex-col"
      style={{ background: T.bg, fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      {/* background */}
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

      {/* TOP BAR */}
      <motion.div
        className="relative z-10 flex items-center gap-3 px-5 py-3 shrink-0"
        style={{ borderBottom: `1px solid ${T.border}`, background: `${T.panel}cc` }}
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 mr-1 shrink-0">
          <div className="w-6 h-6 rounded-md flex items-center justify-center font-black text-white text-xs"
            style={{ background: 'linear-gradient(135deg, #00B4D8, #0050E0)' }}>B</div>
          <span className="font-black text-sm hidden sm:block" style={{ color: T.text }}>BrainTrade</span>
        </div>

        <div className="w-px h-4 shrink-0" style={{ background: T.border }} />

        {/* Agent identity */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black"
            style={{ background: `rgba(0,180,216,0.15)`, border: `1px solid rgba(0,180,216,0.25)`, color: T.cyan }}>
            {initials}
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-bold leading-tight" style={{ color: T.text }}>{agentName}</div>
            <div className="text-[9px]" style={{ color: T.sub }}>Sales Agent</div>
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
              <span className="text-[10px] font-bold" style={{ color: T.sub }}>{done}/{modules.length}</span>
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
          onMouseEnter={e => {
            e.currentTarget.style.color = '#F87171';
            e.currentTarget.style.borderColor = 'rgba(248,113,113,0.3)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = T.sub;
            e.currentTarget.style.borderColor = T.border;
          }}
        >
          <LogOut size={12} />
          <span className="hidden sm:inline">ออกจากระบบ</span>
        </button>
      </motion.div>

      {/* MODULE CARDS */}
      <div className="relative z-10 flex-1 min-h-0 p-4 flex flex-col">
        {/* Section label */}
        <div className="flex items-center gap-2 mb-2.5 shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: T.sub }}>
            เส้นทางการเรียน
          </span>
          <div className="flex-1 h-px" style={{ background: T.border }} />
          <span className="text-[10px]" style={{ color: T.dim }}>{done} / {modules.length} สำเร็จ</span>
        </div>

        {/* 5-column card row */}
        <div className="flex gap-3 flex-1 min-h-0">
          {modules.map((m, i) => (
            <ModuleCard key={m.id} module={m} index={i} />
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
