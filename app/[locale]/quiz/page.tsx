'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  BookOpen, Settings, CreditCard, ChevronRight, ClipboardList,
  Lock, GraduationCap, Briefcase, CheckCircle2, ArrowDown,
  HelpCircle, Globe, ShieldCheck, Layers, Map, Grid,
  type LucideIcon,
} from 'lucide-react';

import { MODULE_QUIZ_MAP, type Language, type QuizDefinition } from '@/lib/quiz-data';
import { getAgentSession } from '@/lib/session/agent';
import { hasStaffSession } from '@/lib/session/client';
import { TRAINING_REGISTRY, getCanonicalQuizKey } from '@/lib/registry';

import { QuizPlayerHUD } from '@/components/features/quiz/QuizPlayerHUD';
import { QuestMapCanvas } from '@/components/features/quiz/QuestMapCanvas';
import { ArcadeStageCard } from '@/components/features/quiz/ArcadeStageCard';
import { playGamifiedSound, triggerHaptic } from '@/components/features/quiz/gamification';

const ICON_MAP: Record<string, LucideIcon> = {
  GraduationCap,
  BookOpen,
  Settings,
  CreditCard,
  Briefcase,
  Globe,
  ShieldCheck,
};

const C = {
  border: 'rgba(0,0,0,0.1)',
  card:   'rgba(255,255,255,0.85)',
  muted:  'rgba(0,0,0,0.05)',
  mutedFg: 'rgba(0,0,0,0.4)',
};

// --- SectionHeader ------------------------------------------------------------

function SectionHeader({ icon: Icon, label, description }: { icon: LucideIcon; label: string; description: string }) {
  return (
    <div className="flex items-center gap-3 mb-4 select-none">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-primary/10 border border-primary/20">
        <Icon size={18} className="text-primary" />
      </div>
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-primary leading-tight">{label}</p>
        <p className="text-xs text-muted-foreground/80">{description}</p>
      </div>
    </div>
  );
}

// --- PrereqConnector ----------------------------------------------------------

function PrereqConnector({ prereqTitle, unlocked }: { prereqTitle: string; unlocked: boolean }) {
  const t = useTranslations('quizSelection');
  return (
    <div className="relative flex flex-col items-center my-4 select-none">
      <div className="w-px h-6 bg-border" />
      <div
        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-[11px] font-bold transition-all duration-300 shadow-sm"
        style={{
          borderColor: unlocked ? 'rgba(34,197,94,0.4)' : C.border,
          background:   unlocked ? 'rgba(34,197,94,0.08)' : C.muted,
          color:        unlocked ? '#16a34a' : C.mutedFg,
        }}
      >
        {unlocked ? <CheckCircle2 size={12} /> : <Lock size={12} />}
        <span>
          {unlocked
            ? t('prereqUnlocked', { title: prereqTitle })
            : t('prereqLocked',   { title: prereqTitle })}
        </span>
      </div>
      <div className="w-px h-6 bg-border" />
      <ArrowDown size={14} className="text-muted-foreground/40 -mt-1" />
    </div>
  );
}

// --- Main Quiz Selection Page Component ---------------------------------------

