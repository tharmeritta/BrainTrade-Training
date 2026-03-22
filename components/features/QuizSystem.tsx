// Re-export from the refactored quiz module.
// The monolith has been split into:
//   quiz/QuizBriefing.tsx  — mode selection screen
//   quiz/QuizSession.tsx   — active quiz screen (QuestionMap, QuestionCard, StickyNav)
//   quiz/QuizResult.tsx    — score & answer key screen (ResultView, PhaseBreakdown)
//   quiz/index.tsx         — state machine / screen router
//   quiz/shared.ts         — theme constants, LABELS, isAnswerCorrect
//   quiz/types.ts          — SessionMode, Screen, prop interfaces
export { default } from './quiz';
