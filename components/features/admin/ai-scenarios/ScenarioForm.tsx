'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit2, Save, Zap,
  Target, Shield, FileUp, Settings,
  RotateCcw, ChevronDown, X, Lock, Unlock
} from 'lucide-react';
import { AiEvalScenario } from '@/types/ai-eval';
import { DIFF, DIFF_ORDER, inputCls, textareaCls } from './constants';

/* ─── Field component ───────────────────────────────────────────────────────── */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

/* ─── Scenario Form ─────────────────────────────────────────────────────────── */

export default function ScenarioForm({
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
  const [activeTab, setActiveTab] = useState<'general' | 'persona' | 'practice' | 'audit'>('general');

  const tabs = [
    { id: 'general',  label: 'General',  icon: Settings,   desc: 'Basic identity and rules' },
    { id: 'persona',  label: 'Persona',  icon: Target,     desc: 'Customer behavior' },
    { id: 'practice', label: 'Practice', icon: FileUp,     desc: 'Instructions for ChatGPT' },
    { id: 'audit',    label: 'Audit',    icon: Shield,     desc: 'AI Grading criteria' },
  ] as const;

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

      {/* Tab Navigation */}
      <div className="flex items-stretch border-b border-border/50 bg-secondary/5">
        {tabs.map((tab, idx) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 transition-all relative ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/20'
              }`}
            >
              <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-primary/10' : 'bg-transparent'}`}>
                <Icon size={16} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider">{tab.label}</span>
              {isActive && (
                <motion.div 
                  layoutId="activeTab" 
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" 
                />
              )}
              {idx < tabs.length - 1 && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-6 bg-border/40" />
              )}
            </button>
          );
        })}
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-6"
          >
            {/* Tab Introduction */}
            <div>
               <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                 {tabs.find(t => t.id === activeTab)?.label} Settings
               </h3>
               <p className="text-xs text-muted-foreground mt-0.5">
                 {tabs.find(t => t.id === activeTab)?.desc}
               </p>
            </div>

            {/* Tab Content */}
            {activeTab === 'general' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
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
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Pass Threshold (%)">
                      <input type="number" className={inputCls} value={form.passThreshold ?? 70} onChange={e => onChange({ ...form, passThreshold: parseInt(e.target.value) })} min={1} max={100} />
                    </Field>
                    <Field label="Max Turns (Ref)">
                      <input type="number" className={inputCls} value={form.maxTurns ?? 12} onChange={e => onChange({ ...form, maxTurns: parseInt(e.target.value) })} min={1} />
                    </Field>
                  </div>
                  <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                    <p className="text-[10px] leading-relaxed text-primary/80">
                      <strong>Threshold:</strong> The minimum score (0-100) an agent needs to pass this scenario. Scores are determined by the AI Auditor.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'persona' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Field label="Persona Description">
                    <textarea className={`${textareaCls} h-32`} value={form.customerPersona || ''} onChange={e => onChange({ ...form, customerPersona: e.target.value })} placeholder="Background, personality, knowledge level…" />
                  </Field>
                </div>
                <div className="space-y-4">
                  <Field label="Practice Objective">
                    <input className={inputCls} value={form.objective || ''} onChange={e => onChange({ ...form, objective: e.target.value })} placeholder="What does the customer want?" />
                  </Field>
                  <Field label="Initial Mood">
                    <input className={inputCls} value={form.initialMood || ''} onChange={e => onChange({ ...form, initialMood: e.target.value })} placeholder="e.g. Skeptical but curious" />
                  </Field>
                </div>
              </div>
            )}

            {activeTab === 'practice' && (
              <div className="space-y-4">
                <Field label="Agent Practice Prompt (ChatGPT)">
                  <div className="relative group">
                    <textarea 
                      className={`${textareaCls} h-48 font-mono text-xs`} 
                      value={form.externalPrompt || ''} 
                      onChange={e => onChange({ ...form, externalPrompt: e.target.value })} 
                      placeholder="The prompt the agent will copy to ChatGPT..." 
                    />
                    <button 
                      onClick={() => {
                        const auto = `เล่นบทเป็นลูกค้าคนไทย: ${form.customerPersona || form.name}
อารมณ์: ${form.initialMood || 'ปกติ'}
เป้าหมาย: ${form.objective}
กติกา: 
1. ฉันเป็นพนักงานขายจาก BrainTrade Thailand
2. เราจะคุยกันทางโทรศัพท์
3. คุณต้องมีข้อโต้แย้ง และให้ฉันพยายามโน้มน้าวคุณ
4. คุยกันให้สมจริง เป็นธรรมชาติ ห้ามหลุดบทบาทจนกว่าฉันจะบอกว่าจบการสนทนา
เริ่มการสนทนาโดยการรับสายจากฉัน`;
                        onChange({ ...form, externalPrompt: auto });
                      }}
                      className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg shadow-lg hover:scale-105 transition-all text-[10px] font-bold"
                    >
                      <RotateCcw size={12} />
                      {form.externalPrompt ? 'Regenerate Default' : 'Generate Default Prompt'}
                    </button>
                  </div>
                </Field>
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 flex gap-3">
                  <Zap size={16} className="text-amber-500 shrink-0" />
                  <p className="text-[10px] leading-relaxed text-amber-700 dark:text-amber-400">
                    This is the instruction set the agent will use in ChatGPT. It should define the customer&apos;s behavior clearly so the agent gets a realistic practice experience.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'audit' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="Audit Instructions (Rules for Gemini)">
                    <textarea 
                      className={`${textareaCls} h-32 font-mono text-xs`} 
                      value={form.auditInstructions || ''} 
                      onChange={e => onChange({ ...form, auditInstructions: e.target.value })} 
                      placeholder="Specific criteria for the auditor to check..." 
                    />
                  </Field>
                  <Field label="Audit Win Condition (Success Criteria)">
                    <textarea 
                      className={`${textareaCls} h-32 text-xs`} 
                      value={form.winCondition || ''} 
                      onChange={e => onChange({ ...form, winCondition: e.target.value })} 
                      placeholder="Pass if agent handles objections and closes..." 
                    />
                  </Field>
                </div>

                <div className="pt-4 border-t border-border/40">
                  <details className="group">
                    <summary className="text-[10px] font-black uppercase tracking-widest text-muted-foreground cursor-pointer hover:text-foreground transition-colors flex items-center gap-2">
                      <Settings size={12} />
                      Legacy Simulation Settings (Advanced)
                      <ChevronDown size={12} className="group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="mt-4 space-y-4">
                      <p className="text-[10px] text-muted-foreground">
                        These settings are used only for the old &quot;AI Simulation&quot; mode. They are <strong>hidden from agents</strong> during the roleplay.
                      </p>
                      <Field label="Internal Auditor System Prompt">
                        <textarea
                          className={`${textareaCls} h-32 font-mono text-xs`}
                          value={form.systemPrompt || ''}
                          onChange={e => onChange({ ...form, systemPrompt: e.target.value })}
                          placeholder="System instructions for the auditor simulation..."
                        />
                      </Field>
                    </div>
                  </details>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-border/50 bg-secondary/10">
        <div className="flex items-center gap-2">
           {activeTab !== 'general' && (
             <button 
               onClick={() => {
                 const prevIdx = tabs.findIndex(t => t.id === activeTab) - 1;
                 if (prevIdx >= 0) setActiveTab(tabs[prevIdx].id);
               }}
               className="px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-secondary transition-all"
             >
               Back
             </button>
           )}
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="px-5 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-secondary transition-all">
            Cancel
          </button>
          
          {activeTab !== 'audit' ? (
            <button 
              onClick={() => {
                const nextIdx = tabs.findIndex(t => t.id === activeTab) + 1;
                if (nextIdx < tabs.length) setActiveTab(tabs[nextIdx].id);
              }}
              className="flex items-center gap-2 bg-secondary text-foreground px-6 py-2 rounded-xl text-xs font-black hover:bg-secondary/80 transition-all border border-border/50"
            >
              Next Step
            </button>
          ) : (
            <button onClick={onSave} className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-xl text-xs font-black shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
              <Save size={15} />
              {isCreating ? 'Create Scenario' : 'Save Changes'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
