'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { GraduationCap, X, Plus, Check } from 'lucide-react';
import type { TrainingPeriod } from '@/types';
import { T, Spinner } from './TrainerConstants';
import { TrainerService } from '@/lib/services/trainer-service';

interface NewPeriodModalProps {
  agents: { id: string; name: string }[];
  trainers: { id: string; name: string }[];
  currentUser: { uid?: string; name?: string; role: string };
  onClose: () => void;
  onCreated: (p: TrainingPeriod) => void;
}

export function NewPeriodModal({ agents, trainers, currentUser, onClose, onCreated }: NewPeriodModalProps) {
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

      const period = await TrainerService.createPeriod(body);
      onCreated(period);
    } catch (e: any) { 
      setErr(e.message || 'Network error'); 
    } finally { 
      setSaving(false); 
    }
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
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-muted-foreground">{t('batchName')}</label>
            <input
              value={name} onChange={e => setName(e.target.value)}
              placeholder={t('batchNamePlaceholder')}
              required
              className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-colors text-foreground"
              style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${T.border}` }}
            />
          </div>

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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-muted-foreground">{t('startDate')}</label>
              <input
                type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-colors text-foreground"
                style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${T.border}` }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-muted-foreground">{t('totalDays')}</label>
              <input
                type="number" min={1} max={60} value={totalDays}
                onChange={e => setTotalDays(Math.max(1, parseInt(e.target.value) || 5))}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-colors text-foreground"
                style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${T.border}` }}
              />
            </div>
          </div>

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
