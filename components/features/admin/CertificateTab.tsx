'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Award, Sparkles, Save, RotateCcw, ShieldCheck, CheckCircle2, Loader2, Eye, Palette 
} from 'lucide-react';
import { CertificateConfig, DEFAULT_CERT_CONFIG } from '@/lib/certificate-types';

const COLOR_PRESETS = [
  { name: 'Midnight Indigo', color: '#818cf8' },
  { name: 'Royal Gold', color: '#f59e0b' },
  { name: 'Emerald Master', color: '#10b981' },
  { name: 'Cyber Purple', color: '#a855f7' },
  { name: 'Rose Distinction', color: '#f43f5e' },
];

export function CertificateTab() {
  const [config, setConfig] = useState<CertificateConfig>(DEFAULT_CERT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/certificate-config')
      .then(res => res.json())
      .then(data => {
        if (data && data.academyName) {
          setConfig(data);
        }
      })
      .catch(err => console.error('Failed to load cert config:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/admin/certificate-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      if (res.ok) {
        setStatusMsg('✓ Certificate template configuration saved successfully!');
      } else {
        throw new Error(data.error || 'Failed to save');
      }
    } catch (err: any) {
      setStatusMsg(`⚠ ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setConfig(DEFAULT_CERT_CONFIG);
    setStatusMsg('Reset to default configuration.');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="animate-spin text-primary" size={32} />
        <p className="text-xs text-muted-foreground animate-pulse">Loading Certificate Template Editor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-card border border-border rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Award size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-foreground tracking-tight">Certificate Template Configuration</h2>
            <p className="text-xs text-muted-foreground">Customize official graduation certificates, titles, signatories, and visual themes</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-secondary text-foreground font-bold text-xs hover:bg-secondary/80 transition-all"
          >
            <RotateCcw size={14} /> Reset
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Configuration
          </button>
        </div>
      </div>

      {statusMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold text-center"
        >
          {statusMsg}
        </motion.div>
      )}

      {/* Main Grid: Form + Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Inputs (5 cols) */}
        <div className="lg:col-span-5 bg-card border border-border rounded-3xl p-6 shadow-sm space-y-5">
          <h3 className="text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-2">
            <Palette size={16} className="text-primary" /> Template Metadata & Content
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label htmlFor="cert-academy-name" className="block font-bold text-foreground mb-1">Academy Name / Header</label>
              <input
                id="cert-academy-name"
                type="text"
                value={config.academyName}
                onChange={e => setConfig({ ...config, academyName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label htmlFor="cert-title" className="block font-bold text-foreground mb-1">Certificate Title</label>
              <input
                id="cert-title"
                type="text"
                value={config.certificateTitle}
                onChange={e => setConfig({ ...config, certificateTitle: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label htmlFor="cert-subtitle" className="block font-bold text-foreground mb-1">Certification Subtitle</label>
              <input
                id="cert-subtitle"
                type="text"
                value={config.subtitle}
                onChange={e => setConfig({ ...config, subtitle: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="cert-sig-name" className="block font-bold text-foreground mb-1">Signatory Name</label>
                <input
                  id="cert-sig-name"
                  type="text"
                  value={config.signatoryName}
                  onChange={e => setConfig({ ...config, signatoryName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label htmlFor="cert-sig-title" className="block font-bold text-foreground mb-1">Signatory Title</label>
                <input
                  id="cert-sig-title"
                  type="text"
                  value={config.signatoryTitle}
                  onChange={e => setConfig({ ...config, signatoryTitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label htmlFor="cert-color-picker" className="block font-bold text-foreground mb-2">Accent Theme Color</label>
              <div className="flex items-center gap-2 flex-wrap">
                {COLOR_PRESETS.map(preset => (
                  <button
                    key={preset.color}
                    type="button"
                    onClick={() => setConfig({ ...config, accentColor: preset.color })}
                    className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center ${
                      config.accentColor === preset.color ? 'scale-110 border-white shadow-md' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: preset.color }}
                    title={preset.name}
                  >
                    {config.accentColor === preset.color && <CheckCircle2 size={14} className="text-white" />}
                  </button>
                ))}
                <input
                  id="cert-color-picker"
                  type="color"
                  value={config.accentColor}
                  onChange={e => setConfig({ ...config, accentColor: e.target.value })}
                  className="w-8 h-8 rounded-lg cursor-pointer border border-border p-0.5 bg-secondary"
                  title="Custom Color Picker"
                />
              </div>
            </div>

            <div>
              <label htmlFor="cert-custom-notes" className="block font-bold text-foreground mb-1">Graduation Statement / Notes</label>
              <textarea
                id="cert-custom-notes"
                rows={3}
                value={config.customNotes}
                onChange={e => setConfig({ ...config, customNotes: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:border-primary resize-none"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live Certificate Visual Preview (7 cols) */}
        <div className="lg:col-span-7 bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-2">
              <Eye size={16} className="text-primary" /> Live Interactive Preview
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-secondary text-muted-foreground border border-border">
              Real-time Rendering
            </span>
          </div>

          {/* Certificate Card Preview (Global White Standard) */}
          <div className="relative rounded-2xl p-8 bg-white border-4 border-double border-amber-600 text-slate-900 shadow-2xl overflow-hidden space-y-6 text-center">
            {/* Inner Gold Frame Border */}
            <div className="absolute inset-2 border border-slate-900 pointer-events-none rounded-xl" />

            {/* Header Emblem */}
            <div className="flex items-center justify-center gap-2 pt-2">
              <div className="p-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-600 shadow-sm">
                <Sparkles size={18} />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-800">
                {config.academyName}
              </span>
            </div>

            {/* Certificate Title */}
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 font-serif">{config.certificateTitle}</h2>
              <p className="text-xs text-slate-600 italic mt-1">{config.subtitle}</p>
            </div>

            {/* Recipient Mock Name */}
            <div className="py-3 border-y border-slate-200">
              <h1 className="text-3xl font-black tracking-tight text-blue-900 font-serif">
                Somsak Jaidee
              </h1>
              <div className="h-0.5 w-32 bg-amber-500 mx-auto my-2" />
              <p className="text-xs text-slate-600 font-bold uppercase tracking-wider">Senior Telesales Specialist</p>
            </div>

            {/* Notes */}
            <p className="text-xs text-slate-700 max-w-md mx-auto leading-relaxed">
              {config.customNotes}
            </p>

            {/* Footer Signatory & Serial */}
            <div className="flex items-end justify-between flex-wrap gap-4 pt-4 border-t border-slate-100 text-xs">
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Signatory Authority</span>
                <span className="font-extrabold text-slate-900 text-sm block">{config.signatoryName}</span>
                <span className="text-[9px] text-slate-500 block">{config.signatoryTitle}</span>
              </div>

              <div className="px-4 py-2 rounded-xl bg-amber-100/80 border border-amber-300 text-amber-900 font-black text-xs shadow-sm">
                Mastery Score: 94%
              </div>

              <div className="text-right font-mono text-[10px] text-slate-500">
                <div className="font-bold text-slate-800">ID: BT-CERT-2026-PREVIEW</div>
                <div>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
