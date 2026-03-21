'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { X, Upload, FileDown, CheckCircle2, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

interface BulkImportModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function BulkImportModal({ onClose, onSuccess }: BulkImportModalProps) {
  const t = useTranslations('admin');
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
      
      // Basic validation of extension
      const ext = selected.name.split('.').pop()?.toLowerCase();
      if (!['csv', 'xlsx', 'xls'].includes(ext ?? '')) {
        setError('Please select a CSV or Excel file.');
        setFile(null);
      }
    }
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      { Name: 'John Doe', 'Stage Name': 'The Closer' },
      { Name: 'Jane Smith', 'Stage Name': 'Sales Queen' },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Agents');
    XLSX.writeFile(wb, 'agent_import_template.xlsx');
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

      const agents = json
        .map(row => ({
          name: row.Name || row.name || row['Full Name'] || row['ชื่อ-นามสกุล'],
          stageName: row['Stage Name'] || row.stageName || row['ชื่อในวงการ'] || '',
        }))
        .filter(a => a.name);

      if (agents.length === 0) {
        setError('No valid agents found in file. Ensure you have a "Name" column.');
        setUploading(false);
        return;
      }

      setCount(agents.length);
      const res = await fetch('/api/admin/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agents),
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
        setError(d.error || t('agents.importError'));
      }
    } catch (err) {
      console.error('Import error:', err);
      setError(t('agents.importError'));
    }
    setUploading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-lg text-foreground">{t('agents.importTitle')}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          {t('agents.importDesc')}
        </p>

        <div 
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${file ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-primary/30 hover:bg-secondary/30'}`}
        >
          <div className={`p-3 rounded-full ${file ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'}`}>
            <Upload size={24} />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">
              {file ? file.name : t('agents.selectFile')}
            </p>
            {file && <p className="text-xs text-muted-foreground mt-1">{(file.size / 1024).toFixed(1)} KB</p>}
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
          <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex gap-2 items-start text-red-500">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <p className="text-xs font-medium">{error}</p>
          </div>
        )}

        {successCount !== null && (
          <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex gap-2 items-start text-green-500">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
            <p className="text-xs font-medium">{t('agents.importSuccess', { count: successCount })}</p>
          </div>
        )}

        <div className="flex flex-col gap-3 mt-6">
          <button
            onClick={handleImport}
            disabled={!file || uploading || successCount !== null}
            className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          >
            {uploading ? t('agents.uploading', { count }) : t('agents.bulkImport')}
          </button>
          
          <button 
            onClick={downloadTemplate}
            className="flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground py-2 transition-colors"
          >
            <FileDown size={14} /> {t('agents.downloadTemplate')}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
