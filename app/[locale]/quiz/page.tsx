'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { AnimatePresence } from 'framer-motion';
import {
  BookOpen, Settings, CreditCard, ChevronRight, ClipboardList,
  Lock, GraduationCap, Briefcase, CheckCircle2, ArrowDown,
  HelpCircle, Globe, ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { MODULE_QUIZ_MAP, type Language, type QuizDefinition } from '@/lib/quiz-data';
import { getAgentSession } from '@/lib/agent-session';

const ICON_MAP: Record<string, LucideIcon> = {
  GraduationCap,
  BookOpen,
  Settings,
  CreditCard,
  Briefcase,
  Globe,
  ShieldCheck,
};

// Framer Motion has trouble animating CSS variables like hsl(var(--border)).
// Using literal colors ensures smooth transitions.
const C = {
  border: 'rgba(0,0,0,0.1)',
  card:   'rgba(255,255,255,0.8)',
  muted:  'rgba(0,0,0,0.05)',
  mutedFg: 'rgba(0,0,0,0.4)',
};


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
  quiz, locked, passed, lang, locale, index, prereqTitle,
}: {
  quiz: QuizDefinition;
  locked: boolean;
  passed: boolean;
  lang: Language;
  locale: string;
  index: number;
  prereqTitle?: string;
}) {
  const t = useTranslations('quizSelection');
  const router = useRouter();
  
  const Icon = (quiz.icon ? ICON_MAP[quiz.icon] : null) || HelpCircle;
  const color = quiz.color || '#D97706';
  const glow = `${color}12`; // 0.12 opacity hex approx

  const total = quiz.questions.length;
  const thresholdPct = Math.round((quiz.passThreshold ?? 0.7) * 100);

  return (
    <motion.button
      onClick={() => { if (!locked) router.push(`/${locale}/quiz/${quiz.id}`); }}
      disabled={locked}
      className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all group relative overflow-hidden"
      style={{
        borderColor: passed ? color + '50' : C.border,
        background:  passed ? glow        : locked ? 'transparent' : C.card,
        opacity:     locked ? 0.55          : 1,
        cursor:      locked ? 'not-allowed' : 'pointer',
      }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: locked ? 0.55 : 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={locked ? {} : { scale: 1.01, borderColor: color + '60' }}
      whileTap={locked   ? {} : { scale: 0.98 }}
    >
      {/* Icon */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
        style={{
          background: locked ? 'transparent' : glow,
          border: `1px solid ${locked ? C.border : color + '30'}`,
        }}
      >
        {locked
          ? <Lock size={20} className="text-muted-foreground" />
          : <Icon size={22} style={{ color: color }} />
        }
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="font-bold text-foreground text-base leading-tight mb-0.5 flex items-center gap-2 flex-wrap">
          {quiz.title?.[lang]}
          {passed && (
            <span
              className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: color + '20', color: color }}
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
                style={{ background: glow, color: color }}
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
          ? <CheckCircle2 size={18} className="shrink-0" style={{ color: color }} />
          : <ChevronRight
              size={18}
              className="shrink-0 transition-transform group-hover:translate-x-1"
              style={{ color: color }}
            />
      }
    </motion.button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function QuizIndexPage() {
  const t = useTranslations('quizSelection');
  const pathname = usePathname();
  const router   = useRouter();
  const locale   = pathname.split('/')[1] ?? 'th';
  const lang     = (locale === 'en' ? 'en' : 'th') as Language;

  const [passedModules,    setPassedModules]    = useState<Set<string>>(new Set());
  const [quizConfigs,      setQuizConfigs]      = useState<Record<string, QuizDefinition>>(MODULE_QUIZ_MAP);
  const [showLockedModal,  setShowLockedModal]  = useState(false);

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

    // 1. Check learned modules — show prompt if none completed yet
    fetch(`/api/agent/progress?agentId=${encodeURIComponent(session.id)}`)
      .then(r => r.json())
      .then(d => {
        const learned = d.stats?.learnedModules ?? [];
        if (learned.length === 0) setShowLockedModal(true);
      })
      .catch(() => {});

    // 2. Fetch passed quizzes
    fetch(`/api/quiz/status?agentId=${encodeURIComponent(session.id)}`)
      .then(r => r.json())
      .then(({ passed }: { passed: string[] }) => setPassedModules(new Set(passed)))
      .catch(() => {});
  }, [locale, router]);

  // Dynamic grouping and sorting
  const sections = useMemo(() => {
    const list = Object.values(quizConfigs).sort((a, b) => (a.order || 99) - (b.order || 99));
    const groups: Record<string, QuizDefinition[]> = {};
    list.forEach(q => {
      const s = q.section || 'other';
      if (!groups[s]) groups[s] = [];
      groups[s].push(q);
    });
    return groups;
  }, [quizConfigs]);

  const allList = useMemo(() => Object.values(quizConfigs).sort((a, b) => (a.order || 99) - (b.order || 99)), [quizConfigs]);
  const completedCount = allList.filter(q => passedModules.has(q.id)).length;

  const foundationTitle = quizConfigs['foundation']?.title?.[lang] ?? '';
  const foundationPassed = passedModules.has('foundation');

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
            <span className="text-[10px] font-bold text-primary/60 uppercase tracking-wide">/ {allList.length}</span>
          </div>
        </div>
      </motion.div>

      {/* Render Sections Dynamically */}
      {Object.entries(sections).map(([sectionKey, quizzes], sIdx) => (
        <div key={sectionKey}>
          {/* Prerequisite connector if this is the second section */}
          {sIdx === 1 && (
             <PrereqConnector prereqTitle={foundationTitle} unlocked={foundationPassed} />
          )}

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: sIdx * 0.1 }}
            className={sIdx > 0 ? 'mt-8' : ''}
          >
            <SectionHeader
              icon={sectionKey === 'foundation' ? GraduationCap : Briefcase}
              label={t(`sections.${sectionKey}.label`)}
              description={t(`sections.${sectionKey}.desc`)}
            />
            <div className="space-y-3">
              {quizzes.map((quiz, qIdx) => {
                const locked = quiz.prerequisiteId ? !passedModules.has(quiz.prerequisiteId) : false;
                const prereqTitle = quiz.prerequisiteId ? quizConfigs[quiz.prerequisiteId]?.title?.[lang] : undefined;
                
                return (
                  <ModuleCard
                    key={quiz.id}
                    quiz={quiz}
                    locked={locked}
                    passed={passedModules.has(quiz.id)}
                    lang={lang}
                    locale={locale}
                    index={qIdx + (sIdx * 5)} // rough index for stagger
                    prereqTitle={prereqTitle}
                  />
                );
              })}
            </div>
          </motion.div>
        </div>
      ))}

      {/* ── Learn-first prompt modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showLockedModal && (
          <motion.div
            key="locked-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setShowLockedModal(false)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 12 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="bg-card border border-border rounded-3xl p-7 w-full max-w-sm shadow-2xl shadow-black/20 text-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-500/15 flex items-center justify-center mx-auto mb-4">
                <BookOpen size={26} className="text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-lg font-black text-foreground mb-2 tracking-tight">
                Complete a lesson first
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                You need to finish at least one learning module before taking a quiz. Head to the <strong className="text-foreground">Learn</strong> section to get started.
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => router.push(`/${locale}/learn`)}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-xl text-sm font-black hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
                >
                  Go to Learn
                </button>
                <button
                  onClick={() => setShowLockedModal(false)}
                  className="w-full py-2.5 rounded-xl text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                >
                  Maybe Later
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
