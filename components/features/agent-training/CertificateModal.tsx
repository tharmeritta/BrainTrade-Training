'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, Download, Mail, CheckCircle2, X, Sparkles, ShieldCheck, Loader2 
} from 'lucide-react';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentName: string;
  stageName?: string;
  score?: number;
  completedAt?: string;
  certificateId?: string;
  agentEmail?: string;
}

export function CertificateModal({
  isOpen,
  onClose,
  agentName,
  stageName = 'Sales Executive',
  score = 92,
  completedAt,
  certificateId = 'BT-CERT-2026-88F19',
  agentEmail
}: CertificateModalProps) {
  const [emailInput, setEmailInput] = useState(agentEmail || '');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const certCardRef = useRef<HTMLDivElement>(null);

  const formattedDate = completedAt
    ? new Date(completedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // Generate PNG image via HTML5 Canvas
  const handleDownload = async () => {
    if (downloading || !certCardRef.current) return;
    setDownloading(true);

    try {
      const element = certCardRef.current;
      const canvas = document.createElement('canvas');
      const scale = 2; // 2x resolution
      canvas.width = element.offsetWidth * scale;
      canvas.height = element.offsetHeight * scale;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context unavailable');

      ctx.scale(scale, scale);
      
      // Draw background gradient
      const grad = ctx.createLinearGradient(0, 0, element.offsetWidth, element.offsetHeight);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, element.offsetWidth, element.offsetHeight);

      // Draw border
      ctx.strokeStyle = '#818cf8';
      ctx.lineWidth = 4;
      ctx.strokeRect(12, 12, element.offsetWidth - 24, element.offsetHeight - 24);

      // Render Text Content
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('BRAINTRADE TRAINING ACADEMY', element.offsetWidth / 2, 50);

      ctx.fillStyle = '#818cf8';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('OFFICIAL CERTIFICATE OF COMPLETION', element.offsetWidth / 2, 75);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px sans-serif';
      ctx.fillText('This certifies that', element.offsetWidth / 2, 110);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '900 24px sans-serif';
      ctx.fillText(agentName, element.offsetWidth / 2, 145);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '12px sans-serif';
      ctx.fillText(`has successfully graduated from the Intelligent Sales Training Curriculum`, element.offsetWidth / 2, 175);

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(`Overall Competency Score: ${score}%`, element.offsetWidth / 2, 210);

      ctx.fillStyle = '#64748b';
      ctx.font = '10px monospace';
      ctx.fillText(`Serial: ${certificateId} | Date: ${formattedDate}`, element.offsetWidth / 2, 245);

      const link = document.createElement('a');
      link.download = `BrainTrade_Certificate_${agentName.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Failed to download certificate image:', err);
    } finally {
      setDownloading(false);
    }
  };

  // Send Email Certificate API Call
  const handleSendEmail = async () => {
    if (sendingEmail) return;
    setSendingEmail(true);
    setEmailStatus(null);

    try {
      const res = await fetch('/api/agent/certificate/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentName,
          email: emailInput || agentEmail,
          score,
          certificateId,
          date: formattedDate
        })
      });

      const data = await res.json();
      if (res.ok) {
        setEmailStatus(`✓ Sent to ${data.sentTo}`);
      } else {
        throw new Error(data.error || 'Failed to send email');
      }
    } catch (err: any) {
      setEmailStatus(`⚠ ${err.message}`);
    } finally {
      setSendingEmail(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-all z-10"
          >
            <X size={18} />
          </button>

          {/* Certificate Header Banner */}
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-border/50 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Award size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-foreground tracking-tight">Official Training Certificate</h3>
                <p className="text-xs text-muted-foreground">BrainTrade Sales Excellence Academy</p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold">
              <ShieldCheck size={14} />
              <span>Verified Certificate</span>
            </div>
          </div>

          {/* Printable Certificate Card Component */}
          <div 
            ref={certCardRef}
            className="relative rounded-2xl p-8 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border-2 border-indigo-500/40 text-white shadow-2xl overflow-hidden space-y-6 text-center"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Emblem Seal */}
            <div className="flex items-center justify-center gap-2">
              <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                <Sparkles size={20} className="text-amber-400" />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">
                BrainTrade Academy
              </span>
            </div>

            {/* Title */}
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-white">Certificate of Completion</h2>
              <p className="text-xs text-indigo-200 mt-1">This document verifies that</p>
            </div>

            {/* Recipient */}
            <div className="py-2 border-y border-white/10">
              <h1 className="text-3xl font-black text-cyan-400 tracking-tight">{agentName}</h1>
              <p className="text-xs text-slate-300 mt-1 font-semibold">{stageName}</p>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
              Has successfully fulfilled all graduation criteria, course modules, sales quizzes, and AI audit evaluations with distinction.
            </p>

            {/* Score & Serial Footer */}
            <div className="flex items-center justify-between flex-wrap gap-4 pt-2 text-xs">
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Graduation Date</span>
                <span className="font-extrabold text-white">{formattedDate}</span>
              </div>

              <div className="px-4 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-black text-sm">
                Mastery Score: {score}%
              </div>

              <div className="text-right font-mono text-[10px] text-slate-400">
                <div>ID: {certificateId}</div>
              </div>
            </div>
          </div>

          {/* Action Controls */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                Download High-Res Certificate
              </button>

              <div className="flex w-full sm:w-auto items-center gap-2 shrink-0">
                <input
                  type="email"
                  placeholder="Enter email address..."
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 text-xs rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={handleSendEmail}
                  disabled={sendingEmail}
                  className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 active:scale-95 transition-all shrink-0"
                >
                  {sendingEmail ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
                  Send Email
                </button>
              </div>
            </div>

            {emailStatus && (
              <p className="text-xs font-bold text-emerald-500 text-center animate-fade-in">
                {emailStatus}
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
