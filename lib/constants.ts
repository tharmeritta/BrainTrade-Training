/**
 * Application Constants & Configuration Defaults
 */

export const SUPPORTED_LOCALES = ['th', 'en'] as const;
export type SupportedLocale = typeof SUPPORTED_LOCALES[number];
export const DEFAULT_LOCALE: SupportedLocale = 'th';

export const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
export const DEFAULT_OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

export const SCORE_THRESHOLDS = {
  PASS: 70,
  DEVELOPING: 50,
};
