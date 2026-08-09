'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Zap, Search, FileUp, Sparkles, Loader2, CheckCircle2, AlertCircle, Edit2, ShieldAlert
} from 'lucide-react';
import { AiEvalScenario } from '@/types/ai-eval';
import { getPassThresholdPct } from '@/lib/scoring';
import ScenarioForm from './ai-scenarios/ScenarioForm';
import AiScenarioImportModal from './AiScenarioImportModal';
import { PRESET_TEMPLATES } from './ai-scenarios/templates';

const DIFF_STYLES: Record<string, { label: string; bg: string; text: string; border: string }> = {
  beginner:     { label: 'Beginner', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  intermediate: { label: 'Intermediate', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  advanced:     { label: 'Advanced', bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
};

export default function AiScenariosTab({ readOnly }: { readOnly?: boolean }) {
  const [scenarios, setScenarios] = useState<AiEvalScenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  
  // Editor state
  const [isCreating, setIsCreating] = useState(false);
  const [editingScenario, setEditingScenario] = useState<Partial<AiEvalScenario> | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  const fetchScenarios = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/ai-scenarios');
      if (res.ok) {
        const data = await res.json();
        setScenarios(data.scenarios || []);
      }
    } catch (err) {
      console.error('Failed to fetch AI scenarios:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScenarios();
  }, [fetchScenarios]);

  const handleSaveScenario = async () => {
    if (!editingScenario || !editingScenario.name) return;

    try {
      if (isCreating) {
        const res = await fetch('/api/admin/ai-scenarios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingScenario),
        });
        if (res.ok) {
          setIsCreating(false);
          setEditingScenario(null);
          fetchScenarios();
        }
      } else {
        const res = await fetch('/api/admin/ai-scenarios', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingScenario.id, data: editingScenario }),
        });
        if (res.ok) {
          setEditingScenario(null);
          fetchScenarios();
        }
      }
    } catch (err) {
      console.error('Failed to save scenario:', err);
    }
  };

  const handleDeleteScenario = async (id: string) => {
    if (!confirm('Are you sure you want to delete this AI customer scenario?')) return;
    try {
      const res = await fetch(`/api/admin/ai-scenarios?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchScenarios();
    } catch (err) {
      console.error('Failed to delete scenario:', err);
    }
  };

  const handleToggleActive = async (s: AiEvalScenario) => {
    try {
      const res = await fetch('/api/admin/ai-scenarios', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: s.id, data: { isActive: !s.isActive } }),
      });
      if (res.ok) fetchScenarios();
    } catch (err) {
      console.error('Failed to toggle active status:', err);
    }
  };

  const getLocText = (val: any): string => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    return val.en || val.th || '';
  };

  const handleApplyPreset = (tmpl: any) => {
    setEditingScenario({
      name: tmpl.name,
      difficulty: tmpl.difficulty,
      passThreshold: tmpl.passThreshold,
      customerPersona: tmpl.customerPersona,
      initialMood: tmpl.initialMood,
      objective: tmpl.objective,
      situation: tmpl.situation,
      choices: tmpl.choices,
      required: tmpl.required,
      isActive: true,
    });
    setIsCreating(true);
  };

  const filteredScenarios = useMemo(() => {
    return scenarios.filter(s => {
      const nameText = getLocText(s.name).toLowerCase();
      const personaText = getLocText(s.customerPersona || s.description).toLowerCase();
      const matchesSearch = nameText.includes(search.toLowerCase()) || personaText.includes(search.toLowerCase());
      const matchesDiff = difficultyFilter === 'all' || s.difficulty === difficultyFilter;
      return matchesSearch && matchesDiff;
    });
  }, [scenarios, search, difficultyFilter]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="animate-spin text-primary" size={32} />
        <p className="text-sm text-muted-foreground animate-pulse">Loading AI scenarios...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card border border-border rounded-3xl p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-foreground flex items-center gap-2.5">
            <Zap className="text-primary" size={22} />
            AI Customer Personas & Roleplay Scenarios
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Manage customer personas and evaluation criteria for AI Audit roleplay sessions.
          </p>
        </div>

        {!readOnly && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-secondary text-foreground text-xs font-bold hover:bg-secondary/80 transition-all border border-border/60"
            >
              <FileUp size={15} /> Import File
            </button>
            
            <button
              onClick={() => {
                setEditingScenario({
                  difficulty: 'beginner',
                  passThreshold: 70,
                  required: true,
                  isActive: true
                });
                setIsCreating(true);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground text-xs font-black shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Plus size={16} /> New Persona
            </button>
          </div>
        )}
      </div>

      {/* Editor Form Drawer */}
      <AnimatePresence>
        {(isCreating || editingScenario) && (
          <ScenarioForm
            form={editingScenario || {}}
            isCreating={isCreating}
            onChange={setEditingScenario}
            onSave={handleSaveScenario}
            onCancel={() => {
              setIsCreating(false);
              setEditingScenario(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Quick Start Presets (Shown if no editor active) */}
      {!isCreating && !editingScenario && !readOnly && (
        <div className="bg-gradient-to-br from-secondary/40 to-secondary/10 border border-border/60 rounded-3xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Sparkles size={14} className="text-primary" /> Instant Persona Templates:
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {PRESET_TEMPLATES.map((tmpl, idx) => (
              <button
                key={idx}
                onClick={() => handleApplyPreset(tmpl)}
                className="p-4 rounded-2xl bg-card border border-border/60 hover:border-primary/50 text-left transition-all hover:scale-[1.02] shadow-sm group"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{getLocText(tmpl.name)}</p>
                  <span className="text-[9px] font-black uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-full">Preset</span>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{getLocText(tmpl.customerPersona)}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            type="text"
            placeholder="Search personas by name or keywords..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          {['all', 'beginner', 'intermediate', 'advanced'].map(d => (
            <button
              key={d}
              onClick={() => setDifficultyFilter(d)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                difficultyFilter === d
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-card text-muted-foreground hover:text-foreground border border-border'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Scenario Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredScenarios.map(s => {
          const style = DIFF_STYLES[s.difficulty || 'beginner'] || DIFF_STYLES.beginner;
          const nameStr = getLocText(s.name);
          const personaStr = getLocText(s.customerPersona || s.description);
          const moodStr = getLocText(s.initialMood);

          return (
            <motion.div
              key={s.id}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className={`bg-card border border-border/80 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group ${
                !s.isActive ? 'opacity-60' : ''
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${style.bg} ${style.text} ${style.border}`}>
                    {style.label}
                  </span>

                  <div className="flex items-center gap-2">
                    {s.required && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-primary/10 text-primary border border-primary/20">
                        Mandatory
                      </span>
                    )}

                    {!readOnly && (
                      <button
                        onClick={() => handleToggleActive(s)}
                        title={s.isActive ? 'Deactivate Persona' : 'Activate Persona'}
                        className={`w-9 h-5 rounded-full relative transition-colors ${s.isActive ? 'bg-emerald-500' : 'bg-secondary'}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${s.isActive ? 'left-4.5' : 'left-0.5'}`} />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-black text-foreground group-hover:text-primary transition-colors tracking-tight">{nameStr}</h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                    {personaStr || 'No persona details defined.'}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-border/40 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-secondary/40 p-2 rounded-xl">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase block">Target Pass</span>
                    <span className="font-black text-foreground">{getPassThresholdPct(s.passThreshold, 70)}% Score</span>
                  </div>
                  <div className="bg-secondary/40 p-2 rounded-xl">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase block">Initial Mood</span>
                    <span className="font-bold text-foreground truncate block">{moodStr || 'Normal'}</span>
                  </div>
                </div>

                {!readOnly && (
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => {
                        setEditingScenario(s);
                        setIsCreating(false);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary text-foreground text-xs font-bold hover:bg-secondary/80 transition-all"
                    >
                      <Edit2 size={13} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteScenario(s.id)}
                      className="p-1.5 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all"
                      title="Delete Scenario"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredScenarios.length === 0 && (
        <div className="bg-card border border-border rounded-3xl p-12 text-center text-muted-foreground space-y-2">
          <Zap size={32} className="mx-auto text-muted-foreground/40 animate-pulse" />
          <p className="text-sm font-bold text-foreground">No Customer Personas Found</p>
          <p className="text-xs">Click "+ New Persona" or choose an instant template above to get started.</p>
        </div>
      )}

      {/* File Import Modal */}
      {showImportModal && (
        <AiScenarioImportModal
          onClose={() => setShowImportModal(false)}
          onSuccess={() => {
            setShowImportModal(false);
            fetchScenarios();
          }}
        />
      )}
    </div>
  );
}
