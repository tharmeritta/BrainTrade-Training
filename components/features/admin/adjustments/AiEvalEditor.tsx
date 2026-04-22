'use client';

import { useState } from 'react';
import { Sparkles, BookOpen, Edit3, Eye, Loader2, Save } from 'lucide-react';
import { FormField, EditorHeader } from './SharedUI';

interface AiEvalConfig {
  systemPrompt?: string;
  agentGuideline: string;
  passThreshold?: number;
  criteria?: string[];
  provider?: 'openai' | 'gemini' | 'auto';
  [key: string]: any;
}

export default function AiEvalEditor({ data, onSave, onChange, saving, readOnly }: { data: AiEvalConfig | undefined, onSave: (d: AiEvalConfig) => void, onChange: () => void, saving: boolean, readOnly?: boolean }) {
  const [agentGuideline, setAgentGuideline] = useState(data?.agentGuideline || '');
  const [passThreshold, setPassThreshold] = useState(data?.passThreshold ?? 7);
  const [criteria, setCriteria] = useState<string[]>(data?.criteria || ['rapport', 'objectionHandling', 'credibility', 'closing', 'naturalness']);
  const [provider, setProvider] = useState<'openai' | 'gemini' | 'auto'>(
    (data?.provider === 'gemini' || data?.provider === 'openai' || data?.provider === 'auto') ? data.provider : 'auto'
  );
  const [previewMode, setPreviewMode] = useState(false);

  const handleUpdate = (type: 'guideline' | 'threshold' | 'criteria' | 'provider', val: any) => {
    if (type === 'guideline') setAgentGuideline(val);
    else if (type === 'threshold') setPassThreshold(val);
    else if (type === 'criteria') setCriteria(val);
    else if (type === 'provider') setProvider(val);
    onChange();
  };

  const currentConfig = { ...data, agentGuideline, passThreshold, criteria, provider };

  return (
    <div className="p-6 space-y-8">
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Sparkles className="text-primary" size={20} />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-black text-primary uppercase tracking-wider mb-1">New: Scenario-based Architecture</h4>
          <p className="text-xs text-muted-foreground leading-relaxed font-medium">
            AI Eval now uses <span className="text-foreground font-bold">Dynamic Scenarios</span>. 
            The system prompt is automatically generated for each scenario. Global settings below are fallbacks.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-4 border-b border-border">
        <FormField id="ai-provider" label="AI Provider" description="Choose the AI engine for evaluations.">
          <select 
            id="ai-provider"
            value={provider} 
            onChange={e => handleUpdate('provider', e.target.value)}
            className="w-full bg-secondary/30 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
          >
            <option value="auto">Auto (Native Optimized)</option>
            <option value="gemini">Google Gemini (3.1 Flash)</option>
            <option value="openai">OpenAI (GPT-4o mini)</option>
          </select>
        </FormField>

        <FormField id="pass-threshold" label="Global Pass Threshold (1-10)" description="Global fallback threshold if not defined in scenario.">
          <div className="flex items-center gap-3">
            <input 
              id="pass-threshold"
              type="range" min="1" max="10" step="0.5"
              value={passThreshold} 
              onChange={e => handleUpdate('threshold', Number(e.target.value))} 
              className="flex-1 accent-primary" 
            />
            <span className="w-12 text-center font-black text-sm bg-primary/10 text-primary py-1 rounded-lg border border-primary/20">{passThreshold}</span>
          </div>
        </FormField>

        <FormField id="criteria-keys" label="Global Criteria Keys" description="Comma-separated keys used for scoring.">
          <input 
            id="criteria-keys"
            type="text" 
            value={criteria.join(', ')} 
            onChange={e => handleUpdate('criteria', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} 
            className="w-full bg-secondary/30 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono" 
            placeholder="rapport, closing..."
          />
        </FormField>
      </div>

      <div className="space-y-4">
        <EditorHeader 
          title="Global Intro Guideline" 
          icon={BookOpen} 
          onSave={() => onSave(currentConfig)} 
          saving={saving}
        >
          <button 
            onClick={() => setPreviewMode(!previewMode)} 
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${previewMode ? 'bg-primary text-white' : 'bg-secondary text-foreground'}`}
          >
            {previewMode ? <Edit3 size={14} /> : <Eye size={14} />} {previewMode ? 'Edit' : 'Preview'}
          </button>
        </EditorHeader>

        <div className="relative">
          {previewMode ? (
            <div className="w-full min-h-[400px] bg-secondary/10 p-6 rounded-xl border border-dashed border-border whitespace-pre-wrap text-sm leading-relaxed text-foreground font-medium">
              {agentGuideline || <span className="opacity-30 italic">No guideline content yet...</span>}
            </div>
          ) : (
            <>
              <textarea
                id="intro-guideline"
                value={agentGuideline}
                onChange={e => handleUpdate('guideline', e.target.value)}
                className="w-full h-[400px] bg-secondary/20 p-4 rounded-xl border text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                placeholder="Enter intro instructions for agents..."
              />
              <div className="absolute bottom-3 right-3 text-[10px] font-black text-muted-foreground bg-background/80 px-2 py-1 rounded border border-border backdrop-blur-sm">
                {agentGuideline.length} characters
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
