'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { X, Upload, FileDown, CheckCircle2, AlertCircle, Save, Zap } from 'lucide-react';
import { AiEvalScenario } from '@/types/ai-eval';

interface SandboxManagerModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function SandboxManagerModal({ onClose, onSuccess }: SandboxManagerModalProps) {
  const t = useTranslations('admin.aiScenarios');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [sandboxScenario, setSandboxScenario] = useState<Partial<AiEvalScenario> | null>(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch current master sandbox on mount
  useEffect(() => {
    const fetchSandbox = async () => {
      try {
        const res = await fetch('/api/admin/ai-scenarios');
        if (res.ok) {
          const data = await res.json();
          const master = (data.scenarios || []).find((s: any) => s.isMaster);
          if (master) setSandboxScenario(master);
        }
      } catch (err) {
        console.error('Failed to fetch sandbox', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSandbox();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setError('');
      setSuccess(false);
    }
  };

  const downloadSandboxTemplate = async () => {
    const XLSX = await import('xlsx');
    const template = [
      {
        SandboxName: 'Thai Sales Sandbox (All-in-One)',
        BigPrompt: 'เล่นบทเป็นลูกค้าคนไทยหลายบุคลิก...\nพนักงานชื่อ: {{agentName}}\n\n✅ PASS เมื่อ: ...\n❌ FAIL เมื่อ: ...',
        PassThreshold: 8,
        MaxTurns: 25,
        Difficulty: 'expert'
      }
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'SandboxConfig');
    XLSX.writeFile(wb, 'sandbox_simulation_template.xlsx');
  };

  const handleImport = async () => {
    if (!file) return;
    setUploading(true);
    setError('');

    try {
      const XLSX = await import('xlsx');
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet) as any[];

      if (json.length === 0) throw new Error('Excel file is empty');

      const row = json[0]; // Only take the first row for Sandbox
      const payload = {
        id: sandboxScenario?.id || 'master_sandbox',
        name: row.SandboxName || row.name || 'Master Sandbox',
        systemPrompt: row.BigPrompt || row.prompt || row.systemPrompt,
        passThreshold: parseInt(row.PassThreshold || 8),
        maxTurns: parseInt(row.MaxTurns || 20),
        difficulty: (row.Difficulty || 'expert').toLowerCase(),
        isMaster: true,
        isActive: true,
        customerPersona: 'Master Sandbox Simulation',
        objective: 'Sandbox Practice'
      };

      const res = await fetch('/api/admin/ai-scenarios', {
        method: sandboxScenario?.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sandboxScenario?.id ? { id: sandboxScenario.id, data: payload } : payload),
      });

      if (res.ok) {
        setSuccess(true);
        onSuccess();
        setTimeout(onClose, 2000);
      } else {
        const d = await res.json();
        setError(d.error || 'Failed to update Sandbox');
      }
    } catch (err: any) {
      setError(err.message || 'Import error');
    }
    setUploading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-card border border-border rounded-3xl p-6 w-full max-w-lg shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Zap size={20} fill="currentColor" />
            </div>
            <h3 className="font-black text-xl text-foreground tracking-tight">Sandbox Setup</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-secondary text-muted-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-secondary/20 rounded-2xl p-4 border border-border/50">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Instructions</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Use this to upload the <strong>&quot;Big Set of Prompt&quot;</strong> for the All-in-One sandbox. 
              The Excel should contain exactly one row with your master configuration.
            </p>
          </div>

          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${file ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-primary/30 hover:bg-secondary/30'}`}
          >
            <Upload size={32} className={file ? 'text-primary' : 'text-muted-foreground'} />
            <div className="text-center">
              <p className="text-sm font-bold text-foreground">
                {file ? file.name : 'Select Sandbox Excel'}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">Supports .xlsx and .csv</p>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv, .xlsx, .xls" className="hidden" />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex gap-2 text-red-500 items-center">
              <AlertCircle size={16} />
              <p className="text-xs font-bold">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 flex gap-2 text-green-500 items-center">
              <CheckCircle2 size={16} />
              <p className="text-xs font-bold">Sandbox Updated Successfully!</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={handleImport}
              disabled={!file || uploading || success}
              className="w-full bg-primary text-primary-foreground py-3.5 rounded-2xl text-sm font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              {uploading ? 'Processing...' : 'Apply Sandbox Prompt'}
            </button>
            
            <div className="flex items-center justify-between px-2">
              <button onClick={downloadSandboxTemplate} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
                <FileDown size={14} /> Download Template
              </button>
              <p className="text-[9px] text-muted-foreground italic">Overwrites current master prompt</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
