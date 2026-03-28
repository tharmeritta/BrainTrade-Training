'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { 
  Calendar, Users, BookOpen, Clock, TrendingUp, Plus, 
  ToggleLeft, ToggleRight, AlertTriangle, Radio, Loader2, Trash2 
} from 'lucide-react';
import type { TrainingPeriod, TrainingDayRecord, DisciplineRecord } from '@/types';
import { T, Spinner, fmtDate } from './TrainerConstants';
import { TrainerService } from '@/lib/services/trainer-service';
import { DaysTab } from './DaysTab';
import { DisciplineTab } from './DisciplineTab';
import { LiveSessionTab } from './LiveSessionTab';
import { useAgentPresence } from '@/lib/presence';

interface PeriodDetailProps {
  period: TrainingPeriod;
  agents: { id: string; name: string }[];
  role: 'admin' | 'manager' | 'it' | 'trainer' | 'hr';
  onPeriodUpdated: (p: TrainingPeriod) => void;
  onPeriodDeleted?: (id: string) => void;
}

export function PeriodDetail({ period, agents, role, onPeriodUpdated, onPeriodDeleted }: PeriodDetailProps) {
  const t = useTranslations('trainer');
  const locale = t('management') === 'จัดการการฝึกอบรม' ? 'th-TH' : 'en-GB';
  const [subTab,    setSubTab]    = useState<'days' | 'discipline' | 'live'>('days');
  const [dayRecs,   setDayRecs]   = useState<TrainingDayRecord[]>([]);
  const [discRecs,  setDiscRecs]  = useState<DisciplineRecord[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [addingAgent, setAddingAgent] = useState(false);
  const [selectedToAdd, setSelectedToAdd] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Live Presence Tracking
  const presence = useAgentPresence(period.agentIds);

  const canEdit = role === 'trainer' || role === 'admin' || role === 'it';
  const canManage = role === 'trainer' || role === 'admin' || role === 'manager' || role === 'it';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [dRes, discRes] = await Promise.all([
        TrainerService.getDayRecords(period.id),
        TrainerService.getDisciplineRecords(period.id),
      ]);
      setDayRecs(dRes.records ?? []);
      setDiscRecs(discRes.records ?? []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [period.id]);

  useEffect(() => { load(); }, [load]);

  async function adjustDays(delta: number) {
    const newDays = Math.max(1, period.totalDays + delta);
    try {
      await TrainerService.updatePeriod(period.id, { totalDays: newDays });
      onPeriodUpdated({ ...period, totalDays: newDays });
    } catch { /* silent */ }
  }

  async function toggleActive() {
    try {
      await TrainerService.updatePeriod(period.id, { active: !period.active });
      onPeriodUpdated({ ...period, active: !period.active });
    } catch { /* silent */ }
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

      await TrainerService.updatePeriod(period.id, { agentIds: newAgentIds, agentNames: newAgentNames });
      onPeriodUpdated({ ...period, agentIds: newAgentIds, agentNames: newAgentNames });
      setSelectedToAdd('');
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
    try {
      await TrainerService.updatePeriod(period.id, { agentIds: newAgentIds, agentNames: newAgentNames });
      onPeriodUpdated({ ...period, agentIds: newAgentIds, agentNames: newAgentNames });
    } catch { /* silent */ }
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
    try {
      await TrainerService.updatePeriod(period.id, { agentIds: newAgentIds, agentNames: newAgentNames });
      onPeriodUpdated({ ...period, agentIds: newAgentIds, agentNames: newAgentNames });
    } catch { /* silent */ }
  }

  async function handleDeletePeriod() {
    if (!confirm(t('deletePeriodConfirm'))) return;
    setDeleting(true);
    try {
      await TrainerService.deletePeriod(period.id);
      onPeriodDeleted?.(period.id);
    } catch { /* silent */ }
    finally { setDeleting(false); }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="px-6 pt-5 pb-0 flex-shrink-0">
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
            <button onClick={handleDeletePeriod} disabled={deleting} title="Delete period"
              className="ml-auto p-1.5 rounded-lg text-muted-foreground/40 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-40"
            >
              {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            </button>
          )}
        </div>

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

        {canManage && (
          <div className="flex items-center gap-2 flex-wrap p-2 rounded-xl mb-4"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <select value={selectedToAdd} onChange={e => setSelectedToAdd(e.target.value)}
                className="flex-1 min-w-0 px-3 py-1.5 rounded-lg text-xs outline-none text-foreground"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                <option value="">{t('selectAgentToAdd')}</option>
                {agents && agents.filter(a => !period.agentIds.includes(a.id)).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              <button onClick={handleAddAgent} disabled={!selectedToAdd || addingAgent}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-40 whitespace-nowrap"
                style={{ background: T.amberBg, color: T.amber, border: `1px solid ${T.amberBorder}` }}
              >
                {addingAgent ? <Spinner /> : <Plus size={13} />}
                {addingAgent ? t('addingAgent') : t('addAgent')}
              </button>
            </div>
            <div className="w-px h-6 self-center" style={{ background: 'rgba(255,255,255,0.10)' }} />
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[11px] text-muted-foreground whitespace-nowrap">{t('daysAdjust')}</span>
              <div className="flex items-center rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.12)' }}>
                <button onClick={() => adjustDays(-1)} className="w-7 h-7 flex items-center justify-center text-sm font-bold hover:bg-muted/30 transition-colors" style={{ color: T.amber }}>−</button>
                <span className="px-2.5 text-sm font-black text-foreground" style={{ background: 'rgba(255,255,255,0.05)' }}>{period.totalDays}</span>
                <button onClick={() => adjustDays(+1)} className="w-7 h-7 flex items-center justify-center text-sm font-bold hover:bg-muted/30 transition-colors" style={{ color: T.amber }}>+</button>
              </div>
            </div>
            <div className="w-px h-6 self-center" style={{ background: 'rgba(255,255,255,0.10)' }} />
            <button onClick={toggleActive} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex-shrink-0"
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

        <div className="flex gap-0.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {(['days', 'discipline', 'live'] as const).map(st => (
            <button key={st} onClick={() => setSubTab(st)}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold transition-all relative"
              style={{ color: subTab === st ? T.amber : '#6B7280' }}>
              {st === 'days' ? <><BookOpen size={14} /> {t('trainingDays')}</> : 
               st === 'discipline' ? <><AlertTriangle size={14} /> {t('discipline')}</> :
               <><Radio size={14} /> {t('liveLessons')}</>}
              {subTab === st && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full" style={{ background: T.amber }} />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-5 pb-6">
        {loading ? (
          <div className="flex items-center justify-center h-40 gap-3 text-muted-foreground">
            <Spinner /> <span className="text-sm">{t('loading')}</span>
          </div>
        ) : subTab === 'days' ? (
          <DaysTab
            period={period} records={dayRecs} onRecordSaved={handleDaySaved}
            onPeriodUpdated={onPeriodUpdated} onRemoveAgent={handleRemoveAgent}
            onDeactivateAgent={handleDeactivateAgent} readOnly={!canEdit} role={role}
            presence={presence}
          />
        ) : subTab === 'discipline' ? (
          <DisciplineTab
            period={period} records={discRecs} onAdded={r => setDiscRecs(prev => [r, ...prev])}
            onDeleted={id => setDiscRecs(prev => prev.filter(r => r.id !== id))} readOnly={!canEdit}
          />
        ) : (
          <LiveSessionTab period={period} locale={locale} role={role} />
        )}
      </div>
    </div>
  );
}
