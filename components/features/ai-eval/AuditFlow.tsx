'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Copy, Check, ExternalLink, Send, 
  Search, Brain, ShieldCheck, Zap 
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { TRANSITION } from '@/lib/animations';
import type { EvalScenario } from './types';

interface AuditFlowProps {
  scenario: EvalScenario;
  onBack: () => void;
  onSubmit: (link: string, transcript?: string) => void;
  loading: boolean;
  error: string | null;
}

export function AuditFlow({ scenario, onBack, onSubmit, loading, error }: AuditFlowProps) {
  const [copied, setCopied] = useState(false);
  const [link, setLink] = useState('');
  const [manualTranscript, setManualTranscript] = useState('');
  const [showManual, setShowManual] = useState(false);

  const isCloudflareError = error?.includes('Cloudflare') || error?.includes('security filters');

  const defaultPrompt = `เล่นบทเป็นลูกค้าคนไทย: ${scenario.customerPersona || scenario.name}
อารมณ์: ${scenario.initialMood || 'ปกติ'}
เป้าหมาย: ${scenario.objective}
กติกา: 
1. ฉันเป็นพนักงานขายจาก BrainTrade Thailand
2. เราจะคุยกันทางโทรศัพท์
3. คุณต้องมีข้อโต้แย้ง และให้ฉันพยายามโน้มน้าวคุณ
4. คุยกันให้สมจริง เป็นธรรมชาติ ห้ามหลุดบทบาทจนกว่าฉันจะบอกว่าจบการสนทนา
เริ่มการสนทนาโดยการรับสายจากฉัน`;

  const promptToCopy = scenario.externalPrompt || defaultPrompt;

  const handleCopy = () => {
    navigator.clipboard.writeText(promptToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = () => {
    if (showManual) {
      onSubmit('', manualTranscript);
    } else {
      onSubmit(link);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8 flex items-center justify-between">
        <button 
          onClick={onBack}
          className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
        >
          ← Back to Scenarios
        </button>
        <div className="flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20">
          <Zap size={14} className="text-primary" />
          <span className="text-[11px] font-black uppercase tracking-widest text-primary">AI Audit Mode</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Step 1: Practice */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={TRANSITION.base}
          >
          <GlassCard className="p-6 h-full flex flex-col">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                <Brain size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight">Step 1: Practice</h3>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Use ChatGPT to train</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Copy the custom prompt below and paste it into ChatGPT to start your practice session. Handle the customer&apos;s objections and try to close the sale.
            </p>


            <div className="relative group flex-1">
              <div className="absolute inset-0 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/10 group-hover:border-primary/30 transition-all duration-300" />
              <textarea
                readOnly
                value={promptToCopy}
                className="relative w-full h-48 bg-transparent border-none focus:ring-0 p-4 text-xs font-mono leading-relaxed text-muted-foreground resize-none"
              />
              <button
                onClick={handleCopy}
                className={`absolute bottom-3 right-3 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  copied ? 'bg-emerald-500 text-white' : 'bg-primary text-white hover:scale-105 active:scale-95 shadow-lg shadow-primary/30'
                }`}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy Prompt'}
              </button>
            </div>

            <a 
              href="https://chatgpt.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-6 flex items-center justify-center gap-2 text-sm font-bold text-primary hover:underline"
            >
              Open ChatGPT <ExternalLink size={14} />
            </a>
          </GlassCard>
        </motion.div>

        {/* Step 2: Audit */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...TRANSITION.base, delay: 0.1 }}
        >
          <GlassCard className="p-6 h-full flex flex-col border-primary/20 bg-primary/5">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight">Step 2: {showManual ? 'Paste Transcript' : 'Submit Link'}</h3>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Get AI Audit Results</p>
              </div>
            </div>

            {!showManual ? (
              <>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  Once you finish the conversation, click <b>&quot;Share Link&quot;</b> in ChatGPT and paste it here. Our AI auditor will analyze your performance.
                </p>

                <div className="space-y-4">
                  <div className="relative">
                    <div className={`absolute inset-0 bg-white dark:bg-black/20 rounded-2xl border-2 transition-all duration-300 ${
                      error ? 'border-rose-500/50' : 'border-primary/10 focus-within:border-primary/50'
                    }`} />
                    <div className="relative flex items-center px-4 py-3">
                      <Search size={18} className="text-muted-foreground mr-3" />
                      <input
                        type="url"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        placeholder="https://chatgpt.com/share/..."
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold placeholder:text-muted-foreground/30"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="space-y-2">
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs font-bold text-rose-500 px-2"
                      >
                        {error}
                      </motion.p>
                      {isCloudflareError && (
                        <button
                          onClick={() => setShowManual(true)}
                          className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 rounded-lg border border-primary/20 hover:bg-primary/10 transition-colors"
                        >
                          Try Manual Paste Instead
                        </button>
                      )}
                    </div>
                  )}

                  <button
                    disabled={loading || !link.trim() || !(link.includes('chatgpt.com/') || link.includes('chat.openai.com/') || link.includes('openai.com/s/'))}
                    onClick={handleSubmit}
                    className="w-full flex items-center justify-center gap-3 bg-primary text-white py-4 rounded-2xl font-black tracking-tight shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100"
                  >
                    {loading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <Zap size={20} />
                        </motion.div>
                        Auditing...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Submit Link
                      </>
                    )}
                  </button>
                  
                  <button 
                    onClick={() => setShowManual(true)}
                    className="w-full text-[10px] font-bold text-muted-foreground/50 hover:text-primary transition-colors"
                  >
                    Or paste transcript manually
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-4 flex-1 flex flex-col">
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  Copy the entire conversation from ChatGPT and paste it below.
                </p>
                <div className="relative flex-1 min-h-[200px]">
                  <div className={`absolute inset-0 bg-white dark:bg-black/20 rounded-2xl border-2 transition-all duration-300 ${
                    error ? 'border-rose-500/50' : 'border-primary/10 focus-within:border-primary/50'
                  }`} />
                  <textarea
                    value={manualTranscript}
                    onChange={(e) => setManualTranscript(e.target.value)}
                    placeholder="Paste the conversation transcript here..."
                    className="relative w-full h-full bg-transparent border-none focus:ring-0 p-4 text-xs font-medium leading-relaxed resize-none"
                  />
                </div>

                {error && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs font-bold text-rose-500 px-2"
                  >
                    {error}
                  </motion.p>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowManual(false)}
                    className="flex-1 py-4 rounded-2xl font-black tracking-tight bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all"
                  >
                    Back to Link
                  </button>
                  <button
                    disabled={loading || manualTranscript.trim().length < 20}
                    onClick={handleSubmit}
                    className="flex-[2] flex items-center justify-center gap-3 bg-primary text-white py-4 rounded-2xl font-black tracking-tight shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Auditing...' : 'Submit Transcript'}
                  </button>
                </div>
              </div>
            )}

            <div className="mt-auto pt-8">
              <div className="p-4 bg-white/50 dark:bg-black/20 rounded-2xl border border-black/5">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Audit Criteria</h4>
                <div className="flex flex-wrap gap-2">
                  {['Rapport', 'Objections', 'Credibility', 'Closing', 'Naturalness'].map(c => (
                    <span key={c} className="text-[10px] font-bold px-2 py-1 bg-secondary rounded-md">{c}</span>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
