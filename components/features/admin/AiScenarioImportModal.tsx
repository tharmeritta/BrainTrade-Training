'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { X, Upload, FileDown, CheckCircle2, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

interface AiScenarioImportModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AiScenarioImportModal({ onClose, onSuccess }: AiScenarioImportModalProps) {
  const t = useTranslations('admin.aiScenarios');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [count, setCount] = useState(0);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setError('');
      setSuccessCount(null);
      
      const ext = selected.name.split('.').pop()?.toLowerCase();
      if (!['csv', 'xlsx', 'xls'].includes(ext ?? '')) {
        setError('Please select a CSV or Excel file.');
        setFile(null);
      }
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        Name: 'The Skeptical Investor',
        Difficulty: 'intermediate',
        Threshold: 7,
        Persona: 'A middle-aged business owner who has lost money in stocks before.',
        Objective: 'Understand the risk management and safety of the platform.',
        Mood: 'Cautious and skeptical',
        MaxTurns: 12,
        WinHint: 'Agent explains the 1:1 coaching and regulatory compliance.',
        FailHint: 'Agent is too pushy or dismisses the customer\'s past bad experience.'
      },
      {
        Name: 'The Newcomer',
        Difficulty: 'beginner',
        Threshold: 6,
        Persona: 'A young professional interested in saving for their first home.',
        Objective: 'Learn how to start with a small deposit.',
        Mood: 'Excited but confused',
        MaxTurns: 10,
        WinHint: 'Agent simplifies the registration process.',
        FailHint: 'Agent uses too much technical jargon.'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Scenarios');
    XLSX.writeFile(wb, 'ai_scenario_template.xlsx');
  };

  const handleImport = async () => {
    if (!file) return;
    setUploading(true);
    setError('');

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet) as any[];

      const scenarios = json
        .map(row => ({
          name: row.Name || row.name,
          difficulty: (row.Difficulty || row.difficulty || 'beginner').toLowerCase(),
          passThreshold: parseInt(row.Threshold || row.threshold || row.passThreshold || 7),
          customerPersona: row.Persona || row.persona || row.customerPersona,
          objective: row.Objective || row.objective,
          initialMood: row.Mood || row.mood || row.initialMood,
          maxTurns: parseInt(row.MaxTurns || row.maxTurns || 12),
          winCondition: row.WinHint || row.winHint || row.winCondition,
          failCondition: row.FailHint || row.failHint || row.failCondition,
          isActive: true
        }))
        .filter(s => s.name && s.customerPersona);

      if (scenarios.length === 0) {
        setError('No valid scenarios found. Ensure you have "Name" and "Persona" columns.');
        setUploading(false);
        return;
      }

      setCount(scenarios.length);
      const res = await fetch('/api/admin/ai-scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scenarios),
      });

      if (res.ok) {
        const d = await res.json();
        setSuccessCount(d.count);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        const d = await res.json();
        setError(d.error || t('importError'));
      }
    } catch (err) {
      console.error('Import error:', err);
      setError(t('importError'));
    }
    setUploading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card border border-border rounded-3xl p-6 w-full max-w-md shadow-2xl"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-black text-lg text-foreground tracking-tight">{t('importTitle')}</h3>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-muted-foreground mb-6 leading-relaxed font-medium">
          {t('importDesc')}
        </p>

        <div 
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${file ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-primary/30 hover:bg-secondary/30'}`}
        >
          <div className={`p-3 rounded-2xl ${file ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'}`}>
            <Upload size={24} />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-foreground">
              {file ? file.name : t('selectFile')}
            </p>
            {file && <p className="text-[10px] font-bold text-muted-foreground mt-1 tracking-wider uppercase">{(file.size / 1024).toFixed(1)} KB</p>}
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".csv, .xlsx, .xls" 
            className="hidden" 
          />
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex gap-2 items-start text-red-500">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <p className="text-xs font-bold leading-snug">{error}</p>
          </div>
        )}

        {successCount !== null && (
          <div className="mt-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 flex gap-2 items-start text-green-500">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
            <p className="text-xs font-bold leading-snug">{t('importSuccess', { count: successCount })}</p>
          </div>
        )}

        <div className="flex flex-col gap-3 mt-6">
          <button
            onClick={handleImport}
            disabled={!file || uploading || successCount !== null}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl text-sm font-black disabled:opacity-50 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
          >
            {uploading ? t('uploading', { count }) : t('bulkImport')}
          </button>
          
          <button 
            onClick={downloadTemplate}
            className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground py-2 transition-colors"
          >
            <FileDown size={14} /> {t('downloadTemplate')}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
