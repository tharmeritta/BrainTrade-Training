# Graph Report - BrainTrade-Training  (2026-08-07)

## Corpus Check
- 264 files · ~130,735 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1058 nodes · 2667 edges · 78 communities (61 shown, 17 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `90d413ee`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- scoreColor
- ai-eval.ts
- PresentationViewer.tsx
- animations.ts
- EvaluatorDashboard.tsx
- agent.ts
- TrainingPeriod
- agents.ts
- CourseHub.tsx
- [locale]/layout.tsx
- approval-service.ts
- getAdminDb
- ai-eval/index.tsx
- AdminDashboard.tsx
- AdjustmentsTab.tsx
- fsUpdate
- fsSet
- compilerOptions
- quiz/index.tsx
- firebase-admin.ts
- devDependencies
- dependencies
- server.ts
- db.ts
- quiz-data.ts
- fsGetAll
- StaffTab.tsx
- getServerUser
- AgentStats
- seed.mjs
- Pitch Prompt
- deploy.sh
- LiveFeed.tsx
- scripts
- App Hosting Config
- next.config.ts
- debug-firebase.mjs
- Cloud Build Pipeline
- Environment Variables
- GEMINI.md
- @eslint/js
- eslint-plugin-react-hooks
- framer-motion
- next-env.d.ts
- zod
- @types/node
- typescript
- tailwind.config.ts
- QuizResult.tsx
- OverviewTab.tsx
- server/courses.ts
- index.ts
- ScenarioPicker.tsx
- usePresentation.ts
- HistorySections.tsx

## God Nodes (most connected - your core abstractions)
1. `getAdminDb()` - 50 edges
2. `getServerUser` - 45 edges
3. `AgentStats` - 38 edges
4. `TrainingPeriod` - 27 edges
5. `scoreColor()` - 23 edges
6. `fsGetAll()` - 23 edges
7. `fsUpdate()` - 23 edges
8. `updateAgentOverallScore()` - 23 edges
9. `getAgentSession()` - 23 edges
10. `fsSet()` - 22 edges

## Surprising Connections (you probably didn't know these)
- `AdminPageContent()` --calls--> `requireAdminManagerOrTrainer()`  [EXTRACTED]
  app/[locale]/admin/page.tsx → lib/session/server.ts
- `AiEvalLayout()` --calls--> `getServerUser`  [EXTRACTED]
  app/[locale]/ai-eval/layout.tsx → lib/session/server.ts
- `EvaluatorPageContent()` --calls--> `getServerUser`  [EXTRACTED]
  app/[locale]/evaluator/page.tsx → lib/session/server.ts
- `LearnLayout()` --calls--> `getServerUser`  [EXTRACTED]
  app/[locale]/learn/layout.tsx → lib/session/server.ts
- `QuizLayout()` --calls--> `getServerUser`  [EXTRACTED]
  app/[locale]/quiz/layout.tsx → lib/session/server.ts

## Import Cycles
- None detected.

## Communities (78 total, 17 thin omitted)

### Community 0 - "scoreColor"
Cohesion: 0.17
Nodes (20): ProfileHeader(), DetailedEvaluation(), DetailedEvaluationProps, EvalRow(), EvaluationsDashboard(), EvaluationsDashboardProps, AdminEval, EvalTab (+12 more)

### Community 1 - "ai-eval.ts"
Cohesion: 0.07
Nodes (29): GET(), POST(), DELETE(), POST(), DIFF, DIFF_ORDER, EMPTY_FORM, inputCls (+21 more)

### Community 2 - "PresentationViewer.tsx"
Cohesion: 0.19
Nodes (14): maxDuration, CourseCardProps, PresentationControls(), PresentationControlsProps, PresentationHeader(), PresentationHeaderProps, PresentationViewerProps, TrainerToolbar() (+6 more)

### Community 3 - "animations.ts"
Cohesion: 0.05
Nodes (57): HRAnalyticsTab(), BrandingPanel(), MODULES, STATS_CONFIG, EntryAvatar(), EntryAvatarProps, FloatingDecoration(), LoginForm() (+49 more)

### Community 4 - "EvaluatorDashboard.tsx"
Cohesion: 0.15
Nodes (27): EvaluatorPageContent(), AgentPerformancePanel(), EvalForm(), EvalFormProps, EvalHistoryCard(), EvalHistoryCardProps, EvaluatorDashboard(), EvaluatorDashboardProps (+19 more)

### Community 5 - "agent.ts"
Cohesion: 0.08
Nodes (37): AiEvalLayout(), DashboardLayout(), DashboardPage(), LearnLayout(), QuizLayout(), normalizeName(), useAgentEntry(), DashboardHeader() (+29 more)

### Community 6 - "TrainingPeriod"
Cohesion: 0.06
Nodes (46): Tab, DiagnosticResult, DiagnosticRunner(), HealthManager(), ActiveBatchHeader(), ActiveBatchHeaderProps, ArchiveSelectionGrid(), ArchiveSelectionGridProps (+38 more)

### Community 7 - "agents.ts"
Cohesion: 0.07
Nodes (34): AMBER, buildIndividualSheet(), buildOverviewSheet(), GET(), GREEN, RED, scoreFill(), GET() (+26 more)

### Community 8 - "CourseHub.tsx"
Cohesion: 0.13
Nodes (17): getCompletionStatus(), ReportsTab(), statusPill(), CourseCard, CourseHeader, CourseHeaderProps, CourseHub(), LanguagePicker (+9 more)

### Community 9 - "[locale]/layout.tsx"
Cohesion: 0.06
Nodes (29): maxDuration, POST(), POST(), dmMono, dmSans, AgentSkillRow, CohortHeatmap(), CohortHeatmapProps (+21 more)

### Community 10 - "approval-service.ts"
Cohesion: 0.16
Nodes (14): DELETE, PATCH, GET, POST, GET, PATCH, POST, apiError() (+6 more)

### Community 11 - "getAdminDb"
Cohesion: 0.19
Nodes (20): DELETE(), GET(), POST(), POST(), POST(), POST(), GET(), PATCH() (+12 more)

### Community 12 - "ai-eval/index.tsx"
Cohesion: 0.13
Nodes (17): AuditFlow(), AuditFlowProps, CallSimulatorHud(), CallSimulatorHudProps, ChatView, CoachingCard, ScoreTrend, AiEvaluation() (+9 more)

### Community 13 - "AdminDashboard.tsx"
Cohesion: 0.11
Nodes (23): AdminPageContent(), AdminHeader(), AdminHeaderProps, AdminSidebar(), AdminSidebarProps, NavGroupProps, AdminTabContent(), AdminTabContentProps (+15 more)

### Community 14 - "AdjustmentsTab.tsx"
Cohesion: 0.13
Nodes (22): AiEvalConfig, AiEvalEditor(), LearnConfig, LearnEditor(), LearnModule, PresentationInfo, OverridesManager(), QuizDefinition (+14 more)

### Community 15 - "fsUpdate"
Cohesion: 0.24
Nodes (13): DELETE(), PATCH(), GET(), POST(), GET(), POST(), DELETE(), PATCH() (+5 more)

### Community 16 - "fsSet"
Cohesion: 0.22
Nodes (11): defaults(), POST(), ProgressRecord, POST(), defaults(), GET(), POST(), ProgressRecord (+3 more)

### Community 17 - "compilerOptions"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 18 - "quiz/index.tsx"
Cohesion: 0.14
Nodes (15): QuizSystem(), QuizBriefing, reveal, QuizResult(), QuestionCard, QuestionMap, QuestionMapProps, QuizSession() (+7 more)

### Community 19 - "firebase-admin.ts"
Cohesion: 0.22
Nodes (12): POST(), GET(), POST(), setSession(), fsGetWhere(), cleanEmail(), cleanId(), cleanValue() (+4 more)

### Community 20 - "devDependencies"
Cohesion: 0.10
Nodes (21): autoprefixer, babel-plugin-react-compiler, eslint, eslint-config-next, @eslint/eslintrc, eslint-plugin-jsx-a11y, devDependencies, autoprefixer (+13 more)

### Community 21 - "dependencies"
Cohesion: 0.10
Nodes (21): firebase, firebase-admin, @google-cloud/storage, @google/generative-ai, lucide-react, next, next-intl, openai (+13 more)

### Community 22 - "server.ts"
Cohesion: 0.17
Nodes (18): GET(), GET(), POST(), GET(), PATCH(), GET(), DELETE(), PATCH() (+10 more)

### Community 23 - "db.ts"
Cohesion: 0.19
Nodes (10): FeedItem, GET(), POST(), normalizeName(), POST(), POST(), fsAdd(), fsIncrement() (+2 more)

### Community 24 - "quiz-data.ts"
Cohesion: 0.10
Nodes (19): CERT_PART1, CERT_PART2, CERT_PART3, CERT_PART4, CERT_PART5, FOUND_PART1, FOUND_PART2, FOUND_PART3 (+11 more)

### Community 25 - "fsGetAll"
Cohesion: 0.39
Nodes (6): GET(), EMPTY, GET(), fsCount(), fsGetAll(), getGlobalStats()

### Community 26 - "StaffTab.tsx"
Cohesion: 0.21
Nodes (7): BulkImportModal(), BulkImportModalProps, AccessNotes(), AgentSection(), EditState, ROLE_COLORS, StaffSection()

### Community 27 - "getServerUser"
Cohesion: 0.29
Nodes (9): DELETE(), PATCH(), POST(), POST(), GET(), GET(), POST(), createApprovalRequest() (+1 more)

### Community 28 - "AgentStats"
Cohesion: 0.24
Nodes (12): ProfileHeaderProps, GraduationRoster(), GraduationRosterProps, STATUS_ORDER, LeaderboardTableProps, StatusPipeline(), AgentPerformancePanelProps, CompletionConfig (+4 more)

### Community 29 - "seed.mjs"
Cohesion: 0.39
Nodes (7): __dirname, envPath, initAdmin(), main(), seedAdmin(), seedQuizzes(), seedScenarios()

### Community 33 - "scripts"
Cohesion: 0.18
Nodes (10): name, private, scripts, build, check, dev, lint, seed (+2 more)

### Community 71 - "QuizResult.tsx"
Cohesion: 0.33
Nodes (13): PhaseBreakdown, PhaseBreakdownProps, ResultView, ResultViewProps, QuestionCardProps, QuizBriefingProps, QuizResultProps, QuizSessionProps (+5 more)

### Community 72 - "OverviewTab.tsx"
Cohesion: 0.30
Nodes (7): CompletionGrid(), CompletionGridProps, KpiSection(), KpiSectionProps, TrainingWavesSection(), TrainingWavesSectionProps, AdminOverviewData

### Community 73 - "server/courses.ts"
Cohesion: 0.27
Nodes (7): GET(), GET(), LearnPageContent(), LearnIndexPage(), PresentationViewer(), getCourseModule(), getCourseModules()

### Community 74 - "index.ts"
Cohesion: 0.15
Nodes (10): ApprovalsTab(), AgentProgress, ApprovalRequest, EvaluationCriteria, EvaluationSessionType, Evaluator, LiveSessionRecord, ModuleQuizStat (+2 more)

### Community 75 - "ScenarioPicker.tsx"
Cohesion: 0.24
Nodes (8): IntroView, IntroViewProps, DIFFICULTY_MAP, ScenarioPicker, ScenarioPickerProps, StepProgress(), ActiveAgentUI(), ActiveAgentUIProps

### Community 76 - "usePresentation.ts"
Cohesion: 0.29
Nodes (9): DrawingCanvas(), DrawingCanvasProps, slideKey(), usePresentation(), viewedKey(), DrawingPath, LiveSessionState, Point (+1 more)

### Community 77 - "HistorySections.tsx"
Cohesion: 0.26
Nodes (8): BypassModal(), BypassModalProps, DetailedAiEvalHistory(), DetailedHumanEvaluations(), DetailedQuizHistory(), requestOverride(), AgentDetailModal(), Target()

## Knowledge Gaps
- **225 isolated node(s):** `dmSans`, `dmMono`, `Tab`, `ICON_MAP`, `C` (+220 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `zod`, `scripts`, `framer-motion`, `ai-eval.ts`?**
  _High betweenness centrality (0.098) - this node is a cross-community bridge._
- **Why does `xlsx` connect `ai-eval.ts` to `StaffTab.tsx`, `dependencies`, `AdjustmentsTab.tsx`, `agents.ts`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `scripts`, `@eslint/js`, `eslint-plugin-react-hooks`, `@types/node`, `typescript`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **What connects `dmSans`, `dmMono`, `Tab` to the rest of the system?**
  _225 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ai-eval.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07272727272727272 - nodes in this community are weakly interconnected._
- **Should `animations.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05158324821246169 - nodes in this community are weakly interconnected._
- **Should `EvaluatorDashboard.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.14714714714714713 - nodes in this community are weakly interconnected._