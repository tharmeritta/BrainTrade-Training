'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { 
  CheckCircle2, XCircle, HelpCircle, ArrowRight, RotateCcw, Sparkles, User, MessageSquare, Award
} from 'lucide-react';
import { AiEvalScenario } from '@/types/ai-eval';
import { getPassThresholdPct } from '@/lib/scoring';

export function MultipleChoiceView({
  scenario,
  onComplete
}: {
  scenario: AiEvalScenario;
  onComplete: (score: number, passed: boolean) => void;
}) {
  const locale = useLocale();
  const lang = (locale === 'en' ? 'en' : 'th') as 'th' | 'en';
  const t = useTranslations('aiEval');

  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Helper to extract localized text or fallback
  const getLoc = (val: any): string => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    return val[lang] || val.th || val.en || '';
  };

  const name = getLoc(scenario.name);
  const persona = getLoc(scenario.customerPersona);
  const initialMood = getLoc(scenario.initialMood);
  const objective = getLoc(scenario.objective);
  const situation = getLoc(scenario.situation);

  const choices = scenario.choices || [];
  const selectedChoice = choices.find(c => c.id === selectedChoiceId);

  const handleSubmitChoice = async () => {
    if (!selectedChoice || submitted || submitting) return;
    setSubmitting(true);

    const score = selectedChoice.score * 10; // Convert 0-10 to 0-100
    const passThreshold = getPassThresholdPct(scenario.passThreshold, 70);
    const passed = score >= passThreshold;

    try {
      // Save result to Firestore
      await fetch('/api/ai-eval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: scenario.id,
          selectedChoiceId: selectedChoice.id,
          score,
          passed,
          feedback: getLoc(selectedChoice.explanation)
        }),
      });
    } catch (err) {
      console.error('Failed to log scenario submit:', err);
    } finally {
      setSubmitted(true);
      setSubmitting(false);
      onComplete(score, passed);
    }
  };

  const passThresholdPct = getPassThresholdPct(scenario.passThreshold, 70);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Card */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
            {scenario.difficulty || 'beginner'} Level
          </span>

          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
            <span>Target Pass: {passThresholdPct}%</span>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-black text-foreground tracking-tight">{name}</h2>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{persona}</p>
        </div>

        {/* Situation / Dilemma Callout */}
        <div className="p-5 rounded-2xl bg-secondary/40 border border-primary/20 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-primary">
            <MessageSquare size={16} />
            <span>Customer Situation / Dilemma:</span>
          </div>
          <p className="text-sm font-semibold text-foreground italic leading-relaxed">
            {situation || 'Please select the best response to the customer.'}
          </p>
        </div>
      </div>

      {/* Multiple Choice Options */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground px-1">
          Select Your Best Response:
        </h3>

        <div className="grid grid-cols-1 gap-3">
          {choices.map((choice) => {
            const isSelected = selectedChoiceId === choice.id;
            const choiceText = getLoc(choice.text);
            const explanation = getLoc(choice.explanation);

            let borderCls = 'border-border/60 hover:border-primary/40 bg-card';
            if (isSelected) borderCls = 'border-primary bg-primary/5 shadow-md shadow-primary/5';
            if (submitted && choice.isCorrect) borderCls = 'border-emerald-500 bg-emerald-500/10';
            if (submitted && isSelected && !choice.isCorrect) borderCls = 'border-rose-500 bg-rose-500/10';

            return (
              <motion.button
                key={choice.id}
                type="button"
                disabled={submitted}
                onClick={() => setSelectedChoiceId(choice.id)}
                whileHover={!submitted ? { scale: 1.01 } : {}}
                whileTap={!submitted ? { scale: 0.99 } : {}}
                className={`w-full p-5 rounded-2xl border text-left transition-all ${borderCls}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center font-black text-sm border transition-colors ${
                    isSelected ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary text-muted-foreground border-border'
                  }`}>
                    {choice.id}
                  </div>

                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-semibold text-foreground leading-relaxed">
                      {choiceText}
                    </p>

                    {/* Feedback Explanation when submitted */}
                    {submitted && (isSelected || choice.isCorrect) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="pt-2 border-t border-border/40 text-xs leading-relaxed space-y-1"
                      >
                        <div className="flex items-center gap-1.5 font-bold">
                          {choice.isCorrect ? (
                            <span className="text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 size={14} /> Recommended Response ({choice.score * 10} pts)
                            </span>
                          ) : (
                            <span className="text-rose-400 flex items-center gap-1">
                              <XCircle size={14} /> Needs Improvement ({choice.score * 10} pts)
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground">{explanation}</p>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-4">
        {!submitted ? (
          <button
            type="button"
            disabled={!selectedChoiceId || submitting}
            onClick={handleSubmitChoice}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground text-sm font-black shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all ml-auto"
          >
            {submitting ? 'Evaluating Choice...' : 'Submit Choice & Get AI Feedback'} <ArrowRight size={16} />
          </button>
        ) : (
          <div className="w-full p-6 rounded-3xl bg-card border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl ${
                (selectedChoice?.score || 0) * 10 >= passThresholdPct
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-rose-500/10 text-rose-400'
              }`}>
                <Award size={24} />
              </div>
              <div>
                <p className="text-sm font-black text-foreground">
                  Result: {(selectedChoice?.score || 0) * 10 >= passThresholdPct ? 'PASSED 🎉' : 'FAILED'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Score: {(selectedChoice?.score || 0) * 10}% (Target: {passThresholdPct}%)
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setSelectedChoiceId(null);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-secondary text-foreground text-xs font-bold hover:bg-secondary/80 transition-all"
            >
              <RotateCcw size={14} /> Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
