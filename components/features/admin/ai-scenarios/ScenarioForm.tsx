'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Save, X, CheckCircle2, Unlock, Lock,
  ChevronRight, ArrowLeft, Loader2, Eye, EyeOff, Check, AlertCircle, HelpCircle
} from 'lucide-react';
import { AiEvalScenario } from '@/types/ai-eval';
import { DIFF, DIFF_ORDER, inputCls, textareaCls } from './constants';
import { MultipleChoiceView } from '@/components/features/ai-eval/MultipleChoiceView';

const AI_SUGGESTIONS = [
  'Price Skeptic Objection',
  'Impatient CEO Pitch',
  'Competitor Comparison',
  'Trial Closing Hesitation',
  'Security & Compliance Review'
];

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
  const [step, setStep] = useState<1 | 2>(1);
  const [activeLang, setActiveLang] = useState<'th' | 'en'>('th');
  const [aiPrompt, setAiPrompt] = useState('');
  const [generatingAi, setGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState('');
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [activeChoiceId, setActiveChoiceId] = useState<string>('A');

  // Helper for localized object reads
  const getVal = (field: any, lang: 'th' | 'en'): string => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    return field[lang] || '';
  };

  // Helper for localized object writes
  const setVal = (fieldKey: keyof AiEvalScenario, value: string, lang: 'th' | 'en') => {
    const existing = form[fieldKey] as any;
    let updatedObj: any = { th: '', en: '' };

    if (typeof existing === 'string') {
      updatedObj = { th: existing, en: existing, [lang]: value };
    } else if (existing && typeof existing === 'object') {
      updatedObj = { ...existing, [lang]: value };
    } else {
      updatedObj[lang] = value;
    }

    onChange({ ...form, [fieldKey]: updatedObj });
  };

  const handleGenerateWithAi = async (promptToUse?: string) => {
    const targetPrompt = promptToUse || aiPrompt;
    if (!targetPrompt.trim() || generatingAi) return;

    setGeneratingAi(true);
    setAiError('');

    try {
      const res = await fetch('/api/admin/ai-scenarios/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: targetPrompt, difficulty: form.difficulty || 'beginner' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate scenario');

      if (data.scenario) {
        onChange({
          ...form,
          name: data.scenario.name,
          customerPersona: data.scenario.customerPersona,
          initialMood: data.scenario.initialMood,
          objective: data.scenario.objective,
          situation: data.scenario.situation,
          choices: data.scenario.choices,
          passThreshold: data.scenario.passThreshold || 70,
          isActive: true
        });
        setAiPrompt('');
      }
    } catch (err: any) {
      setAiError(err.message || 'AI Generation failed');
    } finally {
      setGeneratingAi(false);
    }
  };

  const choices = form.choices || [
    { id: 'A', text: { th: '', en: '' }, isCorrect: true, score: 10, explanation: { th: '', en: '' } },
    { id: 'B', text: { th: '', en: '' }, isCorrect: false, score: 5, explanation: { th: '', en: '' } },
    { id: 'C', text: { th: '', en: '' }, isCorrect: false, score: 2, explanation: { th: '', en: '' } },
    { id: 'D', text: { th: '', en: '' }, isCorrect: false, score: 0, explanation: { th: '', en: '' } },
  ];

  const updateChoice = (index: number, choiceData: any) => {
    const newChoices = [...choices];
    newChoices[index] = choiceData;
    onChange({ ...form, choices: newChoices });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="bg-card border border-primary/20 rounded-3xl overflow-hidden shadow-2xl mb-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-secondary/20 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="text-base font-black text-foreground">
              {isCreating ? 'Create AI Scenario' : 'Edit Scenario'}
            </h3>
            <p className="text-xs text-muted-foreground font-medium">
              Step {step} of 2: {step === 1 ? 'Customer Dilemma & Persona' : 'Multiple Choice Options (A, B, C, D)'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Live Agent Preview Button */}
          <button
            type="button"
            onClick={() => setShowLivePreview(!showLivePreview)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              showLivePreview
                ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                : 'bg-secondary text-muted-foreground hover:text-foreground border-border'
            }`}
          >
            {showLivePreview ? <EyeOff size={14} /> : <Eye size={14} />}
            <span>{showLivePreview ? 'Close Preview' : '👁️ Agent Preview'}</span>
          </button>

          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-secondary p-1 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setActiveLang('th')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                activeLang === 'th' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              🇹🇭 TH
            </button>
            <button
              type="button"
              onClick={() => setActiveLang('en')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                activeLang === 'en' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              🇬🇧 EN
            </button>
          </div>

          <button onClick={onCancel} className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Live Preview Overlay */}
      {showLivePreview ? (
        <div className="p-6 bg-secondary/10 space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-black uppercase text-purple-400 flex items-center gap-2">
              <Eye size={16} /> Live Agent View Preview ({activeLang.toUpperCase()})
            </span>
            <span className="text-[10px] text-muted-foreground">This is how agents will experience this scenario</span>
          </div>
          <MultipleChoiceView
            scenario={form as any}
            onComplete={() => {}}
          />
        </div>
      ) : (
        <>
          {/* AI Auto-Generator Highlight Banner */}
          <div className="p-5 border-b border-border/40 bg-gradient-to-r from-primary/10 via-purple-500/5 to-transparent space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-2">
                <Sparkles size={16} /> ✨ Instant AI Scenario Generator:
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                placeholder="Type scenario focus e.g. 'Handling objection to 30% higher competitor price'..."
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                className="flex-1 w-full px-4 py-2.5 bg-background border border-border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                disabled={!aiPrompt.trim() || generatingAi}
                onClick={() => handleGenerateWithAi()}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-black shadow-md hover:scale-105 active:scale-95 disabled:opacity-50 transition-all shrink-0"
              >
                {generatingAi ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                {generatingAi ? 'Generating...' : 'AI Generate Scenario'}
              </button>
            </div>

            {/* Quick Suggestion Badges */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-[10px] font-bold text-muted-foreground">Quick Topics:</span>
              {AI_SUGGESTIONS.map((topic, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setAiPrompt(topic);
                    handleGenerateWithAi(topic);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-card border border-border/60 text-[10px] font-bold text-foreground hover:border-primary/50 hover:text-primary transition-all"
                >
                  + {topic}
                </button>
              ))}
            </div>

            {aiError && <p className="text-xs text-rose-400 font-bold px-1">{aiError}</p>}
          </div>

          {/* Form Content */}
          <div className="p-6">
            {step === 1 ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-foreground">
                      Scenario Name ({activeLang.toUpperCase()}) *
                    </label>
                    <input
                      className={inputCls}
                      value={getVal(form.name, activeLang)}
                      onChange={e => setVal('name', e.target.value, activeLang)}
                      placeholder="e.g. Handling Price Skepticism"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="scenario-difficulty" className="block text-xs font-bold text-foreground">Difficulty Level</label>
                    <select
                      id="scenario-difficulty"
                      className={inputCls}
                      value={form.difficulty || 'beginner'}
                      onChange={e => onChange({ ...form, difficulty: e.target.value as any })}
                    >
                      {DIFF_ORDER.map(d => <option key={d} value={d}>{DIFF[d].label}</option>)}
                    </select>
                  </div>
                </div>

                {/* Customer Situation / Dilemma */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-foreground">
                    Customer Situation / Spoken Dilemma ({activeLang.toUpperCase()}) *
                  </label>
                  <textarea
                    className={`${textareaCls} h-24`}
                    value={getVal(form.situation, activeLang)}
                    onChange={e => setVal('situation', e.target.value, activeLang)}
                    placeholder="e.g. 'Your price is 30% higher than competitors! Why should I buy from you?'"
                  />
                </div>

                {/* Customer Persona & Objective */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-foreground">
                      Customer Persona & Background ({activeLang.toUpperCase()})
                    </label>
                    <input
                      className={inputCls}
                      value={getVal(form.customerPersona, activeLang)}
                      onChange={e => setVal('customerPersona', e.target.value, activeLang)}
                      placeholder="e.g. SME Business Owner concerned about budget"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-foreground">
                      Sales Agent Objective ({activeLang.toUpperCase()})
                    </label>
                    <input
                      className={inputCls}
                      value={getVal(form.objective, activeLang)}
                      onChange={e => setVal('objective', e.target.value, activeLang)}
                      placeholder="e.g. Reframe value and book a demo"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => onChange({ ...form, required: !form.required })}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      form.required ? 'bg-primary/10 border-primary/40' : 'bg-secondary/30 border-border/40'
                    }`}
                  >
                    <div className="flex items-center gap-3 text-left">
                      <CheckCircle2 className={form.required ? 'text-primary' : 'text-muted-foreground'} size={20} />
                      <div>
                        <p className="text-xs font-bold text-foreground">Mandatory Graduation Scenario</p>
                        <p className="text-[10px] text-muted-foreground">Agents must pass this scenario to graduate.</p>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onChange({ ...form, isActive: !form.isActive })}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      form.isActive ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-secondary/30 border-border/40'
                    }`}
                  >
                    <div className="flex items-center gap-3 text-left">
                      {form.isActive ? <Unlock className="text-emerald-400" size={20} /> : <Lock className="text-muted-foreground" size={20} />}
                      <div>
                        <p className="text-xs font-bold text-foreground">{form.isActive ? 'Scenario Published (Active)' : 'Draft (Hidden)'}</p>
                        <p className="text-[10px] text-muted-foreground">Visible to agents in their scenario list.</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              /* Step 2: Clean Choice Option Accordions */
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-black text-foreground">Multiple Choice Options & AI Coaching Feedback</h4>
                    <p className="text-xs text-muted-foreground">Configure choices A, B, C, D and their scores in {activeLang.toUpperCase()}</p>
                  </div>

                  {/* Choice Tabs (A, B, C, D) */}
                  <div className="flex items-center gap-1.5 bg-secondary p-1 rounded-xl border border-border">
                    {choices.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setActiveChoiceId(c.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                          activeChoiceId === c.id
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Option {c.id}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Choice Editor */}
                {choices.map((choice, idx) => {
                  if (choice.id !== activeChoiceId) return null;

                  const choiceText = getVal(choice.text, activeLang);
                  const explanationText = getVal(choice.explanation, activeLang);

                  return (
                    <div key={choice.id} className="p-6 rounded-3xl bg-secondary/20 border border-primary/20 space-y-4">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-xl bg-primary text-primary-foreground font-black text-sm flex items-center justify-center">
                            {choice.id}
                          </span>
                          <span className="text-sm font-black text-foreground">Editing Option {choice.id}</span>
                        </div>

                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer">
                            <input
                              type="checkbox"
                              checked={choice.isCorrect}
                              onChange={e => {
                                updateChoice(idx, { ...choice, isCorrect: e.target.checked });
                              }}
                              className="rounded border-border text-primary focus:ring-primary w-4 h-4"
                            />
                            <span className={choice.isCorrect ? 'text-emerald-400 font-bold' : ''}>
                              {choice.isCorrect ? '✓ Recommended Choice' : 'Distractor Answer'}
                            </span>
                          </label>

                          <div className="flex items-center gap-1.5 bg-card px-3 py-1.5 rounded-xl border border-border">
                            <span className="text-xs font-bold text-muted-foreground">Score:</span>
                            <input
                              type="number"
                              value={choice.score}
                              onChange={e => {
                                updateChoice(idx, { ...choice, score: parseInt(e.target.value) || 0 });
                              }}
                              className="w-12 bg-transparent text-xs font-black text-center focus:outline-none"
                              min={0} max={10}
                            />
                            <span className="text-xs text-muted-foreground font-bold">/10</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-foreground">
                          Option {choice.id} Response Text ({activeLang.toUpperCase()}) *
                        </label>
                        <textarea
                          className={`${textareaCls} h-20 text-xs`}
                          value={choiceText}
                          onChange={e => {
                            const updatedText = typeof choice.text === 'object' ? { ...choice.text, [activeLang]: e.target.value } : { th: e.target.value, en: e.target.value };
                            updateChoice(idx, { ...choice, text: updatedText });
                          }}
                          placeholder={`What the sales agent responds for Option ${choice.id}...`}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-foreground">
                          AI Coaching Explanation ({activeLang.toUpperCase()}) *
                        </label>
                        <textarea
                          className={`${textareaCls} h-20 text-xs`}
                          value={explanationText}
                          onChange={e => {
                            const updatedExp = typeof choice.explanation === 'object' ? { ...choice.explanation, [activeLang]: e.target.value } : { th: e.target.value, en: e.target.value };
                            updateChoice(idx, { ...choice, explanation: updatedExp });
                          }}
                          placeholder={`Why Option ${choice.id} is effective or flawed...`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Footer Navigation */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-border/50 bg-secondary/10">
        <div>
          {step === 2 && !showLivePreview && (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-secondary transition-all"
            >
              <ArrowLeft size={14} /> Back to Customer Dilemma
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-secondary transition-all"
          >
            Cancel
          </button>

          {step === 1 && !showLivePreview ? (
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              Next: Edit Choices A, B, C, D <ChevronRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={onSave}
              className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Save size={15} /> Save Scenario
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
