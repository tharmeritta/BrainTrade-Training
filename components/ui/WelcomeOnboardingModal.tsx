'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Sparkles, BookOpen, Trophy, Bot, ArrowRight, ChevronLeft, X, Compass } from 'lucide-react';

export interface WelcomeOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (startTour?: boolean) => void;
  onStartTour?: () => void;
}

export function WelcomeOnboardingModal({
  isOpen,
  onClose,
  onComplete,
  onStartTour,
}: WelcomeOnboardingModalProps) {
  const t = useTranslations('onboarding');
  const [step, setStep] = useState(0);

  const slides = [
    {
      icon: Sparkles,
      color: 'from-amber-500 to-amber-600',
      badgeBg: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      titleKey: 'welcomeTitle',
      descKey: 'welcomeSubtitle',
    },
    {
      icon: BookOpen,
      color: 'from-blue-500 to-indigo-600',
      badgeBg: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      titleKey: 'step1Title',
      descKey: 'step1Desc',
    },
    {
      icon: Trophy,
      color: 'from-purple-500 to-pink-600',
      badgeBg: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      titleKey: 'step2Title',
      descKey: 'step2Desc',
    },
    {
      icon: Bot,
      color: 'from-emerald-500 to-teal-600',
      badgeBg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      titleKey: 'step3Title',
      descKey: 'step3Desc',
    },
  ];

  const currentSlide = slides[step];
  const Icon = currentSlide.icon;

  const handleNext = useCallback(() => {
    if (step < slides.length - 1) {
      setStep((prev) => prev + 1);
    } else {
      onComplete(false);
    }
  }, [step, slides.length, onComplete]);

  const handlePrev = useCallback(() => {
    if (step > 0) {
      setStep((prev) => prev - 1);
    }
  }, [step]);

  const handleStartSpotlight = useCallback(() => {
    if (onStartTour) {
      onStartTour();
    } else {
      onComplete(true);
    }
  }, [onStartTour, onComplete]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-modal-title"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-[2.5rem] border border-border/60 shadow-2xl bg-card text-card-foreground relative"
        >
          {/* Top Decorative Color Glow Bar */}
          <div className={`h-2 w-full bg-gradient-to-r ${currentSlide.color} transition-all duration-500`} />

          {/* Close button */}
          <button
            onClick={onClose}
            type="button"
            aria-label="Close"
            className="absolute top-4 right-4 w-9 h-9 rounded-2xl flex items-center justify-center bg-muted/40 hover:bg-muted text-muted-foreground transition-colors z-10"
          >
            <X size={18} />
          </button>

          <div className="p-6 sm:p-8 text-center space-y-5 sm:space-y-6">
            {/* Step Icon */}
            <motion.div
              key={step}
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${currentSlide.color} text-white flex items-center justify-center mx-auto shadow-xl shadow-amber-500/10`}
            >
              <Icon size={36} />
            </motion.div>

            {/* Title & Description */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-2"
              >
                <h3 id="welcome-modal-title" className="text-2xl font-black text-foreground tracking-tight">
                  {t(currentSlide.titleKey)}
                </h3>
                <p className="text-sm font-bold text-muted-foreground leading-relaxed">
                  {t(currentSlide.descKey)}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Stepper Dots */}
            <div className="flex items-center justify-center gap-2 pt-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setStep(i)}
                  aria-label={`Go to step ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === step ? 'w-8 bg-amber-500' : 'w-2 bg-muted/60 hover:bg-muted-foreground/40'
                  }`}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
              {step === slides.length - 1 ? (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleStartSpotlight}
                    className="w-full py-3.5 px-4 rounded-2xl text-white font-black text-sm uppercase tracking-[0.15em] shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500"
                  >
                    <Compass size={18} />
                    <span>{t('startTour')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onComplete(false)}
                    className={`w-full py-3.5 px-4 rounded-2xl text-white font-black text-sm uppercase tracking-[0.15em] shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 bg-gradient-to-r ${currentSlide.color}`}
                  >
                    <span>{t('startJourney')}</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  {step > 0 && (
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="px-4 py-4 rounded-2xl bg-muted/50 hover:bg-muted text-muted-foreground font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1 transition-all active:scale-95"
                    >
                      <ChevronLeft size={16} />
                      <span>{t('prevStep')}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleNext}
                    className={`flex-1 py-4 rounded-2xl text-white font-black text-sm uppercase tracking-[0.2em] shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 bg-gradient-to-r ${currentSlide.color}`}
                  >
                    <span>{t('nextStep')}</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default WelcomeOnboardingModal;
