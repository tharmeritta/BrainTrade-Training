'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { GraduationCap, Plus, Users, BookOpen, Clock, Radio } from 'lucide-react';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '@/lib/firebase';
import type { TrainingPeriod, AgentStats } from '@/types';
import { T, Spinner, fmtDate } from './trainer/TrainerConstants';
import { TrainerService } from '@/lib/services/trainer-service';
import { NewPeriodModal } from './trainer/NewPeriodModal';
import { PeriodDetail } from './trainer/PeriodDetail';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface TrainerPanelProps {
  role: 'admin' | 'manager' | 'it' | 'trainer' | 'hr';
  uid?: string;
  name?: string;
  readOnly?: boolean;
}

export default function TrainerPanel({ role, uid, name, readOnly }: TrainerPanelProps) {
  const t = useTranslations('trainer');
  const locale = t('management') === 'จัดการการฝึกอบรม' ? 'th-TH' : 'en-GB';
  
  const [periods,          setPeriods]          = useState<TrainingPeriod[]>([]);
  const [agents,           setAgents]           = useState<{ id: string; name: string }[]>([]);
  const [staff,            setStaff]            = useState<{ id: string; name: string; role: string }[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);
  const [loadingPeriods,   setLoadingPeriods]   = useState(true);
  const [showNewPeriod,    setShowNewPeriod]     = useState(false);
  const [liveSessions,     setLiveSessions]     = useState<Record<string, boolean>>({});

  // Listen for live sessions
  useEffect(() => {
    const liveRef = ref(rtdb, 'live_sessions');
    const unsubscribe = onValue(liveRef, (snapshot) => {
      const data = snapshot.val() || {};
      const activeMap: Record<string, boolean> = {};
      Object.keys(data).forEach(moduleId => {
        if (data[moduleId]?.active) {
          activeMap[moduleId] = true;
        }
      });
      setLiveSessions(activeMap);
    });
    return () => unsubscribe();
  }, []);

  const canManage = (role === 'trainer' || role === 'admin' || role === 'manager' || role === 'it') && !readOnly;
  const hasAutoSelected = useRef(false);

  const loadPeriods = useCallback(async () => {
    setLoadingPeriods(true);
    try {
      const d = await TrainerService.getPeriods();
      const list = d.periods ?? [];
      setPeriods(list);
      if (list.length > 0 && !hasAutoSelected.current) {
        setSelectedPeriodId(list[0].id);
        hasAutoSelected.current = true;
      }
    } catch { /* silent */ }
    finally { setLoadingPeriods(false); }
  }, []);

  useEffect(() => {
    loadPeriods();
    
    // Fetch agents for selection
    fetch('/api/admin/agents')
      .then(r => r.json())
      .then(d => setAgents((d.agents ?? []).map((a: AgentStats) => ({ id: a.agent.id, name: a.agent.name }))))
      .catch(() => {});

    // Fetch staff if admin/manager/it to allow assigning trainers
    if (role === 'admin' || role === 'manager' || role === 'it') {
      fetch('/api/admin/staff')
        .then(r => r.json())
        .then(d => setStaff(d.staff ?? []))
        .catch(() => {});
    }
  }, [loadPeriods, role]);

  const selectedPeriod = periods.find(p => p.id === selectedPeriodId) ?? null;

  function handlePeriodCreated(p: TrainingPeriod) {
    setPeriods(prev => [p, ...prev]);
    setSelectedPeriodId(p.id);
    setShowNewPeriod(false);
  }

  function handlePeriodUpdated(p: TrainingPeriod) {
    setPeriods(prev => prev.map(x => x.id === p.id ? p : x));
  }

  function handlePeriodDeleted(id: string) {
    setPeriods(prev => prev.filter(p => p.id !== id));
    setSelectedPeriodId(prev => prev === id ? null : prev);
  }

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 160px)' }}>
      {/* Panel header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
          style={{ background: T.amberBg, border: `1px solid ${T.amberBorder}` }}>
          <GraduationCap size={24} style={{ color: T.amber }} />
        </div>
        <div>
          <h2 className="text-xl font-black text-foreground tracking-tight">{t('management')}</h2>
          <p className="text-sm text-muted-foreground font-medium opacity-70">{t('managementDesc')}</p>
        </div>
      </div>

      <div className="gap-6 flex flex-1 min-h-0">
        {/* Left sidebar — period list */}
        <div className="w-72 flex-shrink-0 flex flex-col gap-3">
          <div className="flex items-center justify-between px-1 mb-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50">
              {t('trainingPeriods', { count: periods.length })}
            </p>
            {canManage && (
              <button
                onClick={() => setShowNewPeriod(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-sm"
                style={{ background: T.amberBg, color: T.amber, border: `1px solid ${T.amberBorder}` }}
              >
                <Plus size={12} strokeWidth={3} /> {t('newPeriod')}
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
            {loadingPeriods ? (
              <div className="flex items-center justify-center py-12 gap-3 text-muted-foreground">
                <Spinner /> <span className="text-xs font-bold uppercase tracking-widest">{t('loading')}</span>
              </div>
            ) : periods.length === 0 ? (
              <div className="text-center py-12 px-6 rounded-3xl border border-dashed border-border/60 bg-muted/10">
                <GraduationCap size={32} className="mx-auto opacity-20 mb-3" style={{ color: T.amber }} />
                <p className="text-xs font-bold text-muted-foreground leading-relaxed">{t('noPeriods')}</p>
                {canManage && <p className="text-[10px] mt-2 opacity-50 uppercase tracking-widest">{t('newPeriodHint')}</p>}
              </div>
            ) : periods.map(p => (
              <motion.button
                key={p.id}
                onClick={() => setSelectedPeriodId(p.id)}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full text-left rounded-2xl overflow-hidden transition-all border ${
                  selectedPeriodId === p.id 
                    ? 'shadow-lg ring-1 ring-amber-500/20' 
                    : 'bg-card/50 hover:bg-card border-border/40'
                }`}
                style={selectedPeriodId === p.id ? { 
                  background: 'linear-gradient(145deg, rgba(245,158,11,0.12), rgba(245,158,11,0.05))', 
                  borderColor: T.amberBorder 
                } : {}}
              >
                <div className="flex h-full">
                  <div className="w-1.5 flex-shrink-0 transition-colors" 
                    style={{ background: p.active ? T.amber : 'var(--hub-dim-border)' }} />
                  <div className="flex-1 px-4 py-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex flex-col gap-1 min-w-0">
                        <span className={`text-[13px] font-black leading-tight tracking-tight truncate ${selectedPeriodId === p.id ? 'text-amber-500' : 'text-foreground'}`}>
                          {p.name}
                        </span>
                        {p.active && Object.values(liveSessions).some(v => v) && (
                          <div className="flex items-center gap-1.5 text-[9px] font-black text-red-500 uppercase tracking-widest animate-pulse">
                            <Radio size={10} /> LIVE NOW
                          </div>
                        )}
                      </div>
                      <StatusBadge 
                        status={p.active ? 'active' : 'inactive'} 
                        label={p.active ? t('active') : t('inactive')} 
                        size="xs"
                        pulse={p.active}
                      />
                    </div>
                    
                    <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground mb-3 opacity-60">
                      <span className="flex items-center gap-1.5"><Users size={12} className="opacity-70" /> {p.agentIds.length}</span>
                      <span className="flex items-center gap-1.5"><BookOpen size={12} className="opacity-70" /> {p.totalDays}d</span>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/40">
                      <span className="text-[10px] font-bold text-muted-foreground opacity-40">{fmtDate(p.startDate, locale)}</span>
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Right content area */}
        <GlassCard className="flex-1 min-w-0 flex flex-col shadow-2xl border-border/40">
          {selectedPeriod ? (
            <PeriodDetail
              key={selectedPeriod.id}
              period={selectedPeriod}
              agents={agents}
              role={role}
              readOnly={readOnly}
              onPeriodUpdated={handlePeriodUpdated}
              onPeriodDeleted={handlePeriodDeleted}
              currentUserName={name}
              currentUserId={uid}
            />
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 py-20 text-center px-10">
              <div className="w-20 h-20 rounded-3xl bg-amber-500/5 flex items-center justify-center mb-6 border border-amber-500/10">
                <GraduationCap size={48} className="opacity-20" style={{ color: T.amber }} />
              </div>
              <h3 className="text-xl font-black text-foreground mb-2 tracking-tight">{t('selectPeriod')}</h3>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed opacity-70">
                {periods.length === 0 ? t('newPeriodHint') : t('selectPeriodHint')}
              </p>
            </div>
          )}
        </GlassCard>
      </div>

      <AnimatePresence>
        {showNewPeriod && (
          <NewPeriodModal
            agents={agents}
            trainers={staff.filter(s => s.role === 'trainer')}
            currentUser={{ uid, name, role }}
            onClose={() => setShowNewPeriod(false)}
            onCreated={handlePeriodCreated}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
