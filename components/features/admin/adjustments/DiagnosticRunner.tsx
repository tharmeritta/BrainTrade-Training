'use client';

import { useState } from 'react';
import { 
  ShieldCheck, AlertTriangle, CheckCircle2, 
  Loader2, Search, Zap, Info, BrainCircuit, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DiagnosticResult {
  id?: string;
  name?: string;
  category?: string;
  status: 'pass' | 'warn' | 'fail';
  message?: string;
  finding?: string;
  details?: string;
  recommendation?: string;
}

export default function DiagnosticRunner() {
  const [running, setRunning] = useState(false);
  const [runningAI, setRunningAI] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[] | null>(null);
  const [aiResults, setAiResults] = useState<DiagnosticResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runDiagnostics = async () => {
    setRunning(true);
    setError(null);
    setResults(null);
    try {
      const res = await fetch('/api/admin/config/diagnostics');
      if (res.ok) {
        const data = await res.json();
        setResults(data.results);
      } else {
        setError('Failed to complete system scan');
      }
    } catch (err) {
      setError('Network error during diagnostics');
    } finally {
      setRunning(false);
    }
  };

  const runAiAudit = async () => {
    setRunningAI(true);
    setError(null);
    setAiResults(null);
    try {
      const res = await fetch('/api/admin/config/diagnostics/ai-audit', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setAiResults(data.findings);
      } else {
        setError('Gemini audit failed to complete');
      }
    } catch (err) {
      setError('Network error during AI audit');
    } finally {
      setRunningAI(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle2 className="text-emerald-500" size={18} />;
      case 'warn': return <AlertTriangle className="text-amber-500" size={18} />;
      case 'fail': return <ShieldCheck className="text-red-500" size={18} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Structural Scan */}
        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
               {running ? <Loader2 size={24} className="animate-spin" /> : <Search size={24} />}
            </div>
            <div className="flex-1">
              <h4 className="font-black text-sm uppercase tracking-tight">Structural Integrity</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">Database connectivity and configuration health.</p>
              <button
                onClick={runDiagnostics}
                disabled={running || runningAI}
                className="mt-4 w-full px-6 py-2.5 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {running ? 'Scanning...' : 'Run Structural Scan'}
              </button>
            </div>
          </div>
        </div>

        {/* AI Semantic Audit */}
        <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-6">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
               {runningAI ? <Loader2 size={24} className="animate-spin" /> : <BrainCircuit size={24} />}
            </div>
            <div className="flex-1">
              <h4 className="font-black text-sm uppercase tracking-tight flex items-center gap-2">
                AI Semantic Audit <Sparkles size={12} className="text-indigo-400" />
              </h4>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">Deep logic analysis & anomaly detection via Gemini.</p>
              <button
                onClick={runAiAudit}
                disabled={running || runningAI}
                className="mt-4 w-full px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:shadow-lg hover:shadow-indigo-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {runningAI ? 'Analyzing with Gemini...' : 'Run Intelligent Audit'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold flex items-center gap-2">
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      {/* Structural Results */}
      <AnimatePresence>
        {results && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="flex items-center gap-2 px-1">
               <div className="h-px flex-1 bg-border/50" />
               <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Structural Findings</span>
               <div className="h-px flex-1 bg-border/50" />
            </div>
            {results.map((r, idx) => (
              <motion.div 
                key={r.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                  r.status === 'pass' ? 'bg-card/50 border-border' : 
                  r.status === 'warn' ? 'bg-amber-500/5 border-amber-500/20' : 
                  'bg-red-500/5 border-red-500/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    r.status === 'pass' ? 'bg-emerald-500/10 text-emerald-500' : 
                    r.status === 'warn' ? 'bg-amber-500/10 text-amber-500' : 
                    'bg-red-500/10 text-red-500'
                  }`}>
                    {getStatusIcon(r.status)}
                  </div>
                  <div>
                    <h5 className="text-xs font-black uppercase tracking-tight flex items-center gap-2">{r.name}</h5>
                    <p className="text-[10px] font-bold text-muted-foreground">{r.message}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:border-l sm:pl-4 border-border/50">
                   <div className="max-w-[200px]">
                      <p className="text-[9px] text-muted-foreground leading-tight italic">{r.details}</p>
                   </div>
                   {r.status !== 'pass' && (
                     <div className="p-1.5 bg-card border border-border rounded-lg text-primary hover:bg-primary hover:text-white transition-all cursor-help group relative">
                        <Info size={14} />
                        <div className="absolute bottom-full right-0 mb-2 w-48 p-3 bg-popover border border-border rounded-xl shadow-xl text-[10px] hidden group-hover:block z-50">
                           <p className="font-bold mb-1">Recommended Fix:</p>
                           <p className="text-muted-foreground">
                              {r.id === 'counters' ? 'Run "Global Stats Sync" below.' : 
                               r.id === 'batches' || r.id === 'integrity' ? 'Run "Batch Status Sync" below.' : 
                               'Contact system administrator for manual repair.'}
                           </p>
                        </div>
                     </div>
                   )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Semantic Results */}
      <AnimatePresence>
        {aiResults && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="flex items-center gap-2 px-1">
               <div className="h-px flex-1 bg-indigo-500/20" />
               <span className="text-[10px] font-black text-indigo-500/70 uppercase tracking-widest flex items-center gap-2">
                 <Sparkles size={10} /> Gemini Intelligence Audit
               </span>
               <div className="h-px flex-1 bg-indigo-500/20" />
            </div>
            {aiResults.map((r, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-all bg-indigo-500/5 border-indigo-500/10`}
              >
                <div className="flex gap-4">
                  <div className={`p-2 h-fit rounded-lg ${
                    r.status === 'pass' ? 'bg-emerald-500/10 text-emerald-500' : 
                    r.status === 'warn' ? 'bg-amber-500/10 text-amber-500' : 
                    'bg-red-500/10 text-red-500'
                  }`}>
                    {getStatusIcon(r.status)}
                  </div>
                  <div>
                    <h5 className="text-xs font-black uppercase tracking-tight flex items-center gap-2">
                      {r.category} Finding
                      <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-black ${
                        r.status === 'warn' ? 'bg-amber-500/20 text-amber-600' : 'bg-red-500/20 text-red-600'
                      }`}>
                        {r.status.toUpperCase()}
                      </span>
                    </h5>
                    <p className="text-sm font-medium text-foreground mt-1">{r.finding}</p>
                    <div className="flex items-start gap-2 mt-3 p-3 bg-secondary/40 rounded-xl border border-indigo-500/20">
                       <Zap size={14} className="text-indigo-500 shrink-0 mt-0.5" />
                       <div>
                          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Recommended Action</p>
                          <p className="text-xs text-muted-foreground mt-1">{r.recommendation}</p>
                       </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
