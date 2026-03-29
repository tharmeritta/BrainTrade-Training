'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { 
  Radio, Clock, Square, Eye, Send, Check, 
  RotateCcw, Users, Pencil, BookOpen, AlertTriangle, HelpCircle, Copy, Zap,
  MessageSquare, BarChart3, Heart, Hand, Smile
} from 'lucide-react';
import dynamic from 'next/dynamic';
import type { TrainingPeriod } from '@/types';
import type { CourseModule, CourseLang } from '@/lib/courses';
import { Spinner, fmtElapsed } from './TrainerConstants';
import { TrainerService } from '@/lib/services/trainer-service';
import { rtdb } from '@/lib/firebase';
import { ref, set, push, serverTimestamp, onValue, remove } from 'firebase/database';

// Lazy load PresentationViewer
const PresentationViewer = dynamic(() => import('@/components/features/PresentationViewer'), {
  loading: () => (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground bg-muted/5 min-h-[300px]">
      <Spinner />
      <p className="text-xs font-medium opacity-50">Loading presentation...</p>
    </div>
  ),
  ssr: false
});

type LivePhase = 'setup' | 'active' | 'summary';

interface SessionSummaryData {
  module: { id: string; title: string; titleTh: string };
  durationSecs: number;
  agentCount: number;
}

interface Reaction {
  id: string;
  type: string;
  senderName: string;
  timestamp: number;
}

// ── Custom Hook for Live Session Logic ──────────────────────────────────────

function useLiveSession(moduleId: string | null) {
  const [phase, setPhase] = useState<LivePhase>('setup');
  const [elapsed, setElapsed] = useState(0);
  const [broadcastText, setBroadcastText] = useState('');
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [reactionCounts, setReactionCounts] = useState({ heart: 0, hand: 0, smile: 0 });
  const [participants, setParticipants] = useState<any[]>([]);
  const [startTime, setStartTime] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!moduleId || phase !== 'active') return;

    // Listen for reactions
    const reactionsRef = ref(rtdb, `presentation_sync/${moduleId}/reactions`);
    const unsubReactions = onValue(reactionsRef, (snap) => {
      if (snap.exists()) {
        const data = snap.val();
        const allReactions = Object.entries(data).map(([id, val]: [string, any]) => ({
          id,
          ...val
        })).sort((a, b) => b.timestamp - a.timestamp);
        
        setReactions(allReactions.slice(0, 10)); // Latest 10 for overlay
        
        const counts = { heart: 0, hand: 0, smile: 0 };
        Object.values(data).forEach((r: any) => {
          if (r.type === 'heart') counts.heart++;
          if (r.type === 'hand') counts.hand++;
          if (r.type === 'smile') counts.smile++;
        });
        setReactionCounts(counts);
      } else {
        setReactions([]);
        setReactionCounts({ heart: 0, hand: 0, smile: 0 });
      }
    });

    // Listen for participants
    const participantsRef = ref(rtdb, `presentation_sync/${moduleId}/participants`);
    const unsubParticipants = onValue(participantsRef, (snap) => {
      if (snap.exists()) {
        const list = Object.values(snap.val()).filter((p: any) => p.role === 'agent');
        setParticipants(list);
      } else {
        setParticipants([]);
      }
    });

    return () => {
      unsubReactions();
      unsubParticipants();
    };
  }, [moduleId, phase]);

  const startSession = async () => {
    setElapsed(0);
    setStartTime(new Date().toISOString());
    setBroadcastText('');
    setBroadcastSent(false);
    timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    setPhase('active');
    setReactionCounts({ heart: 0, hand: 0, smile: 0 });
    setParticipants([]);

    // Clear previous session data if any
    if (moduleId) {
      await remove(ref(rtdb, `presentation_sync/${moduleId}/broadcasts`));
      await remove(ref(rtdb, `presentation_sync/${moduleId}/reactions`));
    }
  };

  const endSession = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setPhase('summary');
  };

  const resetToSetup = () => {
    setPhase('setup');
    setElapsed(0);
    setStartTime(null);
    setReactions([]);
    setParticipants([]);
  };

  const sendBroadcast = async (text: string, trainerName: string) => {
    if (!moduleId || !text.trim()) return;
    
    const broadcastRef = ref(rtdb, `presentation_sync/${moduleId}/broadcasts`);
    await push(broadcastRef, {
      text,
      sender: trainerName,
      timestamp: serverTimestamp(),
    });

    setBroadcastSent(true);
    setBroadcastText('');
    setTimeout(() => setBroadcastSent(false), 3000);
  };

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  return {
    phase, elapsed, startTime, broadcastText, broadcastSent, reactions, reactionCounts, participants,
    setBroadcastText, setBroadcastSent,
    startSession, endSession, resetToSetup, sendBroadcast
  };
}

