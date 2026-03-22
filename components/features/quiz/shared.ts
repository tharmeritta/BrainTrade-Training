import type { QuestionData } from '@/lib/quiz-data';

// ─── Theme ────────────────────────────────────────────────────────────────────

export const C = {
  bg:            '#F5F4F0',
  surface:       '#FFFFFF',
  border:        '#E2E0DA',
  borderHover:   '#C8C5BC',
  text:          '#1A1917',
  muted:         '#6B6860',
  hint:          '#9E9B94',
  successBg:     '#DBEAFE',
  successBorder: '#93C5FD',
  successText:   '#1D4ED8',
  dangerBg:      '#FEE2E2',
  dangerBorder:  '#FCA5A5',
  dangerText:    '#991B1B',
  warnBg:        '#FEF9C3',
  warnBorder:    '#FDE047',
  warnText:      '#854D0E',
} as const;

export const LABELS = ['A', 'B', 'C', 'D'];

export function isAnswerCorrect(q: QuestionData, answeredIdx: number): boolean {
  if (q.type === 'fill') return answeredIdx === 0;
  return answeredIdx === (q.correctIdx ?? 0);
}
