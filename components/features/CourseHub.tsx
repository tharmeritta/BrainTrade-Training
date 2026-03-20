'use client';

import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { BookOpen, ChevronRight, Layers, Globe, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { type CourseLang, type CourseModule } from '@/lib/courses';
import { FADE_IN, STAGGER_CONTAINER, STAGGER_ITEM, TRANSITION, stagger } from '@/lib/animations';
import { getAgentSession } from '@/lib/agent-session';
import { ActiveAgentUI } from '@/components/ui/ActiveAgentUI';

// ─── Interfaces ─────────────────────────────────────────────────────────────

interface LanguagePickerProps {
  lang: CourseLang;
  onSelect: (l: CourseLang) => void;
}

interface CourseHeaderProps {
  lang: CourseLang;
  onLangChange: (l: CourseLang) => void;
  agentName: string | null;
}

interface CourseCardProps {
  module: CourseModule;
  lang: CourseLang;
  index: number;
  onStart: (id: string) => void;
}

interface PlaceholderCardProps {
  lang: CourseLang;
  index: number;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/**
 * Language selection toggle
 */
const LanguagePicker = memo(({ lang, onSelect }: LanguagePickerProps) => {
  const t = useTranslations('courseHub');
  return (
    <div className="flex items-center gap-1.5 bg-secondary/30 backdrop-blur-sm border border-black/5 dark:border-white/10 rounded-2xl p-1.5 shrink-0 shadow-sm">
      <button
        onClick={() => onSelect('th')}
        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
          lang === 'th'
            ? 'bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]'
            : 'text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'
        }`}
      >
        <span className="text-base">🇹🇭</span>
        {lang === 'th' ? t('thai') : t('th')}
      </button>
      <button
        onClick={() => onSelect('en')}
        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
          lang === 'en'
            ? 'bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]'
            : 'text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'
        }`}
      >
        <span className="text-base">🇬🇧</span>
        {lang === 'th' ? t('english') : t('en')}
      </button>
    </div>
  );
});

LanguagePicker.displayName = 'LanguagePicker';

/**
 * Page header with title and language picker
 */
const CourseHeader = memo(({ lang, onLangChange, agentName }: CourseHeaderProps) => {
  const t = useTranslations('courseHub');
  return (
    <motion.div 
      variants={FADE_IN}
      className="flex items-start justify-between gap-6 mb-12 flex-wrap"
    >
      <div className="flex-1 min-w-[300px]">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Layers size={14} className="text-primary" />
          </div>
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
            {t('internalAcademy')}
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
          {t('title')}
        </h1>
        <p className="text-muted-foreground text-sm md:text-base max-w-xl leading-relaxed">
          {t('subtitle')}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <ActiveAgentUI agentName={agentName} />
        <LanguagePicker lang={lang} onSelect={onLangChange} />
      </div>
    </motion.div>
  );
});

CourseHeader.displayName = 'CourseHeader';

/**
 * Individual course card
 */
const CourseCard = memo(({ module, lang, index, onStart }: CourseCardProps) => {
  const t = useTranslations('courseHub');
  const [imgStatus, setImgStatus] = useState<'loading' | 'error' | 'success'>('loading');
  const pres = module.presentations[lang];
  const title = lang === 'th' ? module.titleTh : module.title;
  const desc  = lang === 'th' ? module.descriptionTh : module.description;

  const handleStart = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    onStart(module.id);
  }, [module.id, onStart]);

  return (
    <motion.div
      variants={STAGGER_ITEM}
      custom={index}
      whileHover={{ y: -6, transition: TRANSITION.base }}
      className="group relative flex flex-col rounded-[24px]
                 border border-black/5 dark:border-white/8
                 bg-white/50 dark:bg-white/5 backdrop-blur-md
                 hover:bg-white dark:hover:bg-white/10
                 hover:border-primary/20 dark:hover:border-primary/30
                 overflow-hidden transition-all duration-500
                 hover:shadow-2xl hover:shadow-primary/5
                 cursor-pointer"
      onClick={() => handleStart()}
    >
      <div className={`relative h-44 bg-gradient-to-br ${module.gradient} overflow-hidden flex items-center justify-center`}>
        {/* Animated Placeholder/Fallback */}
        <AnimatePresence>
          {(imgStatus === 'loading' || imgStatus === 'error') && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
            >
              <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px]" />
              
              <div className="relative z-10 flex flex-col items-center">
                 <div className="mb-3 p-3.5 bg-white/10 rounded-[20px] backdrop-blur-md border border-white/20 shadow-xl shadow-black/5">
                   {imgStatus === 'loading' ? (
                     <Loader2 size={28} className="text-white/80 animate-spin" />
                   ) : (
                     <BookOpen size={28} className="text-white/80" />
                   )}
                 </div>
                 <div className="flex flex-col gap-1">
                   <span className="text-[9px] font-black text-white/70 uppercase tracking-[0.2em]">
                     {imgStatus === 'loading' ? t('loadingPreview') || 'Loading Preview' : t('trainingModule') || 'Training Module'}
                   </span>
                 </div>
              </div>
              
              {/* Decorative background title */}
              <div className="absolute -bottom-6 -right-4 text-7xl font-black text-white/5 select-none pointer-events-none uppercase italic leading-none whitespace-nowrap overflow-hidden max-w-[150%]">
                {title}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <img
          src={`https://docs.google.com/presentation/d/${pres.presentationId}/thumbnail?sz=w640`}
          alt={title}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 z-10 ${
            imgStatus === 'success' ? 'opacity-90 group-hover:opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
          onLoad={() => setImgStatus('success')}
          onError={() => setImgStatus('error')}
        />
        
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500 z-20" />
        
        <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/40 backdrop-blur-md
                        rounded-full text-[10px] font-black text-white uppercase tracking-widest z-30 border border-white/10 shadow-lg">
          {pres.totalSlides} {t('slides')}
        </div>
      </div>

      <div className="flex flex-col flex-1 p-6 gap-4">
        <div className="flex-1">
          <h2 className="text-lg font-extrabold leading-tight mb-2 group-hover:text-primary transition-colors duration-300">
            {title}
          </h2>
          <p className="text-muted-foreground text-[13px] leading-relaxed line-clamp-2 font-medium opacity-80 group-hover:opacity-100 transition-opacity">
            {desc}
          </p>
        </div>

        <button
          onClick={handleStart}
          className="mt-2 flex items-center justify-center gap-2 w-full py-3 px-4
                     rounded-[18px] bg-secondary/50 border border-black/5 dark:border-white/10
                     text-foreground text-sm font-bold
                     hover:bg-primary hover:text-white hover:border-primary hover:shadow-lg hover:shadow-primary/30
                     transition-all duration-300 group/btn"
        >
          {t('beginTraining')}
          <ChevronRight
            size={16}
            className="group-hover/btn:translate-x-1 transition-transform"
          />
        </button>
      </div>
    </motion.div>
  );
});

