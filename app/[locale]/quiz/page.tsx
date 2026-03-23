'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  BookOpen, Settings, CreditCard, ChevronRight, ClipboardList,
  Lock, GraduationCap, Briefcase, CheckCircle2, ArrowDown,
  type LucideIcon,
} from 'lucide-react';
import { MODULE_QUIZ_MAP, type Language, type QuizDefinition } from '@/lib/quiz-data';
import { getAgentSession } from '@/lib/agent-session';

type ModuleDef = { id: string; icon: LucideIcon; color: string; glow: string; prereq?: string };

const SECTION_1: ModuleDef[] = [
  { id: 'foundation', icon: GraduationCap, color: '#D97706', glow: 'rgba(217,119,6,0.12)' },
];

const SECTION_2: ModuleDef[] = [
  { id: 'product',  icon: BookOpen,    color: '#818CF8', glow: 'rgba(129,140,248,0.12)', prereq: 'foundation' },
  { id: 'process',  icon: Settings,    color: '#22D3EE', glow: 'rgba(34,211,238,0.12)'  },
  { id: 'payment',  icon: CreditCard,  color: '#60A5FA', glow: 'rgba(96,165,250,0.12)'  },
];

// Framer Motion has trouble animating CSS variables like hsl(var(--border)).
// Using literal colors ensures smooth transitions.
const C = {
  border: 'rgba(0,0,0,0.1)',
  card:   'rgba(255,255,255,0.8)',
  muted:  'rgba(0,0,0,0.05)',
  mutedFg: 'rgba(0,0,0,0.4)',
};

function isModuleLocked(m: ModuleDef, i: number, section: ModuleDef[], passed: Set<string>): boolean {
  // Cross-section prerequisite (e.g. product requires foundation)
  if (m.prereq && !passed.has(m.prereq)) return true;
  // Within-section sequential: must pass previous module first
  if (i > 0 && !passed.has(section[i - 1].id)) return true;
  return false;
}

// ─── SectionHeader ────────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, label, description }: { icon: LucideIcon; label: string; description: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-muted/40 border border-border">
        <Icon size={16} className="text-muted-foreground" />
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground leading-tight">{label}</p>
        <p className="text-xs text-muted-foreground/70">{description}</p>
      </div>
    </div>
  );
}

// ─── PrereqConnector ──────────────────────────────────────────────────────────

function PrereqConnector({ prereqTitle, unlocked }: { prereqTitle: string; unlocked: boolean }) {
  const t = useTranslations('quizSelection');
  return (
    <div className="relative flex flex-col items-center my-3 select-none">
      <div className="w-px h-5 bg-border" />
      <div
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-semibold transition-colors duration-300"
        style={{
          borderColor: unlocked ? 'rgba(34,197,94,0.4)' : C.border,
          background:   unlocked ? 'rgba(34,197,94,0.07)' : C.muted,
          color:        unlocked ? '#16a34a' : C.mutedFg,
        }}
      >
        {unlocked ? <CheckCircle2 size={11} /> : <Lock size={11} />}
        <span>
          {unlocked
            ? t('prereqUnlocked', { title: prereqTitle })
            : t('prereqLocked',   { title: prereqTitle })}
        </span>
      </div>
      <div className="w-px h-5 bg-border" />
      <ArrowDown size={12} className="text-muted-foreground/30 -mt-1" />
    </div>
  );
}

// ─── ModuleCard ───────────────────────────────────────────────────────────────

