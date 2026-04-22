'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, X, Copy, CheckCircle2, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';

interface BypassModalProps {
  level: number;
  agentName: string;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}

export default function BypassModal({ 
  level, 
  agentName, 
  onClose, 
  onConfirm 
}: BypassModalProps) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [promptContent, setPromptContent] = useState('Loading practice prompt...');

  useEffect(() => {
    async function fetchPrompt() {
      try {
        const res = await fetch('/api/admin/ai-scenarios');
        if (res.ok) {
          const { scenarios } = await res.json();
          const scenario = scenarios.find((s: any) => s.level === level);
          if (scenario?.bypassPrompt) {
            setPromptContent(scenario.bypassPrompt);
          } else {
            setPromptContent(`Please act as a customer for Level ${level} evaluation. (No specific bypass prompt found)`);
          }
        }
      } catch (err) {
        setPromptContent('Failed to load specific prompt. Please use standard persona guidelines.');
      }
    }
    fetchPrompt();
  }, [level]);

  const handleCopy = () => {
    navigator.clipboard.writeText(promptContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = async () => {
    if (!reason.trim()) {
      alert('Please provide a reason for bypassing.');
      return;
    }
    setLoading(true);
    await onConfirm(reason);
    setLoading(false);
    onClose();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="bg-card border border-border rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-border flex justify-between items-center bg-secondary/20">
          <h3 className="text-lg font-black flex items-center gap-2">
            <Zap size={20} className="text-purple-500" /> AI Evaluation Bypass
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="space-y-3">
            <label htmlFor="bypass-prompt" className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-1">1. External AI Practice Prompt</label>
            <div className="relative group">
              <div id="bypass-prompt" className="w-full bg-secondary/40 p-5 rounded-2xl border border-border text-sm leading-relaxed font-medium italic text-foreground/80 pr-12">
                {promptContent}
              </div>
              <button 
                onClick={handleCopy}
                className="absolute top-3 right-3 p-2 rounded-xl bg-background border border-border hover:bg-secondary transition-all shadow-sm"
              >
                {copied ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground px-1">
              Copy this prompt to ChatGPT/Gemini to practice with the agent. The agent must pass the criteria in the prompt.
            </p>
          </div>

          <div className="space-y-3">
            <label htmlFor="bypass-reason" className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-1">2. Bypass Reason</label>
            <textarea 
              id="bypass-reason"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. System outage, manually verified via Discord roleplay..."
              className="w-full bg-secondary/40 border border-border rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all h-24 resize-none"
            />
          </div>

          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex gap-3 items-start">
            <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-700/80 leading-relaxed font-medium">
              Bypassing will mark Level {level} as <span className="font-bold">PASSED</span> for {agentName}. This action will be logged for audit.
            </p>
          </div>
        </div>

        <div className="p-6 bg-secondary/10 border-t border-border flex gap-3">
          <button 
            onClick={handleConfirm}
            disabled={loading || !reason.trim()}
            className="flex-1 bg-primary text-white py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
            Confirm & Mark as Passed
          </button>
          <button onClick={onClose} className="px-6 py-3 rounded-2xl font-bold text-sm text-muted-foreground hover:bg-secondary transition-all">
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