CourseCard.displayName = 'CourseCard';

/**
 * Placeholder for future courses
 */
const PlaceholderCard = memo(({ lang, index }: PlaceholderCardProps) => {
  const t = useTranslations('courseHub');
  return (
    <motion.div
      variants={STAGGER_ITEM}
      custom={index}
      className="flex flex-col rounded-[24px] border border-dashed
                 border-black/10 dark:border-white/10
                 bg-black/[0.02] dark:bg-white/[0.02] overflow-hidden opacity-40 select-none"
    >
      <div className="h-44 bg-black/5 dark:bg-white/5 flex items-center justify-center relative">
        <div className="p-5 bg-white dark:bg-black/20 rounded-2xl shadow-sm border border-black/5 dark:border-white/5">
          <BookOpen size={32} className="text-muted-foreground/30" />
        </div>
      </div>
      <div className="p-6">
        <div className="h-4 w-3/4 bg-black/10 dark:bg-white/10 rounded-full mb-3" />
        <div className="h-3 w-full bg-black/5 dark:bg-white/5 rounded-full mb-2" />
        <div className="h-3 w-2/3 bg-black/5 dark:bg-white/5 rounded-full mb-6" />
        <div className="h-11 w-full bg-black/5 dark:bg-white/5 rounded-[18px] flex items-center justify-center">
          <span className="text-[10px] text-muted-foreground/40 font-black uppercase tracking-widest">
            {t('comingSoon')}
          </span>
        </div>
      </div>
    </motion.div>
  );
});

PlaceholderCard.displayName = 'PlaceholderCard';

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CourseHub({ initialModules }: { initialModules: CourseModule[] }) {
  const t = useTranslations('courseHub');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = pathname.split('/')[1] ?? 'th';

  const [modules, setModules] = useState<CourseModule[]>(initialModules);
  const [loading, setLoading] = useState(false);
  const [agentName, setAgentName] = useState<string | null>(null);

  useEffect(() => {
    const session = getAgentSession();
    if (session) setAgentName(session.name);
  }, []);

  // State managed by URL query param 'lang'
  const [lang, setLang] = useState<CourseLang>(() => {
    const p = searchParams.get('lang');
    return (p === 'en' ? 'en' : 'th') as CourseLang;
  });

  // Sync state to URL without full reload
  const handleLangChange = useCallback((newLang: CourseLang) => {
    setLang(newLang);
    const params = new URLSearchParams(window.location.search);
    params.set('lang', newLang);
    window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
  }, []);

  const start = useCallback((moduleId: string) => {
    router.push(`/${locale}/learn/${moduleId}?lang=${lang}`);
  }, [router, locale, lang]);

  return (
    <div className="min-h-[calc(100dvh-72px)] bg-background text-foreground px-4 py-12 md:px-10 lg:px-12 selection:bg-primary/20">
      <div className="max-w-6xl mx-auto">
        <CourseHeader lang={lang} onLangChange={handleLangChange} agentName={agentName} />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="animate-spin text-primary" size={32} />
            <p className="text-sm text-muted-foreground animate-pulse">Loading academy...</p>
          </div>
        ) : (
          <motion.div 
            variants={STAGGER_CONTAINER}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          >
            <AnimatePresence mode="popLayout">
              {modules.map((mod, idx) => (
                <CourseCard 
                  key={mod.id} 
                  module={mod} 
                  lang={lang} 
                  index={idx}
                  onStart={start} 
                />
              ))}

              {[...Array(Math.max(0, 3 - modules.length))].map((_, i) => (
                <PlaceholderCard 
                  key={`placeholder-${i}`} 
                  lang={lang} 
                  index={modules.length + i}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
        
        {/* Footer info */}
        <motion.div 
          variants={FADE_IN}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.6, ...TRANSITION.base }}
          className="mt-16 pt-8 border-t border-black/5 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-muted-foreground"
        >
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
            <Globe size={12} />
            <span>{t('infrastructure')} v2.1</span>
          </div>
          <p className="text-[11px] font-medium opacity-60">
            © {new Date().getFullYear()} BrainTrade Internal. {t('proprietary')}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
