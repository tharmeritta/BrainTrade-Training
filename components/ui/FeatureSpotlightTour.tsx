'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ChevronRight, ChevronLeft, X, Sparkles, CheckCircle2 } from 'lucide-react';

export interface SpotlightStep {
  target: string; // CSS selector e.g. '[data-tour="learn-module"]' or comma-separated selectors
  titleKey?: string;
  title?: { en: string; th: string } | string;
  descriptionKey?: string;
  description?: { en: string; th: string } | string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

export interface FeatureSpotlightTourProps {
  isOpen: boolean;
  steps?: SpotlightStep[];
  onClose: () => void;
  onComplete: () => void;
}

const DEFAULT_STEPS: SpotlightStep[] = [
  {
    target: '[data-tour="learn-module"], [data-tour="nav-learn"]',
    titleKey: 'tourStep1Title',
    descriptionKey: 'tourStep1Desc',
    placement: 'bottom',
  },
  {
    target: '[data-tour="quiz-module"], [data-tour="nav-quiz"]',
    titleKey: 'tourStep2Title',
    descriptionKey: 'tourStep2Desc',
    placement: 'bottom',
  },
  {
    target: '[data-tour="ai-eval-module"], [data-tour="nav-ai-eval"]',
    titleKey: 'tourStep3Title',
    descriptionKey: 'tourStep3Desc',
    placement: 'bottom',
  },
  {
    target: '[data-tour="profile-sidebar"], [data-tour="starter-quest"], [data-tour="lang-toggle"]',
    titleKey: 'tourStep4Title',
    descriptionKey: 'tourStep4Desc',
    placement: 'right',
  },
];

interface ElementRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function FeatureSpotlightTour({
  isOpen,
  steps = DEFAULT_STEPS,
  onClose,
  onComplete,
}: FeatureSpotlightTourProps) {
  const t = useTranslations('onboarding');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<ElementRect | null>(null);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

  const activeStep = steps[currentStepIndex];

  // Helper to find element from selector string (supports comma-separated selectors)
  const findElement = useCallback((selectorStr: string): HTMLElement | null => {
    if (typeof window === 'undefined') return null;
    const selectors = selectorStr.split(',').map((s) => s.trim());
    for (const selector of selectors) {
      const el = document.querySelector(selector) as HTMLElement | null;
      if (el) return el;
    }
    return null;
  }, []);

  // Update target element dimensions & position
  const updateTargetPosition = useCallback(() => {
    if (!isOpen || !activeStep) return;

    setViewportSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    const el = findElement(activeStep.target);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      const rect = el.getBoundingClientRect();
      setTargetRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    } else {
      setTargetRect(null);
    }
  }, [isOpen, activeStep, findElement]);

  useEffect(() => {
    if (!isOpen) return;

    updateTargetPosition();

    const handleResize = () => updateTargetPosition();
    const handleScroll = () => updateTargetPosition();

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen, currentStepIndex, updateTargetPosition]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        if (currentStepIndex < steps.length - 1) {
          setCurrentStepIndex((prev) => prev + 1);
        } else {
          onComplete();
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentStepIndex > 0) {
          setCurrentStepIndex((prev) => prev - 1);
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex, steps.length, onComplete, onClose]);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  // Helper to render text with locale or key lookup
  const getStepText = (
    key?: string,
    explicitText?: { en: string; th: string } | string
  ): string => {
    if (key) {
      try {
        const val = t(key);
        if (val) return val;
      } catch {
        // Fall back to key if not found
      }
    }
    if (explicitText) {
      if (typeof explicitText === 'string') return explicitText;
      return explicitText.th || explicitText.en || '';
    }
    return '';
  };

  const stepTitle = useMemo(
    () => getStepText(activeStep?.titleKey, activeStep?.title),
    [activeStep, t]
  );
  const stepDesc = useMemo(
    () => getStepText(activeStep?.descriptionKey, activeStep?.description),
    [activeStep, t]
  );

