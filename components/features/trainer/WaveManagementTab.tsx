'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { GraduationCap, Plus, Users, BookOpen, Radio } from 'lucide-react';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '@/lib/firebase';
import type { TrainingPeriod, AgentStats } from '@/types';
import { T, Spinner, fmtDate } from './TrainerConstants';
import { TrainerService } from '@/lib/services/trainer-service';
import { NewPeriodModal } from './NewPeriodModal';
import { PeriodDetail } from './PeriodDetail';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface WaveManagementTabProps {
  role: 'admin' | 'manager' | 'it' | 'trainer' | 'hr';
  uid?: string;
  name?: string;
  readOnly?: boolean;
}

export function WaveManagementTab({ role, uid, name, readOnly }: WaveManagementTabProps) {
  const t = useTranslations('trainer');
  const locale = t('management') === 'จัดการการฝึกอบรม' ? 'th-TH' : 'en-GB';

  const [periods, setPeriods] = useState<TrainingPeriod[]>([]);
  const [agents, setAgents] = useState<{ id: string; name: string; graduated?: boolean; activePeriodId?: string }[]>([]);
  const [staff, setStaff] = useState<{ id: string; name: string; role: string }[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);
  const [loadingPeriods, setLoadingPeriods] = useState(true);
  const [showNewPeriod, setShowNewPeriod] = useState(false);
  const [liveSessions, setLiveSessions] = useState<Record<string, boolean>>({});

  // Listen for live sessions
  useEffect(() => {
    const liveRef = ref(rtdb, 'live_sessions');
    const unsubscribe = onValue(liveRef, (snapshot) => {
      const data = snapshot.val() || {};
      const activeMap: Record<string, boolean> = {};
      Object.keys(data).forEach((moduleId) => {
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
    } catch {
      /* silent */
    } finally {
      setLoadingPeriods(false);
    }
  }, []);

  useEffect(() => {
    loadPeriods();

    // Fetch agents for selection
    fetch('/api/admin/agents')
      .then((r) => r.json())
      .then((d) =>
        setAgents(
          (d.agents ?? []).map((a: AgentStats) => ({
            id: a.agent.id,
            name: a.agent.name,
            graduated: a.agent.graduated,
            activePeriodId: a.activePeriodId,
          }))
        )
      )
      .catch(() => {});

    // Fetch staff if authorized to assign trainers
    if (role === 'admin' || role === 'manager' || role === 'it') {
      fetch('/api/admin/staff')
        .then((r) => r.json())
        .then((d) => setStaff(d.staff ?? []))
        .catch(() => {});
    }
  }, [loadPeriods, role]);

  const selectedPeriod = periods.find((p) => p.id === selectedPeriodId) ?? null;

  function handlePeriodCreated(p: TrainingPeriod) {
    setPeriods((prev) => [p, ...prev]);
    setSelectedPeriodId(p.id);
    setShowNewPeriod(false);
  }

  function handlePeriodUpdated(p: TrainingPeriod) {
    setPeriods((prev) => prev.map((x) => (x.id === p.id ? p : x)));
  }

  function handlePeriodDeleted(id: string) {
    setPeriods((prev) => prev.filter((p) => p.id !== id));
    setSelectedPeriodId((prev) => (prev === id ? null : prev));
  }

  const activePeriods = periods.filter((p) => p.active);
  const completedPeriods = periods.filter((p) => !p.active);

  return (
    <div className="flex flex-col gap-6 flex-1 min-h-0">
      <div className="gap-6 flex flex-col lg:flex-row flex-1 min-h-0">
        {/* Left sidebar — period list */}
        <div className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-3">
          <div className="flex items-center justify-between px-1 mb-1">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">
              {t('trainingPeriods', { count: periods.length })}
            </h3>
            {canManage && (
              <button
                onClick={() => setShowNewPeriod(true)}
                aria-label={t('newPeriod')}
                aria-haspopup="dialog"
                aria-expanded={showNewPeriod}
                className="flex items-center gap-1.5 px-3 min-h-[44px] rounded-xl text-[11px] font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                style={{ background: T.amberBg, color: T.amber, border: `1px solid ${T.amberBorder}` }}
              >
                <Plus size={12} strokeWidth={3} aria-hidden="true" /> {t('newPeriod')}
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">
            {loadingPeriods ? (
              <div className="flex items-center justify-center py-12 gap-3 text-muted-foreground">
                <Spinner /> <span className="text-xs font-bold uppercase tracking-widest">{t('loading')}</span>
              </div>
            ) : periods.length === 0 ? (
              <div className="text-center py-12 px-6 rounded-3xl border border-dashed border-border/60 bg-muted/10">
                <GraduationCap size={32} className="mx-auto opacity-30 mb-3" style={{ color: T.amber }} aria-hidden="true" />
                <p className="text-xs font-bold text-muted-foreground leading-relaxed">{t('noPeriods')}</p>
                {canManage && <p className="text-[10px] mt-2 font-bold uppercase tracking-widest text-muted-foreground/70">{t('newPeriodHint')}</p>}
              </div>
            ) : (
              <>
                {activePeriods.length > 0 && (
                  <div className="space-y-2.5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-amber-500/80 px-1">Active Waves</p>
                    {activePeriods.map((p) => (
                      <PeriodListItem
                        key={p.id}
                        p={p}
                        isSelected={selectedPeriodId === p.id}
                        onClick={() => setSelectedPeriodId(p.id)}
                        locale={locale}
                        liveSessions={liveSessions}
                        t={t}
                      />
                    ))}
                  </div>
                )}

                {completedPeriods.length > 0 && (
                  <div className="space-y-2.5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/80 px-1">Completed Waves</p>
                    {completedPeriods.map((p) => (
                      <PeriodListItem
                        key={p.id}
                        p={p}
                        isSelected={selectedPeriodId === p.id}
                        onClick={() => setSelectedPeriodId(p.id)}
                        locale={locale}
                        liveSessions={liveSessions}
                        t={t}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
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
                <GraduationCap size={48} className="opacity-30" style={{ color: T.amber }} aria-hidden="true" />
              </div>
              <h3 className="text-xl font-black text-foreground mb-2 tracking-tight">{t('selectPeriod')}</h3>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed opacity-80">
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
            trainers={staff.filter((s) => s.role === 'trainer')}
            currentUser={{ uid, name, role }}
            onClose={() => setShowNewPeriod(false)}
            onCreated={handlePeriodCreated}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function PeriodListItem({
  p,
  isSelected,
  onClick,
  locale,
  liveSessions,
  t,
}: {
  p: TrainingPeriod;
  isSelected: boolean;
  onClick: () => void;
  locale: string;
  liveSessions: any;
  t: any;
}) {
  return (
    <motion.button
      onClick={onClick}
      aria-label={`Wave ${p.name}, ${p.active ? t('active') : p.completedAt ? 'Finished' : t('inactive')}, ${p.agentIds.length} trainees, ${p.totalDays} days`}
      aria-current={isSelected ? 'true' : undefined}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      className={`w-full text-left rounded-2xl overflow-hidden transition-all border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
        isSelected ? 'shadow-xl ring-2 ring-amber-500/20 z-10' : 'bg-card/50 hover:bg-card border-border/40 hover:border-border'
      } ${!p.active ? 'opacity-75' : ''}`}
      style={
        isSelected
          ? {
              background: 'linear-gradient(145deg, var(--card), rgba(245,158,11,0.05))',
              borderColor: T.amber,
            }
          : {}
      }
    >
      <div className="flex h-full">
        <div className="w-1.5 flex-shrink-0 transition-colors" style={{ background: p.active ? T.amber : 'var(--muted)' }} />
        <div className="flex-1 px-5 py-5">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex flex-col gap-1 min-w-0">
              <span className={`text-sm font-black leading-tight tracking-tight truncate ${isSelected ? 'text-amber-600 dark:text-amber-500' : 'text-foreground'}`}>
                {p.name}
              </span>
              {p.active && Object.values(liveSessions).some((v: any) => v) && (
                <div className="flex items-center gap-1.5 text-[9px] font-black text-red-500 uppercase tracking-[0.2em] animate-pulse">
                  <Radio size={10} aria-hidden="true" /> LIVE SESSION
                </div>
              )}
            </div>
            <StatusBadge
              status={p.active ? 'active' : 'inactive'}
              label={p.active ? t('active') : p.completedAt ? 'Finished' : t('inactive')}
              size="xs"
              pulse={p.active}
            />
          </div>

          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 mb-3">
            <span className="flex items-center gap-2">
              <Users size={12} className="opacity-80" aria-hidden="true" /> {p.agentIds.length}
            </span>
            <span className="flex items-center gap-2">
              <BookOpen size={12} className="opacity-80" aria-hidden="true" /> {p.totalDays}D
            </span>
          </div>

          <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/40">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">
              {p.completedAt ? `Done: ${fmtDate(p.completedAt, locale)}` : fmtDate(p.startDate, locale)}
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}
