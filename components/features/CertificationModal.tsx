'use client';

import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, Printer, Download, CheckCircle2, ShieldCheck, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { FADE_IN, TRANSITION } from '@/lib/animations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  agentName: string;
  agentId: string;
  completionDate?: string;
  stats?: any;
}

export const CertificationModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  agentName, 
  agentId, 
  completionDate = new Date().toLocaleDateString(),
  stats 
}) => {
  const t = useTranslations('trainingHub.certificate');
  const certRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const certId = `BT-${agentId.slice(-4).toUpperCase()}-${new Date().getFullYear()}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-8 overflow-y-auto">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={TRANSITION.spring}
            className="relative w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl overflow-hidden print:p-0 print:shadow-none print:rounded-none"
          >
            {/* Header / Actions (Hidden on print) */}
            <div className="flex items-center justify-between p-6 border-b print:hidden">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                  <Award className="text-amber-500" size={24} />
                </div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">Certification of Completion</h2>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors text-sm font-bold"
                >
                  <Printer size={16} />
                  <span>{t('print')}</span>
                </button>
                <button 
                  onClick={onClose}
                  className="p-2 rounded-xl bg-slate-100 text-slate-400 hover:bg-slate-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Certificate Body (The printable area) */}
            <div 
              ref={certRef}
              className="relative p-12 lg:p-20 bg-white print:p-0 overflow-hidden"
              style={{ minHeight: '700px' }}
            >
              {/* Premium Border Decoration */}
              <div className="absolute inset-4 border-[12px] border-amber-500/5 print:inset-0" />
              <div className="absolute inset-8 border-2 border-amber-500/20 print:inset-4" />
              
              {/* Corner Ornaments */}
              <div className="absolute top-12 left-12 w-16 h-16 border-t-4 border-l-4 border-amber-500/40" />
              <div className="absolute top-12 right-12 w-16 h-16 border-t-4 border-r-4 border-amber-500/40" />
              <div className="absolute bottom-12 left-12 w-16 h-16 border-b-4 border-l-4 border-amber-500/40" />
              <div className="absolute bottom-12 right-12 w-16 h-16 border-b-4 border-r-4 border-amber-500/40" />

              {/* Background Watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                <Award size={600} strokeWidth={0.5} className="text-amber-500" />
              </div>

              {/* Actual Content */}
              <div className="relative z-10 flex flex-col items-center text-center">
                {/* Logo Area */}
                <div className="flex flex-col items-center mb-10">
                   <div className="text-4xl font-black tracking-tighter mb-1">
                     <span className="text-slate-900">Brain</span><span className="text-amber-500">Trade</span>
                   </div>
                   <div className="h-1 w-24 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full" />
                </div>

                <h1 className="text-5xl lg:text-6xl font-black text-slate-900 mb-4 tracking-tight uppercase">
                  {t('title')}
                </h1>
                <p className="text-xl font-bold text-amber-600 tracking-[0.2em] uppercase mb-16">
                  {t('subtitle')}
                </p>

                <div className="mb-4">
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t('awardedTo')}</span>
                </div>
                
                <h2 className="text-4xl lg:text-5xl font-serif italic text-slate-800 mb-2 border-b-2 border-slate-100 pb-4 w-full max-w-2xl mx-auto">
                  {agentName}
                </h2>

                <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-3xl mx-auto mt-10 mb-16">
                  {t('achievement')}
                </p>

                {/* Grid of Achievements */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl mx-auto mb-20">
                  <div className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <CheckCircle2 size={32} className="text-emerald-500 mb-3" />
                    <span className="text-xs font-black uppercase text-slate-400 mb-1">{t('foundational')}</span>
                    <span className="text-sm font-bold text-slate-700">100% Mastery</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <ShieldCheck size={32} className="text-blue-500 mb-3" />
                    <span className="text-xs font-black uppercase text-slate-400 mb-1">{t('product')}</span>
                    <span className="text-sm font-bold text-slate-700">Expert Certified</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <Star size={32} className="text-amber-500 mb-3" fill="currentColor" />
                    <span className="text-xs font-black uppercase text-slate-400 mb-1">{t('simulation')}</span>
                    <span className="text-sm font-bold text-slate-700">Ready for Live</span>
                  </div>
                </div>

                {/* Footer Signatures & Date */}
                <div className="grid grid-cols-2 w-full max-w-4xl mx-auto items-end pt-10">
                  <div className="flex flex-col items-start text-left">
                    <div className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">{t('issuedOn')}</div>
                    <div className="text-base font-bold text-slate-800">{completionDate}</div>
                    <div className="text-xs font-medium text-slate-400 mt-4">{t('certId')}: {certId}</div>
                  </div>

                  <div className="flex flex-col items-end text-right">
                    <div className="w-48 border-b-2 border-slate-200 mb-3">
                       <img src="https://api.dicebear.com/7.x/initials/svg?seed=BT&backgroundColor=transparent&fontFamily=DancingScript&fontSize=50" alt="signature" className="h-12 opacity-50 mb-[-10px] ml-auto" />
                    </div>
                    <div className="text-sm font-black text-slate-800 uppercase tracking-wider">{t('director')}</div>
                    <div className="text-xs font-bold text-amber-500">BrainTrade Academy</div>
                  </div>
                </div>

                {/* Physical Seal */}
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 opacity-20 print:opacity-100">
                   <div className="w-32 h-32 rounded-full border-4 border-double border-amber-500 flex items-center justify-center p-2 relative overflow-hidden">
                      <div className="absolute inset-0 animate-[spin_20s_linear_infinity] print:animate-none">
                         <svg className="w-full h-full" viewBox="0 0 100 100">
                           <path id="circlePath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="transparent" />
                           <text className="text-[10px] font-black uppercase fill-amber-500 tracking-[1px]">
                             <textPath xlinkHref="#circlePath">BRAINTRADE SALES READY โ€ข BRAINTRADE SALES READY โ€ข</textPath>
                           </text>
                         </svg>
                      </div>
                      <Award size={48} className="text-amber-500" strokeWidth={1.5} />
                   </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          <style jsx global>{`
            @media print {
              body * {
                visibility: hidden;
              }
              #print-area, #print-area * {
                visibility: visible;
              }
              .print-hidden {
                display: none !important;
              }
            }
          `}</style>
        </div>
      )}
    </AnimatePresence>
  );
};