export default function QuizIndexPage() {
  const t = useTranslations('quizSelection');
  const pathname = usePathname();
  const router   = useRouter();
  const locale   = pathname.split('/')[1] ?? 'th';
  const lang     = (locale === 'en' ? 'en' : 'th') as Language;

  const [passedModules,   setPassedModules]   = useState<Set<string>>(new Set());
  const [quizScores,      setQuizScores]      = useState<Record<string, number>>({});
  const [quizConfigs,     setQuizConfigs]     = useState<Record<string, QuizDefinition>>(MODULE_QUIZ_MAP);
  const [showLockedModal, setShowLockedModal] = useState(false);
  const [viewMode,        setViewMode]        = useState<'quest-map' | 'arcade-grid'>('quest-map');

  useEffect(() => {
    fetch('/api/quiz/config')
      .then(r => r.json())
      .then(({ configs }: { configs?: Record<string, QuizDefinition> }) => {
        if (!configs || Object.keys(configs).length === 0) return;
        setQuizConfigs(prev => ({
          ...MODULE_QUIZ_MAP,
          ...configs
        }));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const session = getAgentSession();
    if (!session) return;

    const isStaffPreview = hasStaffSession() || session.id === 'admin-preview-agent';

    fetch(`/api/agent/progress?agentId=${encodeURIComponent(session.id)}`)
      .then(r => r.json())
      .then(d => {
        const learnedCount = d.stats?.learnedModules?.length ?? 0;
        if (!isStaffPreview && learnedCount < TRAINING_REGISTRY.learn.minToUnlockNext) {
          setShowLockedModal(true);
        }

        if (d.stats?.quiz) {
          const scores: Record<string, number> = {};
          Object.entries(d.stats.quiz).forEach(([k, v]: [string, any]) => {
            if (v && typeof v.bestScore === 'number') {
              scores[k] = v.bestScore;
            }
          });
          setQuizScores(scores);
        }
      })
      .catch(() => {});

    fetch(`/api/quiz/status?agentId=${encodeURIComponent(session.id)}`)
      .then(r => r.json())
      .then(({ passed }: { passed: string[] }) => {
        const canonicalPassed = new Set(passed.map(id => getCanonicalQuizKey(id)));
        setPassedModules(canonicalPassed);
      })
      .catch(() => {});
  }, [locale, router]);

  const allQuizzes = useMemo(() => {
    const dbOrder = (quizConfigs as any)._order || Object.keys(quizConfigs).filter(k => k !== '_order');
    const dbQuizzes = (dbOrder as string[]).map(key => ({
      ...quizConfigs[key],
      mKey: key
    })).filter(q => q.id);

    if (dbQuizzes.length > 0) return dbQuizzes;

    return TRAINING_REGISTRY.quiz.required.map(key => ({
      ...quizConfigs[key],
      mKey: key
    })).filter(q => q.id);
  }, [quizConfigs]);

  const sections = useMemo(() => {
    const groups: Record<string, (QuizDefinition & { mKey: string })[]> = {};
    allQuizzes.forEach(q => {
      const s = q.section || 'sales';
      if (!groups[s]) groups[s] = [];
      groups[s].push(q);
    });

    const SECTION_PRIORITY = ['foundation', 'sales', 'other'];
    const sortedEntries = Object.entries(groups)
      .filter(([_, quizzes]) => quizzes.length > 0)
      .sort(([aKey], [bKey]) => {
        const aIdx = SECTION_PRIORITY.indexOf(aKey);
        const bIdx = SECTION_PRIORITY.indexOf(bKey);
        return (aIdx !== -1 ? aIdx : 99) - (bIdx !== -1 ? bIdx : 99);
      });

    return Object.fromEntries(sortedEntries);
  }, [allQuizzes]);

  const completedCount = allQuizzes.filter(q => passedModules.has(q.mKey)).length;
  
  const foundationKey = 'foundation';
  const foundationTitle = typeof quizConfigs[foundationKey]?.title === 'string'
    ? quizConfigs[foundationKey].title
    : (quizConfigs[foundationKey]?.title?.[lang] || quizConfigs[foundationKey]?.title?.en || quizConfigs[foundationKey]?.title?.th || '');
  const foundationPassed = passedModules.has(foundationKey);

  const handleSelectStage = (mKey: string, locked: boolean) => {
    if (!locked) {
      router.push(`/${locale}/quiz/${mKey}`);
    }
  };

  const handleToggleViewMode = (mode: 'quest-map' | 'arcade-grid') => {
    if (mode !== viewMode) {
      playGamifiedSound('combo');
      triggerHaptic('combo');
      setViewMode(mode);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-8 px-3.5 sm:px-4 overflow-x-hidden">
      {/* Title & Hub Description Header */}
      <motion.div
        className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList size={18} className="text-primary" />
            <span className="text-xs font-black uppercase tracking-widest text-primary">
              {t('title')}
            </span>
          </div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">{t('title')}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{t('subtitle')}</p>
        </div>

        {/* View Mode Switcher (Quest Map vs Arcade Grid) */}
        <div className="flex items-center gap-1 p-1.5 rounded-2xl bg-muted/80 border border-border shadow-inner self-start sm:self-auto max-w-full overflow-x-auto">
          <button
            onClick={() => handleToggleViewMode('quest-map')}
            className={`flex items-center justify-center gap-1.5 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-black transition-all ${
              viewMode === 'quest-map'
                ? 'bg-background text-primary shadow-md border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Map size={14} />
            <span>Quest Map</span>
          </button>
          <button
            onClick={() => handleToggleViewMode('arcade-grid')}
            className={`flex items-center justify-center gap-1.5 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-black transition-all ${
              viewMode === 'arcade-grid'
                ? 'bg-background text-primary shadow-md border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Grid size={14} />
            <span>Arcade Cards</span>
          </button>
        </div>
      </motion.div>

      {/* Gamified Player HUD */}
      <QuizPlayerHUD
        passedCount={completedCount}
        totalCount={allQuizzes.length}
        quizScores={quizScores}
        lang={lang}
      />

      {/* View Mode Content Container */}
      <AnimatePresence mode="wait">
        {viewMode === 'quest-map' ? (
          <motion.div
            key="quest-map-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
          >
            <QuestMapCanvas
              sections={sections}
              passedModules={passedModules}
              quizScores={quizScores}
              lang={lang}
              locale={locale}
              onSelectStage={handleSelectStage}
              iconMap={ICON_MAP}
            />
          </motion.div>
        ) : (
          <motion.div
            key="arcade-grid-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {Object.entries(sections).map(([sectionKey, quizzes], sIdx) => (
              <div key={sectionKey}>
                {sIdx === 1 && (
                  <PrereqConnector prereqTitle={foundationTitle} unlocked={foundationPassed} />
                )}

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: sIdx * 0.1 }}
                  className={sIdx > 0 ? 'mt-6' : ''}
                >
                  <SectionHeader
                    icon={sectionKey === 'foundation' ? GraduationCap : sectionKey === 'sales' ? Briefcase : Layers}
                    label={
                      sectionKey === 'foundation'
                        ? (lang === 'th' ? 'Part 1: ความรู้พื้นฐาน (Foundation)' : 'Part 1: Ecosystem & Foundation')
                        : sectionKey === 'sales'
                        ? (lang === 'th' ? 'Part 2: ทักษะหลักและการขาย (Sales & Core)' : 'Part 2: Sales & Core Competencies')
                        : (lang === 'th' ? 'Part 3: โบรกเกอร์และการชำระเงิน (Broker & Payment)' : 'Part 3: Broker & Payment')
                    }
                    description={
                      sectionKey === 'foundation'
                        ? (lang === 'th' ? 'แบบทดสอบพื้นฐานระบบนิเวศการเทรด โบรกเกอร์ และผลิตภัณฑ์' : 'Essential trading ecosystem, broker mechanics, and foundational knowledge evaluations')
                        : sectionKey === 'sales'
                        ? (lang === 'th' ? 'แบบทดสอบทักษะการขาย KYC และการนำเสนอแพ็กเกจราคา' : 'Core sales process, KYC customer segmentation, and package pricing assessments')
                        : (lang === 'th' ? 'แบบทดสอบเกี่ยวกับโบรกเกอร์ (Zenstock & 200 Invest) และการชำระเงิน' : 'Evaluations covering specialized brokers (Zenstock & 200 Invest) and payment packages')
                    }
                  />

                  <div className="space-y-3.5">
                    {quizzes.map((quiz, qIdx) => {
                      const isStaff = hasStaffSession();
                      const prereqId = quiz.prerequisiteId;
                      
                      let locked = false;
                      let prereqTitle: string | undefined = undefined;

                      if (!isStaff) {
                        if (sectionKey === 'other' || (quiz as any).section === 'other') {
                          const salesQuizzes = allQuizzes.filter(q => (q.section || 'sales') === 'sales');
                          const allSalesPassed = salesQuizzes.every(q => passedModules.has(q.mKey));
                          if (!allSalesPassed) {
                            locked = true;
                            prereqTitle = lang === 'th' ? 'แบบทดสอบใน Part 2 (Sales & Core)' : 'all Part 2 Sales Quizzes';
                          }
                        } else if (prereqId) {
                          locked = !passedModules.has(prereqId);
                          prereqTitle = quizConfigs[prereqId]?.title?.[lang];
                        }
                      }

                      const passed = passedModules.has(quiz.mKey);
                      const score = quizScores[quiz.mKey] ?? (passed ? 100 : 0);

                      let stars = 0;
                      if (score >= 100) stars = 3;
                      else if (score >= 85) stars = 2;
                      else if (passed || score >= (quiz.passThreshold ?? 0.7) * 100) stars = 1;
                      
                      return (
                        <ArcadeStageCard
                          key={quiz.mKey}
                          mKey={quiz.mKey}
                          quiz={quiz}
                          locked={locked}
                          passed={passed}
                          score={score}
                          stars={stars}
                          lang={lang}
                          locale={locale}
                          index={qIdx + (sIdx * 5)}
                          prereqTitle={prereqTitle}
                          iconMap={ICON_MAP}
                          onSelect={() => handleSelectStage(quiz.mKey, locked)}
                        />
                      );
                    })}
                  </div>
                </motion.div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Locked Stage Overlay Modal */}
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
              className="bg-card border border-border rounded-3xl p-5 sm:p-7 w-full max-w-sm max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/20 text-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-500/15 flex items-center justify-center mx-auto mb-4">
                <BookOpen size={26} className="text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-lg font-black text-foreground mb-2 tracking-tight">
                กรุณาเข้าเรียนเนื้อหาก่อน
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                คุณจำเป็นต้องเรียนจบอย่างน้อย 1 โมดูลบทเรียนก่อนเริ่มทำแบบทดสอบ ไปที่หัวข้อ <strong className="text-foreground">เรียนรู้</strong> เพื่อเริ่มต้นศึกษา
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => router.push(`/${locale}/learn`)}
                  className="w-full bg-primary text-primary-foreground py-3 min-h-[44px] flex items-center justify-center rounded-xl text-sm font-black hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
                >
                  ไปที่หน้าเรียนรู้
                </button>
                <button
                  onClick={() => setShowLockedModal(false)}
                  className="w-full py-2.5 min-h-[44px] flex items-center justify-center rounded-xl text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                >
                  ไว้ทีหลัง
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
