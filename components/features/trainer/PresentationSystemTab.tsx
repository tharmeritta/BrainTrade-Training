/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect } from 'react';
import NextImage from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Presentation,
  Play,
  Monitor,
  Radio,
  FileText,
  ExternalLink,
  BookOpen,
  Sparkles,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '@/lib/firebase';
import { COURSE_MODULES, type CourseModule, type CourseLang } from '@/lib/courses';
import { GlassCard } from '@/components/ui/GlassCard';
import { PresenterViewModal } from '../presentation/PresenterViewModal';
import { usePresentation } from '../presentation/usePresentation';

interface PresentationSystemTabProps {
  role: 'admin' | 'manager' | 'it' | 'trainer' | 'hr';
  uid?: string;
  name?: string;
  readOnly?: boolean;
}

export function PresentationSystemTab({ role, uid, name, readOnly }: PresentationSystemTabProps) {
  const [selectedModule, setSelectedModule] = useState<CourseModule>(COURSE_MODULES.product);
  const [lang, setLang] = useState<CourseLang>('th');
  const [liveSessions, setLiveSessions] = useState<Record<string, { active: boolean; trainerName: string; slide: number }>>({});
  const [isPresenterViewOpen, setIsPresenterViewOpen] = useState(false);

  // Hook for presentation launcher
  const presentationHook = usePresentation(
    selectedModule,
    { uid: uid || 'trainer', name: name || 'Trainer', role },
    lang,
    'en'
  );

  // Listen for live RTDB broadcast sessions
  useEffect(() => {
    const liveRef = ref(rtdb, 'live_sessions');
    const unsubscribe = onValue(liveRef, (snapshot) => {
      const data = snapshot.val() || {};
      setLiveSessions(data);
    });
    return () => unsubscribe();
  }, []);

  const modules = Object.values(COURSE_MODULES);

  return (
    <div className="flex flex-col gap-6 flex-1 min-h-0">
      {/* Top Banner & Quick Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" role="region" aria-label={lang === 'th' ? 'เลือกคอร์สอบรม' : 'Course modules selection'}>
        {modules.map((mod) => {
          const isSelected = selectedModule.id === mod.id;
          const liveInfo = liveSessions[mod.id];
          const isLive = !!liveInfo?.active;

          return (
            <GlassCard
              key={mod.id}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              aria-label={`${mod.titleTh} (${mod.title}), ${mod.presentations.th.totalSlides} slides ${isSelected ? ', selected' : ''}`}
              onClick={() => setSelectedModule(mod)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedModule(mod);
                }
              }}
              className={`cursor-pointer p-5 transition-all border relative overflow-hidden group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isSelected
                  ? 'border-primary ring-2 ring-primary/20 shadow-xl'
                  : 'border-border/40 hover:border-border hover:bg-card/80'
              }`}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br ${mod.gradient} opacity-10 blur-2xl pointer-events-none`} />

              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <BookOpen size={18} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black tracking-tight text-foreground">{mod.titleTh}</h3>
                    <p className="text-[10px] font-bold text-muted-foreground">{mod.title}</p>
                  </div>
                </div>

                {isLive && (
                  <span className="flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[9px] font-black uppercase text-rose-500 border border-rose-500/20 animate-pulse">
                    <Radio size={10} aria-hidden="true" /> Live
                  </span>
                )}
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed opacity-90">
                {mod.descriptionTh}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-border/40 text-[11px] font-bold">
                <span className="text-muted-foreground">
                  {mod.presentations.th.totalSlides} {lang === 'th' ? 'สไลด์' : 'Slides'}
                </span>
                <span className="flex items-center gap-1 text-primary group-hover:translate-x-1 transition-transform">
                  {lang === 'th' ? 'เลือกคอร์สนี้' : 'Select Deck'} <ChevronRight size={14} aria-hidden="true" />
                </span>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Main Deck Control & Presenter Desk */}
      <GlassCard className="flex-1 p-6 flex flex-col gap-6 shadow-2xl border-border/40">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
              <Presentation size={24} aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-foreground tracking-tight">
                  {selectedModule.titleTh} ({selectedModule.title})
                </h2>
                <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-mono font-bold text-muted-foreground">
                  ID: {selectedModule.id}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {selectedModule.descriptionTh}
              </p>
            </div>
          </div>

          {/* Language Toggle & Actions */}
          <div className="flex items-center gap-2">
            <div
              role="group"
              aria-label={lang === 'th' ? 'เลือกภาษาคอร์ส' : 'Select course language'}
              className="flex items-center rounded-xl bg-secondary/50 p-1 border border-border/50 text-xs font-bold"
            >
              <button
                onClick={() => setLang('th')}
                aria-label="Switch language to Thai"
                aria-pressed={lang === 'th'}
                className={`px-3 py-1.5 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  lang === 'th' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                TH (ไทย)
              </button>
              <button
                onClick={() => setLang('en')}
                aria-label="Switch language to English"
                aria-pressed={lang === 'en'}
                className={`px-3 py-1.5 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  lang === 'en' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                EN (English)
              </button>
            </div>

            {/* Launch macOS Presenter View */}
            <button
              onClick={() => setIsPresenterViewOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={isPresenterViewOpen}
              aria-label={lang === 'th' ? 'เปิดโหมดผู้สอน Presenter View' : 'Launch macOS Presenter View'}
              className="flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-700 px-4 py-2 text-xs font-bold text-slate-100 shadow-md hover:bg-slate-800 transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Monitor size={16} aria-hidden="true" />
              <span>{lang === 'th' ? 'โหมดผู้สอน (Presenter View)' : 'macOS Presenter View'}</span>
            </button>

            {/* Broadcast Live Toggle */}
            <button
              onClick={() =>
                presentationHook.isLive
                  ? presentationHook.stopLive()
                  : presentationHook.startLive(presentationHook.slide, lang)
              }
              aria-label={
                presentationHook.isLive
                  ? lang === 'th'
                    ? 'จบการถ่ายทอดสด'
                    : 'Stop Live Broadcast'
                  : lang === 'th'
                    ? 'เริ่มถ่ายทอดสด'
                    : 'Start Live Broadcast'
              }
              aria-pressed={presentationHook.isLive}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-md transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                presentationHook.isLive ? 'bg-rose-500 hover:bg-rose-600' : 'bg-primary hover:bg-primary/90'
              }`}
            >
              {presentationHook.isLive ? <Radio size={16} className="animate-pulse" aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
              <span>
                {presentationHook.isLive
                  ? lang === 'th'
                    ? 'จบการถ่ายทอดสด'
                    : 'Stop Live Broadcast'
                  : lang === 'th'
                    ? 'เริ่มถ่ายทอดสด (Go Live)'
                    : 'Start Live Broadcast'}
              </span>
            </button>
          </div>
        </div>

        {/* Slide Deck Grid & Speaker Notes Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
          {/* Main Slide Deck Preview Grid (Left 2 cols) */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Layers size={14} className="text-primary" aria-hidden="true" />
                {lang === 'th' ? 'พรีวิวสไลด์ในคอร์ส' : 'Slide Deck Preview'} (
                {selectedModule.presentations[lang].totalSlides} {lang === 'th' ? 'สไลด์' : 'Slides'})
              </span>

              <Link
                href={`/learn/${selectedModule.id}?lang=${lang}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={lang === 'th' ? 'เปิดสไลด์มุมมองผู้เรียนในหน้าต่างใหม่' : 'Open full slide deck in new tab'}
                className="text-xs font-bold text-primary flex items-center gap-1 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md px-1"
              >
                {lang === 'th' ? 'เปิดสไลด์มุมมองผู้เรียน' : 'Open Full Deck'} <ExternalLink size={12} aria-hidden="true" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[420px] overflow-y-auto pr-1">
              {Array.from(
                { length: selectedModule.presentations[lang].totalSlides },
                (_, i) => i + 1
              ).map((n) => {
                const pres = selectedModule.presentations[lang];
                const slideThumbUrl = pres.slideUrls && pres.slideUrls[n - 1]
                  ? pres.slideUrls[n - 1]
                  : `/api/slide?id=${pres.presentationId}&page=${n}${pres.cacheKey ? `&v=${encodeURIComponent(pres.cacheKey)}` : ''}`;

                return (
                  <button
                    key={n}
                    onClick={() => presentationHook.goToSlide(n)}
                    aria-label={lang === 'th' ? `ไปยังสไลด์ที่ ${n}` : `Jump to slide ${n}`}
                    aria-current={n === presentationHook.slide ? 'true' : undefined}
                    className={`group relative aspect-video rounded-xl bg-black overflow-hidden border cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      n === presentationHook.slide
                        ? 'border-primary ring-2 ring-primary/40 shadow-lg'
                        : 'border-border/60 hover:border-primary/50'
                    }`}
                  >
                    <img
                      src={slideThumbUrl}
                      alt={`Slide ${n}`}
                      className="absolute inset-0 h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                    <span className="absolute bottom-1 right-1.5 rounded bg-black/80 px-1.5 py-0.5 text-[9px] font-mono font-bold text-white z-10 backdrop-blur-sm">
                      #{n}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Speaker Notes Preview Panel (Right 1 col) */}
          <div className="flex flex-col gap-3 rounded-2xl border border-border/50 bg-secondary/20 p-4">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-primary" aria-hidden="true" />
              <h4 className="text-xs font-black uppercase tracking-wider text-foreground">
                {lang === 'th' ? 'บันทึกย่อผู้สอน (Speaker Notes)' : 'Speaker Notes'}
              </h4>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {lang === 'th'
                ? `โน้ตประจำสไลด์ที่ ${presentationHook.slide} จะปรากฏในโหมด Presenter View อัตโนมัติ:`
                : `Notes for slide #${presentationHook.slide} will automatically display in Presenter View:`}
            </p>

            <div className="flex-1 rounded-xl border border-border/60 bg-card p-3 text-xs text-foreground font-sans leading-relaxed min-h-[140px] overflow-y-auto">
              {selectedModule.presentations[lang].speakerNotes?.[presentationHook.slide] || (
                <span className="text-muted-foreground italic">
                  {lang === 'th' ? 'ไม่มีบันทึกย่อสำหรับสไลด์นี้' : 'No pre-configured speaker notes for this slide.'}
                </span>
              )}
            </div>

            <div className="pt-2 border-t border-border/40 text-[10px] text-muted-foreground">
              💡 {lang === 'th' ? 'สามารถแก้ไขโน้ตได้ที่แอดมิน > Adjustments > Learn Editor' : 'Edit notes in Admin > Adjustments > Learn Editor.'}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* macOS Presenter View Modal */}
      <PresenterViewModal
        isOpen={isPresenterViewOpen}
        onClose={() => setIsPresenterViewOpen(false)}
        module={selectedModule}
        slide={presentationHook.slide}
        total={presentationHook.total}
        lang={lang}
        slideImageUrl={presentationHook.slideImageUrl}
        nextSlideImageUrl={presentationHook.nextSlideImageUrl}
        goToSlide={presentationHook.goToSlide}
        activeTool={presentationHook.activeTool}
        setActiveTool={presentationHook.setActiveTool}
        clearDrawings={presentationHook.clearDrawings}
        isLive={presentationHook.isLive}
        startLive={presentationHook.startLive}
        stopLive={presentationHook.stopLive}
        session={presentationHook.session}
        addDrawingPath={presentationHook.addDrawingPath}
        updateLaser={presentationHook.updateLaser}
      />
    </div>
  );
}
