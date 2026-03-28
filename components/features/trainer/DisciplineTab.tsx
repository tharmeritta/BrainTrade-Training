'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Plus, AlertTriangle, Save, Trash2 } from 'lucide-react';
import type { TrainingPeriod, DisciplineRecord, DisciplineType } from '@/types';
import { T, Spinner, fmtDate } from './TrainerConstants';
import { TrainerService } from '@/lib/services/trainer-service';

interface DisciplineSubTabProps {
  period: TrainingPeriod;
  records: DisciplineRecord[];
  onAdded: (r: DisciplineRecord) => void;
  onDeleted: (id: string) => void;
  readOnly: boolean;
}

export function DisciplineTab({ period, records, onAdded, onDeleted, readOnly }: DisciplineSubTabProps) {
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
      const rec = await TrainerService.createDisciplineRecord({
        agentId: form.agentId,
        agentName: period.agentNames[form.agentId] ?? form.agentId,
        trainingPeriodId: period.id,
        date: form.date,
        type: form.type,
        description: form.description,
      });
      onAdded(rec);
      setShowForm(false);
      setForm({ agentId: period.agentIds[0] ?? '', date: new Date().toISOString().slice(0, 10), type: 'phone_usage', description: '' });
    } catch (e: any) { 
      setErr(e.message || 'Network error'); 
    } finally { 
      setSaving(false); 
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(t('deleteConfirm'))) return;
    try {
      await TrainerService.deleteDisciplineRecord(id);
      onDeleted(id);
    } catch { /* silent */ }
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

      <div className="rounded-2xl overflow-hidden border border-border">
        {records.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <AlertTriangle size={28} className="mx-auto opacity-30 mb-3" />
            <p className="text-sm">{t('noDiscipline')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
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
          </div>
        )}
      </div>
    </div>
  );
}
