'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { 
  Calendar, Users, BookOpen, Clock, TrendingUp, Plus, 
  ToggleLeft, ToggleRight, AlertTriangle, Radio, Loader2, Trash2, CheckCircle, Lock
} from 'lucide-react';
import type { TrainingPeriod, TrainingDayRecord, DisciplineRecord } from '@/types';
import { T, Spinner, fmtDate } from './TrainerConstants';
import { TrainerService } from '@/lib/services/trainer-service';
import { DaysTab } from './DaysTab';
import { DisciplineTab } from './DisciplineTab';
import { useAgentPresence } from '@/lib/presence';
import { useSummon } from '@/components/providers/SessionProvider';
import { useLivePresentation } from '@/lib/live-presentation';

interface PeriodDetailProps {
  period: TrainingPeriod;
  agents: { id: string; name: string; graduated?: boolean; activePeriodId?: string }[];
  role: 'admin' | 'manager' | 'it' | 'trainer' | 'hr';
  readOnly?: boolean;
  onPeriodUpdated: (p: TrainingPeriod) => void;
  onPeriodDeleted?: (id: string) => void;
  currentUserName?: string;
  currentUserId?: string;
}

export function PeriodDetail({ 
  period, agents, role, readOnly, onPeriodUpdated, onPeriodDeleted,
  currentUserName, currentUserId
}: PeriodDetailProps) {
  const t = useTranslations('trainer');
  const tAdmin = useTranslations('admin');
  const locale = t('management') === 'จัดการการฝึกอบรม' ? 'th-TH' : 'en-GB';
  const [subTab,    setSubTab]    = useState<'days' | 'discipline'>('days');
  const [dayRecs,   setDayRecs]   = useState<TrainingDayRecord[]>([]);
  const [discRecs,  setDiscRecs]  = useState<DisciplineRecord[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [addingAgent, setAddingAgent] = useState(false);
  const [selectedToAdd, setSelectedToAdd] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [summoning, setSummoning] = useState(false);
  const [markingLearned, setMarkingLearned] = useState(false);
  const [selectedModule, setSelectedModule] = useState<'product' | 'kyc' | 'website'>('product');

  // Filter available agents for adding: not in THIS period, not in ANY active period, and not graduated
  const availableToAdd = agents.filter(a => 
    !period.agentIds.includes(a.id) && 
    !a.activePeriodId && 
    !a.graduated
  );

  // Summon
  const { summon } = useSummon();

  // Live Presence Tracking
  const presence = useAgentPresence(period.agentIds);
  const activeFollowers = Object.values(presence).filter(p => p.status === 'focused').length;

  const getModuleLabel = () => {
    if (selectedModule === 'kyc') return tAdmin('modules.process');
    if (selectedModule === 'website') return tAdmin('modules.foundation');
    return tAdmin('modules.product');
  };

  const handleSummon = async () => {
    setSummoning(true);
    try {
      await summon(
        period.agentIds, 
        selectedModule, 
        `${getModuleLabel()} - Live`, 
        currentUserId || period.trainerId || 'trainer', 
        currentUserName || period.trainerName || 'Trainer'
      );
    } finally {
      setSummoning(false);
    }
  };

  const handleBulkMarkLearned = async () => {
    const moduleLabel = getModuleLabel();
    if (!confirm(t('markAllLearnedConfirm', { module: moduleLabel }) || `Mark "${moduleLabel}" as learned for all agents in this period?`)) return;
    
    setMarkingLearned(true);
    try {
      const res = await fetch('/api/admin/bulk-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentIds: period.agentIds,
          moduleId: selectedModule
        })
      });
      
      if (res.ok) {
        alert(t('bulkMarkSuccess') || 'Successfully marked all agents as learned.');
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update progress.');
      }
    } catch (err) {
      console.error('Bulk mark error:', err);
      alert('Network error occurred.');
    } finally {
      setMarkingLearned(false);
    }
  };

  const isPeriodActive = period.active !== false;
  const canEdit = (role === 'trainer' || role === 'admin' || role === 'it') && !readOnly && isPeriodActive;
  const canManage = (role === 'trainer' || role === 'admin' || role === 'manager' || role === 'it') && !readOnly && isPeriodActive;
  const canReopen = (role === 'admin' || role === 'trainer') && !readOnly;

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
          <h2 className="text-xl font-black text-foreground tracking-tight leading-tight">{period.name}</h2>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold"
            style={{
              background: period.active ? 'rgba(52,211,153,0.12)' : 'rgba(156,163,175,0.12)',
              color: period.active ? '#34D399' : '#9CA3AF',
              border: `1px solid ${period.active ? 'rgba(52,211,153,0.25)' : 'rgba(156,163,175,0.2)'}`,
            }}>
            {period.active ? t('active') : t('inactive')}
          </span>

          {period.inviteCode && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  const origin = typeof window !== 'undefined' ? window.location.origin : '';
                  const joinUrl = `${origin}/th/join?code=${period.inviteCode}`;
                  navigator.clipboard.writeText(joinUrl);
                  alert(`Copied Direct Join Link:\n${joinUrl}`);
                }}
                title="Click to copy full join link for agents"
                className="flex items-center gap-1 px-3 py-1 rounded-xl text-[11px] font-black uppercase bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all active:scale-95"
              >
                <span>🔗 Copy Join Link</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(period.inviteCode!);
                  alert(`Copied Wave Invite Code: ${period.inviteCode}`);
                }}
                title="Click to copy invite code for agents"
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-black uppercase bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all active:scale-95"
              >
                <span>Code: {period.inviteCode}</span>
              </button>
            </div>
          )}

          {canManage && (
            <div className="ml-auto flex items-center gap-2">
              <select 
                value={selectedModule} 
                onChange={e => setSelectedModule(e.target.value as any)}
                className="bg-secondary/40 border border-border/50 rounded-xl px-3 py-2 text-[11px] font-black uppercase outline-none focus:border-emerald-500/50 transition-colors"
              >
                <option value="product">{tAdmin('modules.product')}</option>
                <option value="kyc">{tAdmin('modules.process')}</option>
                <option value="website">{tAdmin('modules.foundation')}</option>
              </select>

              <button
                onClick={handleBulkMarkLearned}
                disabled={markingLearned || !period.active}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-[11px] font-black uppercase text-white shadow-lg transition-all active:scale-95 disabled:opacity-40"
              >
                {markingLearned ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                {markingLearned ? 'Updating...' : 'Mark All Learned'}
              </button>

              <button
                onClick={handleSummon}
                disabled={summoning || !period.active}
                className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-[11px] font-black uppercase text-white shadow-lg transition-all active:scale-95 disabled:opacity-40"
              >
                <Radio size={14} className={summoning ? 'animate-ping' : ''} />
                {summoning ? 'Summoning...' : 'Summon to Live'}
              </button>
            </div>
          )}

          {role === 'admin' && onPeriodDeleted && (
            <button onClick={handleDeletePeriod} disabled={deleting} title="Delete period"
              className={`${!canManage ? 'ml-auto' : 'ml-2'} p-1.5 rounded-lg text-muted-foreground/40 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-40`}
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
              ...(completionPct !== null ? [{ icon: TrendingUp, label: `${completionPct}% filled` }] : []),
              { icon: Radio,       label: `${activeFollowers} Online`, color: '#ef4444' },
            ];
          })().map(({ icon: Icon, label, color }) => (
            <span key={label} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold"
              style={{ 
                background: 'rgba(255,255,255,0.05)', 
                border: '1px solid rgba(255,255,255,0.10)',
                color: color || 'inherit'
              }}>
              <Icon size={11} className={color ? 'opacity-100' : 'opacity-60'} /> {label}
            </span>
          ))}
        </div>

        {!isPeriodActive && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold flex items-center justify-between gap-3 mb-4 shadow-sm">
            <span className="flex items-center gap-2">
              <Lock size={16} className="shrink-0" />
              <span>
                {t('management') === 'จัดการการฝึกอบรม' 
                  ? '🔒 การฝึกอบรมชุดนี้จบลงแล้ว (Read-Only) ข้อมูลถูกล็อกเพื่อการตรวจสอบทางบัญชีและไม่อนุญาตให้แก้ไข'
                  : '🔒 Completed Training Wave — Read-Only Historical Mode. Editing is locked to preserve audit logs.'}
              </span>
            </span>
            {canReopen && (
              <button
                onClick={toggleActive}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-black text-[10px] uppercase tracking-wider transition-all shrink-0 active:scale-95"
              >
                {t('management') === 'จัดการการฝึกอบรม' ? 'เปิดให้แก้ไขชั่วคราว' : 'Reopen Wave'}
              </button>
            )}
          </div>
        )}

        {canManage && (
          <div className="flex items-center gap-4 flex-wrap p-4 rounded-3xl mb-8 shadow-sm bg-muted/20 border border-border/40">
            <div className="flex items-center gap-3 flex-1 min-w-[240px]">
              <div className="relative flex-1 group">
                <select value={selectedToAdd} onChange={e => setSelectedToAdd(e.target.value)}
                  className="w-full appearance-none px-5 py-3 rounded-2xl text-xs outline-none text-foreground font-black uppercase tracking-wider transition-all bg-background/50 border border-border/60 hover:border-amber-500/30 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5"
                >
                  <option value="" className="bg-card">{t('selectAgentToAdd')}</option>
                  {availableToAdd.map(a => <option key={a.id} value={a.id} className="bg-card">{a.name}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-30 group-hover:opacity-60 transition-opacity">
                  <Plus size={14} />
                </div>
              </div>
              <button onClick={handleAddAgent} disabled={!selectedToAdd || addingAgent}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-[0.15em] transition-all active:scale-95 disabled:opacity-40 whitespace-nowrap shadow-lg shadow-amber-500/10"
                style={{ background: T.amberBg, color: T.amber, border: `1px solid ${T.amberBorder}` }}
              >
                {addingAgent ? <Spinner size={14} /> : <Plus size={16} strokeWidth={3} />}
                {addingAgent ? t('addingAgent') : t('addAgent')}
              </button>
            </div>
            
            <div className="hidden lg:block w-px h-10 self-center bg-border/40" />
            
            <div className="flex items-center gap-4 flex-shrink-0">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">{t('daysAdjust')}</span>
              <div className="flex items-center rounded-2xl overflow-hidden bg-background/50 border border-border/60 p-1">
                <button onClick={() => adjustDays(-1)} className="w-10 h-10 flex items-center justify-center text-xl font-bold hover:bg-amber-500/10 rounded-xl transition-all" style={{ color: T.amber }}>−</button>
                <span className="min-w-[44px] text-center text-sm font-black text-foreground tracking-tighter">{period.totalDays}</span>
                <button onClick={() => adjustDays(+1)} className="w-10 h-10 flex items-center justify-center text-xl font-bold hover:bg-amber-500/10 rounded-xl transition-all" style={{ color: T.amber }}>+</button>
              </div>
            </div>

            <div className="hidden lg:block w-px h-10 self-center bg-border/40" />

            <button onClick={toggleActive} className="flex items-center gap-3 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all flex-shrink-0 active:scale-95 shadow-sm"
              style={{
                background: period.active ? 'rgba(52,211,153,0.08)' : 'rgba(0,0,0,0.03)',
                color: period.active ? '#10B981' : 'var(--muted-foreground)',
                border: `1px solid ${period.active ? 'rgba(52,211,153,0.2)' : 'rgba(0,0,0,0.1)'}`,
              }}>
              {period.active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
              {period.active ? t('active') : t('inactive')}
            </button>
          </div>
        )}



        <div className="flex gap-0.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {(['days', 'discipline'] as const).map(st => (
            <button key={st} onClick={() => setSubTab(st)}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold transition-all relative"
              style={{ color: subTab === st ? T.amber : '#6B7280' }}>
              {st === 'days' ? <><BookOpen size={14} /> {t('trainingDays')}</> : 
               <><AlertTriangle size={14} /> {t('discipline')}</>}
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
        ) : (
          <DisciplineTab
            period={period} records={discRecs} onAdded={r => setDiscRecs(prev => [r, ...prev])}
            onDeleted={id => setDiscRecs(prev => prev.filter(r => r.id !== id))} readOnly={!canEdit}
          />
        )}
      </div>
    </div>
  );
}
