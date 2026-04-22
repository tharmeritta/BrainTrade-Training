'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Zap, Shield, FileUp, Settings, RotateCcw, TrendingUp, Loader2
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AiEvalScenario } from '@/types/ai-eval';

// Sub-components & Constants
import AiScenarioImportModal from './AiScenarioImportModal';
import SandboxManagerModal from './SandboxManagerModal';
import { DIFF, DIFF_ORDER, EMPTY_FORM } from './ai-scenarios/constants';
import ScenarioForm from './ai-scenarios/ScenarioForm';
import { DifficultySection } from './ai-scenarios/ScenarioList';

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
  const [globalConfig, setGlobalConfig] = useState<{ unlockMode: 'sequential' | 'flexible', sandboxModeEnabled?: boolean }>({ 
    unlockMode: 'sequential', 
    sandboxModeEnabled: false 
  });

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
    const levelMap: Record<string, number> = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
    setEditForm({ ...s, level: s.level || levelMap[s.difficulty] || 1 });
  };

  const handleFormChange = (newForm: Partial<AiEvalScenario>) => {
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
            <button onClick={() => setShowSandbox(true)} className="flex items-center gap-1.5 bg-secondary text-foreground px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-secondary/80 transition-all border border-border/50">
              <Zap size={14} />
              Sandbox Setup
            </button>
            <button onClick={() => setShowImport(true)} className="flex items-center gap-1.5 bg-secondary text-foreground px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-secondary/80 transition-all border border-border/50">
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

      {/* ── Unlock mode ── */}
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
                  globalConfig.unlockMode === mode ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
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
        {showImport && <AiScenarioImportModal onClose={() => setShowImport(false)} onSuccess={() => fetchScenarios()} />}
        {showSandbox && <SandboxManagerModal onClose={() => setShowSandbox(false)} onSuccess={() => fetchScenarios()} />}
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
            const list = grouped[d].filter(s => s.id !== editingId);
            if (list.length === 0) return null;
            return (
              <DifficultySection
                key={d}
                difficulty={d}
                scenarios={list}
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
            <button onClick={clearSelection} className="text-xs font-bold text-background/60 hover:text-background transition-colors">Clear</button>
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