function ModuleCard({
  m, locked, passed, quiz, lang, locale, index, prereqTitle,
}: {
  m: ModuleDef;
  locked: boolean;
  passed: boolean;
  quiz: QuizDefinition;
  lang: Language;
  locale: string;
  index: number;
  prereqTitle?: string;
}) {
  const t = useTranslations('quizSelection');
  const router = useRouter();
  const Icon = m.icon;
  const total = quiz.questions.length;
  const thresholdPct = Math.round((quiz.passThreshold ?? 0.7) * 100);

  return (
    <motion.button
      onClick={() => { if (!locked) router.push(`/${locale}/quiz/${m.id}`); }}
      disabled={locked}
      className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all group relative overflow-hidden"
      style={{
        borderColor: passed ? m.color + '50' : C.border,
        background:  passed ? m.glow        : locked ? 'transparent' : C.card,
        opacity:     locked ? 0.55          : 1,
        cursor:      locked ? 'not-allowed' : 'pointer',
      }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: locked ? 0.55 : 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={locked ? {} : { scale: 1.01, borderColor: m.color + '60' }}
      whileTap={locked   ? {} : { scale: 0.98 }}
    >
      {/* Icon */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
        style={{
          background: locked ? 'transparent' : m.glow,
          border: `1px solid ${locked ? C.border : m.color + '30'}`,
        }}
      >
        {locked
          ? <Lock size={20} className="text-muted-foreground" />
          : <Icon size={22} style={{ color: m.color }} />
        }
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="font-bold text-foreground text-base leading-tight mb-0.5 flex items-center gap-2 flex-wrap">
          {quiz.title?.[lang]}
          {passed && (
            <span
              className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: m.color + '20', color: m.color }}
            >
              <CheckCircle2 size={10} />
              {t('passed')}
            </span>
          )}
          {locked && prereqTitle && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {t('passFirst', { title: prereqTitle })}
            </span>
          )}
        </div>
        <div className="text-xs text-muted-foreground leading-relaxed">
          {quiz.description?.[lang]}
        </div>
        {!locked && (
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            {total > 0 && (
              <span
                className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: m.glow, color: m.color }}
              >
                {t('questions', { count: total })}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {t('passScore', { threshold: thresholdPct })}
            </span>
          </div>
        )}
      </div>

      {/* Right indicator */}
      {locked
        ? <Lock size={16} className="shrink-0 text-muted-foreground" />
        : passed
          ? <CheckCircle2 size={18} className="shrink-0" style={{ color: m.color }} />
          : <ChevronRight
              size={18}
              className="shrink-0 transition-transform group-hover:translate-x-1"
              style={{ color: m.color }}
            />
      }
    </motion.button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function QuizIndexPage() {
  const t = useTranslations('quizSelection');
  const pathname = usePathname();
  const locale   = pathname.split('/')[1] ?? 'th';
  const lang     = (locale === 'en' ? 'en' : 'th') as Language;

  const [passedModules, setPassedModules] = useState<Set<string>>(new Set());
  const [quizConfigs,   setQuizConfigs]   = useState<Record<string, QuizDefinition>>(MODULE_QUIZ_MAP);

  useEffect(() => {
    fetch('/api/quiz/config')
      .then(r => r.json())
      .then(({ configs }: { configs?: Record<string, QuizDefinition> }) => {
        if (!configs) return;
        const merged: Record<string, QuizDefinition> = { ...MODULE_QUIZ_MAP };
        for (const [key, dbQuiz] of Object.entries(configs)) {
          merged[key] = { ...(MODULE_QUIZ_MAP[key] ?? {}), ...dbQuiz } as QuizDefinition;
        }
        setQuizConfigs(merged);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const session = getAgentSession();
    if (!session) return;
    fetch(`/api/quiz/status?agentId=${encodeURIComponent(session.id)}`)
      .then(r => r.json())
      .then(({ passed }: { passed: string[] }) => setPassedModules(new Set(passed)))
      .catch(() => {});
  }, []);

  const allModules      = [...SECTION_1, ...SECTION_2];
  const completedCount  = allModules.filter(m => passedModules.has(m.id)).length;
  const foundationPassed = passedModules.has('foundation');
  const foundationTitle  = quizConfigs['foundation']?.title?.[lang] ?? '';

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">

      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ClipboardList size={18} className="text-primary" />
              <span className="text-xs font-bold uppercase tracking-widest text-primary">
                {t('title')}
              </span>
            </div>
            <h1 className="text-2xl font-black text-foreground">{t('title')}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t('subtitle')}</p>
          </div>

          {/* Progress badge */}
          <div className="shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-2xl border-2 border-primary/20 bg-primary/5">
            <span className="text-xl font-black text-primary leading-none">{completedCount}</span>
            <span className="text-[10px] font-bold text-primary/60 uppercase tracking-wide">/ {allModules.length}</span>
          </div>
        </div>
      </motion.div>

      {/* Section 1 — Foundation */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <SectionHeader
          icon={GraduationCap}
          label={t('sections.foundation.label')}
          description={t('sections.foundation.desc')}
        />
        <div className="space-y-3">
          {SECTION_1.map((m, i) => {
            const quiz = quizConfigs[m.id];
            if (!quiz) return null;
            return (
              <ModuleCard
                key={m.id}
                m={m}
                locked={isModuleLocked(m, i, SECTION_1, passedModules)}
                passed={passedModules.has(m.id)}
                quiz={quiz}
                lang={lang}
                locale={locale}
                index={i}
              />
            );
          })}
        </div>
      </motion.div>

      {/* Prerequisite connector */}
      <PrereqConnector prereqTitle={foundationTitle} unlocked={foundationPassed} />

      {/* Section 2 — Sales */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <SectionHeader
          icon={Briefcase}
          label={t('sections.sales.label')}
          description={t('sections.sales.desc')}
        />
        <div className="space-y-3">
          {SECTION_2.map((m, i) => {
            const quiz = quizConfigs[m.id];
            if (!quiz) return null;
            const locked = isModuleLocked(m, i, SECTION_2, passedModules);
            const prereqTitle = m.prereq
              ? quizConfigs[m.prereq]?.title?.[lang]
              : i > 0
                ? quizConfigs[SECTION_2[i - 1].id]?.title?.[lang]
                : undefined;
            return (
              <ModuleCard
                key={m.id}
                m={m}
                locked={locked}
                passed={passedModules.has(m.id)}
                quiz={quiz}
                lang={lang}
                locale={locale}
                index={i + SECTION_1.length}
                prereqTitle={prereqTitle}
              />
            );
          })}
        </div>
      </motion.div>

    </div>
  );
}
