'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, Download, Mail, CheckCircle2, X, Sparkles, ShieldCheck, Loader2 
} from 'lucide-react';
import { CertificateConfig, DEFAULT_CERT_CONFIG } from '@/lib/certificate-types';

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
  const [certLang, setCertLang] = useState<'th' | 'en'>('th');
  const [emailInput, setEmailInput] = useState(agentEmail || '');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [config, setConfig] = useState<CertificateConfig>(DEFAULT_CERT_CONFIG);
  const certCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/admin/certificate-config')
        .then(res => res.json())
        .then(data => {
          if (data && data.academyName) setConfig(data);
        })
        .catch(err => console.error('Failed to load cert config:', err));
    }
  }, [isOpen]);

  const formattedDate = completedAt
    ? new Date(completedAt).toLocaleDateString(certLang === 'th' ? 'th-TH' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString(certLang === 'th' ? 'th-TH' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const certText = certLang === 'th' ? {
    academy: 'สถาบันฝึกอบรม BrainTrade Thailand',
    title: 'ใบรับรองผลการฝึกอบรม',
    subtitle: 'เอกสารฉบับนี้ให้ไว้เพื่อแสดงว่า',
    notes: 'ได้ผ่านการทดสอบและประเมินผลความรู้ ควิซวัดระดับ และสถานการณ์จำลอง AI ครบถ้วนตามมาตรฐานสถาบัน',
    scoreLabel: `คะแนนผลการประเมินรวม: ${score}%`,
    dateLabel: 'วันที่สำเร็จการอบรม',
    idLabel: 'เลขที่ใบรับรอง',
    downloadBtn: 'ดาวน์โหลดใบรับรอง (ภาษาไทย)',
    verified: 'ใบรับรองผ่านการตรวจสอบเรียบร้อย'
  } : {
    academy: config.academyName || 'BrainTrade Sales Excellence Academy',
    title: config.certificateTitle || 'Certificate of Completion',
    subtitle: config.subtitle || 'This official document certifies that',
    notes: config.customNotes || 'Has successfully fulfilled all graduation criteria, course modules, sales quizzes, and AI audit evaluations.',
    scoreLabel: `Mastery Score: ${score}%`,
    dateLabel: 'Graduation Date',
    idLabel: 'Serial ID',
    downloadBtn: 'Download Certificate (English)',
    verified: 'Verified Certificate'
  };

  // Generate PNG image via HTML5 Canvas (Global Standard White Certificate)
  const handleDownload = async () => {
    if (downloading || !certCardRef.current) return;
    setDownloading(true);

    try {
      const element = certCardRef.current;
      const canvas = document.createElement('canvas');
      const scale = 2; // 2x high resolution
      canvas.width = element.offsetWidth * scale;
      canvas.height = element.offsetHeight * scale;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context unavailable');

      ctx.scale(scale, scale);
      
      const width = element.offsetWidth;
      const height = element.offsetHeight;

      // 1. Draw Crisp White Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // 2. Draw Outer Double Borders (Navy & Gold)
      ctx.strokeStyle = '#d97706'; // Gold
      ctx.lineWidth = 3;
      ctx.strokeRect(10, 10, width - 20, height - 20);

      ctx.strokeStyle = '#0f172a'; // Deep Navy Inner Border
      ctx.lineWidth = 1;
      ctx.strokeRect(15, 15, width - 30, height - 30);

      // 3. Render Header Academy Name
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(certText.academy.toUpperCase(), width / 2, 50);

      // 4. Main Certificate Title
      ctx.fillStyle = '#0f172a';
      ctx.font = '900 24px Georgia, serif';
      ctx.fillText(certText.title.toUpperCase(), width / 2, 85);

      // Subtitle
      ctx.fillStyle = '#475569';
      ctx.font = 'italic 12px sans-serif';
      ctx.fillText(certText.subtitle, width / 2, 115);

      // 5. Recipient Name
      ctx.fillStyle = '#1e3a8a';
      ctx.font = 'bold 26px Georgia, serif';
      ctx.fillText(agentName, width / 2, 155);

      // Gold Accent Line under name
      ctx.fillStyle = '#d97706';
      ctx.fillRect(width / 2 - 80, 165, 160, 2);

      // Stage / Position Title
      ctx.fillStyle = '#64748b';
      ctx.font = '600 12px sans-serif';
      ctx.fillText(stageName, width / 2, 185);

      // 6. Notes / Graduation Statement
      ctx.fillStyle = '#334155';
      ctx.font = '12px sans-serif';
      ctx.fillText(certText.notes, width / 2, 220);

      // 7. Footer: Score Pill
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(width / 2 - 90, 240, 180, 28);
      ctx.strokeStyle = '#d97706';
      ctx.strokeRect(width / 2 - 90, 240, 180, 28);

      ctx.fillStyle = '#92400e';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(certText.scoreLabel, width / 2, 258);

      // Signatory Authority (Left Footer)
      ctx.textAlign = 'left';
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(config.signatoryName || 'Prin Rittathanasit', 35, height - 40);
      ctx.fillStyle = '#64748b';
      ctx.font = '10px sans-serif';
      ctx.fillText(config.signatoryTitle || 'Head of Sales Training & QA', 35, height - 25);

      // Verification Details (Right Footer)
      ctx.textAlign = 'right';
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`${certText.idLabel}: ${certificateId}`, width - 35, height - 40);
      ctx.fillStyle = '#64748b';
      ctx.font = '10px sans-serif';
      ctx.fillText(`${certText.dateLabel}: ${formattedDate}`, width - 35, height - 25);

      const link = document.createElement('a');
      link.download = `BrainTrade_Certificate_${agentName.replace(/\s+/g, '_')}_${certLang.toUpperCase()}.png`;
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
          date: formattedDate,
          lang: certLang
        })
      });

      const data = await res.json();
      if (res.ok) {
        if (data.simulated) {
          setEmailStatus(`ℹ Simulated Dispatch to ${data.sentTo} (SMTP_USER missing in .env.local — see instructions below)`);
        } else {
          setEmailStatus(`✓ Sent to ${data.sentTo}`);
        }
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
                <h3 className="text-lg font-black text-foreground tracking-tight">{certText.title}</h3>
                <p className="text-xs text-muted-foreground">{certText.academy}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Language Switcher Pills */}
              <div className="flex items-center gap-1 p-1 bg-secondary/80 rounded-xl border border-border/60">
                <button
                  type="button"
                  onClick={() => setCertLang('th')}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                    certLang === 'th' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  🇹🇭 ไทย
                </button>
                <button
                  type="button"
                  onClick={() => setCertLang('en')}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                    certLang === 'en' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  🇬🇧 EN
                </button>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold">
                <ShieldCheck size={14} />
                <span>{certText.verified}</span>
              </div>
            </div>
          </div>

          {/* Printable Certificate Card Component (Global White Standard) */}
          <div 
            ref={certCardRef}
            className="relative rounded-2xl p-8 bg-white border-4 border-double border-amber-600 text-slate-900 shadow-2xl overflow-hidden space-y-6 text-center"
          >
            {/* Inner Gold Frame Border */}
            <div className="absolute inset-2 border border-slate-900 pointer-events-none rounded-xl" />

            {/* Emblem Seal */}
            <div className="flex items-center justify-center gap-2 pt-2">
              <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-300 shadow-sm text-amber-600">
                <Sparkles size={20} />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-800">
                {certText.academy}
              </span>
            </div>

            {/* Title */}
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900 font-serif">{certText.title}</h2>
              <p className="text-xs text-slate-600 italic mt-1">{certText.subtitle}</p>
            </div>

            {/* Recipient */}
            <div className="py-3 border-y border-slate-200">
              <h1 className="text-3xl font-black tracking-tight text-blue-900 font-serif">{agentName}</h1>
              <div className="h-0.5 w-32 bg-amber-500 mx-auto my-2" />
              <p className="text-xs text-slate-600 font-bold uppercase tracking-wider">{stageName}</p>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-700 max-w-md mx-auto leading-relaxed">
              {certText.notes}
            </p>

            {/* Score & Footer Signatories */}
            <div className="flex items-end justify-between flex-wrap gap-4 pt-4 border-t border-slate-100 text-xs">
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Signatory Authority</span>
                <span className="font-extrabold text-slate-900 text-sm block">{config.signatoryName || 'Prin Rittathanasit'}</span>
                <span className="text-[9px] text-slate-500 block">{config.signatoryTitle || 'Head of Sales Training & QA'}</span>
              </div>

              <div className="px-4 py-2 rounded-xl bg-amber-100/80 border border-amber-300 text-amber-900 font-black text-xs shadow-sm">
                {certText.scoreLabel}
              </div>

              <div className="text-right font-mono text-[10px] text-slate-500">
                <div className="font-bold text-slate-800">{certText.idLabel}: {certificateId}</div>
                <div>{certText.dateLabel}: {formattedDate}</div>
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
                {certText.downloadBtn}
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
