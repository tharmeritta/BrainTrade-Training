'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { GraduationCap, X, Plus, Check, AlertTriangle } from 'lucide-react';
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
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md"
      style={{ background: 'rgba(0, 0, 0, 0.4)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-lg rounded-[2.5rem] overflow-hidden border relative shadow-2xl bg-card text-card-foreground"
        style={{ 
          borderColor: 'rgba(245, 158, 11, 0.2)', 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 40px rgba(245, 158, 11, 0.1)'
        }}
      >
        {/* Decorative Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
        
        <div className="flex items-center justify-between px-8 py-7 border-b border-border/40">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-amber-500/10 border border-amber-500/20 shadow-inner">
              <GraduationCap size={24} className="text-amber-500" />
            </div>
            <div>
              <h3 className="font-black text-xl tracking-tight leading-none mb-1.5">{t('createPeriodTitle')}</h3>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">Training Wave Designer</p>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 flex items-center justify-center rounded-2xl transition-all hover:bg-secondary text-muted-foreground hover:text-foreground active:scale-90"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-7">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-[0.2em] mb-2.5 text-muted-foreground/70">{t('batchName')}</label>
              <input
                value={name} onChange={e => setName(e.target.value)}
                placeholder={t('batchNamePlaceholder')}
                required
                className="w-full px-5 py-4 rounded-2xl text-sm outline-none transition-all font-bold bg-muted/30 border border-border/50 hover:border-amber-500/30 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 placeholder:text-muted-foreground/40"
              />
            </div>

            {canPickTrainer && trainers.length > 0 && (
              <div>
                <label className="block text-[11px] font-black uppercase tracking-[0.2em] mb-2.5 text-muted-foreground/70">{t('trainerLabel')}</label>
                <div className="relative group">
                  <select
                    value={trainerId} onChange={e => setTrainerId(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl text-sm outline-none transition-all font-bold appearance-none bg-muted/30 border border-border/50 hover:border-amber-500/30 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5"
                  >
                    {trainers.map(tr => (
                      <option key={tr.id} value={tr.id} className="bg-card text-foreground py-2">{tr.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                    <Plus size={14} className="rotate-45" />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-[0.2em] mb-2.5 text-muted-foreground/70">{t('startDate')}</label>
                <input
                  type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl text-sm outline-none transition-all font-bold bg-muted/30 border border-border/50 hover:border-amber-500/30 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5"
                />
              </div>
              <div>
                <label className="block text-[11px] font-black uppercase tracking-[0.2em] mb-2.5 text-muted-foreground/70">{t('totalDays')}</label>
                <input
                  type="number" min={1} max={60} value={totalDays}
                  onChange={e => setTotalDays(Math.max(1, parseInt(e.target.value) || 5))}
                  className="w-full px-5 py-4 rounded-2xl text-sm outline-none transition-all font-bold bg-muted/30 border border-border/50 hover:border-amber-500/30 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">
                {t('selectAgents', { count: selectedIds.size })}
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">
                  {availableAgents.length} {t('noAgents').includes('ไม่มี') ? 'ที่ว่าง' : 'Available'}
                </span>
                {selectedIds.size > 0 && (
                  <button 
                    type="button" 
                    onClick={() => setSelectedIds(new Set())}
                    className="text-[10px] font-black text-amber-500 hover:text-amber-600 uppercase tracking-widest transition-colors"
                  >
                    {t('noAgents').includes('ไม่มี') ? 'ล้าง' : 'Clear'}
                  </button>
                )}
              </div>
            </div>
            
            <div className="rounded-[1.5rem] overflow-hidden max-h-56 overflow-y-auto border border-border/60 bg-muted/20 shadow-inner custom-scrollbar">
              {availableAgents.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="text-xs font-bold text-muted-foreground/40 italic uppercase tracking-widest leading-relaxed">
                    {t('noAgents')}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/30">
                  {availableAgents.map(a => (
                    <button
                      key={a.id} type="button"
                      onClick={() => toggleAgent(a.id)}
                      className="w-full flex items-center gap-4 px-6 py-4 text-left transition-all hover:bg-amber-500/[0.03] group"
                    >
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all border shadow-sm"
                        style={{
                          background: selectedIds.has(a.id) ? 'linear-gradient(135deg, #F59E0B, #D97706)' : 'transparent',
                          borderColor: selectedIds.has(a.id) ? '#F59E0B' : 'rgba(0,0,0,0.1)',
                        }}>
                        {selectedIds.has(a.id) && <Check size={12} className="text-white" strokeWidth={4} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm font-bold tracking-tight transition-colors ${selectedIds.has(a.id) ? 'text-amber-600' : 'text-foreground/70 group-hover:text-foreground'}`}>
                          {a.name}
                        </span>
                      </div>
                      {selectedIds.has(a.id) && (
                        <motion.div 
                          layoutId="selection-pill"
                          className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[9px] font-black text-amber-600 uppercase tracking-tighter"
                        >
                          Added
                        </motion.div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {err && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-xl bg-destructive/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={16} className="text-destructive" />
              </div>
              <p className="text-xs font-bold text-destructive leading-tight">{err}</p>
            </motion.div>
          )}

          <div className="flex items-center gap-4 pt-4">
            <button
              type="submit" disabled={saving}
              className="flex-1 h-16 flex items-center justify-center gap-3 rounded-2xl text-sm font-black uppercase tracking-[0.2em] transition-all active:scale-[0.97] shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden text-white"
              style={{ 
                background: 'linear-gradient(135deg, #F59E0B, #D97706)', 
                boxShadow: '0 10px 30px -5px rgba(245, 158, 11, 0.4)'
              }}
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full transition-transform group-hover:translate-y-0" />
              {saving ? <Spinner size={22} color="white" /> : <Plus size={20} strokeWidth={3} />}
              <span className="relative">{saving ? t('creating') : t('createBtn')}</span>
            </button>
            <button 
              type="button" 
              onClick={onClose}
              className="h-16 px-10 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all hover:bg-secondary text-muted-foreground hover:text-foreground active:scale-95"
            >
              {t('cancel')}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>


  );
}
