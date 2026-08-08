'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Edit2, Trash2, Zap, Target, ChevronDown, CheckSquare, Square
} from 'lucide-react';
import { AiEvalScenario } from '@/types/ai-eval';
import { DIFF } from './constants';

/* --- Scenario Card ----------------------------------------------------------- */

export function ScenarioCard({
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
            <span className="font-black text-sm text-foreground tracking-tight truncate">
              {typeof s.name === 'string' ? s.name : s.name?.en || s.name?.th || ''}
            </span>
            {s.isMaster && (
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded border border-primary/30 text-primary bg-primary/10 shrink-0 flex items-center gap-1">
                <Zap size={8} fill="currentColor" /> Sandbox
              </span>
            )}
            {!s.isActive && (
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded border border-muted-foreground/20 text-muted-foreground bg-muted-foreground/5 shrink-0">Inactive</span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
            {typeof s.customerPersona === 'string' ? s.customerPersona : s.customerPersona?.en || s.customerPersona?.th || '—'}
          </p>
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

/* --- Difficulty Section ------------------------------------------------------ */

export function DifficultySection({
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
