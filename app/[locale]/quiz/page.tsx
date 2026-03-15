'use client';

import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BookOpen, Settings, CreditCard, ChevronRight, ClipboardList } from 'lucide-react';
import { MODULE_QUIZ_MAP, UI_STRINGS, type Language } from '@/lib/quiz-data';

const MODULES = [
  {
    id: 'product',
    icon: BookOpen,
    color: '#818CF8',
    glow: 'rgba(129,140,248,0.12)',
  },
  {
    id: 'process',
    icon: Settings,
    color: '#34D399',
    glow: 'rgba(52,211,153,0.12)',
  },
  {
    id: 'payment',
    icon: CreditCard,
    color: '#60A5FA',
    glow: 'rgba(96,165,250,0.12)',
  },
];

export default function QuizIndexPage() {
  const pathname = usePathname();
  const router   = useRouter();
  const locale   = pathname.split('/')[1] ?? 'th';
  const lang     = (locale === 'en' ? 'en' : 'th') as Language;
  const ui       = UI_STRINGS[lang];

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
            {lang === 'th' ? 'แบบทดสอบ' : 'Assessments'}
          </span>
        </div>
        <h1 className="text-2xl font-black text-foreground">
          {ui.selectQuiz}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {lang === 'th'
            ? 'เลือกหัวข้อที่ต้องการทำแบบทดสอบ'
            : 'Choose an assessment module to begin'}
        </p>
      </motion.div>

      {/* Quiz cards */}
      <div className="space-y-3">
        {MODULES.map((m, i) => {
          const quiz = MODULE_QUIZ_MAP[m.id];
          const Icon = m.icon;
          const total = quiz.questions.length;

          return (
            <motion.button
              key={m.id}
              onClick={() => router.push(`/${locale}/quiz/${m.id}`)}
              className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all group"
              style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.01, borderColor: m.color + '60' }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: m.glow, border: `1px solid ${m.color}30` }}>
                <Icon size={22} style={{ color: m.color }} />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="font-bold text-foreground text-base leading-tight mb-0.5">
                  {quiz.title[lang]}
                </div>
                <div className="text-xs text-muted-foreground leading-relaxed">
                  {quiz.description[lang]}
                </div>
                <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: m.glow, color: m.color }}>
                  {total} {lang === 'th' ? 'ข้อ' : 'questions'}
                </div>
              </div>

              {/* Arrow */}
              <ChevronRight size={18} className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1"
                style={{ color: m.color }} />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
