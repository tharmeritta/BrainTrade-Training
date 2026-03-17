'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { BookOpen, ChevronRight, Layers } from 'lucide-react';
import { COURSE_MODULES, type CourseLang } from '@/lib/courses';

export default function CourseHub() {
  const [lang, setLang] = useState<CourseLang>('th');
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] ?? 'th';

  const modules = Object.values(COURSE_MODULES);

  const start = (moduleId: string) => {
    router.push(`/${locale}/learn/${moduleId}?lang=${lang}`);
  };

  return (
    <div className="min-h-[calc(100dvh-72px)] bg-background text-foreground px-4 py-8 md:px-8">
      {/* ── Page header ───────────────────────────────────── */}
      <div className="max-w-5xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-10 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Layers size={16} className="text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-widest">
                Training Courses
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {lang === 'th' ? 'คอร์สอบรม' : 'Training Modules'}
            </h1>
            <p className="text-muted-foreground text-sm mt-1.5">
              {lang === 'th'
                ? 'เลือกบทเรียนเพื่อเริ่มฝึกอบรม'
                : 'Select a module to begin your training session'}
            </p>
          </div>

          {/* Language picker */}
          <div className="flex items-center gap-1 bg-black/5 dark:bg-white/6 border border-black/10 dark:border-white/10 rounded-xl p-1 shrink-0">
            <button
              onClick={() => setLang('th')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                lang === 'th'
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              🇹🇭 ภาษาไทย
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                lang === 'en'
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              🇬🇧 English
            </button>
          </div>
        </div>

        {/* ── Course cards grid ─────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map((mod) => {
            const pres = mod.presentations[lang];
            const title = lang === 'th' ? mod.titleTh : mod.title;
            const desc  = lang === 'th' ? mod.descriptionTh : mod.description;

            return (
              <div
                key={mod.id}
                className="group relative flex flex-col rounded-2xl
                           border border-black/10 dark:border-white/8
                           bg-black/3 dark:bg-white/3
                           hover:bg-black/5 dark:hover:bg-white/6
                           hover:border-black/20 dark:hover:border-white/16
                           overflow-hidden transition-all duration-300
                           hover:shadow-xl hover:shadow-black/20 dark:hover:shadow-black/40
                           cursor-pointer"
                onClick={() => start(mod.id)}
              >
                {/* Card gradient header */}
                <div className={`relative h-36 bg-gradient-to-br ${mod.gradient} flex items-center justify-center overflow-hidden`}>
                  {/* Decorative circles */}
                  <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/8 rounded-full" />
                  <div className="absolute -bottom-8 -left-4 w-24 h-24 bg-black/15 rounded-full" />

                  <div className="relative z-10 p-4 bg-white/15 rounded-2xl backdrop-blur-sm
                                  group-hover:scale-110 transition-transform duration-300">
                    <BookOpen size={28} className="text-white" />
                  </div>

                  {/* Slide count badge */}
                  <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/30 backdrop-blur-sm
                                  rounded-full text-[10px] font-semibold text-white/80">
                    {pres.totalSlides} slides
                  </div>
                </div>

                {/* Card body */}
                <div className="flex flex-col flex-1 p-5 gap-3">
                  <div className="flex-1">
                    <h2 className="font-bold text-base leading-snug mb-1.5 group-hover:text-primary transition-colors">
                      {title}
                    </h2>
                    <p className="text-muted-foreground text-xs leading-relaxed line-clamp-3">
                      {desc}
                    </p>
                  </div>

                  {/* Start button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); start(mod.id); }}
                    className="mt-1 flex items-center justify-center gap-2 w-full py-2.5 px-4
                               rounded-xl bg-primary/15 border border-primary/25 text-primary
                               text-sm font-semibold
                               hover:bg-primary hover:text-white hover:border-primary
                               transition-all duration-200 group/btn"
                  >
                    {lang === 'th' ? 'เริ่มเรียน' : 'Start Module'}
                    <ChevronRight
                      size={15}
                      className="group-hover/btn:translate-x-0.5 transition-transform"
                    />
                  </button>
                </div>
              </div>
            );
          })}

          {/* ── Placeholder cards for upcoming modules ────────── */}
          {[...Array(Math.max(0, 3 - modules.length))].map((_, i) => (
            <div
              key={`placeholder-${i}`}
              className="flex flex-col rounded-2xl border border-dashed
                         border-black/10 dark:border-white/10
                         bg-black/2 dark:bg-white/2 overflow-hidden opacity-50"
            >
              <div className="h-36 bg-black/3 dark:bg-white/3 flex items-center justify-center">
                <div className="p-4 bg-black/6 dark:bg-white/6 rounded-2xl">
                  <BookOpen size={28} className="text-black/20 dark:text-white/20" />
                </div>
              </div>
              <div className="p-5">
                <div className="h-3 w-3/4 bg-black/8 dark:bg-white/8 rounded-full mb-2" />
                <div className="h-2.5 w-full bg-black/5 dark:bg-white/5 rounded-full mb-1.5" />
                <div className="h-2.5 w-2/3 bg-black/5 dark:bg-white/5 rounded-full mb-4" />
                <div className="h-9 w-full bg-black/4 dark:bg-white/4 rounded-xl flex items-center justify-center">
                  <span className="text-xs text-black/20 dark:text-white/20 font-medium">
                    {lang === 'th' ? 'เร็วๆ นี้' : 'Coming soon'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
