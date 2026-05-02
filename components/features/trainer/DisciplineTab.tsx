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
    phone_usage:    { bg: 'bg-amber-500/10',  color: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/20' },
    dress_code:     { bg: 'bg-blue-500/10',   color: 'text-blue-600 dark:text-blue-400',   border: 'border-blue-500/20' },
    misconduct:     { bg: 'bg-red-500/10',    color: 'text-red-600 dark:text-red-400',    border: 'border-red-500/20' },
    warning_issued: { bg: 'bg-violet-500/10', color: 'text-violet-600 dark:text-violet-400', border: 'border-violet-500/20' },
    other:          { bg: 'bg-muted',         color: 'text-muted-foreground',             border: 'border-border' },
  };

  return (
    <div className="space-y-6">
      {!readOnly && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-amber-500/5"
            style={{ background: T.amberBg, color: T.amber, border: `1px solid ${T.amberBorder}` }}
          >
            {showForm ? <Plus size={16} className="rotate-45" /> : <Plus size={16} />} 
            {showForm ? t('cancel') : t('disciplineNew')}
          </button>
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, scale: 0.98, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            className="overflow-hidden rounded-3xl p-8 space-y-6 bg-amber-500/[0.03] border border-amber-500/20 relative"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle size={20} className="text-amber-500" />
              </div>
              <p className="text-sm font-black uppercase tracking-widest" style={{ color: T.amber }}>{t('disciplineTitle')}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-muted-foreground/60">{t('agent')}</label>
                <select
                  value={form.agentId} onChange={e => setForm(v => ({ ...v, agentId: e.target.value }))}
                  className="w-full px-5 py-3 rounded-2xl text-xs outline-none font-bold bg-background border border-border/60 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5"
                >
                  {period.agentIds.map(id => (
                    <option key={id} value={id} className="bg-card">{period.agentNames[id] ?? id}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-muted-foreground/60">{t('type')}</label>
                <select
                  value={form.type} onChange={e => setForm(v => ({ ...v, type: e.target.value as DisciplineType }))}
                  className="w-full px-5 py-3 rounded-2xl text-xs outline-none font-bold bg-background border border-border/60 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5"
                >
                  {(['phone_usage', 'dress_code', 'misconduct', 'warning_issued', 'other'] as const).map(k => (
                    <option key={k} value={k} className="bg-card">{t(`disciplineLabels.${k}`)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-muted-foreground/60">{t('startDate')}</label>
                <input
                  type="date" value={form.date} onChange={e => setForm(v => ({ ...v, date: e.target.value }))}
                  className="w-full px-5 py-3 rounded-2xl text-xs outline-none font-bold bg-background border border-border/60 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-muted-foreground/60">{t('description')}</label>
                <input
                  value={form.description} onChange={e => setForm(v => ({ ...v, description: e.target.value }))}
                  placeholder={t('descriptionPlaceholder')}
                  className="w-full px-5 py-3 rounded-2xl text-xs outline-none font-bold bg-background border border-border/60 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5"
                />
              </div>
            </div>
            
            {err && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-500 flex items-center gap-2">
                <AlertTriangle size={14} /> {err}
              </div>
            )}
            
            <div className="flex gap-4 pt-2">
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-amber-500/20 transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', opacity: saving ? 0.7 : 1 }}>
                {saving ? <Spinner size={16} color="white" /> : <Save size={16} />}
                {saving ? t('saving') : t('save')}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-muted transition-all text-muted-foreground">
                {t('cancel')}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="rounded-3xl overflow-hidden border border-border/60 bg-card shadow-sm">
        {records.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4 border border-border/40">
              <AlertTriangle size={32} className="opacity-20" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest opacity-40">{t('noDiscipline')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted/30 border-b border-border/60">
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{t('agent')}</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{t('type')}</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{t('startDate')}</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{t('description')}</th>
                  {!readOnly && <th className="px-6 py-4" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/[0.02] transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-black uppercase shrink-0 shadow-inner"
                          style={{ background: T.amberBg, color: T.amber, border: `1px solid ${T.amberBorder}` }}>
                          {r.agentName.charAt(0)}
                        </div>
                        <span className="font-bold text-foreground tracking-tight">{r.agentName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {(() => {
                        const dc = DISC_COLORS[r.type] ?? DISC_COLORS.other;
                        return (
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${dc.bg} ${dc.color} ${dc.border}`}>
                            {t(`disciplineLabels.${r.type}`)}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-5 text-[11px] font-bold text-muted-foreground opacity-60 font-mono tracking-tighter">
                      {fmtDate(r.date)}
                    </td>
                    <td className="px-6 py-5 text-xs text-muted-foreground max-w-xs truncate font-medium">
                      {r.description || '—'}
                    </td>
                    {!readOnly && (
                      <td className="px-6 py-5 text-right">
                        <button onClick={() => handleDelete(r.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-xl transition-all hover:bg-destructive/10 hover:text-destructive text-muted-foreground opacity-0 group-hover:opacity-100 focus:opacity-100">
                          <Trash2 size={14} />
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
