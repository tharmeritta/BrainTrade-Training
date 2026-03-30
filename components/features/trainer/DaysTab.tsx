'use client';

import React, { useState, memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { 
  Calendar, Pencil, Save, Check, UserMinus, UserX, 
  ChevronDown, ChevronRight, BookOpen, Users, Clock, 
  TrendingUp, Loader2, ChevronFirst 
} from 'lucide-react';
import type { TrainingPeriod, TrainingDayRecord } from '@/types';
import { T, Spinner } from './TrainerConstants';
import { TrainerService } from '@/lib/services/trainer-service';
import { LiveIndicator } from '@/components/ui/LiveIndicator';
import { AgentPresenceStatus, PresenceMap } from '@/lib/presence';

// ── Day Record Form (per agent, per day) ─────────────────────────────────────

interface DayRecordFormProps {
  periodId: string;
  agentId: string;
  agentName: string;
  dayNumber: number;
  existing?: TrainingDayRecord;
  presence?: AgentPresenceStatus;
  onSaved: (r: TrainingDayRecord) => void;
  onRemoveAgent: (id: string, name: string) => void;
  onDeactivateAgent: (id: string, name: string) => void;
  readOnly: boolean;
  canDeactivate: boolean;
}

const DayRecordForm = memo(function DayRecordForm({ 
  periodId, agentId, agentName, dayNumber, existing, presence = 'offline',
  onSaved, onRemoveAgent, onDeactivateAgent, readOnly, canDeactivate 
}: DayRecordFormProps) {
  const t = useTranslations('trainer');
  const [attendance, setAttendance] = useState<'present' | 'late' | 'sick_leave' | 'personal_leave' | 'absent_no_reason'>(existing?.attendance ?? 'present');
  const [notes,      setNotes]      = useState(existing?.notes ?? '');
  const [date,       setDate]       = useState(existing?.date ?? new Date().toISOString().slice(0, 10));
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const ATTENDANCE_COLORS: Record<string, string> = {
    present:          'bg-emerald-500/15 text-emerald-400',
    late:             'bg-amber-500/15 text-amber-400',
    sick_leave:       'bg-blue-500/15 text-blue-400',
    personal_leave:   'bg-violet-500/15 text-violet-400',
    absent_no_reason: 'bg-red-500/15 text-red-400',
  };

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const d = await TrainerService.updateDayRecord(periodId, { agentId, dayNumber, date, attendance, notes });
      onSaved({ ...d, agentId, dayNumber, trainingPeriodId: periodId, attendance, notes, date } as TrainingDayRecord);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* silent */ }
    finally { setSaving(false); }
  }

  const isFilled = !!(existing || notes);

  return (
    <div
      className="rounded-2xl overflow-hidden border transition-all bg-card"
      style={{
        borderColor: isFilled ? T.amberBorder : undefined,
        borderLeftWidth: '4px',
        borderLeftColor: isFilled ? T.amber : 'rgba(156,163,175,0.4)',
        boxShadow: isFilled ? `0 4px 20px -5px ${T.amber}20` : 'none'
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3.5 gap-3 bg-muted/40 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[12px] font-black uppercase flex-shrink-0"
            style={{ background: T.amberBg, color: T.amber, border: `1px solid ${T.amberBorder}` }}>
            {agentName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground leading-tight truncate">{agentName}</span>
              <LiveIndicator status={presence} />
              {isFilled && (
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md flex-shrink-0"
                  style={{ background: 'rgba(52,211,153,0.12)', color: '#34D399', border: '1px solid rgba(52,211,153,0.2)' }}>
                  {t('saved')}
                </span>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">{t('day', { day: dayNumber })}</p>
          </div>
          
          {!readOnly && (
            <div className="relative ml-1">
              <button 
                onClick={() => setShowOptions(!showOptions)}
                className="p-1.5 rounded-lg hover:bg-muted/30 text-muted-foreground/40 hover:text-red-400 transition-colors"
              >
                <UserMinus size={14} />
              </button>
              
              <AnimatePresence>
                {showOptions && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowOptions(false)} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 5 }}
                      className="absolute left-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-xl z-20 p-1.5"
                    >
                      <button
                        onClick={() => { onRemoveAgent(agentId, agentName); setShowOptions(false); }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-foreground hover:bg-muted/30 flex items-center gap-2"
                      >
                        <UserMinus size={13} className="text-amber-500" />
                        {t('removeFromPeriod')}
                      </button>
                      {canDeactivate && (
                        <button
                          onClick={() => { onDeactivateAgent(agentId, agentName); setShowOptions(false); }}
                          className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                        >
                          <UserX size={13} />
                          {t('deactivateAgent')}
                        </button>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
        <div className="flex gap-1 flex-wrap justify-end">
          {(['present', 'late', 'sick_leave', 'personal_leave', 'absent_no_reason'] as const).map(a => (
            <button
              key={a} type="button"
              disabled={readOnly}
              onClick={() => setAttendance(a)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all uppercase tracking-tight ${
                attendance === a ? ATTENDANCE_COLORS[a] : 'text-muted-foreground/60 hover:bg-muted/30'
              }`}
              style={{ border: `1px solid ${attendance === a ? 'currentColor' : 'rgba(255,255,255,0.06)'}`, opacity: readOnly ? 0.7 : 1 }}
            >
              {t(`attendanceLabels.${a}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
              <Calendar size={12} className="text-blue-400" /> {t('startDate')}
            </label>
            <input
              type="date" value={date} onChange={e => setDate(e.target.value)}
              disabled={readOnly}
              className="w-full px-3.5 py-2 rounded-xl text-xs outline-none text-foreground focus:ring-1 focus:ring-blue-500/30 transition-all bg-background border border-border"
              style={{ opacity: readOnly ? 0.7 : 1 }}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
              <Pencil size={12} className="text-emerald-400" /> {t('notes')}
            </label>
            <textarea
              value={notes} onChange={e => setNotes(e.target.value)}
              placeholder={t('notesPlaceholder')}
              rows={1}
              disabled={readOnly}
              className="w-full px-3.5 py-2 rounded-xl text-xs outline-none resize-none text-foreground transition-all focus:ring-1 focus:ring-emerald-500/30 bg-background border border-border"
              style={{ opacity: readOnly ? 0.7 : 1 }}
            />
          </div>
        </div>

        {!readOnly && (
          <div className="flex justify-end pt-1">
            <button
              onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all"
              style={{
                background: saved ? 'rgba(52,211,153,0.15)' : T.amberBg,
                color: saved ? '#34D399' : T.amber,
                border: `1px solid ${saved ? 'rgba(52,211,153,0.25)' : T.amberBorder}`,
              }}
            >
              {saving ? <Spinner /> : saved ? <Check size={14} /> : <Save size={14} />}
              {saving ? t('saving') : saved ? t('saved') : t('save')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

// ── Days Tab ─────────────────────────────────────────────────────────────

interface DaysTabProps {
  period: TrainingPeriod;
  records: TrainingDayRecord[];
  onRecordSaved: (r: TrainingDayRecord) => void;
  onPeriodUpdated: (p: TrainingPeriod) => void;
  onRemoveAgent: (id: string, name: string) => void;
  onDeactivateAgent: (id: string, name: string) => void;
  readOnly: boolean;
  role: 'admin' | 'manager' | 'it' | 'trainer' | 'hr';
  presence?: PresenceMap;
}

export function DaysTab({ period, records, onRecordSaved, onPeriodUpdated, onRemoveAgent, onDeactivateAgent, readOnly, role, presence = {} }: DaysTabProps) {
  const t = useTranslations('trainer');
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [editingTopic, setEditingTopic] = useState<{ day: number, value: string } | null>(null);
  const [savingTopic, setSavingTopic] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);

  function getRecord(agentId: string, dayNumber: number): TrainingDayRecord | undefined {
    return records.find(r => r.agentId === agentId && r.dayNumber === dayNumber);
  }

  function dayCompletionCount(dayNumber: number): number {
    return period.agentIds.filter(id => !!getRecord(id, dayNumber)).length;
  }

  async function handleSaveTopic(day: number) {
    if (!editingTopic || editingTopic.day !== day) return;
    setSavingTopic(true);
    try {
      const newDayTopics = { ...(period.dayTopics || {}), [day]: editingTopic.value };
      await TrainerService.updatePeriod(period.id, { dayTopics: newDayTopics });
      onPeriodUpdated({ ...period, dayTopics: newDayTopics });
      setEditingTopic(null);
    } catch { /* silent */ }
    finally { setSavingTopic(false); }
  }

  const canDeactivate = role === 'admin' || role === 'it';

  return (
    <div className="space-y-3">
      {period.agentIds.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Users size={32} className="mx-auto opacity-30 mb-3" />
          <p className="text-sm">{t('noAgentsInPeriod')}</p>
        </div>
      )}
      {Array.from({ length: period.totalDays }, (_, i) => i + 1).map(day => {
        const isExpanded = expandedDay === day;
        const done = dayCompletionCount(day);
        const total = period.agentIds.length;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        const isComplete = total > 0 && done === total;
        const isPartial  = done > 0 && done < total;

        const accentColor  = isComplete ? '#34D399' : isPartial ? T.amber : 'rgba(255,255,255,0.15)';
        const borderColor  = isExpanded
          ? (isComplete ? 'rgba(52,211,153,0.3)' : T.amberBorder)
          : 'rgba(255,255,255,0.10)';
        const headerBg     = isExpanded
          ? (isComplete ? 'rgba(52,211,153,0.05)' : 'rgba(245,158,11,0.06)')
          : undefined;
        const badgeBg      = isComplete ? 'rgba(52,211,153,0.15)' : T.amberBg;
        const badgeColor   = isComplete ? '#34D399' : T.amber;
        const badgeBorder  = isComplete ? 'rgba(52,211,153,0.3)' : T.amberBorder;
        const barColor     = isComplete ? '#34D399' : T.amber;

        const dayTopic = period.dayTopics?.[day] || '';

        return (
          <div key={day}
            className="rounded-2xl overflow-hidden transition-all bg-card border"
            style={{
              borderTopColor: borderColor,
              borderRightColor: borderColor,
              borderBottomColor: borderColor,
              borderLeftColor: accentColor,
              borderLeftWidth: '3px',
            }}
          >
            <div
              className="w-full flex items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/40 cursor-pointer"
              style={{ background: headerBg ?? 'transparent' }}
              onClick={() => {
                setExpandedDay(isExpanded ? null : day);
                setVisibleCount(10); // Reset count when switching days
              }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0"
                style={{ background: badgeBg, color: badgeColor, border: `1px solid ${badgeBorder}` }}>
                {day}
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-foreground flex items-center gap-2">
                  {t('day', { day })}
                  {dayTopic && (
                    <span className="font-normal text-muted-foreground truncate italic">— {dayTopic}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">{t('recordsDone', { done, total })}</span>
                  {total > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{
                        background: isComplete ? 'rgba(52,211,153,0.12)' : isPartial ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.06)',
                        color: isComplete ? '#34D399' : isPartial ? T.amber : 'rgba(255,255,255,0.35)',
                      }}>
                      {isComplete ? t('dayComplete') : isPartial ? `${pct}%` : t('dayNotStarted')}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                {total > 0 && (
                  <div className="flex flex-col items-end gap-1 hidden sm:flex">
                    <div className="w-28 h-2 rounded-full overflow-hidden bg-muted">
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ background: barColor, width: `${pct}%` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{t('dayAgentsProgress', { done, total })}</span>
                  </div>
                )}
                {isExpanded
                  ? <ChevronDown size={16} className="text-muted-foreground" />
                  : <ChevronRight size={16} className="text-muted-foreground" />}
              </div>
            </div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="px-5 py-4 border-t border-border bg-muted/30">
                    <div className="flex flex-col gap-1.5">
                      <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-500/80">
                        <BookOpen size={12} /> {t('topics')}
                      </label>
                      <div className="flex gap-2">
                        <input
                          value={editingTopic?.day === day ? editingTopic.value : dayTopic}
                          onChange={e => setEditingTopic({ day, value: e.target.value })}
                          placeholder={t('topicsPlaceholder')}
                          disabled={readOnly}
                          className="flex-1 px-3.5 py-2 rounded-xl text-xs outline-none text-foreground transition-all focus:ring-1 focus:ring-amber-500/30 bg-background border border-border"
                          style={{ opacity: readOnly ? 0.7 : 1 }}
                        />
                        {!readOnly && editingTopic?.day === day && (
                          <button
                            onClick={() => handleSaveTopic(day)}
                            disabled={savingTopic}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50"
                          >
                            {savingTopic ? <Spinner /> : <Save size={14} />}
                            {savingTopic ? t('saving') : t('save')}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-5 py-2.5 border-t border-border bg-muted/20">
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      {period.agentIds.length === 0 ? t('noAgentsInPeriod') : done === 0
                        ? t('dayNoRecords')
                        : t('dayAgentsRecorded', { done, total })}
                    </span>
                    {isComplete && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(52,211,153,0.12)', color: '#34D399', border: '1px solid rgba(52,211,153,0.2)' }}>
                        {t('dayAllDone')}
                      </span>
                    )}
                  </div>

                  {period.agentIds.length > 0 && (
                    <div className="px-5 pb-5 pt-3 space-y-4 bg-muted/10">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {period.agentIds.slice(0, visibleCount).map(agentId => (
                          <DayRecordForm
                            key={agentId}
                            periodId={period.id}
                            agentId={agentId}
                            agentName={period.agentNames[agentId] ?? agentId}
                            dayNumber={day}
                            existing={getRecord(agentId, day)}
                            presence={presence[agentId]?.status || 'offline'}
                            onSaved={onRecordSaved}
                            onRemoveAgent={onRemoveAgent}
                            onDeactivateAgent={onDeactivateAgent}
                            readOnly={readOnly}
                            canDeactivate={canDeactivate}
                          />
                        ))}
                      </div>
                      
                      {visibleCount < total && (
                        <div className="flex flex-col items-center gap-3 pt-2">
                          <p className="text-[11px] text-muted-foreground">
                            Showing {visibleCount} of {total} agents
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setVisibleCount(prev => Math.min(prev + 10, total))}
                              className="px-6 py-2 rounded-xl bg-card border border-border text-xs font-bold text-foreground hover:bg-muted/50 transition-all flex items-center gap-2"
                            >
                              <ChevronDown size={14} /> Load 10 More
                            </button>
                            <button
                              onClick={() => setVisibleCount(total)}
                              className="px-6 py-2 rounded-xl bg-card border border-border text-xs font-bold text-foreground hover:bg-muted/50 transition-all"
                            >
                              Show All
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
