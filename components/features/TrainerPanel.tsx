'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, Plus, ChevronDown, ChevronRight, X, Check,
  Calendar, Users, Clock, AlertTriangle, BookOpen, Pencil,
  Trash2, Save, ToggleLeft, ToggleRight, Loader2,
} from 'lucide-react';
import type { TrainingPeriod, TrainingDayRecord, DisciplineRecord, AgentStats, DisciplineType } from '@/types';

// ── Constants ────────────────────────────────────────────────────────────────

const T = {
  bg:     '#070D1A',
  card:   'rgba(10,20,36,0.92)',
  border: 'rgba(255,255,255,0.08)',
  text:   '#E8F4FF',
  sub:    '#4A6A8A',
  amber:  '#F59E0B',
  amberBg: 'rgba(245,158,11,0.10)',
  amberBorder: 'rgba(245,158,11,0.20)',
};

const DISCIPLINE_LABELS: Record<DisciplineType, string> = {
  late:              'มาสาย (Late)',
  sick_leave:        'ลาป่วย (Sick Leave)',
  personal_leave:    'ลากิจ (Personal Leave)',
  absent_no_reason:  'ขาดงาน (Absent)',
  other:             'อื่นๆ (Other)',
};

const ATTENDANCE_LABELS: Record<string, string> = {
  present: 'มาเรียน',
  late:    'มาสาย',
  absent:  'ขาด',
};

const ATTENDANCE_COLORS: Record<string, string> = {
  present: 'bg-emerald-500/15 text-emerald-400',
  late:    'bg-amber-500/15 text-amber-400',
  absent:  'bg-red-500/15 text-red-400',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return iso; }
}

function Spinner() {
  return <Loader2 size={16} className="animate-spin" style={{ color: T.amber }} />;
}

// ── New Period Modal ─────────────────────────────────────────────────────────

interface NewPeriodModalProps {
  agents: { id: string; name: string }[];
  onClose: () => void;
  onCreated: (p: TrainingPeriod) => void;
}

