'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { BookOpen, Settings, CreditCard, ChevronRight, ClipboardList, Lock, GraduationCap, Briefcase, type LucideIcon } from 'lucide-react';
import { MODULE_QUIZ_MAP, type Language, type QuizDefinition } from '@/lib/quiz-data';
import { getAgentSession } from '@/lib/agent-session';

const SECTION_1 = [
  {
    id: 'foundation',
    icon: GraduationCap,
    color: '#D97706',
    glow: 'rgba(217,119,6,0.12)',
  },
];

const SECTION_2 = [
  {
    id: 'product',
    icon: BookOpen,
    color: '#818CF8',
    glow: 'rgba(129,140,248,0.12)',
  },
  {
    id: 'process',
    icon: Settings,
    color: '#22D3EE',
    glow: 'rgba(34,211,238,0.12)',
  },
  {
    id: 'payment',
    icon: CreditCard,
    color: '#60A5FA',
    glow: 'rgba(96,165,250,0.12)',
  },
];

// module at index i (within a section) is unlocked if all previous modules in that section have been passed
function getLockedState(modules: { id: string }[], passedModules: Set<string>): boolean[] {
  return modules.map((_, i) => {
    if (i === 0) return false;
    return !passedModules.has(modules[i - 1].id);
  });
}

function SectionHeader({ icon: Icon, label, description }: { icon: LucideIcon; label: string; description: string }) {
  return (
    <div className="flex items-center gap-3 mb-3 mt-2">
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

function ModuleCard({
  m, locked, quiz, lang, locale, index,
  prevTitle,
}: {
  m: { id: string; icon: LucideIcon; color: string; glow: string };
  locked: boolean;
  quiz: QuizDefinition;
  lang: Language;
  locale: string;
  index: number;
  prevTitle?: string;
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
        borderColor: 'var(--border)',
        background: locked ? 'var(--muted)/5' : 'var(--card)',
        opacity: locked ? 0.6 : 1,
        cursor: locked ? 'not-allowed' : 'pointer',
      }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: locked ? 0.6 : 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={locked ? {} : { scale: 1.01, borderColor: m.color + '60' }}
      whileTap={locked ? {} : { scale: 0.98 }}
    >
      {/* Icon */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
        style={{
          background: locked ? 'var(--muted)/10' : m.glow,
          border: `1px solid ${locked ? 'var(--border)' : m.color + '30'}`,
        }}
      >
        {locked
          ? <Lock size={20} className="text-muted-foreground" />
          : <Icon size={22} style={{ color: m.color }} />
        }
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="font-bold text-foreground text-base leading-tight mb-0.5 flex items-center gap-2">
          {quiz.title[lang]}
          {locked && prevTitle && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {t('passFirst', { title: prevTitle })}
            </span>
          )}
        </div>
        <div className="text-xs text-muted-foreground leading-relaxed">
          {quiz.description[lang]}
        </div>
        {!locked && (
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <span
              className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: m.glow, color: m.color }}
            >
              {t('questions', { count: total })}
            </span>
            <span
              className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
            >
              {t('passScore', { threshold: thresholdPct })}
            </span>
          </div>
        )}
      </div>

      {/* Arrow / Lock indicator */}
      {locked
        ? <Lock size={16} className="shrink-0 text-muted-foreground" />
        : <ChevronRight
            size={18}
            className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1"
            style={{ color: m.color }}
          />
      }
    </motion.button>
  );
}

export default function QuizIndexPage() {
  const t = useTranslations('quizSelection');
  const pathname = usePathname();
  const locale   = pathname.split('/')[1] ?? 'th';
  const lang     = (locale === 'en' ? 'en' : 'th') as Language;

  const [passedModules, setPassedModules] = useState<Set<string>>(new Set());

  useEffect(() => {
    const session = getAgentSession();
    if (!session) return;
    fetch(`/api/quiz/status?agentId=${encodeURIComponent(session.id)}`)
      .then(r => r.json())
      .then(({ passed }: { passed: string[] }) => setPassedModules(new Set(passed)))
      .catch(() => {});
  }, []);

  const locked1 = getLockedState(SECTION_1, passedModules);
  const locked2 = getLockedState(SECTION_2, passedModules);

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <ClipboardList size={18} className="text-primary" />
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            {t('title')}
          </span>
        </div>
        <h1 className="text-2xl font-black text-foreground">
          {t('title')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('subtitle')}
        </p>
      </motion.div>

      {/* Section 1 */}
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
        <div className="space-y-3 mb-8">
          {SECTION_1.map((m, i) => {
            const quiz = MODULE_QUIZ_MAP[m.id];
            if (!quiz) return null;
            return (
              <ModuleCard
                key={m.id}
                m={m}
                locked={locked1[i]}
                quiz={quiz}
                lang={lang}
                locale={locale}
                index={i}
              />
            );
          })}
        </div>
      </motion.div>

      {/* Divider */}
      <div className="border-t border-border mb-6" />

      {/* Section 2 */}
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
            const quiz = MODULE_QUIZ_MAP[m.id];
            if (!quiz) return null;
            const prevQuiz = i > 0 ? MODULE_QUIZ_MAP[SECTION_2[i - 1].id] : undefined;
            const prevTitle = prevQuiz?.title[lang];
            return (
              <ModuleCard
                key={m.id}
                m={m}
                locked={locked2[i]}
                quiz={quiz}
                lang={lang}
                locale={locale}
                index={i + SECTION_1.length}
                prevTitle={prevTitle}
              />
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