// ── Live Session Tab ─────────────────────────────────────────────────────────

interface LiveSessionTabProps {
  period: TrainingPeriod;
  locale: string;
  role: 'admin' | 'manager' | 'it' | 'trainer' | 'hr';
}

export function LiveSessionTab({ period, locale, role }: LiveSessionTabProps) {
  const t = useTranslations('trainer');
  const lang = locale.split('-')[0];
  const trainerLang = (lang === 'th' ? 'th' : 'en') as CourseLang;

  const [selectedModId,  setSelectedModId]  = useState<string>('');
  
  const {
    phase, elapsed, startTime, broadcastText, broadcastSent, reactions, reactionCounts, participants,
    setBroadcastText, setBroadcastSent,
    startSession, endSession, resetToSetup, sendBroadcast
  } = useLiveSession(selectedModId);

  const [sessionLang,    setSessionLang]    = useState<CourseLang>(trainerLang);
  const [availableMods,  setAvailableMods]  = useState<CourseModule[]>([]);
  const [course,         setCourse]         = useState<CourseModule | null>(null);
  const [loadingCourse,  setLoadingCourse]  = useState(false);
  const [loadingList,    setLoadingList]    = useState(true);
  const [copied,         setCopied]         = useState(false);
  const [sessionNotes,   setSessionNotes]   = useState('');
  const [confirmEnd,     setConfirmEnd]     = useState(false);
  const [summary,        setSummary]        = useState<SessionSummaryData | null>(null);
  const [isSaving,       setIsSaving]       = useState(false);

  const agentLearnUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/${lang}/learn`
    : `/${lang}/learn`;

  useEffect(() => {
    fetch('/api/courses')
      .then(r => r.json())
      .then(d => {
        const mods = (d.modules || []) as CourseModule[];
        setAvailableMods(mods);
        if (mods.length > 0 && !selectedModId) setSelectedModId(mods[0].id);
        setLoadingList(false);
      })
      .catch(() => setLoadingList(false));
  }, [selectedModId]);

  useEffect(() => {
    if (!selectedModId) return;
    let active = true;
    setLoadingCourse(true);
    setCourse(null);

    fetch(`/api/courses/${selectedModId}`)
      .then(res => res.ok ? res.json() : null)
      .then(c => {
        if (active) {
          setCourse(c);
          setLoadingCourse(false);
        }
      })
      .catch(() => {
        if (active) setLoadingCourse(false);
      });
    return () => { active = false; };
  }, [selectedModId]);

  const selectedMod = availableMods.find(m => m.id === selectedModId) || availableMods[0];
  const agentNames  = Object.values(period.agentNames ?? {});
  const modTitle    = selectedMod ? (locale === 'th-TH' ? selectedMod.titleTh : selectedMod.title) : '...';
  const isManager = role === 'manager' || role === 'it' || role === 'hr';

  function handleStart() {
    if (isManager) return;
    setSessionNotes('');
    startSession();
  }

  async function handleEnd() {
    setIsSaving(true);
    try {
      const endTime = new Date().toISOString();
      const sessionData = {
        trainingPeriodId: period.id,
        moduleId: selectedModId,
        moduleTitle: modTitle,
        startTime,
        endTime,
        durationSecs: elapsed,
        agentCount: participants.length,
        notes: sessionNotes,
        engagement: reactionCounts,
      };
      
      await TrainerService.saveSessionSummary(sessionData);
      setSummary({ module: selectedMod, durationSecs: elapsed, agentCount: participants.length });
      endSession();
    } catch (err) {
      console.error('Failed to save session summary:', err);
      // Still end session even if save fails, but maybe alert?
      setSummary({ module: selectedMod, durationSecs: elapsed, agentCount: participants.length });
      endSession();
    } finally {
      setIsSaving(false);
      setConfirmEnd(false);
    }
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(agentLearnUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleBroadcast() {
    sendBroadcast(broadcastText, period.trainerName || 'Trainer');
  }

  return (
    <AnimatePresence mode="wait">
      {phase === 'summary' && summary ? (
        <motion.div key="summary" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-5">
          <div className="rounded-2xl border p-8 flex flex-col items-center gap-4 text-center" style={{ borderColor: 'rgba(34,197,94,0.20)', background: 'rgba(34,197,94,0.05)' }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }}>
              <Check size={28} style={{ color: '#22c55e' }} />
            </div>
            <h3 className="text-xl font-black text-foreground">{t('sessionSummaryTitle')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full mt-1">
              {[
                { label: t('summaryDuration'), value: fmtElapsed(summary.durationSecs) },
                { label: t('summaryModule'),   value: locale === 'th-TH' ? summary.module.titleTh : summary.module.title },
                { label: t('summaryAgents'),   value: String(summary.agentCount) },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl border border-border bg-card p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
                  <p className="text-base font-black text-foreground leading-tight">{value}</p>
                </div>
              ))}
            </div>
          </div>
          <button onClick={resetToSetup} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-black bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all">
            <RotateCcw size={15} /> {t('startNewSession')}
          </button>
        </motion.div>
      ) : phase === 'active' ? (
        <motion.div key="active" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
          <div className="rounded-2xl p-3.5 flex items-center gap-3 border" style={{ background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.20)' }}>
            <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <span className="text-[11px] font-black tracking-widest text-red-400 uppercase">{t('sessionLive')}</span>
            <span className="text-xs font-bold text-foreground hidden sm:inline truncate flex-1">{modTitle}</span>
            <div className="ml-auto flex items-center gap-2 flex-shrink-0">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-background border border-border">
                <Clock size={11} className="text-muted-foreground" />
                <span className="text-xs font-mono font-bold text-foreground tabular-nums">{fmtElapsed(elapsed)}</span>
              </div>
              {confirmEnd ? (
                <div className="flex items-center gap-1.5">
                  <button onClick={handleEnd} disabled={isSaving} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-red-500 disabled:opacity-50">
                    {isSaving ? <Spinner /> : <Square size={11} />} {t('endSessionYes')}
                  </button>
                  <button onClick={() => setConfirmEnd(false)} className="px-3 py-1.5 rounded-lg text-xs font-bold border border-border text-muted-foreground">
                    {t('keepGoing')}
                  </button>
                </div>
              ) : (
                <button onClick={() => setConfirmEnd(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-red-500/30 text-red-400">
                  <Square size={11} /> {t('endSession')}
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
            <div className="xl:col-span-7 flex flex-col gap-3">
              <div className="rounded-2xl border border-border bg-black/40 overflow-hidden aspect-video relative group flex flex-col">
                {course ? (
                  <PresentationViewer 
                    key={`${selectedModId}-${sessionLang}`}
                    module={course}
                    locale={locale}
                    initialLang={sessionLang}
                    user={{ uid: period.trainerId || 'trainer', name: period.trainerName || 'Trainer', role }}
                    minimal
                    embedded
                  />
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground bg-muted/5">
                    {loadingCourse ? <Spinner /> : <BookOpen size={32} className="opacity-20" />}
                    <p className="text-xs font-medium opacity-50">{loadingCourse ? 'Loading presentation...' : 'No presentation available'}</p>
                  </div>
                )}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-30 flex items-center gap-2">
                  <div className="flex gap-0.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 p-1">
                    {(['th', 'en'] as const).map(l => (
                      <button key={l} onClick={() => setSessionLang(l)} className={`px-2 py-1 rounded-lg text-[9px] font-black ${sessionLang === l ? 'bg-white text-black' : 'text-white/40'}`}>
                        {l.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => window.open(`/${lang}/learn/${selectedModId}?sync=true&lang=${sessionLang}`, '_blank')} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] font-black uppercase">
                    <Eye size={12} /> {t('reopenPresenter')}
                  </button>
                </div>

                {/* Real-time Reaction Overlay for Trainer */}
                <div className="absolute bottom-20 left-4 z-40 flex flex-col gap-2 pointer-events-none">
                  <AnimatePresence>
                    {reactions.map((r, i) => (
                      <motion.div 
                        key={r.id}
                        initial={{ opacity: 0, x: -20, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.8 }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 shadow-lg"
                      >
                        <span className="text-lg">
                          {r.type === 'heart' && '❤️'}
                          {r.type === 'hand' && '✋'}
                          {r.type === 'smile' && '😊'}
                        </span>
                        <span className="text-[10px] font-black text-white/80 uppercase">{r.senderName}</span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-foreground flex items-center gap-1.5"><Radio size={13} className="text-primary" /> {t('broadcastMessage')}</p>
                  {broadcastSent && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] font-bold text-emerald-400 uppercase">{t('broadcastSent')}</motion.span>}
                </div>
                <div className="flex gap-2">
                  <input 
                    value={broadcastText} 
                    onChange={e => setBroadcastText(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && handleBroadcast()}
                    placeholder={t('broadcastPlaceholder')} 
                    className="flex-1 text-xs bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none" 
                  />
                  <button onClick={handleBroadcast} disabled={!broadcastText.trim()} className="flex items-center justify-center px-5 rounded-xl text-xs font-bold border transition-all" style={broadcastSent ? { color: '#22c55e', borderColor: 'rgba(34,197,94,0.4)', background: 'rgba(34,197,94,0.08)' } : { color: 'hsl(var(--primary))' }}>
                    {broadcastSent ? <Check size={14} /> : <Send size={14} />}
                  </button>
                </div>
              </div>
            </div>
            <div className="xl:col-span-5 space-y-4 flex flex-col">
              <div className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col flex-1">
                <div className="p-5 border-b border-border bg-muted/10 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-1">{t('sessionModule')}</p>
                    <h4 className="text-sm font-black text-foreground">{modTitle}</h4>
                  </div>
                  <BarChart3 size={18} className="text-muted-foreground/30" />
                </div>
                <div className="p-5 space-y-4 flex-1 flex flex-col">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1.5"><Users size={12} /> {participants.length > 0 ? t('liveParticipants') : t('agentsInBatch')}</span>
                      <span className="text-primary">{participants.length > 0 ? participants.length : agentNames.length}</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                      {participants.length > 0 ? participants.map((p, i) => (
                        <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-muted/40 border border-border">
                          <div className={`w-1.5 h-1.5 rounded-full ${p.isFocused === false ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                          <span className={`text-[11px] font-medium ${p.isFocused === false ? 'text-muted-foreground' : 'text-foreground'}`}>{p.name}</span>
                          {p.isFocused === false && <span className="text-[8px] font-black uppercase text-amber-500/60 tracking-tighter">Away</span>}
                        </div>
                      )) : agentNames.map((name, i) => (
                        <span key={i} className="px-2 py-1 rounded-lg bg-muted/40 border border-border text-[11px] font-medium text-foreground">{name}</span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Live Stats Placeholder */}
                  <div className="pt-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5"><Zap size={12} className="text-amber-400" /> Live Engagement</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2 rounded-xl bg-muted/20 border border-border text-center">
                        <Heart size={14} className="mx-auto mb-1 text-pink-400" />
                        <span className="text-xs font-black">{reactionCounts.heart}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-muted/20 border border-border text-center">
                        <Hand size={14} className="mx-auto mb-1 text-amber-400" />
                        <span className="text-xs font-black">{reactionCounts.hand}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-muted/20 border border-border text-center">
                        <Smile size={14} className="mx-auto mb-1 text-emerald-400" />
                        <span className="text-xs font-black">{reactionCounts.smile}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col mt-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5"><Pencil size={12} /> {t('sessionNotes')}</p>
                    <textarea value={sessionNotes} onChange={e => setSessionNotes(e.target.value)} placeholder={t('sessionNotesPlaceholder')} className="flex-1 w-full text-xs bg-background border border-border rounded-xl px-3.5 py-3 text-foreground resize-none focus:outline-none" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => window.open(`/${lang}/learn/${selectedModId}?sync=true&lang=${sessionLang}`, '_blank')} className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border border-border text-muted-foreground hover:bg-white/5 transition-all"><Eye size={13} /> {t('reopenPresenter')}</button>
                <button onClick={() => window.open(`/${lang}/learn/${selectedModId}?lang=${sessionLang}`, '_blank')} className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border border-border text-muted-foreground hover:bg-white/5 transition-all"><HelpCircle size={13} /> {t('previewAsAgent')}</button>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
          <div className="rounded-2xl p-5 bg-primary/5 border border-primary/10 flex items-center gap-4">
            <div className="flex-1">
              <h3 className="text-base font-black text-primary mb-0.5">{t('livePresentation')}</h3>
              <p className="text-sm text-muted-foreground">{t('syncDescription')}</p>
            </div>
            <Radio className="text-primary animate-pulse hidden md:block" size={36} />
          </div>
          <div className="space-y-2">
            <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground px-1">{t('pickModule')}</p>
            {loadingList ? <div className="flex justify-center p-12 bg-card rounded-2xl border border-border"><Spinner /></div> : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {availableMods.map(mod => (
                  <button key={mod.id} onClick={() => setSelectedModId(mod.id)} className={`rounded-2xl border p-4 text-left transition-all ${mod.id === selectedModId ? 'border-primary bg-primary/10' : 'border-border'}`}>
                    <span className={`text-[10px] font-black uppercase ${mod.id === selectedModId ? 'text-primary' : 'text-muted-foreground'}`}>{mod.id}</span>
                    <p className="text-sm font-bold text-foreground mt-0.5">{locale === 'th-TH' ? mod.titleTh : mod.title}</p>
                    {mod.id === selectedModId && <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-primary"><Check size={10} /> Selected</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground px-1">{t('agentJoinUrl')}</p>
            <div className="rounded-2xl border border-border bg-card p-3 flex items-center gap-3">
              <p className="flex-1 text-xs font-mono text-foreground truncate">{agentLearnUrl}</p>
              <button onClick={handleCopyLink} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${copied ? 'text-emerald-400 border-emerald-400/40' : 'border-border'}`}>
                {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? t('linkCopied') : t('copyAgentLink')}
              </button>
            </div>
          </div>
          <div className="space-y-2">
             <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground px-1">{t('presentationLanguage') || 'Presentation Language'}</p>
             <div className="flex gap-3">
              {(['th', 'en'] as const).map(l => (
                <button key={l} onClick={() => setSessionLang(l)} className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-sm font-black border transition-all ${sessionLang === l ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}>
                   <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${sessionLang === l ? 'border-primary' : 'border-border'}`}>{sessionLang === l && <div className="w-2 h-2 rounded-full bg-primary" />}</div>
                   {l === 'th' ? 'ภาษาไทย (TH)' : 'English (EN)'}
                </button>
              ))}
             </div>
          </div>
          {isManager ? (
            <div className="rounded-2xl p-4 bg-muted/20 border border-border text-center">
              <p className="text-sm font-semibold text-muted-foreground flex items-center justify-center gap-2"><AlertTriangle size={16} className="text-amber-500" /> {t('managerNoStartSession')}</p>
            </div>
          ) : (
            <button onClick={handleStart} className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-black bg-primary text-white shadow-xl hover:scale-[1.01] transition-all"><Zap size={16} /> {t('sessionStart')}</button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
