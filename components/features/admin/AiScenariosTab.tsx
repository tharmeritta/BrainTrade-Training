'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit2, Trash2, Save, Zap,
  Target, Shield, FileUp, Settings,
  RotateCcw, ChevronDown, X, TrendingUp, Lock, Unlock, CheckSquare, Square, Loader2
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AiEvalScenario } from '@/types/ai-eval';
import AiScenarioImportModal from './AiScenarioImportModal';
import SandboxManagerModal from './SandboxManagerModal';

/* ─── Difficulty config ─────────────────────────────────────────────────────── */

const DIFF = {
  beginner:     { label: 'Beginner',     color: 'emerald', border: 'border-l-emerald-500',  bg: 'bg-emerald-500/10',  text: 'text-emerald-500',  badge: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  intermediate: { label: 'Intermediate', color: 'amber',   border: 'border-l-amber-500',    bg: 'bg-amber-500/10',    text: 'text-amber-500',    badge: 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  advanced:     { label: 'Advanced',     color: 'rose',    border: 'border-l-rose-500',      bg: 'bg-rose-500/10',     text: 'text-rose-500',     badge: 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400' },
  expert:       { label: 'Expert',       color: 'purple',  border: 'border-l-purple-500',    bg: 'bg-purple-500/10',   text: 'text-purple-500',   badge: 'border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400' },
} as const;

const DIFF_ORDER: (keyof typeof DIFF)[] = ['beginner', 'intermediate', 'advanced', 'expert'];

const EMPTY_FORM: Partial<AiEvalScenario> = {
  difficulty: 'beginner', isActive: true, maxTurns: 12, passThreshold: 7
};

/* ─── Field component ───────────────────────────────────────────────────────── */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full bg-secondary/40 border border-border/40 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all placeholder:text-muted-foreground/40";
const textareaCls = `${inputCls} resize-none`;

/* ─── Scenario Form ─────────────────────────────────────────────────────────── */

function ScenarioForm({
  form,
  isCreating,
  onChange,
  onSave,
  onCancel,
}: {
  form: Partial<AiEvalScenario>;
  isCreating: boolean;
  onChange: (f: Partial<AiEvalScenario>) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="bg-card border border-primary/20 rounded-2xl overflow-hidden shadow-xl shadow-primary/5 mb-2"
    >
      {/* Form header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-primary/[0.03]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            {isCreating ? <Plus size={16} className="text-primary" /> : <Edit2 size={16} className="text-primary" />}
          </div>
          <div>
            <p className="text-sm font-black text-foreground">{isCreating ? 'New Scenario' : 'Edit Scenario'}</p>
            <p className="text-[10px] text-muted-foreground font-medium">{form.name || 'Untitled scenario'}</p>
          </div>
        </div>
        <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
          <X size={16} />
        </button>
      </div>

      <div className="p-6 space-y-6">

        {/* System Prompt — full width, primary field */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-primary/80 border-b border-primary/20 pb-1.5 flex-1">ChatGPT System Prompt <span className="text-primary">(Main Instruction)</span></p>
          </div>
          <p className="text-[10px] text-muted-foreground">
            This prompt is the <strong>source of truth</strong> for the AI. You can use variables: <code className="bg-secondary/60 px-1 rounded">{"{{agentName}}"}</code>, <code className="bg-secondary/60 px-1 rounded">{"{{customerName}}"}</code>, <code className="bg-secondary/60 px-1 rounded">{"{{level}}"}</code>.
            It MUST instruct ChatGPT to return JSON with <code className="bg-secondary/60 px-1 rounded">verdict: &quot;continue&quot; | &quot;passed&quot; | &quot;failed&quot;</code>.
          </p>
          <Field label="System Prompt (Thai or English)">
            <textarea
              className={`${textareaCls} h-64 font-mono text-xs`}
              value={form.systemPrompt || ''}
              onChange={e => onChange({ ...form, systemPrompt: e.target.value })}
              placeholder={`เล่นบทเป็นลูกค้าคนไทย สุ่มเลือก 1 บทบาท...\nพนักงานชื่อ: {{agentName}}\n\n✅ PASS เมื่อ: ...\n❌ FAIL เมื่อ: ...\n\nตอบกลับเป็น JSON เสมอ:\n{"dialogue":"...","verdict":"continue","reason":"","score":null,"strengths":null,"improvements":null,"coachingTip":null}\n\nห้ามบอก verdict แก่พนักงานใน dialogue เด็ดขาด`}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1 — Identity */}
          <div className="space-y-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 border-b border-border/30 pb-1.5">Identity</p>
            <Field label="Scenario Name">
              <input className={inputCls} value={form.name || ''} onChange={e => onChange({ ...form, name: e.target.value })} placeholder="e.g. The Angry Skeptic" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Difficulty">
                <select className={inputCls} value={form.difficulty} onChange={e => onChange({ ...form, difficulty: e.target.value as any })}>
                  {DIFF_ORDER.map(d => <option key={d} value={d}>{DIFF[d].label}</option>)}
                </select>
              </Field>
              <Field label="Status">
                <button
                  type="button"
                  onClick={() => onChange({ ...form, isActive: !form.isActive })}
                  className={`w-full flex items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-bold border transition-all ${form.isActive ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : 'bg-secondary/40 border-border/40 text-muted-foreground'}`}
                >
                  {form.isActive ? <Unlock size={13} /> : <Lock size={13} />}
                  {form.isActive ? 'Active' : 'Inactive'}
                </button>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Pass Threshold">
                <input type="number" className={inputCls} value={form.passThreshold ?? 7} onChange={e => onChange({ ...form, passThreshold: parseInt(e.target.value) })} min={1} max={10} />
              </Field>
              <Field label="Max Turns">
                <input type="number" className={inputCls} value={form.maxTurns ?? 12} onChange={e => onChange({ ...form, maxTurns: parseInt(e.target.value) })} min={1} />
              </Field>
            </div>
          </div>

          {/* Column 2 — Persona (fallback fields) */}
          <div className="space-y-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 border-b border-border/30 pb-1.5">Customer Persona <span className="normal-case font-medium">(fallback if no system prompt)</span></p>
            <Field label="Persona Description">
              <textarea className={`${textareaCls} h-28`} value={form.customerPersona || ''} onChange={e => onChange({ ...form, customerPersona: e.target.value })} placeholder="Background, personality, knowledge level…" />
            </Field>
            <Field label="Objective">
              <input className={inputCls} value={form.objective || ''} onChange={e => onChange({ ...form, objective: e.target.value })} placeholder="What does the customer want?" />
            </Field>
            <Field label="Initial Mood">
              <input className={inputCls} value={form.initialMood || ''} onChange={e => onChange({ ...form, initialMood: e.target.value })} placeholder="e.g. Skeptical but curious" />
            </Field>
          </div>

          {/* Column 3 — Conditions */}
          <div className="space-y-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 border-b border-border/30 pb-1.5">Win / Fail Conditions</p>
            <Field label="Win Condition">
              <textarea className={`${textareaCls} h-28`} value={form.winCondition || ''} onChange={e => onChange({ ...form, winCondition: e.target.value })} placeholder="When should the AI decide the agent passed?" />
            </Field>
            <Field label="Fail Condition">
              <textarea className={`${textareaCls} h-[4.5rem]`} value={form.failCondition || ''} onChange={e => onChange({ ...form, failCondition: e.target.value })} placeholder="When should the AI hang up?" />
            </Field>
            <Field label="Bypass Prompt (External AI Practice)">
              <textarea className={`${textareaCls} h-28`} value={form.bypassPrompt || ''} onChange={e => onChange({ ...form, bypassPrompt: e.target.value })} placeholder="Prompt for ChatGPT/Gemini practice..." />
            </Field>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border/50 bg-secondary/10">
        <button onClick={onCancel} className="px-5 py-2 rounded-xl text-sm font-bold text-muted-foreground hover:bg-secondary transition-all">
          Cancel
        </button>
        <button onClick={onSave} className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-xl text-sm font-black shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
          <Save size={15} />
          {isCreating ? 'Create Scenario' : 'Save Changes'}
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Scenario Card ─────────────────────────────────────────────────────────── */

function ScenarioCard({
  s,
  readOnly,
  selected,
  onToggleSelect,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  s: AiEvalScenario;
  readOnly?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}) {
  const diff = DIFF[(s.difficulty as keyof typeof DIFF)] || DIFF.beginner;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -4 }}
      className={`group relative bg-card border border-l-4 ${diff.border} rounded-xl hover:shadow-sm transition-all ${
        selected ? 'border-primary/40 bg-primary/[0.02]' : 'border-border/50 hover:border-border/80'
      }`}
    >
      <div className="flex items-center gap-3 px-4 py-3.5">
        {/* Checkbox */}
        {!readOnly && (
          <button
            onClick={onToggleSelect}
            className="shrink-0 text-muted-foreground/40 hover:text-primary transition-colors"
          >
            {selected
              ? <CheckSquare size={16} className="text-primary" />
              : <Square size={16} className="group-hover:text-muted-foreground/70" />}
          </button>
        )}

        {/* Icon */}
        <div className={`p-2 rounded-lg shrink-0 ${diff.bg}`}>
          <Target size={15} className={diff.text} />
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-black text-sm text-foreground tracking-tight truncate">{s.name}</span>
            {s.isMaster && (
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded border border-primary/30 text-primary bg-primary/10 shrink-0 flex items-center gap-1">
                <Zap size={8} fill="currentColor" /> Sandbox
              </span>
            )}
            {!s.isActive && (
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded border border-muted-foreground/20 text-muted-foreground bg-muted-foreground/5 shrink-0">Inactive</span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{s.description || s.customerPersona || '—'}</p>
        </div>

        {/* Stats */}
        <div className="hidden md:flex items-center gap-4 shrink-0">
          <div className="text-center">
            <p className="text-xs font-black text-foreground">{s.passThreshold}<span className="text-muted-foreground font-medium">/10</span></p>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Threshold</p>
          </div>
          <div className="w-px h-6 bg-border/60" />
          <div className="text-center">
            <p className="text-xs font-black text-foreground">{s.maxTurns}</p>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Turns</p>
          </div>
        </div>

        {/* Actions */}
        {!readOnly && (
          <div className="flex items-center gap-1 shrink-0">
            {/* Active toggle */}
            <button
              onClick={onToggleActive}
              title={s.isActive ? 'Deactivate' : 'Activate'}
              className={`w-9 h-5 rounded-full relative transition-colors shrink-0 ${s.isActive ? 'bg-emerald-500' : 'bg-border'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${s.isActive ? 'left-[18px]' : 'left-0.5'}`} />
            </button>

            {/* Edit / Delete — visible on hover */}
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
              <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-all" title="Edit">
                <Edit2 size={14} />
              </button>
              <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-all" title="Delete">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Difficulty Section ────────────────────────────────────────────────────── */

function DifficultySection({
  difficulty,
  scenarios,
  readOnly,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  difficulty: keyof typeof DIFF;
  scenarios: AiEvalScenario[];
  readOnly?: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAll: (ids: string[], select: boolean) => void;
  onEdit: (s: AiEvalScenario) => void;
  onDelete: (id: string) => void;
  onToggleActive: (s: AiEvalScenario) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const diff = DIFF[difficulty];
  const activeCount = scenarios.filter(s => s.isActive).length;
  const ids = scenarios.map(s => s.id);
  const allSelected = ids.length > 0 && ids.every(id => selectedIds.has(id));
  const someSelected = ids.some(id => selectedIds.has(id));

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center gap-3 mb-2">
        {!readOnly && (
          <button
            onClick={() => onSelectAll(ids, !allSelected)}
            className="shrink-0 text-muted-foreground/40 hover:text-primary transition-colors"
            title={allSelected ? 'Deselect all in level' : 'Select all in level'}
          >
            {allSelected
              ? <CheckSquare size={14} className="text-primary" />
              : someSelected
              ? <CheckSquare size={14} className="text-primary/50" />
              : <Square size={14} />}
          </button>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="flex-1 flex items-center gap-3 group/header"
        >
          <div className={`w-2 h-2 rounded-full ${diff.bg} border-2 ${diff.border.replace('border-l-', 'border-')}`} />
          <span className={`text-xs font-black uppercase tracking-widest ${diff.text}`}>{diff.label}</span>
          <span className="text-[10px] font-bold text-muted-foreground">
            {activeCount}/{scenarios.length} active
          </span>
          <div className="flex-1 h-px bg-border/40" />
          <ChevronDown size={14} className={`text-muted-foreground/50 transition-transform ${collapsed ? '-rotate-90' : ''}`} />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-1.5 pb-2">
              {scenarios.map(s => (
                <ScenarioCard
                  key={s.id}
                  s={s}
                  readOnly={readOnly}
                  selected={selectedIds.has(s.id)}
                  onToggleSelect={() => onToggleSelect(s.id)}
                  onEdit={() => onEdit(s)}
                  onDelete={() => onDelete(s.id)}
                  onToggleActive={() => onToggleActive(s)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────────────────────────── */

export default function AiScenariosTab({ readOnly }: { readOnly?: boolean }) {
  const [scenarios, setScenarios] = useState<AiEvalScenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<AiEvalScenario>>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showSandbox, setShowSandbox] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [globalConfig, setGlobalConfig] = useState<{ unlockMode: 'sequential' | 'flexible', sandboxModeEnabled?: boolean }>({ unlockMode: 'sequential', sandboxModeEnabled: false });

  const t = useTranslations('admin');

  const fetchScenarios = useCallback(async () => {
    setLoading(true);
    try {
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

  const fetchGlobalConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/config');
      if (res.ok) {
        const data = await res.json();
        const aiEvalConfig = data.configs?.ai_eval || {};
        setGlobalConfig({ 
          unlockMode: aiEvalConfig.unlockMode || 'sequential',
          sandboxModeEnabled: aiEvalConfig.sandboxModeEnabled || false
        });
      }
    } catch (err) {
      console.error('Failed to fetch global config', err);
    }
  }, []);

  useEffect(() => {
    fetchScenarios();
    fetchGlobalConfig();
  }, [fetchScenarios, fetchGlobalConfig]);

  const updateGlobalConfig = async (newConfig: typeof globalConfig) => {
    setSavingConfig(true);
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'ai_eval', data: newConfig }),
      });
      if (res.ok) setGlobalConfig(newConfig);
    } catch (err) {
      console.error('Failed to update global config', err);
    } finally {
      setSavingConfig(false);
    }
  };

  const handleSave = async () => {
    if (!editForm.id) return;
    try {
      const res = await fetch('/api/admin/ai-scenarios', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editForm.id, data: editForm }),
      });
      if (res.ok) { setEditingId(null); fetchScenarios(); }
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
      if (res.ok) { setIsCreating(false); setEditForm(EMPTY_FORM); fetchScenarios(); }
    } catch (err) {
      console.error('Create failed', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scenario?')) return;
    try {
      const res = await fetch(`/api/admin/ai-scenarios?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchScenarios();
    } catch {
      alert('Network error while deleting scenario');
    }
  };

  const handleToggleActive = async (s: AiEvalScenario) => {
    const res = await fetch('/api/admin/ai-scenarios', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: s.id, data: { isActive: !s.isActive } }),
    });
    if (res.ok) fetchScenarios();
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = (ids: string[], select: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      ids.forEach(id => select ? next.add(id) : next.delete(id));
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkDelete = async () => {
    const count = selectedIds.size;
    if (!confirm(`Delete ${count} scenarios?`)) return;
    setBulkDeleting(true);
    try {
      await Promise.all(Array.from(selectedIds).map(id => fetch(`/api/admin/ai-scenarios?id=${id}`, { method: 'DELETE' })));
      clearSelection();
      fetchScenarios();
    } catch {
      alert('Some deletions failed.');
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleEdit = (s: AiEvalScenario) => {
    setIsCreating(false);
    setEditingId(s.id);
    // Ensure level is present based on difficulty if missing
    const levelMap: Record<string, number> = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
    setEditForm({ ...s, level: s.level || levelMap[s.difficulty] || 1 });
  };

  const handleFormChange = (newForm: Partial<AiEvalScenario>) => {
    // Sync level if difficulty changed
    if (newForm.difficulty !== editForm.difficulty && newForm.difficulty) {
      const levelMap: Record<string, number> = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
      newForm.level = levelMap[newForm.difficulty] || 1;
    }
    setEditForm(newForm);
  };

  const cancelForm = () => { setEditingId(null); setIsCreating(false); setEditForm(EMPTY_FORM); };

  const grouped = DIFF_ORDER.reduce((acc, d) => {
    acc[d] = scenarios.filter(s => s.difficulty === d);
    return acc;
  }, {} as Record<keyof typeof DIFF, AiEvalScenario[]>);

  const masterCount = scenarios.filter(s => s.isMaster && s.isActive).length;

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
            <Zap className="text-primary" size={19} />
            AI Training Scenarios
          </h2>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            Manage customer personas and evaluation criteria for AI Eval.
          </p>
        </div>
        {!readOnly && (
          <div className="flex items-center gap-2">
            {/* Global Sandbox Toggle */}
            <button
              onClick={() => updateGlobalConfig({ ...globalConfig, sandboxModeEnabled: !globalConfig.sandboxModeEnabled })}
              disabled={savingConfig || (masterCount === 0 && !globalConfig.sandboxModeEnabled)}
              title={masterCount === 0 ? "Set at least one scenario as Master to enable" : ""}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                globalConfig.sandboxModeEnabled 
                  ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 hover:scale-105' 
                  : 'bg-secondary/40 border-border/40 text-muted-foreground hover:border-primary/30'
              } disabled:opacity-40 disabled:hover:scale-100`}
            >
              <Zap size={14} fill={globalConfig.sandboxModeEnabled ? "currentColor" : "none"} />
              Sandbox: {globalConfig.sandboxModeEnabled ? 'ON' : 'OFF'}
            </button>

            {/* Sandbox Setup button */}
            <button
              onClick={() => setShowSandbox(true)}
              className="flex items-center gap-1.5 bg-secondary text-foreground px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-secondary/80 transition-all border border-border/50"
            >
              <Zap size={14} />
              Sandbox Setup
            </button>

            <button
              onClick={() => setShowImport(true)}
              className="flex items-center gap-1.5 bg-secondary text-foreground px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-secondary/80 transition-all border border-border/50"
            >
              <FileUp size={14} />
              {t('aiScenarios.bulkImport')}
            </button>
            <button
              onClick={() => { setIsCreating(true); setEditingId(null); setEditForm(EMPTY_FORM); }}
              className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3.5 py-2 rounded-xl text-xs font-bold shadow-md shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Plus size={14} />
              {t('aiScenarios.create')}
            </button>
          </div>
        )}
      </div>

      {/* ── Stats bar ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {DIFF_ORDER.map(d => {
          const diff = DIFF[d];
          const count = grouped[d].length;
          const active = grouped[d].filter(s => s.isActive).length;
          return (
            <div key={d} className={`flex items-center gap-3 bg-card border border-border/50 rounded-xl px-3.5 py-2.5 border-l-4 ${diff.border}`}>
              <div className={`p-1.5 rounded-lg ${diff.bg} shrink-0`}>
                <TrendingUp size={13} className={diff.text} />
              </div>
              <div className="min-w-0">
                <p className={`text-xs font-black ${diff.text}`}>{diff.label}</p>
                <p className="text-[10px] text-muted-foreground font-medium">
                  {count === 0 ? 'None' : `${active} active · ${count} total`}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Unlock mode (compact) ── */}
      {!readOnly && (
        <div className="flex items-center justify-between gap-4 bg-card border border-border/50 rounded-xl px-4 py-3">
          <div className="flex items-center gap-3">
            <Settings size={15} className="text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs font-black text-foreground">Level Unlock Mode</p>
              <p className="text-[10px] text-muted-foreground">
                {globalConfig.unlockMode === 'sequential'
                  ? 'Agents must pass ALL scenarios in a level to unlock the next.'
                  : 'Agents need ANY ONE pass in a level to unlock the next.'}
              </p>
            </div>
          </div>
          <div className="flex items-center bg-secondary/60 p-0.5 rounded-lg border border-border/50 shrink-0">
            {(['sequential', 'flexible'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => updateGlobalConfig({ ...globalConfig, unlockMode: mode })}
                disabled={savingConfig}
                className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all capitalize ${
                  globalConfig.unlockMode === mode
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {mode === 'sequential' ? <><Shield size={10} className="inline mr-1" />Sequential</> : <><RotateCcw size={10} className="inline mr-1" />Flexible</>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      <AnimatePresence>
        {showImport && (
          <AiScenarioImportModal onClose={() => setShowImport(false)} onSuccess={() => fetchScenarios()} />
        )}
        {showSandbox && (
          <SandboxManagerModal onClose={() => setShowSandbox(false)} onSuccess={() => fetchScenarios()} />
        )}
      </AnimatePresence>

      {/* ── Create / Edit form ── */}
      <AnimatePresence>
        {(isCreating || editingId) && (
          <ScenarioForm
            form={editForm}
            isCreating={isCreating}
            onChange={handleFormChange}
            onSave={isCreating ? handleCreate : handleSave}
            onCancel={cancelForm}
          />
        )}
      </AnimatePresence>

      {/* ── Scenario groups ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="animate-spin text-primary" size={28} />
          <p className="text-xs font-bold text-muted-foreground animate-pulse">Loading scenarios…</p>
        </div>
      ) : scenarios.length === 0 && !isCreating ? (
        <div className="text-center py-16 bg-secondary/10 rounded-2xl border border-dashed border-border">
          <div className="w-10 h-10 bg-secondary/50 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Shield className="text-muted-foreground" size={20} />
          </div>
          <p className="font-bold text-sm text-foreground">No scenarios yet</p>
          <p className="text-xs text-muted-foreground mt-1">Create your first AI training scenario to get started.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {DIFF_ORDER.map(d => {
            const list = grouped[d];
            if (list.length === 0) return null;
            const visible = list.filter(s => s.id !== editingId);
            return (
              <DifficultySection
                key={d}
                difficulty={d}
                scenarios={visible}
                readOnly={readOnly}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
                onSelectAll={selectAll}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleActive={handleToggleActive}
              />
            );
          })}
        </div>
      )}

      {/* ── Bulk action bar ── */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-foreground text-background px-5 py-3 rounded-2xl shadow-2xl shadow-black/30"
          >
            <span className="text-sm font-black">{selectedIds.size} selected</span>
            <div className="w-px h-4 bg-background/20" />
            <button
              onClick={clearSelection}
              className="text-xs font-bold text-background/60 hover:text-background transition-colors"
            >
              Clear
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="flex items-center gap-1.5 bg-rose-500 text-white text-xs font-black px-3.5 py-1.5 rounded-xl hover:bg-rose-600 active:scale-95 transition-all disabled:opacity-50"
            >
              <Trash2 size={13} />
              {bulkDeleting ? 'Deleting…' : `Delete ${selectedIds.size}`}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