  // Calculate Popover Position relative to target or center screen
  const popoverStyle = useMemo(() => {
    const defaultStyle: React.CSSProperties = {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 60,
    };

    if (!targetRect || !viewportSize.width) return defaultStyle;

    const pad = 12;
    const popoverWidth = Math.min(360, viewportSize.width - 32);
    const placement = activeStep?.placement || 'bottom';

    let top = 0;
    let left = 0;

    if (placement === 'bottom') {
      top = targetRect.top + targetRect.height + pad;
      left = targetRect.left + targetRect.width / 2 - popoverWidth / 2;
    } else if (placement === 'top') {
      top = targetRect.top - pad - 200; // estimated popover height
      left = targetRect.left + targetRect.width / 2 - popoverWidth / 2;
    } else if (placement === 'left') {
      top = targetRect.top + targetRect.height / 2 - 100;
      left = targetRect.left - popoverWidth - pad;
    } else if (placement === 'right') {
      top = targetRect.top + targetRect.height / 2 - 100;
      left = targetRect.left + targetRect.width + pad;
    } else {
      return defaultStyle;
    }

    // Viewport boundaries clamp
    const clampLeft = Math.max(16, Math.min(viewportSize.width - popoverWidth - 16, left));
    const clampTop = Math.max(16, Math.min(viewportSize.height - 220, top));

    return {
      position: 'fixed',
      top: `${clampTop}px`,
      left: `${clampLeft}px`,
      width: `${popoverWidth}px`,
      zIndex: 60,
    } as React.CSSProperties;
  }, [targetRect, viewportSize, activeStep]);

  if (!isOpen) return null;

  const pad = 8;
  const highlightBox = targetRect
    ? {
        x: targetRect.left - pad,
        y: targetRect.top - pad,
        w: targetRect.width + pad * 2,
        h: targetRect.height + pad * 2,
      }
    : null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden pointer-events-auto">
        {/* SVG Mask Overlay for Spotlight Cutout */}
        <svg className="fixed inset-0 w-full h-full pointer-events-auto transition-all duration-300">
          <defs>
            <mask id="spotlight-mask" x="0" y="0" width="100%" height="100%">
              {/* White area (covers viewport) */}
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {/* Black rounded rect cutout (illuminates target element) */}
              {highlightBox && (
                <rect
                  x={highlightBox.x}
                  y={highlightBox.y}
                  width={highlightBox.w}
                  height={highlightBox.h}
                  rx="16"
                  ry="16"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          {/* Dark semi-transparent background with cutout */}
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.75)"
            mask="url(#spotlight-mask)"
          />
        </svg>

        {/* Pulsing Glowing Border Box around Target Element */}
        {highlightBox && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed pointer-events-none rounded-2xl border-2 border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.5)] z-50"
            style={{
              top: `${highlightBox.y}px`,
              left: `${highlightBox.x}px`,
              width: `${highlightBox.w}px`,
              height: `${highlightBox.h}px`,
            }}
          >
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-ping" />
          </motion.div>
        )}

        {/* Floating Tooltip Card */}
        <motion.div
          key={currentStepIndex}
          initial={{ opacity: 0, y: 12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          style={popoverStyle}
          className="bg-card text-card-foreground border border-amber-500/30 rounded-3xl p-6 shadow-2xl backdrop-blur-2xl relative overflow-hidden"
        >
          {/* Top Gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-purple-500 to-cyan-500" />

          {/* Close button */}
          <button
            onClick={onClose}
            type="button"
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground flex items-center justify-center transition-colors"
            aria-label={t('skipTour')}
          >
            <X size={14} />
          </button>

          <div className="space-y-4">
            {/* Step Counter & Badge */}
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={12} />
                {t('stepCount', { current: currentStepIndex + 1, total: steps.length })}
              </span>
            </div>

            {/* Title & Description */}
            <div className="space-y-1.5">
              <h4 className="text-lg font-black text-foreground tracking-tight">
                {stepTitle}
              </h4>
              <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                {stepDesc}
              </p>
            </div>

            {/* Step Dots */}
            <div className="flex items-center justify-center gap-1.5 pt-1">
              {steps.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentStepIndex
                      ? 'w-6 bg-amber-500'
                      : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60'
                  }`}
                  aria-label={`Go to step ${idx + 1}`}
                />
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
              >
                {t('skipTour')}
              </button>

              <div className="flex items-center gap-2">
                {currentStepIndex > 0 && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="p-2.5 rounded-xl bg-muted/60 hover:bg-muted text-muted-foreground transition-all active:scale-95"
                    aria-label={t('prevStep')}
                  >
                    <ChevronLeft size={16} />
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <span>
                    {currentStepIndex === steps.length - 1 ? t('finishTour') : t('nextStep')}
                  </span>
                  {currentStepIndex === steps.length - 1 ? (
                    <CheckCircle2 size={14} />
                  ) : (
                    <ChevronRight size={14} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default FeatureSpotlightTour;
