'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit2, Save, Zap,
  Target, Shield, Settings,
  RotateCcw, ChevronDown, X, Lock, Unlock,
  Eye, FileCode, CheckCircle2
} from 'lucide-react';
import { AiEvalScenario } from '@/types/ai-eval';
import { DIFF, DIFF_ORDER, inputCls, textareaCls } from './constants';

/* --- Field component --------------------------------------------------------- */

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</label>
        {hint && <span className="text-[9px] font-bold text-primary/60">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

/* --- Scenario Form ----------------------------------------------------------- */

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
  const [activeTab, setActiveTab] = useState<'general' | 'brain' | 'advanced'>('general');

  const practicePrompt = useMemo(() => {
    if (form.externalPrompt) return form.externalPrompt;
    return `เล่นบทเป็นลูกค้าคนไทย: ${form.customerPersona || form.name || '...'}
อารมณ์: ${form.initialMood || 'ปกติ'}
เป้าหมาย: ${form.objective || '...'}
กติกา: 
1. ฉันเป็นพนักงานขายจาก BrainTrade Thailand
2. เราจะคุยกันทางโทรศัพท์
3. คุณต้องมีข้อโต้แย้ง และให้ฉันพยายามโน้มน้าวคุณ
4. คุยกันให้สมจริง เป็นธรรมชาติ ห้ามหลุดบทบาทจนกว่าฉันจะบอกว่าจบการสนทนา
เริ่มการสนทนาโดยการรับสายจากฉัน`;
  }, [form.externalPrompt, form.customerPersona, form.name, form.initialMood, form.objective]);

  const auditInstructions = useMemo(() => {
    if (form.auditInstructions) return form.auditInstructions;
    return `ตรวจสอบว่าพนักงานสามารถ:
1. ${form.winCondition || 'โน้มน้าวลูกค้าได้'}
2. รับมือข้อโต้แย้งได้อย่างเป็นธรรมชาติ
3. มีความเป็นมืออาชีพและให้ข้อมูลที่ถูกต้อง`;
  }, [form.auditInstructions, form.winCondition]);

  const tabs = [
    { id: 'general',  label: 'Setup',  icon: Settings,   desc: 'Identity & Rules' },
    { id: 'brain',    label: 'Persona', icon: Target,     desc: 'Behavior & Grading' },
    { id: 'advanced', label: 'Prompts', icon: FileCode,   desc: 'AI Instructions' },
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
            <div className="flex items-center justify-between">
               <div>
                 <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                   {tabs.find(t => t.id === activeTab)?.label}
                 </h3>
                 <p className="text-xs text-muted-foreground mt-0.5">
                   {tabs.find(t => t.id === activeTab)?.desc}
                 </p>
               </div>
               {activeTab === 'brain' && (
                 <div className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black flex items-center gap-1.5 border border-emerald-500/20">
                   <Zap size={10} fill="currentColor" />
                   PROMPTS AUTO-GENERATED
                 </div>
               )}
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
                    <Field label="Pass Threshold (%)" hint="Target Audit Score">
                      <input type="number" className={inputCls} value={form.passThreshold ?? 70} onChange={e => onChange({ ...form, passThreshold: parseInt(e.target.value) })} min={1} max={100} />
                    </Field>
                  </div>
                  <Field label="Max Turns" hint="Reference Only">
                    <input type="number" className={inputCls} value={form.maxTurns ?? 12} onChange={e => onChange({ ...form, maxTurns: parseInt(e.target.value) })} min={1} />
                  </Field>
                </div>
                
                <div className="space-y-4">
                  <Field label="Graduation Requirement">
                    <button
                      type="button"
                      onClick={() => onChange({ ...form, required: !form.required })}
                      className={`w-full flex items-center justify-between gap-3 rounded-2xl p-4 border transition-all ${
                        form.required 
                          ? 'bg-primary/5 border-primary/30 shadow-inner' 
                          : 'bg-secondary/40 border-border/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${form.required ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                          <CheckCircle2 size={16} />
                        </div>
                        <div className="text-left">
                          <p className={`text-xs font-black ${form.required ? 'text-primary' : 'text-foreground'}`}>Mandatory for Graduation</p>
                          <p className="text-[10px] text-muted-foreground">Agents must pass this to graduate.</p>
                        </div>
                      </div>
                      <div className={`w-10 h-6 rounded-full relative transition-colors ${form.required ? 'bg-primary' : 'bg-secondary'}`}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form.required ? 'left-5' : 'left-1'}`} />
                      </div>
                    </button>
                  </Field>

                  <Field label="Visibility">
                    <button
                      type="button"
                      onClick={() => onChange({ ...form, isActive: !form.isActive })}
                      className={`w-full flex items-center gap-3 rounded-2xl p-4 border transition-all ${
                        form.isActive 
                          ? 'bg-emerald-500/5 border-emerald-500/30' 
                          : 'bg-secondary/40 border-border/40'
                      }`}
                    >
                      <div className={`p-2 rounded-xl ${form.isActive ? 'bg-emerald-500 text-white' : 'bg-secondary text-muted-foreground'}`}>
                        {form.isActive ? <Unlock size={16} /> : <Lock size={16} />}
                      </div>
                      <div className="text-left">
                        <p className={`text-xs font-black ${form.isActive ? 'text-emerald-600' : 'text-foreground'}`}>
                          {form.isActive ? 'Active' : 'Hidden'}
                        </p>
                        <p className="text-[10px] text-muted-foreground">Visible to agents in the roadmap.</p>
                      </div>
                    </button>
                  </Field>
                </div>
              </div>
            )}

            {activeTab === 'brain' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Field label="The Persona" hint="Who is the customer?">
                    <textarea 
                      className={`${textareaCls} h-40`} 
                      value={form.customerPersona || ''} 
                      onChange={e => onChange({ ...form, customerPersona: e.target.value })} 
                      placeholder="e.g. Somsak, 45, busy business owner who hates being cold-called..." 
                    />
                  </Field>
                  <Field label="Initial Mood">
                    <input className={inputCls} value={form.initialMood || ''} onChange={e => onChange({ ...form, initialMood: e.target.value })} placeholder="e.g. Skeptical and impatient" />
                  </Field>
                </div>
                <div className="space-y-4">
                  <Field label="The Objective" hint="What must the agent do?">
                    <input className={inputCls} value={form.objective || ''} onChange={e => onChange({ ...form, objective: e.target.value })} placeholder="e.g. Book a 1:1 consultation" />
                  </Field>
                  <Field label="Win Condition" hint="Audit success criteria">
                    <textarea 
                      className={`${textareaCls} h-32`} 
                      value={form.winCondition || ''} 
                      onChange={e => onChange({ ...form, winCondition: e.target.value })} 
                      placeholder="e.g. Agent handles the 'price too high' objection and successfully asks for the meeting." 
                    />
                  </Field>
                </div>
              </div>
            )}

            {activeTab === 'advanced' && (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex gap-4">
                  <Eye className="text-primary shrink-0" size={20} />
                  <div>
                    <p className="text-xs font-black text-primary uppercase tracking-wider">Preview Generated Prompts</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed mt-1">
                      These are the actual instructions sent to the AI. You can override them below if you need specialized behavior.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Practice Prompt (ChatGPT)</label>
                      <button 
                        onClick={() => onChange({ ...form, externalPrompt: undefined })}
                        className="text-[9px] font-bold text-primary hover:underline"
                        title="Revert to auto-generated"
                      >
                        Reset to Auto
                      </button>
                    </div>
                    <textarea 
                      className={`${textareaCls} h-48 font-mono text-[10px] leading-normal opacity-80`} 
                      value={practicePrompt} 
                      onChange={e => onChange({ ...form, externalPrompt: e.target.value })}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Audit Instructions (Gemini)</label>
                      <button 
                        onClick={() => onChange({ ...form, auditInstructions: undefined })}
                        className="text-[9px] font-bold text-primary hover:underline"
                      >
                        Reset to Auto
                      </button>
                    </div>
                    <textarea 
                      className={`${textareaCls} h-48 font-mono text-[10px] leading-normal opacity-80`} 
                      value={auditInstructions} 
                      onChange={e => onChange({ ...form, auditInstructions: e.target.value })}
                    />
                  </div>
                </div>

                <details className="group border-t border-border/40 pt-4">
                  <summary className="text-[10px] font-black uppercase tracking-widest text-muted-foreground cursor-pointer hover:text-foreground transition-colors flex items-center gap-2">
                    <RotateCcw size={12} />
                    Internal Simulation Settings (Legacy)
                    <ChevronDown size={12} className="group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="mt-4 space-y-4">
                    <Field label="Legacy System Prompt">
                      <textarea
                        className={`${textareaCls} h-24 font-mono text-[10px]`}
                        value={form.systemPrompt || ''}
                        onChange={e => onChange({ ...form, systemPrompt: e.target.value })}
                        placeholder="Internal simulation prompt..."
                      />
                    </Field>
                  </div>
                </details>
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
          
          {activeTab !== 'advanced' ? (
            <button 
              onClick={() => {
                const nextIdx = tabs.findIndex(t => t.id === activeTab) + 1;
                if (nextIdx < tabs.length) setActiveTab(tabs[nextIdx].id);
              }}
              className="flex items-center gap-2 bg-secondary text-foreground px-6 py-2 rounded-xl text-xs font-black hover:bg-secondary/80 transition-all border border-border/50 shadow-sm"
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
