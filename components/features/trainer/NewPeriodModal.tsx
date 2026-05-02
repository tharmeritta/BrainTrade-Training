'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { GraduationCap, X, Plus, Check } from 'lucide-react';
import type { TrainingPeriod } from '@/types';
import { T, Spinner } from './TrainerConstants';
import { TrainerService } from '@/lib/services/trainer-service';

interface NewPeriodModalProps {
  agents: { id: string; name: string; graduated?: boolean; activePeriodId?: string }[];
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

  // Filter out agents who are already in a training wave or have graduated
  const availableAgents = agents.filter(a => !a.graduated && !a.activePeriodId);

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
    if (selectedIds.size === 0) { setErr(t('selectAgents', { count: 0 })); return; }
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
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-500/10 border border-amber-500/20">
              <GraduationCap size={18} style={{ color: T.amber }} />
            </div>
            <span className="font-black text-lg text-foreground tracking-tight">{t('createPeriodTitle')}</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-colors hover:bg-muted/30 text-muted-foreground">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-muted-foreground/50">{t('batchName')}</label>
            <input
              value={name} onChange={e => setName(e.target.value)}
              placeholder={t('batchNamePlaceholder')}
              required
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all text-foreground font-bold focus:ring-1 focus:ring-amber-500/30"
              style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${T.border}` }}
            />
          </div>

          {canPickTrainer && trainers.length > 0 && (
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-muted-foreground/50">{t('trainerLabel')}</label>
              <select
                value={trainerId} onChange={e => setTrainerId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all text-foreground font-bold"
                style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${T.border}` }}
              >
                {trainers.map(tr => (
                  <option key={tr.id} value={tr.id} className="bg-[#0A1424]">{tr.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-muted-foreground/50">{t('startDate')}</label>
              <input
                type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all text-foreground font-bold"
                style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${T.border}` }}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-muted-foreground/50">{t('totalDays')}</label>
              <input
                type="number" min={1} max={60} value={totalDays}
                onChange={e => setTotalDays(Math.max(1, parseInt(e.target.value) || 5))}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all text-foreground font-bold"
                style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${T.border}` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                {t('selectAgents', { count: selectedIds.size })}
              </label>
              <span className="text-[9px] font-black text-amber-500/50 uppercase tracking-widest">
                {availableAgents.length} Available
              </span>
            </div>
            <div className="rounded-xl overflow-hidden max-h-48 overflow-y-auto border border-border/40 bg-white/5 shadow-inner custom-scrollbar">
              {availableAgents.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-xs font-bold text-muted-foreground/40 italic">{t('noAgents')}</p>
                </div>
              ) : availableAgents.map(a => (
                <button
                  key={a.id} type="button"
                  onClick={() => toggleAgent(a.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5 group"
                  style={{ borderBottom: `1px solid ${T.border}` }}
                >
                  <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all"
                    style={{
                      background: selectedIds.has(a.id) ? T.amber : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${selectedIds.has(a.id) ? T.amber : T.border}`,
                      boxShadow: selectedIds.has(a.id) ? '0 0 12px rgba(245,158,11,0.3)' : 'none'
                    }}>
                    {selectedIds.has(a.id) && <Check size={11} className="text-white" strokeWidth={4} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm font-bold transition-colors ${selectedIds.has(a.id) ? 'text-amber-500' : 'text-foreground/80 group-hover:text-foreground'}`}>
                      {a.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {err && (
            <motion.p 
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[11px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              {err}
            </motion.p>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit" disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg disabled:cursor-not-allowed"
              style={{ 
                background: `linear-gradient(135deg, ${T.amber}, #D97706)`, 
                color: '#fff', 
                opacity: saving ? 0.7 : 1,
                boxShadow: '0 8px 24px rgba(245,158,11,0.2)'
              }}
            >
              {saving ? <Spinner /> : <Plus size={16} strokeWidth={3} />}
              {saving ? t('creating') : t('createBtn')}
            </button>
            <button type="button" onClick={onClose}
              className="px-6 py-3.5 rounded-xl text-sm font-bold transition-all hover:bg-white/5 text-muted-foreground/60 hover:text-foreground active:scale-95">
              {t('cancel')}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
