'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Edit2, Trash2, Check, X, Zap, 
  Target, MessageSquare, AlertTriangle, Save,
  ChevronDown, ChevronUp, Activity, Shield
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AiEvalScenario, AiEvalScenarioSchema } from '@/types/ai-eval';

/* ─── Components ─────────────────────────────────────────────────────────── */

export default function AiScenariosTab() {
  const [scenarios, setScenarios] = useState<AiEvalScenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<AiEvalScenario>>({});
  const [isCreating, setIsCreating] = useState(false);
  
  const t = useTranslations('admin');

  const fetchScenarios = useCallback(async () => {
    setLoading(true);
    try {
      // Note: We'll create this API route next
      const res = await fetch('/api/admin/ai-scenarios');
      if (res.ok) {
        const data = await res.json();
        setScenarios(data.scenarios || []);
      }
    } catch (err) {
      console.error('Failed to fetch scenarios', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScenarios();
  }, [fetchScenarios]);

  const handleEdit = (s: AiEvalScenario) => {
    setEditingId(s.id);
    setEditForm(s);
  };

  const handleSave = async () => {
    if (!editForm.id) return;
    try {
      const res = await fetch('/api/admin/ai-scenarios', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editForm.id, data: editForm }),
      });
      if (res.ok) {
        setEditingId(null);
        fetchScenarios();
      }
    } catch (err) {
      console.error('Save failed', err);
    }
  };

  const handleCreate = async () => {
    try {
      const res = await fetch('/api/admin/ai-scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setIsCreating(false);
        setEditForm({});
        fetchScenarios();
      }
    } catch (err) {
      console.error('Create failed', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scenario?')) return;
    try {
      await fetch(`/api/admin/ai-scenarios?id=${id}`, { method: 'DELETE' });
      fetchScenarios();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
            <Zap className="text-primary" size={20} />
            AI Training Scenarios
          </h2>
          <p className="text-xs text-muted-foreground font-medium">Manage customer personas and evaluation criteria for AI Eval.</p>
        </div>
        <button
          onClick={() => { setIsCreating(true); setEditForm({ difficulty: 'beginner', isActive: true, maxTurns: 12, passThreshold: 7 }); }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={16} />
          Create Scenario
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {(isCreating || editingId) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-primary/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <Edit2 size={120} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Scenario Name</label>
                    <input
                      className="w-full bg-secondary/30 border-none rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-primary/20"
                      value={editForm.name || ''}
                      onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="e.g. The Angry Skeptic"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Difficulty</label>
                      <select
                        className="w-full bg-secondary/30 border-none rounded-xl px-4 py-2.5 text-sm font-bold"
                        value={editForm.difficulty}
                        onChange={e => setEditForm({ ...editForm, difficulty: e.target.value as any })}
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="expert">Expert</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Pass Threshold</label>
                      <input
                        type="number"
                        className="w-full bg-secondary/30 border-none rounded-xl px-4 py-2.5 text-sm font-bold"
                        value={editForm.passThreshold}
                        onChange={e => setEditForm({ ...editForm, passThreshold: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Customer Persona (System Prompt)</label>
                    <textarea
                      className="w-full bg-secondary/30 border-none rounded-xl px-4 py-2.5 text-sm font-medium h-32 resize-none"
                      value={editForm.customerPersona || ''}
                      onChange={e => setEditForm({ ...editForm, customerPersona: e.target.value })}
                      placeholder="Describe the customer's background, personality, and knowledge level..."
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Customer Objective</label>
                    <input
                      className="w-full bg-secondary/30 border-none rounded-xl px-4 py-2.5 text-sm font-bold"
                      value={editForm.objective || ''}
                      onChange={e => setEditForm({ ...editForm, objective: e.target.value })}
                      placeholder="What does the customer want to achieve/know?"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Initial Mood</label>
                      <input
                        className="w-full bg-secondary/30 border-none rounded-xl px-4 py-2.5 text-sm font-bold"
                        value={editForm.initialMood || ''}
                        onChange={e => setEditForm({ ...editForm, initialMood: e.target.value })}
                        placeholder="e.g. Skeptical but curious"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Max Turns</label>
                      <input
                        type="number"
                        className="w-full bg-secondary/30 border-none rounded-xl px-4 py-2.5 text-sm font-bold"
                        value={editForm.maxTurns}
                        onChange={e => setEditForm({ ...editForm, maxTurns: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Win Condition (AI Hint)</label>
                    <input
                      className="w-full bg-secondary/30 border-none rounded-xl px-4 py-2.5 text-sm font-bold"
                      value={editForm.winCondition || ''}
                      onChange={e => setEditForm({ ...editForm, winCondition: e.target.value })}
                      placeholder="e.g. Agent explains the 1:1 coach clearly"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Fail Condition (AI Hint)</label>
                    <input
                      className="w-full bg-secondary/30 border-none rounded-xl px-4 py-2.5 text-sm font-bold"
                      value={editForm.failCondition || ''}
                      onChange={e => setEditForm({ ...editForm, failCondition: e.target.value })}
                      placeholder="e.g. Agent is pushy or ignores security questions"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-border/50">
                <button
                  onClick={() => { setEditingId(null); setIsCreating(false); setEditForm({}); }}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-muted-foreground hover:bg-secondary transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={isCreating ? handleCreate : handleSave}
                  className="flex items-center gap-2 bg-foreground text-background px-8 py-2.5 rounded-xl text-sm font-black shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                  <Save size={18} />
                  {isCreating ? 'Create Scenario' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          )}

          {scenarios.map(s => (
            <motion.div
              key={s.id}
              layout
              className={`bg-card border border-border/50 rounded-2xl p-5 hover:border-primary/30 transition-all group ${editingId === s.id ? 'hidden' : ''}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${
                    s.difficulty === 'beginner' ? 'bg-emerald-500/10 text-emerald-500' :
                    s.difficulty === 'intermediate' ? 'bg-amber-500/10 text-amber-500' :
                    s.difficulty === 'advanced' ? 'bg-rose-500/10 text-rose-500' :
                    'bg-purple-500/10 text-purple-500'
                  }`}>
                    <Target size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-black text-foreground tracking-tight">{s.name}</h3>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${
                        s.difficulty === 'beginner' ? 'border-emerald-500/20 text-emerald-500 bg-emerald-500/5' :
                        s.difficulty === 'intermediate' ? 'border-amber-500/20 text-amber-500 bg-amber-500/5' :
                        'border-rose-500/20 text-rose-500 bg-rose-500/5'
                      }`}>
                        {s.difficulty}
                      </span>
                      {!s.isActive && (
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md border border-muted-foreground/20 text-muted-foreground bg-muted-foreground/5">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{s.description || s.customerPersona}</p>
                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
                        <Activity size={12} className="text-primary/50" />
                        Threshold: {s.passThreshold}/10
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
                        <MessageSquare size={12} className="text-primary/50" />
                        Max Turns: {s.maxTurns}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(s)}
                    className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="p-2 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-all"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="animate-spin text-primary" size={32} />
          <p className="text-xs font-bold text-muted-foreground animate-pulse">Loading AI Scenarios...</p>
        </div>
      )}

      {!loading && scenarios.length === 0 && !isCreating && (
        <div className="text-center py-20 bg-secondary/10 rounded-3xl border border-dashed border-border">
          <div className="w-12 h-12 bg-secondary/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="text-muted-foreground" size={24} />
          </div>
          <p className="font-bold text-foreground">No scenarios found</p>
          <p className="text-xs text-muted-foreground mt-1">Create your first AI training scenario to get started.</p>
        </div>
      )}
    </div>
  );
}

const Loader2 = ({ className, size }: { className?: string; size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