function NewPeriodModal({ agents, onClose, onCreated }: NewPeriodModalProps) {
  const [name,        setName]        = useState('');
  const [startDate,   setStartDate]   = useState(new Date().toISOString().slice(0, 10));
  const [totalDays,   setTotalDays]   = useState(5);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [saving,      setSaving]      = useState(false);
  const [err,         setErr]         = useState('');

  function toggleAgent(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setErr('กรุณากรอกชื่อ Batch'); return; }
    setSaving(true);
    setErr('');
    try {
      const agentNames: Record<string, string> = {};
      for (const id of selectedIds) {
        const a = agents.find(a => a.id === id);
        if (a) agentNames[id] = a.name;
      }
      const res = await fetch('/api/trainer/training-periods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          startDate,
          totalDays,
          agentIds: Array.from(selectedIds),
          agentNames,
        }),
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
            <span className="font-bold text-base" style={{ color: T.text }}>สร้าง Training Period ใหม่</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: T.sub }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: T.sub }}>ชื่อ Batch *</label>
            <input
              value={name} onChange={e => setName(e.target.value)}
              placeholder="เช่น March 2026 Batch"
              required
              className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${T.border}`, color: T.text }}
              onFocus={e => { e.currentTarget.style.borderColor = T.amber + '60'; }}
              onBlur={e => { e.currentTarget.style.borderColor = T.border; }}
            />
          </div>

          {/* Date + Days row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: T.sub }}>วันเริ่ม</label>
              <input
                type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${T.border}`, color: T.text }}
                onFocus={e => { e.currentTarget.style.borderColor = T.amber + '60'; }}
                onBlur={e => { e.currentTarget.style.borderColor = T.border; }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: T.sub }}>จำนวนวัน</label>
              <input
                type="number" min={1} max={60} value={totalDays}
                onChange={e => setTotalDays(Math.max(1, parseInt(e.target.value) || 5))}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${T.border}`, color: T.text }}
                onFocus={e => { e.currentTarget.style.borderColor = T.amber + '60'; }}
                onBlur={e => { e.currentTarget.style.borderColor = T.border; }}
              />
            </div>
          </div>

          {/* Agent selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: T.sub }}>
              เลือก Agent ({selectedIds.size} คน)
            </label>
            <div className="rounded-xl overflow-hidden max-h-48 overflow-y-auto" style={{ border: `1px solid ${T.border}` }}>
              {agents.length === 0 ? (
                <div className="px-4 py-3 text-sm" style={{ color: T.sub }}>ไม่มี agent ในระบบ</div>
              ) : agents.map(a => (
                <button
                  key={a.id} type="button"
                  onClick={() => toggleAgent(a.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5"
                  style={{ borderBottom: `1px solid ${T.border}` }}
                >
                  <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-colors"
                    style={{
                      background: selectedIds.has(a.id) ? T.amber : 'rgba(255,255,255,0.06)',
                      border: `1px solid ${selectedIds.has(a.id) ? T.amber : T.border}`,
                    }}>
                    {selectedIds.has(a.id) && <Check size={11} className="text-white" />}
                  </div>
                  <span className="text-sm" style={{ color: selectedIds.has(a.id) ? T.text : T.sub }}>{a.name}</span>
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
              {saving ? 'กำลังสร้าง...' : 'สร้าง Period'}
            </button>
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm transition-colors hover:bg-white/5"
              style={{ color: T.sub }}>
              ยกเลิก
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
  readOnly: boolean;
}

function DayRecordForm({ periodId, agentId, agentName, dayNumber, existing, onSaved, readOnly }: DayRecordFormProps) {
  const [attendance, setAttendance] = useState<'present' | 'late' | 'absent'>(existing?.attendance ?? 'present');
  const [topics,     setTopics]     = useState(existing?.topics ?? '');
  const [notes,      setNotes]      = useState(existing?.notes ?? '');
  const [date,       setDate]       = useState(existing?.date ?? new Date().toISOString().slice(0, 10));
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/trainer/training-periods/${periodId}/days`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, dayNumber, date, attendance, topics, notes }),
      });
      if (res.ok) {
        const d = await res.json();
        onSaved({ ...d, agentId, dayNumber, trainingPeriodId: periodId, attendance, topics, notes, date } as TrainingDayRecord);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch { /* silent */ }
    finally { setSaving(false); }
  }

  return (
    <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${T.border}` }}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold" style={{ color: T.text }}>{agentName}</span>
        <div className="flex gap-1.5">
          {(['present', 'late', 'absent'] as const).map(a => (
            <button
              key={a} type="button"
              disabled={readOnly}
              onClick={() => setAttendance(a)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                attendance === a ? ATTENDANCE_COLORS[a] : 'text-[#4A6A8A] hover:bg-white/5'
              }`}
              style={{ border: `1px solid ${attendance === a ? 'currentColor' : T.border}`, opacity: readOnly ? 0.7 : 1 }}
            >
              {ATTENDANCE_LABELS[a]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-medium uppercase tracking-wider mb-1" style={{ color: T.sub }}>วันที่</label>
          <input
            type="date" value={date} onChange={e => setDate(e.target.value)}
            disabled={readOnly}
            className="w-full px-3 py-2 rounded-lg text-xs outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${T.border}`, color: T.text, opacity: readOnly ? 0.7 : 1 }}
          />
        </div>
        <div>
          <label className="block text-[10px] font-medium uppercase tracking-wider mb-1" style={{ color: T.sub }}>หัวข้อวันนี้</label>
          <input
            value={topics} onChange={e => setTopics(e.target.value)}
            placeholder="หัวข้อที่สอน..."
            disabled={readOnly}
            className="w-full px-3 py-2 rounded-lg text-xs outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${T.border}`, color: T.text, opacity: readOnly ? 0.7 : 1 }}
          />
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-medium uppercase tracking-wider mb-1" style={{ color: T.sub }}>บันทึกเพิ่มเติม</label>
        <textarea
          value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="สังเกต ข้อดี ข้อควรปรับปรุง..."
          rows={2}
          disabled={readOnly}
          className="w-full px-3 py-2 rounded-lg text-xs outline-none resize-none"
          style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${T.border}`, color: T.text, opacity: readOnly ? 0.7 : 1 }}
        />
      </div>

      {!readOnly && (
        <div className="flex justify-end">
          <button
            onClick={handleSave} disabled={saving}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: saved ? 'rgba(52,211,153,0.15)' : T.amberBg,
              color: saved ? '#34D399' : T.amber,
              border: `1px solid ${saved ? 'rgba(52,211,153,0.25)' : T.amberBorder}`,
            }}
          >
            {saving ? <Spinner /> : saved ? <Check size={12} /> : <Save size={12} />}
            {saving ? 'บันทึก...' : saved ? 'บันทึกแล้ว!' : 'บันทึก'}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Days Sub-tab ─────────────────────────────────────────────────────────────

interface DaysTabProps {
  period: TrainingPeriod;
  records: TrainingDayRecord[];
  onRecordSaved: (r: TrainingDayRecord) => void;
  readOnly: boolean;
}

function DaysSubTab({ period, records, onRecordSaved, readOnly }: DaysTabProps) {
  const [expandedDay, setExpandedDay] = useState<number | null>(1);

  function getRecord(agentId: string, dayNumber: number): TrainingDayRecord | undefined {
    return records.find(r => r.agentId === agentId && r.dayNumber === dayNumber);
  }

  function dayCompletionCount(dayNumber: number): number {
    return period.agentIds.filter(id => !!getRecord(id, dayNumber)).length;
  }

  return (
    <div className="space-y-3">
      {period.agentIds.length === 0 && (
        <div className="text-center py-12" style={{ color: T.sub }}>
          <Users size={32} className="mx-auto opacity-30 mb-3" />
          <p className="text-sm">ยังไม่มี agent ในรอบนี้</p>
        </div>
      )}
      {Array.from({ length: period.totalDays }, (_, i) => i + 1).map(day => {
        const isExpanded = expandedDay === day;
        const done = dayCompletionCount(day);
        const total = period.agentIds.length;
        return (
          <div key={day} className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${T.border}` }}>
            <button
              onClick={() => setExpandedDay(isExpanded ? null : day)}
              className="w-full flex items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-white/3"
              style={{ background: isExpanded ? 'rgba(245,158,11,0.05)' : 'rgba(255,255,255,0.02)' }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0"
                style={{ background: T.amberBg, color: T.amber, border: `1px solid ${T.amberBorder}` }}>
                {day}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm" style={{ color: T.text }}>Day {day}</div>
                <div className="text-xs mt-0.5" style={{ color: T.sub }}>
                  {done}/{total} agents บันทึกแล้ว
                </div>
              </div>
              <div className="flex items-center gap-3">
                {total > 0 && (
                  <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div className="h-full rounded-full transition-all" style={{ background: T.amber, width: `${Math.round((done / total) * 100)}%` }} />
                  </div>
                )}
                {isExpanded ? <ChevronDown size={16} style={{ color: T.sub }} /> : <ChevronRight size={16} style={{ color: T.sub }} />}
              </div>
            </button>

            <AnimatePresence>
              {isExpanded && period.agentIds.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 pt-2 grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {period.agentIds.map(agentId => (
                      <DayRecordForm
                        key={agentId}
                        periodId={period.id}
                        agentId={agentId}
                        agentName={period.agentNames[agentId] ?? agentId}
                        dayNumber={day}
                        existing={getRecord(agentId, day)}
                        onSaved={onRecordSaved}
                        readOnly={readOnly}
                      />
                    ))}
                  </div>
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
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    agentId: period.agentIds[0] ?? '',
    date: new Date().toISOString().slice(0, 10),
    type: 'late' as DisciplineType,
    description: '',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.agentId) { setErr('กรุณาเลือก agent'); return; }
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
      setForm({ agentId: period.agentIds[0] ?? '', date: new Date().toISOString().slice(0, 10), type: 'late', description: '' });
    } catch { setErr('Network error'); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('ลบบันทึกวินัยนี้?')) return;
    const res = await fetch(`/api/trainer/discipline/${id}`, { method: 'DELETE' });
    if (res.ok) onDeleted(id);
  }

  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: `1px solid ${T.border}`,
    color: T.text,
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
            <Plus size={15} /> บันทึกวินัย
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
            <p className="text-sm font-bold" style={{ color: T.amber }}>บันทึกวินัยใหม่</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: T.sub }}>Agent</label>
                <select
                  value={form.agentId} onChange={e => setForm(v => ({ ...v, agentId: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={inputStyle}
                >
                  {period.agentIds.map(id => (
                    <option key={id} value={id}>{period.agentNames[id] ?? id}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: T.sub }}>ประเภท</label>
                <select
                  value={form.type} onChange={e => setForm(v => ({ ...v, type: e.target.value as DisciplineType }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={inputStyle}
                >
                  {(Object.keys(DISCIPLINE_LABELS) as DisciplineType[]).map(k => (
                    <option key={k} value={k}>{DISCIPLINE_LABELS[k]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: T.sub }}>วันที่</label>
                <input
                  type="date" value={form.date} onChange={e => setForm(v => ({ ...v, date: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: T.sub }}>รายละเอียด</label>
                <input
                  value={form.description} onChange={e => setForm(v => ({ ...v, description: e.target.value }))}
                  placeholder="รายละเอียดเพิ่มเติม..."
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
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
                {saving ? 'บันทึก...' : 'บันทึก'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2.5 rounded-xl text-sm hover:bg-white/5 transition-colors"
                style={{ color: T.sub }}>ยกเลิก</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Records table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${T.border}` }}>
        {records.length === 0 ? (
          <div className="text-center py-12" style={{ color: T.sub }}>
            <AlertTriangle size={28} className="mx-auto opacity-30 mb-3" />
            <p className="text-sm">ยังไม่มีบันทึกวินัยในรอบนี้</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: `1px solid ${T.border}` }}>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: T.sub }}>Agent</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: T.sub }}>ประเภท</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: T.sub }}>วันที่</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: T.sub }}>รายละเอียด</th>
                {!readOnly && <th className="px-4 py-3" />}
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => (
                <tr key={r.id} style={{ borderBottom: i < records.length - 1 ? `1px solid ${T.border}` : 'none' }}
                  className="hover:bg-white/2 transition-colors">
                  <td className="px-5 py-3.5 font-semibold" style={{ color: T.text }}>{r.agentName}</td>
                  <td className="px-4 py-3.5">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{ background: 'rgba(245,158,11,0.12)', color: T.amber, border: `1px solid ${T.amberBorder}` }}>
                      {DISCIPLINE_LABELS[r.type] ?? r.type}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs" style={{ color: T.sub }}>{fmtDate(r.date)}</td>
                  <td className="px-4 py-3.5 text-xs max-w-xs truncate" style={{ color: T.sub }}>{r.description || '—'}</td>
                  {!readOnly && (
                    <td className="px-4 py-3.5 text-right">
                      <button onClick={() => handleDelete(r.id)}
                        className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10 hover:text-red-400"
                        style={{ color: T.sub }}>
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

// ── Period Detail Panel ───────────────────────────────────────────────────────

interface PeriodDetailProps {
  period: TrainingPeriod;
  role: 'admin' | 'manager' | 'trainer';
  onPeriodUpdated: (p: TrainingPeriod) => void;
}

function PeriodDetail({ period, role, onPeriodUpdated }: PeriodDetailProps) {
  const [subTab,    setSubTab]    = useState<'days' | 'discipline'>('days');
  const [dayRecs,   setDayRecs]   = useState<TrainingDayRecord[]>([]);
  const [discRecs,  setDiscRecs]  = useState<DisciplineRecord[]>([]);
  const [loading,   setLoading]   = useState(true);

  const isTrainer = role === 'trainer';

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

  function handleDaySaved(r: TrainingDayRecord) {
    setDayRecs(prev => {
      const idx = prev.findIndex(x => x.agentId === r.agentId && x.dayNumber === r.dayNumber);
      if (idx >= 0) { const next = [...prev]; next[idx] = r; return next; }
      return [...prev, r];
    });
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Period header */}
      <div className="px-6 py-5 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}` }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h2 className="text-lg font-black" style={{ color: T.text }}>{period.name}</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                style={{
                  background: period.active ? 'rgba(52,211,153,0.12)' : 'rgba(107,114,128,0.12)',
                  color: period.active ? '#34D399' : '#6B7280',
                  border: `1px solid ${period.active ? 'rgba(52,211,153,0.2)' : 'rgba(107,114,128,0.2)'}`,
                }}>
                {period.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs" style={{ color: T.sub }}>
              <span className="flex items-center gap-1.5"><Calendar size={11} /> เริ่ม {fmtDate(period.startDate)}</span>
              <span className="flex items-center gap-1.5"><Users size={11} /> {period.agentIds.length} agents</span>
              <span className="flex items-center gap-1.5"><BookOpen size={11} /> {period.totalDays} วัน</span>
              <span className="flex items-center gap-1.5"><Clock size={11} /> {period.trainerName}</span>
            </div>
          </div>

          {isTrainer && (
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Days adjuster */}
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: T.sub }}>วัน:</span>
                <div className="flex items-center gap-1 rounded-xl overflow-hidden" style={{ border: `1px solid ${T.border}` }}>
                  <button onClick={() => adjustDays(-1)}
                    className="px-3 py-1.5 text-sm font-bold transition-colors hover:bg-white/8"
                    style={{ color: T.amber }}>−</button>
                  <span className="px-3 py-1.5 text-sm font-black" style={{ color: T.text, background: 'rgba(255,255,255,0.04)' }}>{period.totalDays}</span>
                  <button onClick={() => adjustDays(+1)}
                    className="px-3 py-1.5 text-sm font-bold transition-colors hover:bg-white/8"
                    style={{ color: T.amber }}>+</button>
                </div>
              </div>
              {/* Active toggle */}
              <button onClick={toggleActive}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors hover:bg-white/5"
                style={{ color: period.active ? '#34D399' : T.sub, border: `1px solid ${T.border}` }}>
                {period.active ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                {period.active ? 'Active' : 'Inactive'}
              </button>
            </div>
          )}
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-1 mt-5">
          {(['days', 'discipline'] as const).map(st => (
            <button key={st} onClick={() => setSubTab(st)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: subTab === st ? T.amberBg : 'transparent',
                color: subTab === st ? T.amber : T.sub,
                border: `1px solid ${subTab === st ? T.amberBorder : 'transparent'}`,
              }}>
              {st === 'days' ? <><BookOpen size={14} /> Training Days</> : <><AlertTriangle size={14} /> วินัย</>}
            </button>
          ))}
        </div>
      </div>

      {/* Sub-tab content */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {loading ? (
          <div className="flex items-center justify-center h-40 gap-3" style={{ color: T.sub }}>
            <Spinner /> <span className="text-sm">กำลังโหลด...</span>
          </div>
        ) : subTab === 'days' ? (
          <DaysSubTab
            period={period}
            records={dayRecs}
            onRecordSaved={handleDaySaved}
            readOnly={!isTrainer}
          />
        ) : (
          <DisciplineSubTab
            period={period}
            records={discRecs}
            onAdded={r => setDiscRecs(prev => [r, ...prev])}
            onDeleted={id => setDiscRecs(prev => prev.filter(r => r.id !== id))}
            readOnly={!isTrainer}
          />
        )}
      </div>
    </div>
  );
}

// ── Main TrainerPanel ─────────────────────────────────────────────────────────

interface TrainerPanelProps {
  role: 'admin' | 'manager' | 'trainer';
}

export default function TrainerPanel({ role }: TrainerPanelProps) {
  const [periods,          setPeriods]          = useState<TrainingPeriod[]>([]);
  const [agents,           setAgents]           = useState<{ id: string; name: string }[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);
  const [loadingPeriods,   setLoadingPeriods]   = useState(true);
  const [showNewPeriod,    setShowNewPeriod]     = useState(false);

  const isTrainer = role === 'trainer';

  const loadPeriods = useCallback(async () => {
    setLoadingPeriods(true);
    try {
      const res = await fetch('/api/trainer/training-periods');
      if (res.ok) {
        const d = await res.json();
        const list: TrainingPeriod[] = d.periods ?? [];
        setPeriods(list);
        if (list.length > 0 && !selectedPeriodId) {
          setSelectedPeriodId(list[0].id);
        }
      }
    } catch { /* silent */ }
    finally { setLoadingPeriods(false); }
  }, [selectedPeriodId]);

  useEffect(() => {
    loadPeriods();
    fetch('/api/admin/agents')
      .then(r => r.json())
      .then(d => setAgents((d.agents ?? []).map((a: AgentStats) => ({ id: a.agent.id, name: a.agent.name }))))
      .catch(() => {});
  }, [loadPeriods]);

  const selectedPeriod = periods.find(p => p.id === selectedPeriodId) ?? null;

  function handlePeriodCreated(p: TrainingPeriod) {
    setPeriods(prev => [p, ...prev]);
    setSelectedPeriodId(p.id);
    setShowNewPeriod(false);
  }

  function handlePeriodUpdated(p: TrainingPeriod) {
    setPeriods(prev => prev.map(x => x.id === p.id ? p : x));
  }

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 160px)' }}>
      {/* Panel header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: T.amberBg, border: `1px solid ${T.amberBorder}` }}>
            <GraduationCap size={20} style={{ color: T.amber }} />
          </div>
          <div>
            <h2 className="text-lg font-black" style={{ color: T.text }}>Training Management</h2>
            <p className="text-xs" style={{ color: T.sub }}>จัดการรอบการฝึก บันทึกรายวัน และวินัย</p>
          </div>
        </div>
        {isTrainer && (
          <button
            onClick={() => setShowNewPeriod(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: T.amber, color: '#fff', boxShadow: `0 4px 16px rgba(245,158,11,0.25)` }}
          >
            <Plus size={16} /> New Period
          </button>
        )}
      </div>

      <div className="flex gap-5 flex-1 min-h-0">
        {/* Left sidebar — period list */}
        <div className="w-64 flex-shrink-0 flex flex-col gap-2">
          <p className="text-[10px] font-bold uppercase tracking-widest px-1 mb-1" style={{ color: T.sub }}>
            Training Periods ({periods.length})
          </p>
          {loadingPeriods ? (
            <div className="flex items-center justify-center py-8 gap-2" style={{ color: T.sub }}>
              <Spinner /> <span className="text-xs">Loading...</span>
            </div>
          ) : periods.length === 0 ? (
            <div className="text-center py-8 px-4" style={{ color: T.sub }}>
              <GraduationCap size={28} className="mx-auto opacity-30 mb-2" />
              <p className="text-xs">ยังไม่มีรอบการฝึก</p>
              {isTrainer && <p className="text-xs mt-1 opacity-70">กด "New Period" เพื่อสร้างรอบแรก</p>}
            </div>
          ) : periods.map(p => (
            <motion.button
              key={p.id}
              onClick={() => setSelectedPeriodId(p.id)}
              whileHover={{ x: 2 }}
              className="w-full text-left px-4 py-3.5 rounded-xl transition-all"
              style={{
                background: selectedPeriodId === p.id ? T.amberBg : 'rgba(255,255,255,0.02)',
                border: `1px solid ${selectedPeriodId === p.id ? T.amberBorder : T.border}`,
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold truncate" style={{ color: selectedPeriodId === p.id ? T.amber : T.text }}>
                  {p.name}
                </span>
                {!p.active && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full ml-1 flex-shrink-0"
                    style={{ background: 'rgba(107,114,128,0.15)', color: '#6B7280' }}>off</span>
                )}
              </div>
              <div className="text-xs" style={{ color: T.sub }}>
                {p.agentIds.length} agents · {p.totalDays} วัน
              </div>
              <div className="text-xs mt-0.5" style={{ color: T.sub }}>{fmtDate(p.startDate)}</div>
            </motion.button>
          ))}
        </div>

        {/* Right content */}
        <div className="flex-1 min-w-0 rounded-2xl overflow-hidden flex flex-col"
          style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${T.border}` }}>
          {selectedPeriod ? (
            <PeriodDetail
              key={selectedPeriod.id}
              period={selectedPeriod}
              role={role}
              onPeriodUpdated={handlePeriodUpdated}
            />
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 py-20" style={{ color: T.sub }}>
              <GraduationCap size={40} className="opacity-20 mb-4" style={{ color: T.amber }} />
              <p className="text-base font-semibold mb-1" style={{ color: T.text }}>เลือก Training Period</p>
              <p className="text-sm">คลิกที่รอบการฝึกด้านซ้ายเพื่อดูรายละเอียด</p>
              {isTrainer && periods.length === 0 && (
                <button
                  onClick={() => setShowNewPeriod(true)}
                  className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: T.amber, color: '#fff' }}>
                  <Plus size={15} /> สร้างรอบแรก
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* New Period Modal */}
      <AnimatePresence>
        {showNewPeriod && (
          <NewPeriodModal
            agents={agents}
            onClose={() => setShowNewPeriod(false)}
            onCreated={handlePeriodCreated}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
