'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  GraduationCap, Plus, ChevronDown, ChevronRight, X, Check,
  Calendar, Users, Clock, AlertTriangle, BookOpen, Pencil,
  Trash2, Save, ToggleLeft, ToggleRight, Loader2, TrendingUp,
  UserMinus, UserX, Radio, Zap, HelpCircle, Copy, Eye,
  Square, Send, RotateCcw
} from 'lucide-react';
import type { TrainingPeriod, TrainingDayRecord, DisciplineRecord, AgentStats, DisciplineType } from '@/types';

// ── Constants ────────────────────────────────────────────────────────────────

const T = {
  bg:     '#070D1A',
  card:   'rgba(10,20,36,0.92)',
  border: 'rgba(255,255,255,0.08)',
  text:   '#E8F4FF',
  sub:    '#8AAAC8',
  amber:  '#F59E0B',
  amberBg: 'rgba(245,158,11,0.10)',
  amberBorder: 'rgba(245,158,11,0.20)',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string, locale: string = 'en-GB') {
  try {
    return new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return iso; }
}

function Spinner() {
  return <Loader2 size={16} className="animate-spin" style={{ color: T.amber }} />;
}

function fmtElapsed(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ── New Period Modal ─────────────────────────────────────────────────────────

interface NewPeriodModalProps {
  agents: { id: string; name: string }[];
  trainers: { id: string; name: string }[];
  currentUser: { uid?: string; name?: string; role: string };
  onClose: () => void;
  onCreated: (p: TrainingPeriod) => void;
}

function NewPeriodModal({ agents, trainers, currentUser, onClose, onCreated }: NewPeriodModalProps) {
  const t = useTranslations('trainer');
  const [name,        setName]        = useState('');
  const [startDate,   setStartDate]   = useState(new Date().toISOString().slice(0, 10));
  const [totalDays,   setTotalDays]   = useState(5);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [trainerId,   setTrainerId]   = useState(currentUser.role === 'trainer' ? (currentUser.uid || '') : (trainers[0]?.id || ''));
  const [saving,      setSaving]      = useState(false);
  const [err,         setErr]         = useState('');

  const canPickTrainer = currentUser.role === 'admin' || currentUser.role === 'manager' || currentUser.role === 'it';

  function toggleAgent(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setErr(t('batchName')); return; }
    setSaving(true);
    setErr('');
    try {
      const agentNames: Record<string, string> = {};
      for (const id of selectedIds) {
        const a = agents.find(a => a.id === id);
        if (a) agentNames[id] = a.name;
      }
      
      const selectedTrainer = trainers.find(st => st.id === trainerId);
      const body: any = {
        name: name.trim(),
        startDate,
        totalDays,
        agentIds: Array.from(selectedIds),
        agentNames,
      };
      
      if (canPickTrainer && selectedTrainer) {
        body.trainerId = selectedTrainer.id;
        body.trainerName = selectedTrainer.name;
      }

      const res = await fetch('/api/trainer/training-periods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) { const d = await res.json(); setErr(d.error ?? 'Failed to create'); return; }
      const period = await res.json();
      onCreated(period);
    } catch { setErr('Network error'); }
    finally { setSaving(false); }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 12 }}
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background: T.card, border: `1px solid ${T.amberBorder}`, boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: `1px solid ${T.border}` }}>
          <div className="flex items-center gap-2">
            <GraduationCap size={18} style={{ color: T.amber }} />
            <span className="font-bold text-base text-foreground">{t('createPeriodTitle')}</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-colors hover:bg-muted/30 text-muted-foreground">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-muted-foreground">{t('batchName')}</label>
            <input
              value={name} onChange={e => setName(e.target.value)}
              placeholder={t('batchNamePlaceholder')}
              required
              className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-colors text-foreground"
              style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${T.border}` }}
              onFocus={e => { e.currentTarget.style.borderColor = T.amber + '60'; }}
              onBlur={e => { e.currentTarget.style.borderColor = T.border; }}
            />
          </div>

          {/* Trainer selection (if admin/manager) */}
          {canPickTrainer && trainers.length > 0 && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-muted-foreground">{t('trainerLabel')}</label>
              <select
                value={trainerId} onChange={e => setTrainerId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-colors text-foreground"
                style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${T.border}` }}
              >
                {trainers.map(tr => (
                  <option key={tr.id} value={tr.id}>{tr.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Date + Days row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-muted-foreground">{t('startDate')}</label>
              <input
                type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-colors text-foreground"
                style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${T.border}` }}
                onFocus={e => { e.currentTarget.style.borderColor = T.amber + '60'; }}
                onBlur={e => { e.currentTarget.style.borderColor = T.border; }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-muted-foreground">{t('totalDays')}</label>
              <input
                type="number" min={1} max={60} value={totalDays}
                onChange={e => setTotalDays(Math.max(1, parseInt(e.target.value) || 5))}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-colors text-foreground"
                style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${T.border}` }}
                onFocus={e => { e.currentTarget.style.borderColor = T.amber + '60'; }}
                onBlur={e => { e.currentTarget.style.borderColor = T.border; }}
              />
            </div>
          </div>

          {/* Agent selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-muted-foreground">
              {t('selectAgents', { count: selectedIds.size })}
            </label>
            <div className="rounded-xl overflow-hidden max-h-48 overflow-y-auto border border-border">
              {agents.length === 0 ? (
                <div className="px-4 py-3 text-sm text-muted-foreground">{t('noAgents')}</div>
              ) : agents.map(a => (
                <button
                  key={a.id} type="button"
                  onClick={() => toggleAgent(a.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/30"
                  style={{ borderBottom: `1px solid ${T.border}` }}
                >
                  <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-colors"
                    style={{
                      background: selectedIds.has(a.id) ? T.amber : 'rgba(255,255,255,0.06)',
                      border: `1px solid ${selectedIds.has(a.id) ? T.amber : T.border}`,
                    }}>
                    {selectedIds.has(a.id) && <Check size={11} className="text-white" />}
                  </div>
                  <span className={`text-sm ${selectedIds.has(a.id) ? 'text-foreground' : 'text-muted-foreground'}`}>{a.name}</span>
                </button>
              ))}
            </div>
          </div>

          {err && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{err}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="submit" disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-opacity"
              style={{ background: T.amber, color: '#fff', opacity: saving ? 0.7 : 1 }}
            >
              {saving ? <Spinner /> : <Plus size={15} />}
              {saving ? t('creating') : t('createBtn')}
            </button>
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm transition-colors hover:bg-muted/30 text-muted-foreground">
              {t('cancel')}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ── Day Record Form (per agent, per day) ─────────────────────────────────────

interface DayRecordFormProps {
  periodId: string;
  agentId: string;
  agentName: string;
  dayNumber: number;
  existing?: TrainingDayRecord;
  onSaved: (r: TrainingDayRecord) => void;
  onRemoveAgent: (id: string, name: string) => void;
  onDeactivateAgent: (id: string, name: string) => void;
  readOnly: boolean;
  canDeactivate: boolean;
}

function DayRecordForm({ periodId, agentId, agentName, dayNumber, existing, onSaved, onRemoveAgent, onDeactivateAgent, readOnly, canDeactivate }: DayRecordFormProps) {
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
      const res = await fetch(`/api/trainer/training-periods/${periodId}/days`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, dayNumber, date, attendance, notes }),
      });
      if (res.ok) {
        const d = await res.json();
        onSaved({ ...d, agentId, dayNumber, trainingPeriodId: periodId, attendance, notes, date } as TrainingDayRecord);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
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
      {/* Agent header */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3.5 gap-3 bg-muted/40 border-b border-border"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-[12px] font-black uppercase flex-shrink-0"
            style={{ background: T.amberBg, color: T.amber, border: `1px solid ${T.amberBorder}` }}
          >
            {agentName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground leading-tight">{agentName}</span>
              {isFilled && (
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md"
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
                title={t('terminatedResigned')}
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

      {/* Fields Container */}
      <div className="p-4 space-y-4">
        
        {/* Date and Notes Row */}
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
}

// ── Days Sub-tab ─────────────────────────────────────────────────────────────

interface DaysTabProps {
  period: TrainingPeriod;
  records: TrainingDayRecord[];
  onRecordSaved: (r: TrainingDayRecord) => void;
  onPeriodUpdated: (p: TrainingPeriod) => void;
  onRemoveAgent: (id: string, name: string) => void;
  onDeactivateAgent: (id: string, name: string) => void;
  readOnly: boolean;
  role: 'admin' | 'manager' | 'it' | 'trainer';
}

function DaysSubTab({ period, records, onRecordSaved, onPeriodUpdated, onRemoveAgent, onDeactivateAgent, readOnly, role }: DaysTabProps) {
  const t = useTranslations('trainer');
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [editingTopic, setEditingTopic] = useState<{ day: number, value: string } | null>(null);
  const [savingTopic, setSavingTopic] = useState(false);

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
      const res = await fetch(`/api/trainer/training-periods/${period.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayTopics: newDayTopics }),
      });
      if (res.ok) {
        onPeriodUpdated({ ...period, dayTopics: newDayTopics });
        setEditingTopic(null);
      }
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
            {/* ── Collapsed / Header row ── */}
            <div
              className="w-full flex items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/40 cursor-pointer"
              style={{ background: headerBg ?? 'transparent' }}
              onClick={() => setExpandedDay(isExpanded ? null : day)}
            >
              {/* Day badge */}
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0"
                style={{ background: badgeBg, color: badgeColor, border: `1px solid ${badgeBorder}` }}>
                {day}
              </div>

              {/* Title + sub-info */}
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

              {/* Progress bar + chevron */}
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

            {/* ── Expanded content ── */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  {/* Topic Section */}
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

                  {/* Summary strip */}
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

                  {/* Agent cards grid */}
                  {period.agentIds.length > 0 && (
                    <div className="px-5 pb-5 pt-3 grid grid-cols-1 lg:grid-cols-2 gap-4 bg-muted/10">
                      {period.agentIds.map(agentId => (
                        <DayRecordForm
                          key={agentId}
                          periodId={period.id}
                          agentId={agentId}
                          agentName={period.agentNames[agentId] ?? agentId}
                          dayNumber={day}
                          existing={getRecord(agentId, day)}
                          onSaved={onRecordSaved}
                          onRemoveAgent={onRemoveAgent}
                          onDeactivateAgent={onDeactivateAgent}
                          readOnly={readOnly}
                          canDeactivate={canDeactivate}
                        />
                      ))}
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

// ── Discipline Sub-tab ───────────────────────────────────────────────────────

interface DisciplineSubTabProps {
  period: TrainingPeriod;
  records: DisciplineRecord[];
  onAdded: (r: DisciplineRecord) => void;
  onDeleted: (id: string) => void;
  readOnly: boolean;
}

function DisciplineSubTab({ period, records, onAdded, onDeleted, readOnly }: DisciplineSubTabProps) {
  const t = useTranslations('trainer');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    agentId: period.agentIds[0] ?? '',
    date: new Date().toISOString().slice(0, 10),
    type: 'phone_usage' as DisciplineType,
    description: '',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.agentId) { setErr(t('agent')); return; }
    setSaving(true);
    setErr('');
    try {
      const res = await fetch('/api/trainer/discipline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: form.agentId,
          agentName: period.agentNames[form.agentId] ?? form.agentId,
          trainingPeriodId: period.id,
          date: form.date,
          type: form.type,
          description: form.description,
        }),
      });
      if (!res.ok) { const d = await res.json(); setErr(d.error ?? 'Failed'); return; }
      const rec = await res.json();
      onAdded(rec);
      setShowForm(false);
      setForm({ agentId: period.agentIds[0] ?? '', date: new Date().toISOString().slice(0, 10), type: 'phone_usage', description: '' });
    } catch { setErr('Network error'); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm(t('deleteConfirm'))) return;
    const res = await fetch(`/api/trainer/discipline/${id}`, { method: 'DELETE' });
    if (res.ok) onDeleted(id);
  }

  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: `1px solid ${T.border}`,
  };

  const DISC_COLORS: Record<string, { bg: string; color: string; border: string }> = {
    phone_usage:    { bg: 'rgba(245,158,11,0.12)',  color: '#F59E0B', border: 'rgba(245,158,11,0.25)' },
    dress_code:     { bg: 'rgba(96,165,250,0.12)',  color: '#60A5FA', border: 'rgba(96,165,250,0.25)' },
    misconduct:     { bg: 'rgba(248,113,113,0.12)', color: '#F87171', border: 'rgba(248,113,113,0.25)' },
    warning_issued: { bg: 'rgba(167,139,250,0.12)', color: '#A78BFA', border: 'rgba(167,139,250,0.25)' },
    other:          { bg: 'rgba(156,163,175,0.12)', color: '#9CA3AF', border: 'rgba(156,163,175,0.20)' },
  };

  return (
    <div className="space-y-4">
      {!readOnly && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: T.amberBg, color: T.amber, border: `1px solid ${T.amberBorder}` }}
          >
            <Plus size={15} /> {t('disciplineNew')}
          </button>
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-2xl p-5 space-y-4"
            style={{ background: 'rgba(245,158,11,0.04)', border: `1px solid ${T.amberBorder}` }}
          >
            <p className="text-sm font-bold" style={{ color: T.amber }}>{t('disciplineTitle')}</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1 text-muted-foreground">{t('agent')}</label>
                <select
                  value={form.agentId} onChange={e => setForm(v => ({ ...v, agentId: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none text-foreground"
                  style={inputStyle}
                >
                  {period.agentIds.map(id => (
                    <option key={id} value={id}>{period.agentNames[id] ?? id}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1 text-muted-foreground">{t('type')}</label>
                <select
                  value={form.type} onChange={e => setForm(v => ({ ...v, type: e.target.value as DisciplineType }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none text-foreground"
                  style={inputStyle}
                >
                  {(['phone_usage', 'dress_code', 'misconduct', 'warning_issued', 'other'] as const).map(k => (
                    <option key={k} value={k}>{t(`disciplineLabels.${k}`)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1 text-muted-foreground">{t('startDate')}</label>
                <input
                  type="date" value={form.date} onChange={e => setForm(v => ({ ...v, date: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none text-foreground"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1 text-muted-foreground">{t('description')}</label>
                <input
                  value={form.description} onChange={e => setForm(v => ({ ...v, description: e.target.value }))}
                  placeholder={t('descriptionPlaceholder')}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none text-foreground"
                  style={inputStyle}
                />
              </div>
            </div>
            {err && <p className="text-xs text-red-400">{err}</p>}
            <div className="flex gap-3">
              <button type="submit" disabled={saving}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: T.amber, color: '#fff', opacity: saving ? 0.7 : 1 }}>
                {saving ? <Spinner /> : <Save size={13} />}
                {saving ? t('saving') : t('save')}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2.5 rounded-xl text-sm hover:bg-muted/30 transition-colors text-muted-foreground">{t('cancel')}</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Records table */}
      <div className="rounded-2xl overflow-hidden border border-border">
        {records.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <AlertTriangle size={28} className="mx-auto opacity-30 mb-3" />
            <p className="text-sm">{t('noDiscipline')}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/20" style={{ borderBottom: `1px solid ${T.border}` }}>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('agent')}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('type')}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('startDate')}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('description')}</th>
                {!readOnly && <th className="px-4 py-3" />}
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => (
                <tr key={r.id} style={{ borderBottom: i < records.length - 1 ? `1px solid ${T.border}` : 'none' }}
                  className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black uppercase shrink-0"
                        style={{ background: T.amberBg, color: T.amber, border: `1px solid ${T.amberBorder}` }}>
                        {r.agentName.charAt(0)}
                      </div>
                      <span className="font-semibold text-foreground text-sm">{r.agentName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    {(() => {
                      const dc = DISC_COLORS[r.type] ?? DISC_COLORS.other;
                      return (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{ background: dc.bg, color: dc.color, border: `1px solid ${dc.border}` }}>
                          {t(`disciplineLabels.${r.type}`)}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground">{fmtDate(r.date)}</td>
                  <td className="px-4 py-3.5 text-xs max-w-xs truncate text-muted-foreground">{r.description || '—'}</td>
                  {!readOnly && (
                    <td className="px-4 py-3.5 text-right">
                      <button onClick={() => handleDelete(r.id)}
                        className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10 hover:text-red-400 text-muted-foreground">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── Live Sub-tab ─────────────────────────────────────────────────────────────

interface LiveSubTabProps {
  period: TrainingPeriod;
  locale: string;
  role: 'admin' | 'manager' | 'trainer';
}

type LivePhase = 'setup' | 'active' | 'summary';

interface SessionSummaryData {
  module: { id: string; title: string; titleTh: string };
  durationSecs: number;
  agentCount: number;
}

const LIVE_MODULES = [
  { id: 'product', title: 'What is Stock?',           titleTh: 'หุ้นคืออะไร?' },
  { id: 'kyc',     title: 'Know Your Customer (KYC)', titleTh: 'รู้จักลูกค้า (KYC)' },
  { id: 'website', title: 'BrainTrade Website',       titleTh: 'เว็บไซต์ BrainTrade' },
];

function LiveSubTab({ period, locale, role }: LiveSubTabProps) {
  const t   = useTranslations('trainer');
  const lang = locale.split('-')[0];

  const [phase,          setPhase]          = useState<LivePhase>('setup');
  // ... rest of state ...
  const [selectedModId,  setSelectedModId]  = useState(LIVE_MODULES[0].id);
  const [copied,         setCopied]         = useState(false);
  const [elapsed,        setElapsed]        = useState(0);
  const [broadcastText,  setBroadcastText]  = useState('');
  const [broadcastSent,  setBroadcastSent]  = useState(false);
  const [sessionNotes,   setSessionNotes]   = useState('');
  const [confirmEnd,     setConfirmEnd]     = useState(false);
  const [summary,        setSummary]        = useState<SessionSummaryData | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const agentLearnUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/${lang}/learn`
    : `/${lang}/learn`;

  const selectedMod = LIVE_MODULES.find(m => m.id === selectedModId) ?? LIVE_MODULES[0];
  const agentNames  = Object.values(period.agentNames ?? {});
  const modTitle    = locale === 'th-TH' ? selectedMod.titleTh : selectedMod.title;

  const isManager = role === 'manager' || role === 'it';

  // Cleanup timer on unmount
  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  function startSession() {
    if (isManager) return;
    setElapsed(0);
    setBroadcastText('');
    setBroadcastSent(false);
    setConfirmEnd(false);
    timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    setPhase('active');
    window.open(`/${lang}/learn/${selectedModId}?sync=true`, '_blank');
  }

  function endSession() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setSummary({ module: selectedMod, durationSecs: elapsed, agentCount: agentNames.length });
    setPhase('summary');
    setConfirmEnd(false);
    setSessionNotes('');
  }

  function resetToSetup() {
    setPhase('setup');
    setSummary(null);
    setElapsed(0);
  }

  function copyAgentLink() {
    navigator.clipboard.writeText(agentLearnUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function sendBroadcast() {
    if (!broadcastText.trim()) return;
    // TODO: write to Firestore syncSessions/{sessionId}/broadcastMessage for real-time delivery
    navigator.clipboard.writeText(broadcastText);
    setBroadcastSent(true);
    setTimeout(() => setBroadcastSent(false), 3000);
  }

  return (
    <AnimatePresence mode="wait">

      {/* ── Phase: Summary ──────────────────────────────────────────────────── */}
      {phase === 'summary' && summary ? (
        <motion.div
          key="summary"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="space-y-5"
        >
          {/* Summary card */}
          <div
            className="rounded-2xl border p-8 flex flex-col items-center gap-4 text-center"
            style={{ borderColor: 'rgba(34,197,94,0.20)', background: 'rgba(34,197,94,0.05)' }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }}
            >
              <Check size={28} style={{ color: '#22c55e' }} />
            </div>
            <h3 className="text-xl font-black text-foreground">{t('sessionSummaryTitle')}</h3>
            <div className="grid grid-cols-3 gap-3 w-full mt-1">
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
          <button
            onClick={resetToSetup}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-black bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            <RotateCcw size={15} />
            {t('startNewSession')}
          </button>
        </motion.div>
      ) : null}

      {/* ── Phase: Active Session (Mission Control) ──────────────────────────── */}
      {phase === 'active' ? (
        <motion.div
          key="active"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {/* Session Status Bar */}
          <div
            className="rounded-2xl p-3.5 flex items-center gap-3 border"
            style={{ background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.20)' }}
          >
            <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <span className="text-[11px] font-black tracking-widest text-red-400 uppercase">{t('sessionLive')}</span>
            <span className="text-muted-foreground hidden sm:inline text-xs">·</span>
            <span className="text-xs font-bold text-foreground hidden sm:inline truncate flex-1">{modTitle}</span>
            <div className="ml-auto flex items-center gap-2 flex-shrink-0">
              {/* Elapsed timer */}
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-background border border-border">
                <Clock size={11} className="text-muted-foreground" />
                <span className="text-xs font-mono font-bold text-foreground tabular-nums">{fmtElapsed(elapsed)}</span>
              </div>
              {/* End session — two-step confirm */}
              {confirmEnd ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-muted-foreground hidden md:inline">{t('endSessionPrompt')}</span>
                  <button
                    onClick={endSession}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-colors"
                    style={{ background: 'rgb(239,68,68)' }}
                  >
                    <Square size={11} />
                    {t('endSessionYes')}
                  </button>
                  <button
                    onClick={() => setConfirmEnd(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold border border-border text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                  >
                    {t('keepGoing')}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmEnd(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors"
                  style={{ borderColor: 'rgba(239,68,68,0.30)', color: 'rgb(248,113,113)' }}
                >
                  <Square size={11} />
                  {t('endSession')}
                </button>
              )}
            </div>
          </div>

          {/* Two-column control area */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

            {/* ── Left col (3/5): module + notes ── */}
            <div className="md:col-span-3 space-y-4">

              {/* Current module card */}
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-1">{t('sessionModule')}</p>
                <h4 className="text-base font-black text-foreground mb-0.5">{modTitle}</h4>
                <p className="text-[11px] font-mono text-muted-foreground mb-4">{selectedMod.id}</p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => window.open(`/${lang}/learn/${selectedModId}?sync=true`, '_blank')}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    <Zap size={13} />
                    {t('reopenPresenter')}
                  </button>
                  <button
                    onClick={() => window.open(`/${lang}/learn/${selectedModId}`, '_blank')}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all"
                  >
                    <Eye size={12} />
                    {t('previewAsAgent')}
                  </button>
                </div>
              </div>

              {/* Session notes */}
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
                  <BookOpen size={13} className="text-primary" />
                  {t('sessionNotes')}
                </p>
                <textarea
                  value={sessionNotes}
                  onChange={e => setSessionNotes(e.target.value)}
                  placeholder={t('sessionNotesPlaceholder')}
                  rows={4}
                  className="w-full text-xs bg-background border border-border rounded-xl px-3 py-2.5 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-primary/40 transition-colors"
                />
              </div>
            </div>

            {/* ── Right col (2/5): agents + broadcast ── */}
            <div className="md:col-span-2 space-y-4">

              {/* Agents in batch */}
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
                  <Users size={13} className="text-primary" />
                  {t('agentsInBatch')}
                  <span
                    className="ml-auto text-[10px] font-black rounded-full px-2 py-0.5"
                    style={{ color: 'hsl(var(--primary))', background: 'rgba(var(--primary-rgb,99,102,241),0.10)', border: '1px solid rgba(var(--primary-rgb,99,102,241),0.20)' }}
                  >
                    {agentNames.length}
                  </span>
                </p>
                <div className="space-y-0.5 max-h-44 overflow-y-auto">
                  {agentNames.length === 0 ? (
                    <p className="text-xs text-muted-foreground">{t('noAgentsInPeriod')}</p>
                  ) : agentNames.map((name, i) => (
                    <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 flex-shrink-0" />
                      <span className="text-xs text-foreground">{name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Broadcast */}
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
                  <Radio size={13} className="text-primary" />
                  {t('broadcastMessage')}
                </p>
                <textarea
                  value={broadcastText}
                  onChange={e => setBroadcastText(e.target.value)}
                  placeholder={t('broadcastPlaceholder')}
                  rows={3}
                  className="w-full text-xs bg-background border border-border rounded-xl px-3 py-2.5 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-primary/40 transition-colors mb-2"
                />
                <button
                  onClick={sendBroadcast}
                  disabled={!broadcastText.trim()}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-all"
                  style={
                    broadcastSent
                      ? { color: '#22c55e', borderColor: 'rgba(34,197,94,0.4)', background: 'rgba(34,197,94,0.08)' }
                      : broadcastText.trim()
                      ? { color: 'hsl(var(--primary))', borderColor: 'rgba(var(--primary-rgb,99,102,241),0.4)', background: 'rgba(var(--primary-rgb,99,102,241),0.08)' }
                      : { color: 'hsl(var(--muted-foreground))', borderColor: 'hsl(var(--border))', opacity: 0.45 }
                  }

                >
                  {broadcastSent ? <Check size={12} /> : <Send size={12} />}
                  {broadcastSent ? t('broadcastSent') : t('sendBroadcast')}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}

      {/* ── Phase: Setup ─────────────────────────────────────────────────────── */}
      {phase === 'setup' ? (
        <motion.div
          key="setup"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-5"
        >
          {/* Header */}
          <div className="rounded-2xl p-5 bg-primary/5 border border-primary/10 flex items-center gap-4">
            <div className="flex-1">
              <h3 className="text-base font-black text-primary mb-0.5">{t('livePresentation')}</h3>
              <p className="text-sm text-muted-foreground">{t('syncDescription')}</p>
            </div>
            <Radio className="text-primary animate-pulse hidden md:block flex-shrink-0" size={36} />
          </div>

          {/* Step 1 — Pick module */}
          <div className="space-y-2">
            <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground px-1">{t('pickModule')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {LIVE_MODULES.map(mod => {
                const isSelected = mod.id === selectedModId;
                return (
                  <button
                    key={mod.id}
                    onClick={() => setSelectedModId(mod.id)}
                    className="rounded-2xl border p-4 text-left transition-all"
                    style={
                      isSelected
                        ? { borderColor: 'hsl(var(--primary))', background: 'rgba(var(--primary-rgb,99,102,241),0.08)' }
                        : { borderColor: 'hsl(var(--border))', background: 'transparent' }
                    }
                  >
                    <span
                      className="text-[10px] font-black uppercase tracking-widest"
                      style={{ color: isSelected ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))' }}
                    >
                      {mod.id}
                    </span>
                    <p className="text-sm font-bold text-foreground mt-0.5 leading-tight">
                      {locale === 'th-TH' ? mod.titleTh : mod.title}
                    </p>
                    {isSelected && (
                      <span
                        className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold"
                        style={{ color: 'hsl(var(--primary))' }}
                      >
                        <Check size={10} /> Selected
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2 — Enrolled agents */}
          <div className="space-y-2">
            <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground px-1">
              {t('enrolledAgents', { count: agentNames.length })}
            </p>
            <div className="rounded-2xl border border-border bg-card px-4 py-3">
              {agentNames.length === 0 ? (
                <p className="text-xs text-muted-foreground">{t('noAgentsInPeriod')}</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {agentNames.map((name, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-full text-xs font-bold border border-border bg-background text-foreground"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Step 3 — Agent join link */}
          <div className="space-y-2">
            <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground px-1">{t('agentJoinUrl')}</p>
            <div className="rounded-2xl border border-border bg-card p-3 flex items-center gap-3">
              <p className="flex-1 text-xs font-mono text-foreground truncate min-w-0">{agentLearnUrl}</p>
              <button
                onClick={copyAgentLink}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-border bg-background hover:bg-primary/10 hover:border-primary/30 transition-all"
                style={copied ? { color: '#22c55e', borderColor: 'rgba(34,197,94,0.4)' } : undefined}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? t('linkCopied') : t('copyAgentLink')}
              </button>
            </div>
          </div>

          {/* Start button */}
          {isManager ? (
            <div className="rounded-2xl p-4 bg-muted/20 border border-border text-center">
              <p className="text-sm font-semibold text-muted-foreground flex items-center justify-center gap-2">
                <AlertTriangle size={16} className="text-amber-500" />
                {t('managerNoStartSession')}
              </p>
            </div>
          ) : (
            <button
              onClick={startSession}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-black bg-primary text-white shadow-xl shadow-primary/25 hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              <Zap size={16} />
              {t('sessionStart')}
            </button>
          )}
        </motion.div>
      ) : null}

    </AnimatePresence>
  );
}

// ── Period Detail Panel ───────────────────────────────────────────────────────

interface PeriodDetailProps {
  period: TrainingPeriod;
  agents: { id: string; name: string }[];
  role: 'admin' | 'manager' | 'trainer';
  onPeriodUpdated: (p: TrainingPeriod) => void;
  onPeriodDeleted?: (id: string) => void;
}

function PeriodDetail({ period, agents, role, onPeriodUpdated, onPeriodDeleted }: PeriodDetailProps) {
  const t = useTranslations('trainer');
  const locale = t('management') === 'จัดการการฝึกอบรม' ? 'th-TH' : 'en-GB';
  const [subTab,    setSubTab]    = useState<'days' | 'discipline' | 'live'>('days');
  const [dayRecs,   setDayRecs]   = useState<TrainingDayRecord[]>([]);
  const [discRecs,  setDiscRecs]  = useState<DisciplineRecord[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [addingAgent, setAddingAgent] = useState(false);
  const [selectedToAdd, setSelectedToAdd] = useState('');
  const [deleting, setDeleting] = useState(false);

  const canEdit = role === 'trainer' || role === 'admin' || role === 'it';
  const canManage = role === 'trainer' || role === 'admin' || role === 'manager' || role === 'it';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [dRes, discRes] = await Promise.all([
        fetch(`/api/trainer/training-periods/${period.id}/days`),
        fetch(`/api/trainer/discipline?periodId=${period.id}`),
      ]);
      if (dRes.ok)    { const d = await dRes.json();    setDayRecs(d.records ?? []); }
      if (discRes.ok) { const d = await discRes.json(); setDiscRecs(d.records ?? []); }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [period.id]);

  useEffect(() => { load(); }, [load]);

  async function adjustDays(delta: number) {
    const newDays = Math.max(1, period.totalDays + delta);
    const res = await fetch(`/api/trainer/training-periods/${period.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ totalDays: newDays }),
    });
    if (res.ok) onPeriodUpdated({ ...period, totalDays: newDays });
  }

  async function toggleActive() {
    const res = await fetch(`/api/trainer/training-periods/${period.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !period.active }),
    });
    if (res.ok) onPeriodUpdated({ ...period, active: !period.active });
  }

  async function handleAddAgent() {
    if (!selectedToAdd) return;
    if (period.agentIds.includes(selectedToAdd)) {
      alert(t('agentAlreadyInPeriod'));
      return;
    }

    const agent = agents.find(a => a.id === selectedToAdd);
    if (!agent) return;

    setAddingAgent(true);
    try {
      const newAgentIds = [...period.agentIds, selectedToAdd];
      const newAgentNames = { ...period.agentNames, [selectedToAdd]: agent.name };

      const res = await fetch(`/api/trainer/training-periods/${period.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentIds: newAgentIds, agentNames: newAgentNames }),
      });

      if (res.ok) {
        onPeriodUpdated({ ...period, agentIds: newAgentIds, agentNames: newAgentNames });
        setSelectedToAdd('');
      }
    } catch { /* silent */ }
    finally { setAddingAgent(false); }
  }

  function handleDaySaved(r: TrainingDayRecord) {
    setDayRecs(prev => {
      const idx = prev.findIndex(x => x.agentId === r.agentId && x.dayNumber === r.dayNumber);
      if (idx >= 0) { const next = [...prev]; next[idx] = r; return next; }
      return [...prev, r];
    });
  }

  async function handleRemoveAgent(agentId: string, agentName: string) {
    if (!confirm(t('removeFromPeriodConfirm', { name: agentName }))) return;
    const newAgentIds = period.agentIds.filter(id => id !== agentId);
    const newAgentNames = { ...period.agentNames };
    delete newAgentNames[agentId];
    const res = await fetch(`/api/trainer/training-periods/${period.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentIds: newAgentIds, agentNames: newAgentNames }),
    });
    if (res.ok) onPeriodUpdated({ ...period, agentIds: newAgentIds, agentNames: newAgentNames });
  }

  async function handleDeactivateAgent(agentId: string, agentName: string) {
    if (!confirm(t('deactivateAgentConfirm', { name: agentName }))) return;
    await fetch(`/api/admin/agents/${agentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: false }),
    });
    const newAgentIds = period.agentIds.filter(id => id !== agentId);
    const newAgentNames = { ...period.agentNames };
    delete newAgentNames[agentId];
    const res = await fetch(`/api/trainer/training-periods/${period.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentIds: newAgentIds, agentNames: newAgentNames }),
    });
    if (res.ok) onPeriodUpdated({ ...period, agentIds: newAgentIds, agentNames: newAgentNames });
  }

  async function handleDeletePeriod() {
    if (!confirm(t('deletePeriodConfirm'))) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/trainer/training-periods/${period.id}`, { method: 'DELETE' });
      if (res.ok) onPeriodDeleted?.(period.id);
    } catch { /* silent */ }
    finally { setDeleting(false); }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Period header */}
      <div className="px-6 pt-5 pb-0 flex-shrink-0">

        {/* ── Row 1: title + status ── */}
        <div className="flex items-center gap-2.5 mb-3">
          <h2 className="text-lg font-black text-foreground leading-tight">{period.name}</h2>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold"
            style={{
              background: period.active ? 'rgba(52,211,153,0.12)' : 'rgba(156,163,175,0.12)',
              color: period.active ? '#34D399' : '#9CA3AF',
              border: `1px solid ${period.active ? 'rgba(52,211,153,0.25)' : 'rgba(156,163,175,0.2)'}`,
            }}>
            {period.active ? t('active') : t('inactive')}
          </span>
          {role === 'admin' && onPeriodDeleted && (
            <button
              onClick={handleDeletePeriod}
              disabled={deleting}
              title="Delete period"
              className="ml-auto p-1.5 rounded-lg text-muted-foreground/40 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-40"
            >
              {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            </button>
          )}
        </div>

        {/* ── Row 2: meta chips ── */}
        <div className="flex items-center flex-wrap gap-2 mb-4">
          {(() => {
            const totalPossible = period.agentIds.length * period.totalDays;
            const completionPct = !loading && totalPossible > 0 ? Math.round((dayRecs.length / totalPossible) * 100) : null;
            return [
              { icon: Calendar,    label: fmtDate(period.startDate, locale) },
              { icon: Users,       label: `${period.agentIds.length} ${t('noAgents').includes('ไม่มี') ? 'เอเจนต์' : 'agents'}` },
              { icon: BookOpen,    label: `${period.totalDays} ${t('totalDays')}` },
              { icon: Clock,       label: period.trainerName },
              ...(completionPct !== null ? [{ icon: TrendingUp, label: `${completionPct}% filled` }] : []),
            ];
          })().map(({ icon: Icon, label }) => (
            <span key={label} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-muted-foreground"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}>
              <Icon size={11} className="opacity-60" /> {label}
            </span>
          ))}
        </div>

        {/* ── Row 3: controls toolbar ── */}
        {canManage && (
          <div className="flex items-center gap-2 flex-wrap p-2 rounded-xl mb-4"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>

            {/* Add agent */}
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <select
                value={selectedToAdd}
                onChange={e => setSelectedToAdd(e.target.value)}
                className="flex-1 min-w-0 px-3 py-1.5 rounded-lg text-xs outline-none text-foreground"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                <option value="">{t('selectAgentToAdd')}</option>
                {agents && agents
                  .filter(a => !period.agentIds.includes(a.id))
                  .map(a => <option key={a.id} value={a.id}>{a.name}</option>)
                }
              </select>
              <button
                onClick={handleAddAgent}
                disabled={!selectedToAdd || addingAgent}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-40 whitespace-nowrap"
                style={{ background: T.amberBg, color: T.amber, border: `1px solid ${T.amberBorder}` }}
              >
                {addingAgent ? <Spinner /> : <Plus size={13} />}
                {addingAgent ? t('addingAgent') : t('addAgent')}
              </button>
            </div>

            {/* Divider */}
            <div className="w-px h-6 self-center" style={{ background: 'rgba(255,255,255,0.10)' }} />

            {/* Days stepper */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[11px] text-muted-foreground whitespace-nowrap">{t('daysAdjust')}</span>
              <div className="flex items-center rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.12)' }}>
                <button onClick={() => adjustDays(-1)}
                  className="w-7 h-7 flex items-center justify-center text-sm font-bold hover:bg-muted/30 transition-colors"
                  style={{ color: T.amber }}>−</button>
                <span className="px-2.5 text-sm font-black text-foreground" style={{ background: 'rgba(255,255,255,0.05)' }}>{period.totalDays}</span>
                <button onClick={() => adjustDays(+1)}
                  className="w-7 h-7 flex items-center justify-center text-sm font-bold hover:bg-muted/30 transition-colors"
                  style={{ color: T.amber }}>+</button>
              </div>
            </div>

            {/* Divider */}
            <div className="w-px h-6 self-center" style={{ background: 'rgba(255,255,255,0.10)' }} />

            {/* Active toggle */}
            <button onClick={toggleActive}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex-shrink-0"
              style={{
                background: period.active ? 'rgba(52,211,153,0.10)' : 'rgba(255,255,255,0.04)',
                color: period.active ? '#34D399' : '#9CA3AF',
                border: `1px solid ${period.active ? 'rgba(52,211,153,0.25)' : 'rgba(255,255,255,0.10)'}`,
              }}>
              {period.active ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
              {period.active ? t('active') : t('inactive')}
            </button>
          </div>
        )}

        {/* ── Sub-tabs ── */}
        <div className="flex gap-0.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {(['days', 'discipline', 'live'] as const).map(st => (
            <button key={st} onClick={() => setSubTab(st)}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold transition-all relative"
              style={{ color: subTab === st ? T.amber : '#6B7280' }}>
              {st === 'days' ? <><BookOpen size={14} /> {t('trainingDays')}</> : 
               st === 'discipline' ? <><AlertTriangle size={14} /> {t('discipline')}</> :
               <><Radio size={14} /> {t('liveLessons')}</>}
              {subTab === st && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full"
                  style={{ background: T.amber }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Sub-tab content */}
      <div className="flex-1 overflow-y-auto px-6 pt-5 pb-6">
        {loading ? (
          <div className="flex items-center justify-center h-40 gap-3 text-muted-foreground">
            <Spinner /> <span className="text-sm">{t('loading')}</span>
          </div>
        ) : subTab === 'days' ? (
          <DaysSubTab
            period={period}
            records={dayRecs}
            onRecordSaved={handleDaySaved}
            onPeriodUpdated={onPeriodUpdated}
            onRemoveAgent={handleRemoveAgent}
            onDeactivateAgent={handleDeactivateAgent}
            readOnly={!canEdit}
            role={role}
          />
        ) : subTab === 'discipline' ? (
          <DisciplineSubTab
            period={period}
            records={discRecs}
            onAdded={r => setDiscRecs(prev => [r, ...prev])}
            onDeleted={id => setDiscRecs(prev => prev.filter(r => r.id !== id))}
            readOnly={!canEdit}
          />
        ) : (
          <LiveSubTab
            period={period}
            locale={locale}
            role={role}
          />
        )}
      </div>
    </div>
  );
}

// ── Main TrainerPanel ─────────────────────────────────────────────────────────

interface TrainerPanelProps {
  role: 'admin' | 'manager' | 'it' | 'trainer';
  uid?: string;
  name?: string;
}

export default function TrainerPanel({ role, uid, name }: { role: 'admin' | 'manager' | 'it' | 'trainer', uid?: string, name?: string }) {
  const t = useTranslations('trainer');
  const locale = t('management') === 'จัดการการฝึกอบรม' ? 'th-TH' : 'en-GB';
  const [periods,          setPeriods]          = useState<TrainingPeriod[]>([]);
  const [agents,           setAgents]           = useState<{ id: string; name: string }[]>([]);
  const [staff,            setStaff]            = useState<{ id: string; name: string; role: string }[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);
  const [loadingPeriods,   setLoadingPeriods]   = useState(true);
  const [showNewPeriod,    setShowNewPeriod]     = useState(false);

  const canManage = role === 'trainer' || role === 'admin' || role === 'manager' || role === 'it';
  const hasAutoSelected = useRef(false);

  const loadPeriods = useCallback(async () => {
    setLoadingPeriods(true);
    try {
      const res = await fetch('/api/trainer/training-periods');
      if (res.ok) {
        const d = await res.json();
        const list: TrainingPeriod[] = d.periods ?? [];
        setPeriods(list);
        if (list.length > 0 && !hasAutoSelected.current) {
          setSelectedPeriodId(list[0].id);
          hasAutoSelected.current = true;
        }
      }
    } catch { /* silent */ }
    finally { setLoadingPeriods(false); }
  }, []);

  useEffect(() => {
    loadPeriods();
    
    // Fetch agents
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
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: T.amberBg, border: `1px solid ${T.amberBorder}` }}>
          <GraduationCap size={20} style={{ color: T.amber }} />
        </div>
        <div>
          <h2 className="text-lg font-black text-foreground">{t('management')}</h2>
          <p className="text-xs text-muted-foreground">{t('managementDesc')}</p>
        </div>
      </div>

      <div className="gap-5 flex flex-1 min-h-0">
        {/* Left sidebar — period list */}
        <div className="w-64 flex-shrink-0 flex flex-col gap-2">

          {/* Sidebar header with single create button */}
          <div className="flex items-center justify-between px-1 mb-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {t('trainingPeriods', { count: periods.length })}
            </p>
            {canManage && (
              <button
                onClick={() => setShowNewPeriod(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all hover:opacity-80"
                style={{ background: T.amberBg, color: T.amber, border: `1px solid ${T.amberBorder}` }}
              >
                <Plus size={11} /> {t('newPeriod')}
              </button>
            )}
          </div>

          {loadingPeriods ? (
            <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
              <Spinner /> <span className="text-xs">{t('loading')}</span>
            </div>
          ) : periods.length === 0 ? (
            <div className="text-center py-8 px-4 text-muted-foreground">
              <GraduationCap size={28} className="mx-auto opacity-30 mb-2" />
              <p className="text-xs">{t('noPeriods')}</p>
              {canManage && <p className="text-xs mt-1 opacity-70">{t('newPeriodHint')}</p>}
            </div>
          ) : periods.map(p => (
            <motion.button
              key={p.id}
              onClick={() => setSelectedPeriodId(p.id)}
              whileHover={{ x: 2 }}
              className={`w-full text-left rounded-xl overflow-hidden transition-all border ${selectedPeriodId === p.id ? '' : 'bg-card border-border'}`}
              style={selectedPeriodId === p.id ? { background: T.amberBg, border: `1px solid ${T.amberBorder}` } : {}}
            >
              <div className="flex">
                {/* Active status strip */}
                <div className="w-1 flex-shrink-0"
                  style={{ background: p.active ? T.amber : '#374151' }} />
                <div className="flex-1 px-4 py-3.5">
                  <div className="flex items-start justify-between gap-1.5 mb-1.5">
                    <span className={`text-sm font-semibold leading-tight ${selectedPeriodId === p.id ? 'text-amber-500' : 'text-foreground'}`}>
                      {p.name}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5"
                      style={{
                        background: p.active ? 'rgba(52,211,153,0.12)' : 'rgba(156,163,175,0.15)',
                        color: p.active ? '#34D399' : '#9CA3AF',
                      }}>
                      {p.active ? t('active') : t('inactive')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Users size={11} /> {p.agentIds.length}</span>
                    <span className="flex items-center gap-1"><BookOpen size={11} /> {p.totalDays}d</span>
                  </div>
                  <div className="flex items-center justify-between mt-1 gap-2">
                    <span className="text-xs text-muted-foreground">{fmtDate(p.startDate, locale)}</span>
                    {p.trainerName && (
                      <span className="text-[10px] text-muted-foreground/60 flex items-center gap-0.5 truncate max-w-[80px] shrink-0">
                        <Clock size={9} className="shrink-0" /> {p.trainerName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Right content */}
        <div className="flex-1 min-w-0 rounded-2xl overflow-hidden flex flex-col bg-card border border-border">
          {selectedPeriod ? (
            <PeriodDetail
              key={selectedPeriod.id}
              period={selectedPeriod}
              agents={agents}
              role={role}
              onPeriodUpdated={handlePeriodUpdated}
              onPeriodDeleted={handlePeriodDeleted}
            />
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 py-20 text-muted-foreground">
              <GraduationCap size={40} className="opacity-20 mb-4" style={{ color: T.amber }} />
              <p className="text-base font-semibold mb-1 text-foreground">{t('selectPeriod')}</p>
              <p className="text-sm text-center max-w-xs">
                {periods.length === 0 ? t('newPeriodHint') : t('selectPeriodHint')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* New Period Modal */}
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
